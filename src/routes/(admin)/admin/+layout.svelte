<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { db } from '$lib/db.ts'

  let checking = $state(true)

  onMount(async () => {
    const {
      data: { session },
    } = await db.auth.getSession()
    if (!session) {
      goto('/login')
    } else {
      checking = false
    }
  })

  let { children } = $props()
</script>

{#if checking}
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-muted-foreground">Checking authentication…</p>
  </div>
{:else}
  {@render children()}
{/if}
