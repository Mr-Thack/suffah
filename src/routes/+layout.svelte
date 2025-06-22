<script lang="ts">
	import '../app.css';

  import { ModeWatcher } from "mode-watcher";
  import NavBar from "$lib/components/Navbar.svelte";  

	let { children } = $props();
</script>


<header class="w-full border-b">
  <div class="flex h-14 items-center px-4">
    <NavBar />
  </div>
</header>
  
<!--
<ModeWatcher />
-->
{@render children()}
