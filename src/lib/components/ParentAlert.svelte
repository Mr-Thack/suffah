<script lang="ts">
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '$lib/components/ui/alert-dialog'

  let { open = $bindable(), onProceed } = $props<{
    open: boolean
    onProceed: () => void
  }>()
</script>

<AlertDialog bind:open>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Incomplete Parent Information</AlertDialogTitle>
      <AlertDialogDescription>
        You can proceed with just one parent's complete info, but we would
        prefer both. Would you like to go back or continue?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Go Back</AlertDialogCancel>
      <AlertDialogAction onclick={onProceed}>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
