<script lang="ts">
  import { isSuperAdmin } from '$lib/db.ts'
</script>

{#if isSuperAdmin()}
  Super
{/if}
