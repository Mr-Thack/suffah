import type { RequestHandler } from '@sveltejs/kit'
import { upsertTermPlan } from '$lib/square'

export const POST: RequestHandler = async ({ request }) => {
  const { termName, termLength, prices } = await request.json()

  // Basic validation
  if (
    typeof termName !== 'string' ||
    typeof termLength !== 'number' ||
    !Array.isArray(prices) ||
    prices.some((p) => typeof p !== 'number')
  ) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
    })
  }

  // Call your helper
  const res = await upsertTermPlan(termName, termLength, prices)

  // Return the real IDs back to the client
  return new Response(
    JSON.stringify({
      success: true,
      planId: res[0],
      variations: res[1],
    }),
    { status: 200 },
  )
}
