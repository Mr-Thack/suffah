import { marked } from 'marked'
import { FORWARD_TO_EMAIL } from '$env/static/private'

// Types
export interface RegistrationData {
  father?: { name?: string; email?: string }
  mother?: { name?: string; email?: string }
  children: Array<{
    name: string
    dob: string
    sex: string
  }>
}

export interface TermInfo {
  name: string
  length: number
  p1: number
  p2: number
  p3: number
}

// Enhanced recipient interface to include names for personalization
export interface EmailRecipient {
  email: string
  name?: string
}

export interface EmailContent {
  htmlContent: string
  textContent: string
  subject: string
  recipients: EmailRecipient[]
  log?: boolean
  cc?: EmailRecipient[]
}

/**
 * Utility Functions
 */
function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  ).toLocaleDateString()
}

function cleanMarkdown(markdown: string): string {
  return markdown
    .split('\n')
    .map((line) => line.replace(/^\s+/, ''))
    .join('\n')
    .trim()
}

function markdownToHtml(markdown: string): string {
  const timestamp = new Date().toLocaleString()

  markdown += `


---

This email was automatically generated. No further action is required unless noted above.

Either reply to this email or contact ${FORWARD_TO_EMAIL} directly for any assitance.


**Sent at:** ${timestamp}`

  const cleanMd = cleanMarkdown(markdown)
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Masjid Suffah</title>
  <style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  h1 { color: #2c3e50; }
  h2 { color: #34495e; }
  strong { color: #2c3e50; }
  hr { border: 1px solid #bdc3c7; margin: 20px 0; }
  </style>
  </head>
  <body>
  ${marked(cleanMd)}
  </body>
  </html>`
}

/**
 * Generate registration confirmation email content
 */
export function generateRegistrationEmail(
  registrationData: RegistrationData,
  termInfo: TermInfo,
): EmailContent {
  const { father, mother, children } = registrationData

  // Extract parent information with names for personalization
  const recipients: EmailRecipient[] = []
  const parentFirstNames: string[] = []

  if (father?.email) {
    recipients.push({
      email: father.email,
      name: father.name || undefined,
    })
    if (father.name) parentFirstNames.push(father.name.split(' ')[0])
  }

  if (mother?.email) {
    recipients.push({
      email: mother.email,
      name: mother.name || undefined,
    })
    if (mother.name) parentFirstNames.push(mother.name.split(' ')[0])
  }

  const greetingNames =
    parentFirstNames.length > 0
      ? parentFirstNames.join(' and ')
      : 'Parent/Guardian'

  // Calculate costs
  const costs = [termInfo.p1, termInfo.p2, termInfo.p3]
  const monthlyCost = costs[Math.min(children.length - 1, 2)]
  const totalCost = monthlyCost * termInfo.length

  // Generate child entries
  const childEntries = children
    .map(
      (child, index) => `${index + 1}. **${child.name}**
- Date of Birth: ${formatDate(child.dob)}
- Gender: ${child.sex}`,
    )
    .join('\n\n')

  // Generate markdown content
  const markdown = `# Assalamu Alaikum Dear ${greetingNames},

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

1. You enrolled for the **entire program (${termInfo.length} months)**.
2. **No refunds** — even if your child stops attending.
3. **Monthly payments** continue even if absent.
4. No cancellation or withdrawal allowed.
5. Your card is **automatically charged** each month.

---

**Barakallahu Feekum,**  
**Masjid Suffah Team**`

  const textContent = cleanMarkdown(markdown)
  const htmlContent = markdownToHtml(markdown)

  return {
    htmlContent,
    textContent,
    subject: 'Maktab Registration Confirmation | Masjid Suffah',
    recipients,
    log: true,
    cc: recipients,
  }
}

/**
 * Generate test email content
 */
export function generateTestEmail(
  recipient: string,
  name?: string,
): EmailContent {
  const markdown = `# 🚀 Email Test Successful

This is a test email to verify the email system is working correctly.


**Barakallahu Feekum,**  
**AbdulMuqeet Mohammed**`

  const textContent = cleanMarkdown(markdown)
  const htmlContent = markdownToHtml(markdown)

  return {
    htmlContent,
    textContent,
    subject: 'Test Email - Masjid Suffah System',
    recipients: [{ email: recipient, name }],
  }
}
