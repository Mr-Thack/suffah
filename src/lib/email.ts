import { BREVO_API_KEY, SENDER_EMAIL } from '$env/static/private'
import {
  generateRegistrationEmail,
  generateTestEmail,
  type RegistrationData,
  type TermInfo,
  type EmailContent,
} from './emailTemplates.js'

// Types
export interface EmailResponse {
  messageId: string
  [key: string]: any
}

// Validation
if (!BREVO_API_KEY || !SENDER_EMAIL) {
  throw new Error('Missing Brevo environment variables')
}

/**
 * Core email sending function using Brevo API
 */
async function sendEmail(emailContent: EmailContent): Promise<EmailResponse> {
  const payload = {
    sender: { email: SENDER_EMAIL, name: 'Masjid Suffah' },
    to: emailContent.recipients.map((email) => ({ email })),
    replyTo: { email: SENDER_EMAIL, name: 'Masjid Suffah' },
    subject: emailContent.subject,
    htmlContent: emailContent.htmlContent,
    textContent: emailContent.textContent,
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Brevo API error: ${response.status} - ${errorData}`)
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)
    return result
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}

/**
 * Send registration confirmation email
 */
export async function sendRegistrationEmail(
  registrationData: RegistrationData,
  termInfo: TermInfo,
): Promise<EmailResponse> {
  const emailContent = generateRegistrationEmail(registrationData, termInfo)
  return sendEmail(emailContent)
}

/**
 * Send test email
 */
export async function sendTestEmail(recipient: string): Promise<EmailResponse> {
  const emailContent = generateTestEmail(recipient)
  return sendEmail(emailContent)
}

// Re-export types for convenience
export type {
  RegistrationData,
  TermInfo,
  EmailContent,
} from './emailTemplates.js'
