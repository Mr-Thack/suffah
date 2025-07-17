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

export async function sendEmail(registrationData, termInfo) {
  // 1️⃣ Instantiate and authenticate
  const emailAPI = new TransactionalEmailsApi()
  emailAPI.authentications.apiKey.apiKey = BREVO_API_KEY

  // 2️⃣ Prepare recipients
  const to = []
  if (registrationData.father?.email)
    to.push({ email: registrationData.father.email })
  if (registrationData.mother?.email)
    to.push({ email: registrationData.mother.email })

  // 3️⃣ Build contents
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

  // 4️⃣ Create SendSmtpEmail message
  const message = new SendSmtpEmail()
  message.sender = { email: SENDER_EMAIL, name: 'Masjid Suffah' }
  message.to = to
  message.replyTo = { email: SENDER_EMAIL, name: 'Masjid Suffah' }
  message.subject = 'Maktab Registration Confirmation | Masjid Suffah'
  message.htmlContent = html
  message.textContent = cleanMd

  // 5️⃣ Send it
  try {
    const resp = await emailAPI.sendTransacEmail(message)
    console.log('Email sent:', resp.body)
    return resp.body
  } catch (err) {
    console.error('Send error:', err.body || err)
    throw err
  }
}
