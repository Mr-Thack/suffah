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

  /* Utility: serialize 2D string array to CSV text */
  function serializeCsv(rows: string[][]): string {
    return rows
      .map((r) => r.map((field) => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n')
  }

  /* Utility: download any text content as a file */
  function downloadFile(
    content: string,
    filename: string,
    mimeType: string = 'application/octet-stream',
  ) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  /* CSV-specific download wrapper */
  function downloadCsv(content: string, filename: string) {
    downloadFile(content, filename, 'text/csv')
  }

  /* HTML-specific download wrapper */
  function downloadHtml(content: string, filename: string) {
    downloadFile(content, filename, 'text/html')
  }

  /**
   * Export just the student view: Name, Sex, DOB (ISO)
   */
  function exportStudentViewCSV() {
    if (!rawRegs.length) return

    const rowsCsv: string[][] = [['Name', 'Sex', 'DOB']]

    rawRegs.forEach((reg) => {
      ;(reg.children as any[]).forEach((child) => {
        rowsCsv.push([child.name, child.sex, child.dob])
      })
    })

    const csvText = serializeCsv(rowsCsv)
    downloadCsv(csvText, 'student_view.csv')
  }

  /**
   * Export one CSV row per family, with dynamic child columns:
   * id, father_name, father_phone, mother_name, mother_phone,
   * child1_name, child1_sex, child1_dob, ..., childN_name, childN_sex, childN_dob
   */
  function exportEntireTableCSV() {
    if (!rawRegs.length) return

    // Determine the maximum number of children in any registration
    const maxChildren = rawRegs.reduce((max, reg) => {
      const count = (reg.children as any[]).length
      return count > max ? count : max
    }, 0)

    // Build header
    const header: string[] = [
      'ID',
      'Father Name',
      'Father Phone',
      'Mother Name',
      'Mother Phone',
    ]
    for (let i = 1; i <= maxChildren; i++) {
      header.push(`child${i}_name`, `child${i}_sex`, `child${i}_dob`)
    }

    const rowsCsv: string[][] = [header]

    // Build rows per registration
    rawRegs.forEach((reg) => {
      const base = [
        String(reg.id),
        reg.father_name ?? '',
        reg.father_phone ?? '',
        reg.mother_name ?? '',
        reg.mother_phone ?? '',
      ]
      const children = reg.children as any[]
      // Add each child or empty placeholders
      for (let i = 0; i < maxChildren; i++) {
        if (i < children.length) {
          const c = children[i]
          base.push(c.name, c.sex, c.dob)
        } else {
          base.push('', '', '')
        }
      }
      rowsCsv.push(base)
    })

    const csvText = serializeCsv(rowsCsv)
    downloadCsv(csvText, 'entire_table.csv')
  }

  /**
   * Use existing bookkeeping HTML generators
   */
  function exportFirstRow() {
    if (!rawRegs.length) return
    const firstReg = rawRegs[0]
    const transformed = transformRegistration(firstReg)
    const html = generateBookkeepingForm(transformed, activeTerm)
    downloadHtml(html, 'registration_export.html')
  }

  function exportBulkRows() {
    if (!rawRegs.length) return
    const transformedRegs = rawRegs.map(transformRegistration)
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

  <!-- Controls -->
  <div class="flex flex-wrap w-full items-center gap-8">
    <!-- Term Selector -->
    <div class="flex items-start flex-col min-w-[200px] flex-1">
      <h3 class="text-lg font-bold">Selected Term:</h3>
      <Select.Root type="single" bind:value={activeTermId}>
        <Select.Trigger class="min-w-[200px]">
          {#if activeTerm}
            {activeTerm.name}
          {:else}
            Select a Term...
          {/if}
        </Select.Trigger>
        <Select.Content>
          {#each terms as term}
            <Select.Item value={term.id}>{term.name}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    <div class="flex items-start flex-col gap-4 min-w-[200px] flex-1">
      <h3 class="text-md font-bold">Export Options</h3>
      <Button onclick={exportBulkRows}>Generate Report</Button>
      <Button onclick={exportStudentViewCSV}>Students as CSV</Button>
      <Button onclick={exportEntireTableCSV}>Applications as CSV</Button>
    </div>
  </div>

  <div class="prose dark:prose-invert">
    <p>
      <strong>
        Press "Print as PDF" when you open the newly generated report file in
        your Downloads
      </strong>
    </p>

    <h5>Notes:</h5>
    <ul>
      <li>"Generate Report" is good for bookkeeping</li>
      <li>"Students as CSV" is good sorting the students</li>
      <li>
        I don't know who might need "Applications as CSV", but I left it here
        just in case
      </li>
    </ul>

    <em>
      Oh, also the filters and sorting on this table aren't working properly
      right now, but if you download as a CSV and open it MS Excel or Google
      Docs, everything will be fine, inshaAllah.
    </em>
  </div>

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
