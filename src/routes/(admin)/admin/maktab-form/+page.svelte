<script lang="ts">
  import { createRawSnippet, onMount } from 'svelte'
  import { db } from '$lib/db'
  import { dev } from '$app/environment'
  import { Button } from '$lib/components/ui/button'
  import { Root, Header, Row, Head, Body, Cell } from '$lib/components/ui/table'
  import * as Select from '$lib/components/ui/select'
  import * as HoverCard from '$lib/components/ui/hover-card'
  import { Input } from '$lib/components/ui/input'
  import { Switch } from '$lib/components/ui/switch'
  import { Label } from '$lib/components/ui/label'
  import ColumnSortButton from '$lib/components/ColumnSortButton.svelte'
  import {
    generateBookkeepingForm,
    generateBookkeepingForms,
  } from '$lib/emailTemplates'
  import {
    createSvelteTable,
    renderSnippet,
    renderComponent,
    FlexRender,
  } from '$lib/components/ui/data-table'
  import {
    type ColumnDef,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
  } from '@tanstack/table-core'

  interface Row {
    id: string
    name: string
    gender: string
    age: number
    parents: {
      father_name: string | null
      father_phone: string | null
      mother_name: string | null
      mother_phone: string | null
    }
  }

  interface Term {
    id: number
    name: string
    length: number
    p1: number
    p2: number
    p3: number
    sid1: string
    sid2: string
    sid3: string
  }

  let terms: Term[] = $state([])
  let activeTermId: number | null = $state(null)
  let activeTerm: Term | null = $derived.by(() => {
    return terms.find((t) => t.id === activeTermId)
  })
  let rows: Row[] = $state([])
  let isFormatShort: boolean = $state(false)

  let rawRegs = []

  function isoDecimalAge(isodob: string) {
    const today = new Date()
    const dob = new Date(isodob)
    const diffMs = today.getTime() - dob.getTime()
    const ageYears = diffMs / (1000 * 60 * 60 * 24 * 365)

    return Math.round(ageYears * 100) / 100
  }

  function formatAgeNearest(decimalAge: number): string {
    return `<strong>${Math.round(decimalAge)}</strong>`
  }

  function formatAgeShort(decimalAge: number): string {
    const years = Math.floor(decimalAge)
    const months = Math.round((decimalAge - years) * 12)

    const adjustedYears = months === 12 ? years + 1 : years
    const adjustedMonths = months === 12 ? 0 : months

    return `<span>
      <strong>${adjustedYears}</strong>y ${adjustedMonths > 0 ? `${adjustedMonths}m` : ''}
    </span>`
  }

  // Load all terms and active term
  async function loadTerms() {
    const { data: termData } = await db
      .from('maktab_term')
      .select('id, name, length, p1, p2, p3, sid1, sid2, sid3')
      .order('id', { ascending: true })
    terms = termData ?? []
    const key = (dev ? 'dev_' : '') + 'active_term_id'
    const { data: cfg } = await db
      .from('config')
      .select('value')
      .eq('key', key)
      .single()
    activeTermId = cfg?.value
      ? parseInt(cfg.value, 10)
      : (terms.at(-1)?.id ?? null)
  }

  // Fetch and flatten registrations
  async function fetchAndFlatten(termId: number) {
    const { data, error } = await db
      .from('maktab_registrations')
      .select(
        'id, father_name, father_phone, father_email, mother_name, mother_phone, mother_email, children, address, city, zip_code, date_submitted, customer_id, subscription_id',
      )
      .eq('term_id', termId)

    if (error || !data) {
      console.error(error)
      rows = []
      rawRegs = []
      return
    }

    rawRegs = data

    rows = data.flatMap((reg) =>
      (reg.children as any[]).map((child, idx) => {
        return {
          id: `${reg.id}-${idx}`,
          name: child.name,
          gender: child.sex,
          age: isoDecimalAge(child.dob),
          parents: {
            father_name: reg.father_name,
            father_phone: reg.father_phone,
            mother_name: reg.mother_name,
            mother_phone: reg.mother_phone,
          },
        }
      }),
    )
  }

  function transformRegistration(reg: any) {
    return {
      id: reg.id,
      father: {
        name: reg.father_name,
        phone: reg.father_phone,
        email: reg.father_email,
      },
      mother: {
        name: reg.mother_name,
        phone: reg.mother_phone,
        email: reg.mother_email,
      },
      address: reg.address,
      city: reg.city,
      zipCode: reg.zip_code,
      children: reg.children.map((c: any) => ({
        name: c.name,
        dob: c.dob,
        sex: c.sex,
      })),
      dateSubmitted: reg.date_submitted,
      customerId: reg.customer_id,
      subscriptionId: reg.subscription_id,
    }
  }

  function downloadHtml(html: string, filename: string) {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportFirstRow() {
    if (rawRegs.length === 0) return

    const firstReg = rawRegs[0]
    const transformed = transformRegistration(firstReg)
    const html = generateBookkeepingForm(transformed, activeTerm)

    downloadHtml(html, 'registration_export.html')
  }

  function exportBulkRows() {
    if (rawRegs.length === 0) return

    const transformedRegs = rawRegs.map(transformRegistration)
    console.log(transformedRegs)
    console.log(activeTerm)
    const html = generateBookkeepingForms(transformedRegs, activeTerm)

    downloadHtml(html, 'registration_export_bulk.html')
  }

  onMount(loadTerms)

  // Re-fetch registrations when term changes
  $effect(async () => {
    if (activeTermId) {
      await fetchAndFlatten(activeTermId)
    }
  })

  // Table setup without pagination
  const columns: ColumnDef<Row>[] = [
    {
      accessorKey: 'name',
      header: 'Student Name',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'age',
      cell: (info) => {
        const v = info.getValue<number>()
        const html = isFormatShort ? formatAgeShort(v) : formatAgeNearest(v)
        const snippet = createRawSnippet(() => ({
          render: () => html,
        }))
        return renderSnippet(snippet, '')
      },
      header: ({ column }) =>
        renderComponent(ColumnSortButton, {
          columnTitle: 'Age',
          sortDirection: column.getIsSorted(),
          onclick: () => {
            const currentSort = column.getIsSorted()
            console.log(currentSort)
            console.log(column)
            if (currentSort === false) {
              column.toggleSorting(false) // Set to ascending
            } else if (currentSort === 'asc') {
              column.toggleSorting(true) // Set to descending
            } else {
              column.clearSorting() // Clear sorting (back to unsorted)
            }
          },
        }),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const p = row.original.parents
        return null
        /*
        return HoverCard.Root.render({
          trigger: `<div class=\"cursor-pointer hover:text-primary\">🛈</div>`,
          content: `<div class=\"p-2 space-y-1\">
          <div><strong>Father:</strong> ${p.father_name} (${p.father_phone})</div>
          <div><strong>Mother:</strong> ${p.mother_name} (${p.mother_phone})</div>
          </div>`,
        })*/
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]

  let sorting: SortingState = $state([])

  let options = $derived({
    get data() {
      return rows
    },
    columns,
    get state() {
      return sorting
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: true,
    onSortingChange: (updater) => {
      if (typeof updater === 'function') {
        sorting = updater(sorting)
      } else {
        sorting = updater
      }
    },
  })

  let table = $derived(createSvelteTable(options))
</script>

<div class="p-4 space-y-4">
  <h1 class="text-2xl font-bold">Maktab Admin - Student List</h1>

  <!-- Term Selector -->
  <div class="flex items-center gap-2">
    <Select.Root type="single" bind:value={activeTermId}>
      <Select.Trigger class="min-w-[200px]">
        {#if activeTerm}
          {activeTerm.name}
        {:else}
          Select a term...
        {/if}
      </Select.Trigger>
      <Select.Content>
        {#each terms as term}
          <Select.Item value={term.id}>{term.name}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>

  <Button onclick={exportBulkRows}>Export All Applications</Button>

  <div class="flex items-center space-x-2">
    <span>Format: Nearest</span>
    <Switch bind:checked={isFormatShort} id="nearest-switch" />
    <Label htmlFor="nearest-switch">Short</Label>
  </div>

  <!-- Filter by name -->
  <!--
  <Input
    placeholder="Search students..."
    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
    on:input={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
    class="max-w-sm" />
  -->

  <!-- Data Table -->
  <div class="rounded-md border">
    <Root>
      <Header>
        {#each table.getHeaderGroups() as hg}
          <Row>
            {#each hg.headers as header}
              <Head>
                {#if !header.isPlaceholder}
                  <button onclick={header.column.getToggleSortingHandler()}>
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()} />
                  </button>
                {/if}
              </Head>
            {/each}
          </Row>
        {/each}
      </Header>
      <Body>
        {#each table.getRowModel().rows as row}
          <Row>
            {#each row.getVisibleCells() as cell}
              <Cell>
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()} />
              </Cell>
            {/each}
          </Row>
        {:else}
          <Row>
            <Cell colspan={columns.length} class="h-24 text-center">
              No students found.
            </Cell>
          </Row>
        {/each}
      </Body>
    </Root>
  </div>
  Total Entries:
  <strong>{table.getRowModel().rows.length}</strong>
</div>
