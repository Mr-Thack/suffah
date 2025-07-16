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
      <AlertDialogTitle>Payment Succesfully Submitted</AlertDialogTitle>
      <AlertDialogDescription>
        Our team may need to make some adjustments. You will receive a receipt
        via email once everything is verified.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <CountdownButton onClick={onProceed} />
  </AlertDialogContent>
</AlertDialog>
