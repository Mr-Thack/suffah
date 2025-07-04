import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ request }) => {
  const referer = request.headers.get('referer') ?? ''
  const refererParams: Record<string, string> = {}

  if (referer) {
    try {
      const url = new URL(referer)
      for (const [key, value] of url.searchParams) {
        refererParams[key] = value
      }
    } catch {
      console.debug('Please note that something is wrong with referer')
      // ignore invalid URLs
    }
  }
  console.log('Referer:', referer)
  console.log('Referer Params:', refererParams)

  return { referer, refererParams }
}
