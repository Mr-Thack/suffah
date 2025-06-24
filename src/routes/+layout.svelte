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

{@render children()}
