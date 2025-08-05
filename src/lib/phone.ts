import { phoneFormats } from '$lib/data/phoneFormats'

export function getExpectedDigitCount(countryCode: string): number {
  const format = phoneFormats[countryCode] || '###-###-####'
  return (format.match(/#/g) || []).length
}

export function detectCountryCode(
  phoneNumber: string,
  currentCountryCode: string = '1',
  respectDefault: boolean = true,
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '')

  if (!cleanNumber) return currentCountryCode

  if (respectDefault) {
    const startsWithPlus = phoneNumber.trim().startsWith('+')
    if (!startsWithPlus) return currentCountryCode
  }

  const sortedCodes = Object.keys(phoneFormats).sort(
    (a, b) => b.length - a.length,
  )

  if (!phoneNumber.trim().startsWith('+') && currentCountryCode === '1') {
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) return '1'
      if (cleanNumber.length === 10) return '1'
    }
  }

  for (const code of sortedCodes) {
    if (cleanNumber.startsWith(code)) return code
  }

  if (phoneNumber.trim().startsWith('+')) {
    for (const code of sortedCodes) {
      if (code.startsWith(cleanNumber)) return cleanNumber
    }
  }

  return currentCountryCode
}

export function formatPhoneNumber(
  value: string,
  currentCountryCode: string = '1',
  respectDefault: boolean = true,
): {
  formatted: string
  countryCode: string
  cleanNumber: string
} {
  const hasPlus = value.trim().startsWith('+')
  const cleanNumber = value.replace(/\D/g, '')

  if (!cleanNumber) {
    return { formatted: '', countryCode: currentCountryCode, cleanNumber: '' }
  }

  const detectedCode = detectCountryCode(
    value,
    currentCountryCode,
    respectDefault,
  )

  let nationalNumber = cleanNumber
  if (
    hasPlus ||
    detectedCode !== currentCountryCode ||
    cleanNumber.startsWith(detectedCode)
  ) {
    nationalNumber = cleanNumber.slice(detectedCode.length)
  }

  const format = phoneFormats[detectedCode] || '###-###-####'
  const expectedDigitCount = getExpectedDigitCount(detectedCode)

  if (nationalNumber.length > expectedDigitCount) {
    nationalNumber = nationalNumber.slice(0, expectedDigitCount)
  }

  const truncatedCleanNumber = detectedCode + nationalNumber
  let formatted = `+${detectedCode}`

  if (nationalNumber.length > 0) {
    formatted += ' '
    let numberIndex = 0

    for (const char of format) {
      if (char === '#' && numberIndex < nationalNumber.length) {
        formatted += nationalNumber[numberIndex++]
      } else if (char !== '#') {
        if (numberIndex > 0 || nationalNumber.length > 0) {
          formatted += char
        }
      }
    }
  }

  return {
    formatted,
    countryCode: detectedCode,
    cleanNumber: truncatedCleanNumber,
  }
}

export function formatPhone(phone?: string): string {
  if (!phone) return ''
  return formatPhoneNumber(phone).formatted
}
