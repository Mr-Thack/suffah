<script lang="ts">
  import NavBar from '$lib/components/Navbar.svelte'

  let { children } = $props()
</script>

<NavBar />

<div data-sveltekit-preload-code="viewport" data-sveltekit-preload-data="hover">
  {@render children()}
</div>
