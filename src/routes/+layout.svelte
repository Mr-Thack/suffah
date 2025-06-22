<script lang="ts">
  import '../app.css'

  import { ModeWatcher } from 'mode-watcher'
  import NavBar from '$lib/components/Navbar.svelte'

  let { children } = $props()
</script>

<NavBar />

<ModeWatcher />
{@render children()}
