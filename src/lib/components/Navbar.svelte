<script lang="ts">
  // SvelteKit imports
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { afterNavigate } from '$app/navigation'

  // Icon imports
  import { Menu, Moon, Sun, X } from 'lucide-svelte'

  // ShadCN-Svelte components
  import * as NavigationMenu from '$lib/components/ui/navigation-menu'
  import * as Collapsible from '$lib/components/ui/collapsible'
  import { Button } from '$lib/components/ui/button'

  // Theme toggler
  import { toggleMode } from 'mode-watcher'

  // Props (Svelte 5)
  export interface Link {
    href: string
    label: string
  }

  let {
    navLinks,
    actionLink,
    actionLinkDestructive = null,
  }: {
    navLinks: Link[]
    actionLink: Link[]
    actionLinkDestructive: Link | null
  } = $props()

  console.log(navLinks)

  // Local state
  let isMobileMenuOpen = $state(false)
  let currentPath = $state('')

  // Update currentPath reactively
  $effect(() => {
    currentPath = $page.url.pathname
  })

  // Close mobile menu on client-side navigation
  if (browser) {
    afterNavigate(() => {
      isMobileMenuOpen = false
    })
  }
</script>

<!-- Define reusable actionButton snippet -->
{#snippet actionButton({ link, destructive, mobile })}
  <Button
    size={mobile ? 'default' : 'lg'}
    data-sveltekit-preload-code="eager"
    href={link.href}
    class="text-base font-semibold
        {destructive ? 'destructive' : ''}
        {mobile ? 'w-full' : 'hidden md:inline-flex'}
    ">
    {link.label}
  </Button>
{/snippet}

<Collapsible.Root bind:open={isMobileMenuOpen} class="w-full">
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <div
      class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
      <div class="flex items-center gap-6">
        <a href="/" class="flex items-center space-x-2">
          <!-- logo omitted for brevity -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            class="h-6 w-6">
            <rect width="256" height="256" fill="none" />
            <line
              x1="208"
              y1="128"
              x2="128"
              y2="208"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16" />
            <line
              x1="192"
              y1="40"
              x2="40"
              y2="192"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16" />
          </svg>
          <span class="font-bold">Masjid Suffah</span>
        </a>

        <NavigationMenu.Root class="hidden md:flex">
          <NavigationMenu.List>
            {#each navLinks as link}
              <NavigationMenu.Item>
                <NavigationMenu.Link
                  href={link.href}
                  active={currentPath === link.href}
                  class="text-base font-medium">
                  {link.label}
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            {/each}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>

      <div class="flex items-center space-x-4 md:space-x-6">
        <!-- Theme toggle -->
        <Button on:click={toggleMode} variant="ghost" size="icon">
          <Sun
            class="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Moon
            class="absolute size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <span class="sr-only">Toggle theme</span>
        </Button>

        <!-- Primary actions via snippet -->
        {@render actionButton({
          link: actionLink,
          destructive: false,
          mobile: false,
        })}
        {#if actionLinkDestructive}
          {@render actionButton({
            link: actionLinkDestructive,
            destructive: true,
            mobile: false,
          })}
        {/if}

        <!-- Mobile menu trigger -->
        <div class="md:hidden">
          <Collapsible.Trigger asChild>
            {#snippet child({ props })}
              <Button {...props} variant="ghost" size="bigicon">
                {#if isMobileMenuOpen}
                  <X class="size-7" />
                {:else}
                  <Menu class="size-7" />
                {/if}
                <span class="sr-only">Toggle Menu</span>
              </Button>
            {/snippet}
          </Collapsible.Trigger>
        </div>
      </div>
    </div>

    <!-- Mobile content -->
    <Collapsible.Content
      class="md:hidden w-full border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="grid gap-4">
        {#each navLinks as link}
          <a
            href={link.href}
            class="text-lg text-center font-medium {currentPath === link.href
              ? 'text-foreground'
              : 'text-muted-foreground'} hover:text-foreground transition-colors">
            {link.label}
          </a>
        {/each}
        <hr class="my-2" />
        <!-- Mobile actions -->
        {@render actionButton({
          link: actionLink,
          destructive: false,
          mobile: true,
        })}
        {#if actionLinkDestructive}
          {@render actionButton({
            link: actionLinkDestructive,
            destructive: true,
            mobile: true,
          })}
        {/if}
      </div>
    </Collapsible.Content>
  </header>
</Collapsible.Root>
