<script lang="ts">
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'
  import { Eye, EyeOff } from 'lucide-svelte'
  import { createEventDispatcher } from 'svelte'

  export let id = ''
  export let value: string
  export let placeholder = ''
  export let autocomplete = ''
  export let invalid = false

  let showing = false
  const dispatch = createEventDispatcher()

  function toggle() {
    showing = !showing
  }

  // Re‑emit input events so parent can bind:value
  function handleInput(e: Event) {
    dispatch('input', e)
  }
</script>

<div class="relative flex flex-row">
  <Input
    {id}
    type={showing ? 'text' : 'password'}
    bind:value
    {placeholder}
    {autocomplete}
    aria-invalid={invalid}
    class="mt-1"
    on:input={handleInput} />
  <Button
    type="button"
    variant="ghost"
    size="icon"
    class="absolute inset-y-0 right-0 m-1"
    aria-label={showing ? 'Hide password' : 'Show password'}
    onclick={toggle}>
    {#if showing}
      <EyeOff size={16} />
    {:else}
      <Eye size={16} />
    {/if}
  </Button>
</div>
