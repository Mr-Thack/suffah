<script lang="ts" module>
  import { type VariantProps, tv } from 'tailwind-variants'

  export const badgeVariants = tv({
    base: 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3',
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent',
        secondary:
          'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent',
        accent:
          'bg-accent text-accent-foreground [a&]:hover:bg-accent/90 border-transparent',
        destructive:
          'bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        success: 'text-xs bg-green-100 text-green-700 border-green-200',
      },
      // Makes it darker than original to give differentiation
      shade: {
        default: '',
        dark: 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30',
      },
    },
    defaultVariants: {
      variant: 'default',
      shade: 'default',
    },
  })

  export type BadgeVariant = VariantProps<typeof badgeVariants>['variant']
  export type BadgeShade = VariantProps<typeof badgeVariants>['shade']
</script>

<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import { cn, type WithElementRef } from '$lib/utils.js'

  let {
    ref = $bindable(null),
    href,
    class: className,
    variant = 'default',
    shade = 'default',
    children,
    ...restProps
  }: WithElementRef<HTMLAnchorAttributes> & {
    variant?: BadgeVariant
    shade?: BadgeShade
  } = $props()
</script>

<svelte:element
  this={href ? 'a' : 'span'}
  bind:this={ref}
  data-slot="badge"
  {href}
  class={cn(badgeVariants({ variant, shade }), className)}
  {...restProps}>
  {@render children?.()}
</svelte:element>
