import { z } from 'zod'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { fail } from '@sveltejs/kit'

// Basically, Zod doesn't have a way of doing:
// EITHER:
//  1. All fields EMPTY
//  2. All fields FULL
//
// So, we're doing it ourselves
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

    if (!anyProvided) {
      // all empty: okay, skip validation
      return
    }
    // else: require all three
    if (!name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'Name is required when providing any parent info',
      })
    } else if (name.length < 1) {
      // probably redundant since trimmed, but you could check length>=1
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        path: ['name'],
        message: 'Name is required',
      })
    }
    if (!phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Phone is required when providing any parent info',
      })
    } else if (!isValidPhoneNumber(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Please enter a valid phone number',
      })
    }
    if (!email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Email is required when providing any parent info',
      })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Please enter a valid email address',
      })
    }
  })

// Helper to check if a parent object has all required fields non-empty
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
  .refine(
    (data) => {
      return isDone(data.father) || isDone(data.mother)
    },
    {
      message: "At least one parent's complete information must be provided",
      path: ['father'],
    },
  )
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

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(maktabSchema))

    if (!form.valid) {
      console.warn('Form issue:', form)
      return fail(400, { form })
    }

    console.log('Form submitted successfully:', form.data)
    return { form }
  },
}
