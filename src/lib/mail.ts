import nodemailer from 'nodemailer'
import { GMAIL_USER, GMAIL_APP_PASSWORD } from '$env/static/private'

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  throw new Error('Missing GMail environment variables')
}

function generateEmailContent(registrationData: any, termInfo: any) {
  const { father, mother, children, address, city, zipCode } = registrationData

  // Calculate total cost
  const childrenCost = [termInfo.p1, termInfo.p2, termInfo.p3]
  const numChildren = children.length
  const totalCost = childrenCost[Math.min(numChildren - 1, 2)]

  return `
  Dear Parent/Guardian,

  Thank you for registering your child${numChildren === 1 ? '' : 'ren'} for the Maktab Program at Masjid Suffah.

      REGISTRATION CONFIRMATION
    =========================

    Term Information:
  - Program: ${termInfo.name}
  - Duration: ${termInfo.length} Months
  - Monthly Payment: $${totalCost}

  Registered Children:
    ${children
      .map(
        (child: any, index: number) => `
        ${index + 1}. ${child.name}
        - Date of Birth: ${new Date(child.dob).toLocaleDateString()}
        - Gender: ${child.sex}
        `,
      )
      .join('')}

      Parent Information:
      ${father?.name ? `- Father: ${father.name} (${father.email}, ${father.phone})` : ''}
      ${mother?.name ? `- Mother: ${mother.name} (${mother.email}, ${mother.phone})` : ''}

      Address:
      ${address}
      ${city}, ${zipCode}

      Payment Information:
      - Total Children: ${numChildren}
      - Monthly Payment: $${totalCost}
      - Program Duration: ${termInfo.length} months
      - Total Program Cost: $${totalCost * termInfo.length}

      IMPORTANT REMINDERS:
      - You are enrolled for the entire ${termInfo.length}-month program
      - Monthly payments will be automatically charged
      - No refunds can be given
      - Monthly payments continue even if your child does not attend

        If you have any questions, please contact Masjid Suffah.

          Barakallahu feekum,
        Masjid Suffah Maktab Team

        ---
          This is an automated confirmation email.
          `.trim()
}

export async function sendEmail(registrationData, termInfo) {
  // Generate email content
  const emailContent = generateEmailContent(registrationData, termInfo)

  // Collect parent emails
  const parentEmails = []
  if (registrationData.father?.email) {
    parentEmails.push(registrationData.father.email)
  }
  if (registrationData.mother?.email) {
    parentEmails.push(registrationData.mother.email)
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

  const childrenNames = registrationData.children
    .map((child) => child.name)
    .join(', ')

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: parentEmails.join(', '),
    subject: `Maktab Registration Confirmation - ${termInfo.name} - ${childrenNames}`,
    text: emailContent,
  }
  await transporter.sendMail(mailOptions)
}
