<script lang="ts">
  // SvelteKit imports for browser detection and page state
  import { browser } from '$app/environment'
  import { page } from '$app/stores'

  // Icon imports from lucide-svelte
  import { Menu, Moon, Sun, X } from 'lucide-svelte'

  // ShadCN-Svelte component imports
  import * as NavigationMenu from '$lib/components/ui/navigation-menu'
  import * as Collapsible from '$lib/components/ui/collapsible'
  import { Button } from '$lib/components/ui/button'

  // Mode-watcher for theme toggling
  import { toggleMode } from 'mode-watcher'

  // --- STATE MANAGEMENT (Svelte 5 Runes) ---
  let isMobileMenuOpen = $state(false)
  let currentPath = $state('')

  // --- DATA ---
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/maktab', label: 'Maktab' },
    { href: '/location', label: 'Location' },
    { href: '/donate', label: 'Donate' },
  ]

  const actionLink = {
    href: '/display',
    label: 'View Prayer Times',
  }

  // --- SIDE EFFECTS ($effect) ---
  $effect(() => {
    currentPath = $page.url.pathname
  })
</script>

<Collapsible.Root bind:open={isMobileMenuOpen} class="w-full">
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
  >
    <div
      class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between"
    >
      <div class="flex items-center gap-6">
        <a href="/" class="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            class="h-6 w-6"
          >
            <rect width="256" height="256" fill="none"></rect>
            <line
              x1="208"
              y1="128"
              x2="128"
              y2="208"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            ></line>
            <line
              x1="192"
              y1="40"
              x2="40"
              y2="192"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            ></line>
          </svg>
          <span class="font-bold">MyApp</span>
        </a>

        <NavigationMenu.Root class="hidden md:flex">
          <NavigationMenu.List>
            {#each navLinks as link}
              <NavigationMenu.Item>
                <NavigationMenu.Link
                  href={link.href}
                  active={currentPath === link.href}
                  class="text-base font-medium"
                >
                  {link.label}
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            {/each}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>

      <div class="flex items-center space-x-2">
        <Button onclick={toggleMode} variant="ghost" size="icon">
          <Sun
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <Moon
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <span class="sr-only">Toggle theme</span>
        </Button>

        <Button
          size="lg"
          href={actionLink.href}
          class="hidden md:inline-flex text-base semi-bold"
        >
          {actionLink.label}
        </Button>

        <div class="md:hidden">
          <Collapsible.Trigger asChild>
            {#snippet child({ props })}
              <Button {...props} variant="ghost" size="icon">
                {#if isMobileMenuOpen}
                  <X class="h-5 w-5" />
                {:else}
                  <Menu class="h-5 w-5" />
                {/if}
                <span class="sr-only">Toggle Menu</span>
              </Button>
            {/snippet}
          </Collapsible.Trigger>
        </div>
      </div>
    </div>

    <Collapsible.Content
      class="md:hidden w-full border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="grid gap-4">
        {#each navLinks as link}
          <a
            href={link.href}
            class="text-lg text-center font-medium {currentPath === link.href
              ? 'text-foreground'
              : 'text-muted-foreground'} hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        {/each}
        <hr class="my-2" />
        <Button href={actionLink.href} class="w-full text-base font-semibold">
          {actionLink.label}
        </Button>
      </div>
    </Collapsible.Content>
  </header>
</Collapsible.Root>
