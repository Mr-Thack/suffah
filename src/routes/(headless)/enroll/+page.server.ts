import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { setError, message, superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { fail } from '@sveltejs/kit'
import { db } from '$lib/db'
import { v4 as uuid } from 'uuid'
import { dev } from '$app/environment'
import { square } from '$lib/square.ts'
import { PUBLIC_SQUARE_LOCATION_ID } from '$env/static/public'
import { sendRegistrationEmail } from '$lib/email.ts'

// Zod schemas for parents and children
const parentSchemaRaw = z
  .object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  })
  .superRefine((obj, ctx) => {
    const name = obj.name?.trim() ?? ''
    const phone = obj.phone?.trim() ?? ''
    const email = obj.email?.trim() ?? ''
    const anyProvided = !!(name || phone || email)

    if (!anyProvided) return

    if (!name)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'Name is required when providing any parent info',
      })
    else if (name.length < 1)
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        path: ['name'],
        message: 'Name is required',
      })

    if (!phone)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Phone is required when providing any parent info',
      })
    else if (!isValidPhoneNumber(phone))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Please enter a valid phone number',
      })

    if (!email)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Email is required when providing any parent info',
      })
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Please enter a valid email address',
      })
  })

function isDone(p: Partial<{ name: string; phone: string; email: string }>) {
  return !!(p.name && p.phone && p.email)
}

const childSchema = z.object({
  name: z.string().min(2, 'Child name must be at least 2 characters'),
  sex: z.enum(['male', 'female'], {
    required_error: 'Please select child gender',
  }),
  dob: z.string().min(1, 'Date of birth is required'),
})

const maktabSchema = z
  .object({
    father: parentSchemaRaw,
    mother: parentSchemaRaw,
    address: z.string().min(5, 'Please enter a complete address'),
    city: z.string().min(2, 'Please enter a valid city'),
    zipCode: z
      .string()
      .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    children: z
      .array(childSchema)
      .min(1, 'At least one child must be registered'),
    confirmParent: z.boolean().optional(),
    nonce: z.string().optional(),
    cardHolderName: z.string().optional(),
  })
  .refine((data) => isDone(data.father) || isDone(data.mother), {
    message: "At least one parent's complete information must be provided",
    path: ['father'],
  })
  .superRefine((data, ctx) => {
    const fatherComplete = isDone(data.father)
    const motherComplete = isDone(data.mother)
    if (
      (fatherComplete || motherComplete) &&
      !(fatherComplete && motherComplete) &&
      !data.confirmParent
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmParent'],
        message:
          'Only one parent is complete. Please check “Confirm” to proceed with single-parent data.',
      })
    }
  })

// Load: initialize empty form
export const load = async () => {
  const form = await superValidate(zod(maktabSchema), {
    defaults: {
      father: { name: '', phone: '', email: '' },
      mother: { name: '', phone: '', email: '' },
      address: '',
      city: '',
      zipCode: '',
      children: [{ name: '', sex: 'male', dob: '' }],
      confirmParent: false,
      nonce: '',
    },
  })
  return { form }
}

// Actions: validate, fetch term, insert, return
export const actions = {
  default: async ({ request }) => {
    // 1) Validate incoming data
    const form = await superValidate(request, zod(maktabSchema))
    if (!form.valid) {
      console.warn('Validation failed:', form)
      return fail(400, { form })
    }

    // If we ever need to list all possible subscriptions
    // console.log(await square.catalog.list())

    // 2) Fetch active term from config
    const { data: cfg, error: cfgErr } = await db
      .from('config')
      .select('value')
      .eq('key', (dev ? 'dev_' : '') + 'active_term_id')
      .single()
    if (cfgErr || !cfg?.value) {
      console.error('Error fetching active term:', cfgErr)
      return setError(
        form,
        '',
        'SERVER ERROR: Unable to determine current term.',
      )
    }
    const termId = Number(cfg.value)

    const { data: termInfo, error: termErr } = await db
      .from('maktab_term')
      .select('*')
      .eq('id', termId)
      .single()

    console.log(termInfo)

    // 3) Destructure form data
    const {
      father,
      mother,
      address,
      city,
      zipCode,
      children,
      nonce,
      cardHolderName,
    } = form.data

    if (nonce.length === 0) {
      return setError(
        form,
        '',
        'Payment Processor Issue. Refresh or seek help. (nonce not recieved)',
      )
    } else if (cardHolderName.length === 0) {
      return setError(
        form,
        'nameOnCard',
        'Please provide the name of the cardholder',
      )
    }

    const billingAddress = {
      addressLine1: address,
      locality: city,
      administrativeDistrictLevel1: 'GA',
      postalCode: zipCode,
      country: 'US',
    }

    // 4) Create Square Customer
    let result = await square.customers.create({
      givenName: father.name || mother.name,
      familyName: mother.name || father.name,
      emailAddress: father.email || mother.email,
      phoneNumber: father.phone || mother.phone,
      address: billingAddress,
    })

    if (result.errors) {
      console.error('Payment Setup Failure', result.errors)
      return setError(form, '', `Payment setup failed: ${result.errors}`)
    }

    const customerId = result.customer.id

    // 5) Add Card to Customer's Account
    result = await square.cards.create({
      idempotencyKey: uuid(),
      sourceId: nonce,
      card: {
        cardHolderName,
        billingAddress,
        customerId,
      },
    })

    if (result.errors) {
      console.error('Card Attachment Failure', result.errors)
      return setError(form, '', `Card Attachment failed: ${result.errors}`)
    }

    const cardId = result.card.id

    // Use the plan variations (not the actual plan itself
    // Because Square charges based off the variations
    // This also means we don't need the actual plan id itself
    let indices = ['sid1', 'sid2', 'sid3']
    let planVariationId = termInfo[indices[children.length - 1]]

    // 6) Create Subscription (charge card)
    result = await square.subscriptions.create({
      idempotencyKey: uuid(),
      locationId: PUBLIC_SQUARE_LOCATION_ID!,
      planVariationId,
      customerId,
      startDate: new Date().toISOString().slice(0, 10),
      timezone: 'America/New_York',
      cardId,
    })

    if (result.errors) {
      console.error('Subscription failed:', result.errors)
      return setError(form, '', `Payment failed: ${result.errors}`)
    }

    const subscription = result.subscription

    // 7) Build payload for insertion
    const payload = {
      term_id: termId,

      father_name: father.name || null,
      father_phone: father.phone || null,
      father_email: father.email || null,

      mother_name: mother.name || null,
      mother_phone: mother.phone || null,
      mother_email: mother.email || null,

      address,
      city,
      zip_code: zipCode,

      children: children,

      customer_id: customerId,
      subscription_id: subscription.id,
      status: subscription.status,
    }

    // 8) Insert into Supabase
    const { data: inserted, error: insertErr } = await db
      .from('maktab_registrations')
      .insert(payload)

    if (insertErr) {
      console.error('Insert error:', insertErr)
      return setError(form, '', `DB ERROR: ${insertErr.message}`)
    }

    // 9) Send Email. There shouldn't be any errors, and I'm out of time for figuring out how to deal with them anyways
    await sendRegistrationEmail(form.data, termInfo)

    // 10) Success
    return message(form, { success: true, subscriptionId: subscription.id })
  },
}
