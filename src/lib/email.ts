import { BREVO_API_KEY } from '$env/static/private'
import {
  PUBLIC_SENDER_EMAIL,
  PUBLIC_SENDER_NAME,
  PUBLIC_FORWARD_TO_EMAIL,
  PUBLIC_BOT_NAME,
  PUBLIC_LOGGING_EMAIL,
} from '$env/static/public'
import {
  generateRegistrationEmail,
  generateTestEmail,
  type RegistrationData,
  type TermInfo,
  type EmailContent,
  type EmailRecipient,
} from '$lib/emailTemplates.js'

// Types
export interface EmailResponse {
  messageId: string
  [key: string]: any
}

const requiredVars = {
  BREVO_API_KEY,
  PUBLIC_SENDER_EMAIL,
  PUBLIC_SENDER_NAME,
  PUBLIC_FORWARD_TO_EMAIL,
  PUBLIC_BOT_NAME,
  PUBLIC_LOGGING_EMAIL,
}

const missingVars = Object.entries(requiredVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingVars.join(', ')}`,
  )
}

/**
 * Core email sending function using Brevo API with anti-spam optimizations
 */
async function sendEmail(emailContent: EmailContent): Promise<EmailResponse> {
  // Build recipients array with proper name handling for personalization
  const recipients = emailContent.recipients.map(
    (recipient: EmailRecipient) => {
      const recipientObj: any = { email: recipient.email }

      // Include name if available for better personalization and spam score
      if (recipient.name) {
        recipientObj.name = recipient.name
      }

      return recipientObj
    },
  )

  // Sender configuration with proper name and email
  const senderInfo = {
    email: PUBLIC_SENDER_EMAIL,
    name: PUBLIC_SENDER_NAME,
  }

  const payload = {
    sender: senderInfo,
    to: recipients,

    // Reply-to configuration (important for spam scoring)
    replyTo: senderInfo,

    // This'll be null anyways if not configured by the generation function,
    // So, it shouldn't be an issue
    cc: emailContent.cc,

    // For logging, if set
    bcc: emailContent.log
      ? [{ email: PUBLIC_LOGGING_EMAIL, name: 'MasjidSuffah Logging' }]
      : undefined,

    // Subject line
    subject: emailContent.subject,

    // Email content
    htmlContent: emailContent.htmlContent,
    textContent: emailContent.textContent,

    // Anti-spam and delivery optimization headers
    headers: {
      // Custom headers to improve deliverability
      'X-Mailer': `${PUBLIC_BOT_NAME} (NodeMailer+Brevo; by AbdulMuqeet Mohammed)`,
      'X-Priority': '3', // Normal priority (1=high, 3=normal, 5=low)
      'X-MSMail-Priority': 'Normal',
      Importance: 'Normal',

      // List-Unsubscribe header (reduces spam complaints)
      'List-Unsubscribe': `<mailto:${PUBLIC_FORWARD_TO_EMAIL}?subject=Unsubscribe>`,

      // Authentication headers to improve reputation
      'X-Mailer-Info': `Masjid Suffah's Automated Mail System; Contact ${PUBLIC_FORWARD_TO_EMAIL} if needed;`,
    },

    // Tags for tracking and organization (helps with Brevo analytics)
    tags: ['registration', 'maktab', 'confirmation'],

    // Template ID can be used if you create templates in Brevo dashboard
    // templateId: 1, // Uncomment if using Brevo templates

    // Tracking settings (can impact delivery speed)
    trackOpens: true,
    trackClicks: true,

    // Batch delivery settings to avoid being flagged as bulk
    batchDelivery: false, // Send immediately, not in batches

    // Scheduled sending (remove for immediate delivery)
    // scheduledAt: new Date(Date.now() + 60000).toISOString(), // 1 minute delay
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,

        // Additional headers for better API performance
        Accept: 'application/json',
        'User-Agent': PUBLIC_BOT_NAME,

        // Cache control to ensure fresh requests
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Brevo API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        payload: JSON.stringify(payload, null, 2),
      })
      throw new Error(`Brevo API error: ${response.status} - ${errorData}`)
    }

    const result = await response.json()

    // Enhanced logging for debugging delivery issues
    console.log('Email sent successfully:', {
      messageId: result.messageId,
      recipients: recipients.map((r) => r.email),
      subject: emailContent.subject,
      timestamp: new Date().toISOString(),
    })

    return result
  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      stack: error.stack,
      recipients: recipients.map((r) => r.email),
      subject: emailContent.subject,
      timestamp: new Date().toISOString(),
    })
    throw error
  }
}

/**
 * Send registration confirmation email with enhanced recipient handling
 */
export async function sendRegistrationEmail(
  registrationData: RegistrationData,
  termInfo: TermInfo,
): Promise<EmailResponse> {
  const emailContent = generateRegistrationEmail(registrationData, termInfo)

  // Log registration email details for debugging
  console.log('Sending registration email:', {
    recipients: emailContent.recipients.map((r) => ({
      email: r.email,
      name: r.name,
    })),
    subject: emailContent.subject,
    timestamp: new Date().toISOString(),
  })

  return sendEmail(emailContent)
}

/**
 * Send test email with optional name parameter
 */
export async function sendTestEmail(
  recipient: string,
  name?: string,
): Promise<EmailResponse> {
  const emailContent = generateTestEmail(recipient, name)

  // Log test email details
  console.log('Sending test email:', {
    recipient: recipient,
    name: name || 'Not provided',
    timestamp: new Date().toISOString(),
  })

  return sendEmail(emailContent)
}

// Re-export types for convenience
export type {
  RegistrationData,
  TermInfo,
  EmailContent,
  EmailRecipient,
} from '$lib/emailTemplates.ts'
