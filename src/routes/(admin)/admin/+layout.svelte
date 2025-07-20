<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { db } from '$lib/db.ts'
  import { Button } from '$lib/components/ui/button'
  import Navbar from '$lib/components/Navbar.svelte'

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

  const navLinks = [
    { href: '/db', label: 'Database' },
    {
      label: 'Maktab',
      items: [
        { href: '/maktab-form', label: 'Maktab Form' },
        { href: '/maktab-terms', label: 'Maktab Terms' },
      ],
    },
    { href: '/display', label: 'Display' },
  ]
  const actionLink = {
    href: '/../setup-admin',
    label: 'User Settings',
  }
  const actionLinkDestructive = {
    onClick: logout,
    label: 'Logout',
  }
</script>

<Navbar isAdmin={true} {navLinks} {actionLink} {actionLinkDestructive} />

{#if checking}
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-muted-foreground">Checking authentication…</p>
  </div>
{:else}
  {@render children()}
{/if}
