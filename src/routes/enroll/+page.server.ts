import { z } from 'zod'
import { superValidate } from 'sveltekit-superforms/server'
import { zod } from 'sveltekit-superforms/adapters'
import { fail } from '@sveltejs/kit'

// Schemas (updated: removed age from childSchema)
const parentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z
    .string()
    .regex(/^[\+]?[(]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
})

const childSchema = z.object({
  name: z.string().min(2, 'Child name must be at least 2 characters'),
  sex: z.enum(['male', 'female'], {
    required_error: 'Please select child gender',
  }),
  dob: z.string().min(1, 'Date of birth is required'),
})

const maktabSchema = z
  .object({
    father: parentSchema.partial(),
    mother: parentSchema.partial(),
    address: z.string().min(5, 'Please enter a complete address'),
    city: z.string().min(2, 'Please enter a valid city'),
    zipCode: z
      .string()
      .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    children: z
      .array(childSchema)
      .min(1, 'At least one child must be registered'),
  })
  .refine(
    (data) => {
      const hasFather =
        data.father.name && data.father.phone && data.father.email
      const hasMother =
        data.mother.name && data.mother.phone && data.mother.email
      return hasFather || hasMother
    },
    {
      message: "At least one parent's complete information must be provided",
      path: ['father'],
    },
  )

export const load = async () => {
  const form = await superValidate(zod(maktabSchema), {
    defaults: {
      father: { name: '', phone: '', email: '' },
      mother: { name: '', phone: '', email: '' },
      address: '',
      city: '',
      zipCode: '',
      children: [{ name: '', sex: 'male', dob: '' }],
    },
  })
  return { form }
}

export const actions = {
  default: async ({ request }) => {
    const formDataRaw = await request.formData()
    const confirmParent = formDataRaw.get('confirmParent')

    const form = await superValidate(request, zod(maktabSchema))
    if (!form.valid) {
      return fail(400, { form })
    }

    const { father, mother } = form.data
    const fatherComplete = Boolean(father.name && father.phone && father.email)
    const motherComplete = Boolean(mother.name && mother.phone && mother.email)

    // If exactly one parent and not yet confirmed, warn
    if (
      (fatherComplete || motherComplete) &&
      !(fatherComplete && motherComplete) &&
      !confirmParent
    ) {
      form.message = 'parent_warning'
      return { form }
    }

    console.log('Form submitted successfully:', form.data)
    return { form }
  },
}
