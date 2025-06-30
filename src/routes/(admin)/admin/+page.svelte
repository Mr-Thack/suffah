<script lang="ts">
  import { isSuperAdmin } from '$lib/db.ts'
  import { onMount } from 'svelte'
  import { Button } from '$lib/components/ui/button'
  import { db } from '$lib/db.ts'
  import { goto } from '$app/navigation'

  let isSuper = $state(false)

  onMount(async () => {
    isSuper = await isSuperAdmin()
  })

  async function logout() {
    const { error } = await db.auth.signOut()

    goto('/login')
  }
</script>

{#if isSuper}
  Super
{:else}
  Not Super
{/if}

<div>
  <Button href="/setup-admin">Settings</Button>
  <Button href="/admin/maktab">Maktab Form</Button>
  <Button variant="destructive" onclick={logout}>Logout</Button>
</div>
