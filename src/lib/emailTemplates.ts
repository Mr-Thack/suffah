import { marked } from 'marked'

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

export interface EmailContent {
  htmlContent: string
  textContent: string
  subject: string
  recipients: string[]
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
  const cleanMd = cleanMarkdown(markdown)
  return `<!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8"/></head>
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

  // Extract parent information
  const parentEmails: string[] = []
  const parentFirstNames: string[] = []

  if (father?.email) {
    parentEmails.push(father.email)
    if (father.name) parentFirstNames.push(father.name.split(' ')[0])
  }

  if (mother?.email) {
    parentEmails.push(mother.email)
    if (mother.name) parentFirstNames.push(mother.name.split(' ')[0])
  }

  const greetingNames = parentFirstNames.join(' and ')

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

- **Monthly Payment:** ${monthlyCost}
- **Total Program Cost (${termInfo.length} Months):** ${totalCost}

### Terms & Conditions

1. You enrolled for the **entire program (${termInfo.length} months)**.
  2. **No refunds** — even if your child stops attending.
  3. **Monthly payments** continue even if absent.
  4. No cancellation or withdrawal allowed.
  5. Your card is **automatically charged** each month.

  ---

  For assistance, **reply** or contact **support@masjidsuffah.org**.

  **Barakallahu Feekum,**  
  **Masjid Suffah Team**`

  const textContent = cleanMarkdown(markdown)
  const htmlContent = markdownToHtml(markdown)

  return {
    htmlContent,
    textContent,
    subject: 'Maktab Registration Confirmation | Masjid Suffah',
    recipients: parentEmails,
  }
}

/**
 * Generate test email content
 */
export function generateTestEmail(recipient: string): EmailContent {
  const timestamp = new Date().toLocaleString()

  const markdown = `# 🚀 Email Test Successful

  This is a test email to verify the email system is working correctly.

    **Sent at:** ${timestamp}

  ---

    **Barakallahu Feekum,**  
    **Masjid Suffah Team**`

  const textContent = cleanMarkdown(markdown)
  const htmlContent = markdownToHtml(markdown)

  return {
    htmlContent,
    textContent,
    subject: 'Test Email - Masjid Suffah System',
    recipients: [recipient],
  }
}
