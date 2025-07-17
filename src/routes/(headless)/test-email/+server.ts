import { json } from '@sveltejs/kit'
import { dev } from '$app/environment'
import { sendTestEmail } from '$lib/email.js'

export async function GET() {
  // Security: Only allow in development
  if (!dev) {
    return json({ error: 'Not found' }, { status: 404 })
  }

  try {
    // Replace with your actual test email
    const testEmail = 'mr_thack@yahoo.com'

    const result = await sendTestEmail(testEmail)

    return json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      sentTo: testEmail,
    })
  } catch (error) {
    console.error('Email test failed:', error)

    return json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
