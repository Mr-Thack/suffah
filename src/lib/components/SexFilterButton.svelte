<script lang="ts">
  interface Props {
    columnTitle: string
    filterValue?: string
    [key: string]: any
  }

  let { columnTitle, filterValue = '', ...restProps }: Props = $props()

  function getDisplayText() {
    if (!filterValue) return '(All)'
    return filterValue === 'male' ? '(Males)' : '(Females)'
  }

  function getTextColor() {
    if (!filterValue) return '' //'text-gray-500'
    return filterValue === 'male' ? 'text-blue-500' : 'text-pink-500'
  }
</script>

<button {...restProps}>
  <span class="flex items-center gap-1">
    {columnTitle}
    <span class={getTextColor()}>
      {getDisplayText()}
    </span>
  </span>
</button>
