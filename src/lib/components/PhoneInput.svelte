<script lang="ts">
  import { Input } from '$lib/components/ui/input'
  import { Phone } from 'lucide-svelte'
  import {
    getExpectedDigitCount,
    detectCountryCode,
    formatPhoneNumber,
  } from '$lib/phone'
  import { phoneFormats } from '$lib/data/phoneFormats'

  // Props with bindable defaults
  let {
    phone = $bindable(''),
    countryCode = $bindable('1'),
    class: className = '',
    ...restProps
  }: {
    phone?: string
    countryCode?: string
    class?: string
    [key: string]: any
  } = $props()

  // Internal state for the display value
  let displayValue = $state('')
  let lastValidPhone = $state('')
  let inputElement: HTMLInputElement
  let userHasStartedTyping = $state(false)

  // Calculate cursor position after formatting
  function calculateCursorPosition(
    oldValue: string,
    newValue: string,
    oldCursor: number,
    isBackspace: boolean = false,
  ): number {
    if (isBackspace) {
      // For backspace, try to maintain relative position
      const ratio = oldCursor / oldValue.length
      return Math.floor(ratio * newValue.length)
    }

    // For regular input, find the position by counting digits
    let digitCount = 0
    let targetDigits = 0

    // Count digits up to cursor position in old value
    for (let i = 0; i < Math.min(oldCursor, oldValue.length); i++) {
      if (/\d/.test(oldValue[i])) {
        targetDigits++
      }
    }

    // Find corresponding position in new value
    for (let i = 0; i < newValue.length; i++) {
      if (/\d/.test(newValue[i])) {
        digitCount++
        if (digitCount >= targetDigits) {
          return i + 1
        }
      }
    }

    return newValue.length
  }

  // Handle keydown for backspace logic
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      const target = event.target as HTMLInputElement
      const cursorPosition = target.selectionStart || 0

      if (cursorPosition > 0) {
        const charBeforeCursor = displayValue[cursorPosition - 1]

        // If the character before cursor is a formatting character,
        // remove the digit before it instead
        if (charBeforeCursor && /[\s\-\(\)]/.test(charBeforeCursor)) {
          event.preventDefault()

          // Find the last digit before this formatting character
          let digitPos = cursorPosition - 2
          while (digitPos >= 0 && !/\d/.test(displayValue[digitPos])) {
            digitPos--
          }

          if (digitPos >= 0) {
            // Remove the digit and reformat
            const beforeDigit = displayValue.slice(0, digitPos)
            const afterCursor = displayValue.slice(cursorPosition)
            const newValue = beforeDigit + afterCursor

            const {
              formatted,
              countryCode: newCountryCode,
              cleanNumber,
            } = formatPhoneNumber(newValue, countryCode, false)

            displayValue = formatted
            countryCode = newCountryCode
            phone = cleanNumber ? `+${cleanNumber}` : ''

            // Set cursor position after the formatting
            requestAnimationFrame(() => {
              const newCursorPos = calculateCursorPosition(
                displayValue,
                formatted,
                digitPos,
                true,
              )
              target.setSelectionRange(newCursorPos, newCursorPos)
            })
          }
        }
      }
    }
  }

  // Handle input changes
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    const cursorPosition = target.selectionStart || 0
    const oldValue = displayValue
    const oldValueWasEmpty = displayValue === ''

    // Mark that user has started typing
    if (!userHasStartedTyping && target.value.length > 0) {
      userHasStartedTyping = true
    }

    const {
      formatted,
      countryCode: newCountryCode,
      cleanNumber,
    } = formatPhoneNumber(target.value, countryCode, !userHasStartedTyping)

    // Update bound values
    displayValue = formatted
    countryCode = newCountryCode
    phone = cleanNumber ? `+${cleanNumber}` : ''

    // Restore cursor position accounting for formatting changes
    requestAnimationFrame(() => {
      let newPosition: number

      if (oldValueWasEmpty || !oldValue.startsWith(`+${newCountryCode}`)) {
        // If we're transitioning from empty or changing country codes,
        // position cursor after the last digit, not at the very end
        const nationalDigits = cleanNumber.slice(newCountryCode.length)
        let digitCount = 0

        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            digitCount++
            // Position cursor after the last national digit
            if (digitCount === newCountryCode.length + nationalDigits.length) {
              newPosition = i + 1
              break
            }
          }
        }

        // Fallback to end if we couldn't find the position
        if (newPosition === undefined) {
          newPosition = formatted.length
        }
      } else {
        newPosition = calculateCursorPosition(
          oldValue,
          formatted,
          cursorPosition,
        )
      }

      target.setSelectionRange(newPosition, newPosition)
    })
  }

  // Handle paste events
  function handlePaste(event: ClipboardEvent) {
    event.preventDefault()
    const pastedText = event.clipboardData?.getData('text') || ''

    // Mark that user has started typing
    userHasStartedTyping = true

    const {
      formatted,
      countryCode: newCountryCode,
      cleanNumber,
    } = formatPhoneNumber(pastedText, countryCode, false)

    displayValue = formatted
    countryCode = newCountryCode
    phone = cleanNumber ? `+${cleanNumber}` : ''
  }

  // Initialize display value if phone prop is provided
  $effect(() => {
    if (phone && phone !== lastValidPhone) {
      const { formatted } = formatPhoneNumber(phone, countryCode, false)
      displayValue = formatted
      lastValidPhone = phone
    }
  })

  // Generate dynamic placeholder based on detected country code
  const dynamicPlaceholder = $derived(() => {
    const format = phoneFormats[countryCode] || '###-###-####'
    return `+${countryCode} ${format}`
  })
</script>

<Input
  bind:this={inputElement}
  type="tel"
  autocomplete="tel"
  bind:value={displayValue}
  oninput={handleInput}
  onkeydown={handleKeyDown}
  onpaste={handlePaste}
  placeholder={dynamicPlaceholder()}
  class={className}
  {...restProps} />
