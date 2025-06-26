<script lang="ts">
  import { Input } from '$lib/components/ui/input'
  import { phoneFormats } from '$lib/data/phoneFormats'
  import { Plus } from 'lucide-svelte' // Props with bindable defaults

  let {
    phone = $bindable(''),
    partial = $bindable(''),
    countryCode = $bindable('1'),
    class: className = '',
    ...restProps
  }: {
    phone?: string
    partial?: string
    countryCode?: string
    class?: string
    [key: string]: any
  } = $props() // Internal state for partial number

  let partialNumber = $state('') // Strip leading zeros if user types them in country code

  $effect(() => {
    if (countryCode.startsWith('0')) {
      countryCode = countryCode.replace(/^0+/, '') || '1'
    }
  }) // Update full phone number and partial whenever countryCode or partialNumber changes

  $effect(() => {
    if (countryCode && partialNumber) {
      // Remove all non-numeric characters from partial number
      const cleanPartial = partialNumber.replace(/\D/g, '')
      phone = `+${countryCode}${cleanPartial}`
      partial = cleanPartial
    } else {
      phone = ''
      partial = ''
    }
  })

  const partialMask = $derived(
    phoneFormats[countryCode] || '#*', // Fallback for unknown codes
  ) // Maska options update whenever partialMask changes

  const maskOptions = $derived({ mask: partialMask })
  // Generate placeholder from the partial mask - defaults to US format via countryCode

  const computedPlaceholder = $derived(partialMask.replace(/#/g, '0'))
</script>

<div class="flex items-center gap-2">
  <Plus class="h-4 w-4 text-muted-foreground" />
  <Input
    type="tel"
    bind:value={countryCode}
    placeholder="1"
    class="w-16"
    maxlength={3}
    {...restProps} />
  <Input
    type="tel"
    mask={maskOptions}
    bind:value={partialNumber}
    placeholder={computedPlaceholder}
    class={className}
    {...restProps} />
</div>
