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
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
  ]

  const featuresLinks = [
    {
      href: '/features/analytics',
      title: 'Analytics',
      description: 'See your data in a new light.',
    },
    {
      href: '/features/automation',
      title: 'Automation',
      description: 'Let your business run itself.',
    },
    {
      href: '/features/integrations',
      title: 'Integrations',
      description: 'Connect with your favorite tools.',
    },
  ]

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
                >
                  {link.label}
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            {/each}
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Features</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <ul
                  class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
                >
                  {#each featuresLinks as component}
                    <li>
                      <NavigationMenu.Link
                        href={component.href}
                        class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div class="text-sm font-medium leading-none">
                          {component.title}
                        </div>
                        <p
                          class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                        >
                          {component.description}
                        </p>
                      </NavigationMenu.Link>
                    </li>
                  {/each}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
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

        <a href="/get-started" class="hidden md:inline-flex">
          <Button>Get Started</Button>
        </a>

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
            class="text-lg font-medium {currentPath === link.href
              ? 'text-foreground'
              : 'text-muted-foreground'} hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        {/each}
        <hr class="my-2" />
        <a href="/get-started" class="w-full">
          <Button class="w-full">Get Started</Button>
        </a>
      </div>
    </Collapsible.Content>
  </header>
</Collapsible.Root>
