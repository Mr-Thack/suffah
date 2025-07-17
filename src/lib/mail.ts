import nodemailer from 'nodemailer'
import { marked } from 'marked'
import { GMAIL_USER, GMAIL_APP_PASSWORD } from '$env/static/private'

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  throw new Error('Missing Gmail environment variables')
}

// This is to ensure it looks the same, regardless of server timezone
function formatDate(dateString): string {
  const [year, month, day] = dateString.split('-')
  return new Date(year, month - 1, day).toLocaleDateString()
}

/**
 * Generate the registration confirmation email in Markdown format
 */
function generateEmailContent(registrationData, termInfo) {
  const { father, mother, children, address, city, zipCode } = registrationData

  // Gather parent emails and names
  const parentEmails = []
  const parentFirstNames = []
  if (father?.email) {
    parentEmails.push(father.email)
    if (father.name) parentFirstNames.push(father.name.split(' ')[0])
  }
  if (mother?.email) {
    parentEmails.push(mother.email)
    if (mother.name) parentFirstNames.push(mother.name.split(' ')[0])
  }

  const greetingNames = parentFirstNames.join(' and ')

  // Cost calculation
  const childrenCost = [termInfo.p1, termInfo.p2, termInfo.p3]
  const numChildren = children.length
  const monthlyCost = childrenCost[Math.min(numChildren - 1, 2)]
  const totalProgramCost = monthlyCost * termInfo.length

  // List of child entries
  const childEntries = children
    .map(
      (child, idx) => `${idx + 1}. **${child.name}**
- Date of Birth: ${formatDate(child.dob)}
- Gender: ${child.sex}`,
    )
    .join('')

  // ENSURE THERE ARE NO SPACES OR ELSE MARKDOWN THINKS THIS IS CODE
  return `# Assalamu Alaikum Dear ${greetingNames},

---

## Program Details

- **Program:** ${termInfo.name}
- **Duration:** ${termInfo.length} Months

## Student Information

${childEntries}

## Payment Summary

- **Monthly Payment:** $${monthlyCost}
- **Total Program Cost (${termInfo.length} months):** $${totalProgramCost}

### Terms & Conditions

By having submitted the form, you acknowledged:
1. When you enrolled, you signed up for the **entire program (2 months)** (not just month-to-month)
2. **No refunds** can be given — **even if your child(ren) stop(s) attending**.
3. **Monthly payments** will still be charged, **even if your child does not attend**.
4. You **cannot cancel or withdraw** from the program.
5. Your card will be **automatically charged each month**.

---

For any assistance, **reply** to this email or contact us at **${GMAIL_USER}**

**Barakallahu feekum,**  
**Masjid Suffah Maktab Team**`
}

/**
 * Send confirmation email to parents
 */
export async function sendEmail(registrationData, termInfo) {
  const parentEmails = []
  if (registrationData.father?.email)
    parentEmails.push(registrationData.father.email)
  if (registrationData.mother?.email)
    parentEmails.push(registrationData.mother.email)

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

  // Generate content
  const markdownContent = generateEmailContent(registrationData, termInfo)
  const cleanMd = markdownContent
    .split('\n')
    .map((line) => line.replace(/^\s+/, '')) // strip leading whitespace
    .join('\n')
    .trim()
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body>
${marked(cleanMd)}
</body>
</html>`

  const mailOptions = {
    from: `Masjid Suffah <${GMAIL_USER}>`, // sender address
    replyTo: parentEmails.join(', '), // replies go to both parents
    to: parentEmails.join(', '),
    subject: `Maktab Registration Confirmation | Masjid Suffah`,
    text: markdownContent, // plain-text fallback
    html: htmlContent, // rendered HTML
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info, markdownContent)
    return info
  } catch (err) {
    console.error('Email delivery error:', err)
    throw err
  }
}
