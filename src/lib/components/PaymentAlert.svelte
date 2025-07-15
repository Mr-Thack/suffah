<script lang="ts">
  import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '$lib/components/ui/alert-dialog'
  import CountdownButton from './CountdownButton.svelte'

  let {
    open = $bindable(),
    onProceed,
    currentTerm,
  } = $props<{
    open: boolean
    onProceed: () => void
    currentTerm: { name: string; length: number } | null
  }>()
</script>

<AlertDialog bind:open>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Redirecting to Payment |
        <strong class="text-accent font-bold text-xl">
          SELECT {currentTerm?.length} MONTHS
        </strong>
      </AlertDialogTitle>
      <AlertDialogDescription>
        You will be taken to the external payment site. Be sure to select the
        <strong class="text-accent font-bold text-base"
          >{currentTerm?.length}-month</strong> option.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <CountdownButton onClick={onProceed} />
  </AlertDialogContent>
</AlertDialog>
