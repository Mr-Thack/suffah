<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { db } from '$lib/db.ts'
  import { Button } from '$lib/components/ui/button'

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

  async function logout() {
    const { error } = await db.auth.signOut()

    goto('/login')
  }
  let { children } = $props()
</script>

<div>
  <Button href="/setup-admin">Settings</Button>
  <Button href="/admin/maktab-form">Maktab Form</Button>
  <Button href="/admin/maktab-terms">Maktab Terms</Button>
  <Button variant="destructive" onclick={logout}>Logout</Button>
</div>

{#if checking}
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-muted-foreground">Checking authentication…</p>
  </div>
{:else}
  {@render children()}
{/if}
