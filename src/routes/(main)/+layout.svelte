<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte'

  let { children } = $props()

  const navLinks: Link[] = [
    { href: '/', label: 'Home' },
    { href: '/maktab', label: 'Maktab' },
    { href: '/location', label: 'Location' },
    { href: '/donate', label: 'Donate' },
  ]
  const actionLink: Link = {
    href: '/display',
    label: 'View Prayer Times',
  }
</script>

<Navbar {navLinks} {actionLink} />

<div data-sveltekit-preload-code="viewport" data-sveltekit-preload-data="hover">
  {@render children()}
</div>
