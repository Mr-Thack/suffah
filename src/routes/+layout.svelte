<script lang="ts">
  import '../app.css'

  import { ModeWatcher } from 'mode-watcher'
  import { Toaster } from '$lib/components/ui/sonner'

  let { children } = $props()
</script>

<Toaster richColors />

<ModeWatcher />

<div data-sveltekit-preload-code="viewport" data-sveltekit-preload-data="hover">
  {@render children()}
</div>
