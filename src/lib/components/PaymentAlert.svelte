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
        Payment Succesfully Submitted + Registration Complete
      </AlertDialogTitle>
      <AlertDialogDescription>
        <p>
          You will receive a confirmation email within 24 hours. Please reply to
          that email if you have any questions or need to update your
          information.
        </p>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <CountdownButton onClick={onProceed} />
  </AlertDialogContent>
</AlertDialog>
