<script lang="ts">
  import { isSuperAdmin } from '$lib/db.ts'
  import { onMount } from 'svelte'

  let isSuper = $state(false)

  onMount(async () => {
    isSuper = await isSuperAdmin()
  })
</script>

{#if isSuper}
  Super
{:else}
  Not Super
{/if}
