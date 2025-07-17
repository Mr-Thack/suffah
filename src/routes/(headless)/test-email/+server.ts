import { json } from '@sveltejs/kit'
import { sendRawEmail } from '$lib/mail.ts'
import { dev } from '$app/environment'

export async function GET() {
  // Block access in production
  if (!dev) {
    return json({ error: 'Not found' }, { status: 404 })
  }

  try {
    // Test email content
    const testRecipients = ['mr_thack@yahoo.com'] // Replace with your actual test email
    const testSubject = 'Test Email - Masjid Suffah System'
    const testHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"/></head>
    <body>
    <h1>Email Test Successful</h1>
    <p>This is a test email to verify the email system is working correctly.</p>
    <p>Sent at: ${new Date().toLocaleString()}</p>
    <hr>
    <p><strong>Barakallahu Feekum,</strong><br>
    <strong>Masjid Suffah Team</strong></p>
    </body>
    </html>
    `
    const testText = `
    Email Test Successful

    This is a test email to verify the email system is working correctly.

      Sent at: ${new Date().toLocaleString()}

    ---

      Barakallahu Feekum,
    Masjid Suffah Team
    `

    const result = await sendRawEmail(
      testRecipients,
      testSubject,
      testHtml,
      testText,
    )

    return json({
      success: true,
      message: 'Email sent successfully',
      result: result,
    })
  } catch (error) {
    console.error('Email test failed:', error)

    return json(
      {
        success: false,
        error: error.message || 'Unknown error occurred',
        details: error.body || error,
      },
      { status: 500 },
    )
  }
}
