import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo'
import { marked } from 'marked'
import { BREVO_API_KEY, SENDER_EMAIL } from '$env/static/private'

if (!BREVO_API_KEY || !SENDER_EMAIL) {
  throw new Error('Missing Brevo environment variables')
}

// Normalize dates to local format
function formatDate(dateString) {
  const [year, month, day] = dateString.split('-')
  return new Date(year, month - 1, day).toLocaleDateString()
}

/**
 * Generate the registration confirmation email in Markdown
 */
function generateEmailContent(registrationData, termInfo) {
  const { father, mother, children } = registrationData

  const parentEmails = []
  const parentFirstNames = []
  if (father?.email) {
    parentEmails.push(father.email)
    father.name && parentFirstNames.push(father.name.split(' ')[0])
  }
  if (mother?.email) {
    parentEmails.push(mother.email)
    mother.name && parentFirstNames.push(mother.name.split(' ')[0])
  }
  const greetingNames = parentFirstNames.join(' and ')

  const costs = [termInfo.p1, termInfo.p2, termInfo.p3]
  const monthlyCost = costs[Math.min(children.length - 1, 2)]
  const totalCost = monthlyCost * termInfo.length

  const childEntries = children
    .map(
      (c, i) => `${i + 1}. **${c.name}**
      - Date of Birth: ${formatDate(c.dob)}
    - Gender: ${c.sex}`,
    )
    .join('\n\n')

  return `# Assalamu Alaikum Dear ${greetingNames},

  ---

    ## Program Details

  - **Program:** ${termInfo.name}
  - **Duration:** ${termInfo.length} Months

  ## Student Information

  ${childEntries}

  ## Payment Summary

  - **Monthly Payment:** $${monthlyCost}
  - **Total Program Cost (${termInfo.length} Months):** $${totalCost}

  ### Terms & Conditions

  1. You enrolled for the **entire program (2 months)**.
      2. **No refunds** — even if your child stops attending.
        3. **Monthly payments** continue even if absent.
          4. No cancellation or withdrawal allowed.
            5. Your card is **automatically charged** each month.

              ---

                For assistance, **reply** or contact **${SENDER_EMAIL}**.

                  **Barakallahu Feekum,**  
                    **Masjid Suffah Team**`
}

// Actual Email sending function
export async function sendRawEmail(
  recipients: string[],
  subject: string,
  htmlContent: string,
  textContent: string,
) {
  const emailAPI = new TransactionalEmailsApi()
  emailAPI.authentications.apiKey.apiKey = BREVO_API_KEY

  const to = recipients.map((email) => ({ email }))

  const message = new SendSmtpEmail()
  message.sender = { email: SENDER_EMAIL, name: 'Masjid Suffah' }
  message.to = to
  message.replyTo = { email: SENDER_EMAIL, name: 'Masjid Suffah' }
  message.subject = subject
  message.htmlContent = htmlContent
  message.textContent = textContent

  try {
    const resp = await emailAPI.sendTransacEmail(message)
    console.log('Email sent:', resp.body)
    return resp.body
  } catch (err) {
    console.error('Send error:', err.body || err)
    throw err
  }
}

export async function sendEmail(registrationData, termInfo) {
  // Prepare recipients
  const recipients = []
  if (registrationData.father?.email)
    recipients.push(registrationData.father.email)
  if (registrationData.mother?.email)
    recipients.push(registrationData.mother.email)

  // Build contents
  const markdown = generateEmailContent(registrationData, termInfo)
  const cleanMd = markdown
    .split('\n')
    .map((l) => l.replace(/^\s+/, ''))
    .join('\n')
    .trim()
  const html = `<!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/></head>
      <body>
      ${marked(cleanMd)}
      </body>
      </html>`

  const subject = 'Maktab Registration Confirmation | Masjid Suffah'

  return await sendRawEmail(recipients, subject, html, cleanMd)
}
