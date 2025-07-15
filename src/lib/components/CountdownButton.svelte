<script lang="ts">
  import { onMount } from 'svelte'
  import { Button } from '$lib/components/ui/button'

  let { seconds = 5, onClick } = $props<{
    seconds?: number
    onClick: () => void
  }>()

  let remaining = $state(seconds)

  onMount(() => {
    const id = setInterval(() => {
      remaining--
      if (remaining <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  })
</script>

<Button disabled={remaining > 0} onclick={onClick} class="w-full">
  {remaining > 0 ? `Wait ${remaining}s` : 'Proceed to Payment'}
</Button>
