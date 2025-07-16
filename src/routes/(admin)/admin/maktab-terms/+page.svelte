<script lang="ts">
  import { onMount } from 'svelte'
  import { db } from '$lib/db.ts'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Button, buttonVariants } from '$lib/components/ui/button'
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
  import * as Select from '$lib/components/ui/select'
  import { toast } from 'svelte-sonner'

  // State
  let terms = $state([] as { id: number; name: string; length: number }[])
  let activeTermId: number | null = $state(null)
  let loading = $state(false)

  let newName = $state('')
  let termLength = $state(6)
  let p1 = $state(100)
  let p2 = $state(160)
  let p3 = $state(200)
  let adding = $state(false)

  let dialogOpen = $state(false)

  // Load existing terms and active term
  async function loadData() {
    const { data: termData, error: termErr } = await db
      .from('maktab_term')
      .select('id, name, length')
      .order('id', { ascending: true })
    if (termErr) {
      toast.error('Error loading terms: ' + termErr.message)
      return
    }
    terms = termData ?? []

    const { data: cfgData, error: cfgErr } = await db
      .from('config')
      .select('value')
      .eq('key', 'active_term_id')
      .single()
    if (cfgErr && cfgErr.code !== 'PGRST116') {
      toast.error('Error loading active term: ' + cfgErr.message)
      return
    }
    activeTermId = cfgData?.value ? parseInt(cfgData.value) : null
  }

  onMount(loadData)

  // Add a new term
  async function handleAddTerm() {
    if (!newName || !termLength) {
      toast.error('Please fill all fields')
      return
    }
    adding = true

    console.log(newName, termLength, p1, p2, p3)
    const res = await fetch('/api/term-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        termName: newName,
        termLength: termLength,
        prices: [p1 * 100, p2 * 100, p3 * 100],
      }),
    })

    if (!res.ok) {
      toast.error('Failed to add term: ' + res.statusText)
      return
    }

    let b = await res.json()
    console.log(b)

    const { error } = await db.from('maktab_term').insert({
      name: newName,
      length: termLength,
      pid: b.planId,
      p1: b.variations[0],
      p2: b.variations[1],
      p3: b.variations[2],
    })

    adding = false
    if (error) {
      toast.error('Failed to add term: ' + error.message)
    } else {
      toast.success('Term added')
      newName = ''
      termLength = 6
      await loadData()
    }
  }

  // Save active term
  async function handleSaveActive() {
    if (activeTermId === null) {
      toast.error('Select a term first')
      return
    }
    loading = true
    const { error } = await db
      .from('config')
      .upsert({ key: 'active_term_id', value: String(activeTermId) })
    loading = false
    if (error) {
      toast.error('Failed to save active term: ' + error.message)
    } else {
      toast.success('Active term set')
    }
  }
</script>

{#snippet Term(term)}
  {term.name}
  <em class="inline text-muted">
    ({term.length} months)
  </em>
{/snippet}

<div class="space-y-6 p-4">
  <h1 class="text-2xl font-bold">Manage School Terms</h1>

  <!-- Add Term Form -->
  <div class="space-y-4 p-4 border rounded">
    <h2 class="text-xl font-semibold">Add New Term</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label for="term-name">Name</Label>
        <Input
          id="term-name"
          bind:value={newName}
          placeholder="e.g., Summer 2025" />
      </div>
      <div>
        <Label for="term-length">Term Length</Label>
        <Input
          id="term-length"
          type="number"
          min={2}
          max={12}
          bind:value={termLength}
          defaultValue={6} />
      </div>
      <!-- This is just for now; later we'll modularize it -->
      <div>
        <Label for="p1">Single Student Price</Label>
        <Input id="p1" type="number" bind:value={p1} defaultValue={100} />
      </div>
      <div>
        <Label for="p2">Two Students Price</Label>
        <Input id="p2" type="number" bind:value={p2} defaultValue={160} />
      </div>
      <div>
        <Label for="p3">Three Students or More Price</Label>
        <Input id="p3" type="number" bind:value={p3} defaultValue={200} />
      </div>
    </div>
    <Button onclick={handleAddTerm} disabled={adding} class="mt-4">
      {#if adding}Adding…{:else}Add Term{/if}
    </Button>
  </div>

  <!-- Select Active Term -->
  <div class="space-y-2 p-4 border rounded">
    <h2 class="text-xl font-semibold">Set Active Term</h2>
    <Select.Root
      type="single"
      bind:value={activeTermId}
      onopenChange={() => (dialogOpen = true)}>
      <Select.Trigger class="min-w-1/4">
        {#if activeTermId}
          {@render Term(terms.find((t) => t.id === activeTermId)?)}
        {:else}
          Select a term…
        {/if}
      </Select.Trigger>
      <Select.Content>
        {#each terms as term}
          <Select.Item value={term.id}>
            {@render Term(term)}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    <Button
      onclick={handleSaveActive}
      disabled={loading || activeTermId === null}
      class="mt-4">
      {#if loading}Saving…{:else}Save Active Term{/if}
    </Button>
  </div>

  <!-- Alert Dialog to discourage edits -->
  <AlertDialog.Root bind:open={dialogOpen}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Read Only</AlertDialog.Title>
        <AlertDialog.Description>
          Terms cannot be edited once created. If you need to change dates or
          names, please delete and re-create the term instead.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>OK</AlertDialog.Cancel>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
</div>
