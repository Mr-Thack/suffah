import { marked } from 'marked'
import { PUBLIC_FORWARD_TO_EMAIL } from '$env/static/public'
import { formatPhone } from '$lib/phone'

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

export interface RowData extends RegistrationData {
  id: number
  dateSubmitted: string
  customerId: string
  subscriptionId: string
  address: string
  city: string
  zipCode: string
}

export interface TermInfo {
  name: string
  length: number
  p1: number
  p2: number
  p3: number
  sid1: string
  sid2: string
  sid3: string
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
  const cleanMd = cleanMarkdown(markdown)
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Masjid Suffah</title>
  <style>
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    padding: 20px;
  }

  h1 {
    color: #2c3e50;
    margin-bottom: 0.5em;
  }

  h2 {
    color: #34495e;
    margin-top: 1.5em;
  }

  strong {
    color: #2c3e50;
  }

  hr {
    border: 1px solid #bdc3c7;
    margin: 20px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
  }

  th, td {
    border: 1px solid #ccc;
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  tr:nth-child(even) {
    background-color: #fafafa;
  }
  </style>
  </head>
  <body>
  ${marked(cleanMd)}
  </body>
  </html>`
}

function markdownToEmail(markdown: string): string {
  const timestamp = new Date().toLocaleString()

  markdown += `


  ---

    This email was automatically generated. No further action is required unless noted above.

    Either reply to this email or contact ${PUBLIC_FORWARD_TO_EMAIL} directly for any assitance.


    **Sent at:** ${timestamp}`

  return markdownToHtml(markdown)
}

export function generateBookkeepingForm(
  registrationData: RowData,
  term: TermInfo,
): string {
  console.log(term)

  const {
    id,
    dateSubmitted,
    customerId,
    subscriptionId,
    father,
    mother,
    address,
    city,
    zipCode,
    children,
  } = registrationData

  const submissionInfo = `
    ## Submission Info

    | Field           | Value |
    |------------------|-------|
    | Application ID   | ${id} |
    | Date Submitted   | ${new Date(dateSubmitted).toLocaleString('en-US', { timeZone: 'UTC' })} |
    | Customer ID      | ${customerId} |
    | Subscription ID  | ${subscriptionId} |
    | Term ID          | ${term.id} |`

  const termInfo = `
    ## Term Details

    | Field                | Value |
    |----------------------|-------|
    | Term Name            | ${term.name} |
    | Length               | ${term.length} Months |
    | Price (1 student)    | ${term.p1} |
    | Price (2 students)   | ${term.p2} |
    | Price (3+ students)  | ${term.p3} |
    | Subscription ID (1)  | ${term.sid1} |
    | Subscription ID (2)  | ${term.sid2} |
    | Subscription ID (3+) | ${term.sid3} |`

  const parentTable = `
    ## Parent/Guardian Details

    |         | Name              | Email              | Phone             |
    |---------|-------------------|--------------------|-------------------|
    | Father  | ${father?.name || 'N/A'} | ${father?.email || 'N/A'} | ${formatPhone(father?.phone) || 'N/A'} |
    | Mother  | ${mother?.name || 'N/A'} | ${mother?.email || 'N/A'} | ${formatPhone(mother?.phone) || 'N/A'} |`

  const addressSection = `
    **Address:** ${address}  
    **City:** ${city}  
    **Zip Code:** ${zipCode}`

  const childTableHeader = `
        ## Enrolled Children

          | Child # | Name            | Sex   | Date of Birth   |
            |---------|------------------|-------|-----------------|`

  const childTableRows = children
    .map(
      (child, index) =>
        `| ${index + 1} | ${child.name} | ${child.sex} | ${formatDate(child.dob)} |`,
    )
    .join('\n')

  const markdown = `
          # Masjid Suffah Maktab - Registration Record #${id}

          ${parentTable}

          ${addressSection}


          ---

            ${childTableHeader}
          ${childTableRows}


          ---

            ${termInfo}

          <div style="page-break-after: always;"></div>

          ${submissionInfo}
          `

  return markdownToHtml(markdown)
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

By clicking the **“Pay $${monthlyCost}/Month for ${termInfo.length} Months”** button on our website, you agreed to the following:

1. You enrolled in the **full program (${termInfo.length} months)** — not a month-to-month plan.  
2. **No refunds** will be given, even if your child stops attending.  
3. **Monthly payments** will continue as scheduled, even if your child is absent.  
4. You cannot cancel or withdraw from the program once enrolled.  
5. Your card will be **automatically charged each month**.

This email is a confirmation of your enrollment and agreement to these terms.

---

**Barakallahu Feekum,**  
**Masjid Suffah Team**`

  const textContent = cleanMarkdown(markdown)
  const htmlContent = markdownToEmail(markdown)

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
  const htmlContent = markdownToEmail(markdown)

  return {
    htmlContent,
    textContent,
    subject: 'Test Email - Masjid Suffah System',
    recipients: [{ email: recipient, name }],
  }
}
