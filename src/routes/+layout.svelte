<script lang="ts">
  import '../app.css'

  import { ModeWatcher } from 'mode-watcher'
  import NavBar from '$lib/components/Navbar.svelte'
  import { Toaster } from '$lib/components/ui/sonner'

  let { children } = $props()
</script>

<Toaster />

<NavBar />

<ModeWatcher />

<div data-sveltekit-preload-code="viewport" data-sveltekit-preload-data="hover">
  {@render children()}
</div>
