import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { message, superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { fail } from '@sveltejs/kit'
import { db } from '$lib/db'

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
      return message(form, 'Invalid Form')
    }

    // 2) Fetch active term from config
    const { data: cfg, error: cfgErr } = await db
      .from('config')
      .select('value')
      .eq('key', 'active_term_id')
      .single()
    if (cfgErr || !cfg?.value) {
      console.error('Error fetching active term:', cfgErr)
      return message(form, 'Unable to determine current term.', { status: 500 })
    }
    const termId = Number(cfg.value)

    // 3) Build payload for insertion
    const payload = {
      term_id: termId,
      father_name: form.data.father.name || null,
      father_phone: form.data.father.phone || null,
      father_email: form.data.father.email || null,
      mother_name: form.data.mother.name || null,
      mother_phone: form.data.mother.phone || null,
      mother_email: form.data.mother.email || null,
      address: form.data.address,
      city: form.data.city,
      zip_code: form.data.zipCode,
      children: form.data.children,
    }

    // 4) Insert into Supabase
    const { data: inserted, error: insertErr } = await db
      .from('maktab_registrations')
      .insert(payload)
      .select('verification_token')
      .single()

    if (insertErr) {
      console.error('Insert error:', insertErr)
      return message(form, insertErr.message, { status: 500 })
    }

    // 5) Success
    return message(form, { token: inserted.verification_token })
  },
}
