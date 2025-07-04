<script lang="ts">
  import { onMount } from 'svelte'

  // — Svelte 5 prop handling with $props():
  let { referer, refererParams } = $props()

  // — client-side referrer state via $state rune:
  let clientReferrer = $state('')

  // populate on mount
  onMount(() => {
    clientReferrer = document.referrer
    console.log('Document.referrer:', clientReferrer)
  })
</script>

<article class="prose dark:prose-invert">
  <h2>Server‐side Referer</h2>
  <p>{referer || 'No referer header present'}</p>

  <h3>Parameters from server referer:</h3>
  <ul>
    {#if refererParams && Object.keys(refererParams).length}
      {#each Object.entries(refererParams) as [key, value]}
        <li><strong>{key}:</strong> {value}</li>
      {/each}
    {:else}
      <li><em>None</em></li>
    {/if}
  </ul>

  <h2>Client‐side document.referrer</h2>
  <a href={clientReferrer || ''}
    >{clientReferrer || 'No document.referrer available'}</a>
</article>
