<script lang="ts">
  // SvelteKit imports
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { afterNavigate } from '$app/navigation'

  // Icon imports
  import { Menu, Moon, Sun, X } from 'lucide-svelte'
  import type { ComponentType } from 'svelte'

  // ShadCN-Svelte components
  import * as NavigationMenu from '$lib/components/ui/navigation-menu'
  import * as Collapsible from '$lib/components/ui/collapsible'
  import { Button } from '$lib/components/ui/button'

  // Theme toggler
  import { toggleMode } from 'mode-watcher'

  type Without<T, K> = { [P in Exclude<keyof T, keyof K>]?: never }
  type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>)

  type HrefProps = {
    href: string
  }

  type OnClickProps = {
    onClick: () => void
  }

  type SimpleLink = {
    label: string
    icon?: ComponentType
  } & XOR<HrefProps, OnClickProps>

  type DropdownLink = {
    label: string
    items: SimpleLink[]
  }

  type NavLink = SimpleLink | DropdownLink

  export type LinkProps = SimpleLink // Keep existing export for backward compatibility

  let {
    isAdmin,
    navLinks,
    actionLink,
    actionLinkDestructive = null,
  }: {
    isAdmin: boolean
    navLinks: NavLink[]
    actionLink: SimpleLink
    actionLinkDestructive: SimpleLink | null
  } = $props()

  // Local state
  let isMobileMenuOpen = $state(false)
  let currentPath = $state('')
  const path = isAdmin ? '/admin' : ''

  // Helper function to check if a link is a dropdown
  function isDropdown(link: NavLink): link is DropdownLink {
    return 'items' in link
  }

  // Helper function to check if a simple link is active
  function isLinkActive(link: SimpleLink): boolean {
    if ('href' in link) {
      const fullPath = path + link.href
      const isActive = currentPath === fullPath
      // Debug logging - remove this later
      console.log(
        `Checking link: ${link.label}, currentPath: ${currentPath}, fullPath: ${fullPath}, isActive: ${isActive}`,
      )
      return isActive
    }
    return false
  }

  // Helper function to check if any item in a dropdown is active
  function isDropdownActive(dropdown: DropdownLink): boolean {
    return dropdown.items.some((item) => isLinkActive(item))
  }

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
    variant={destructive ? 'destructive' : 'default'}
    data-sveltekit-preload-code="eager"
    href={'href' in link ? path + link.href : undefined}
    onclick={'onClick' in link ? link.onClick : undefined}
    class="text-base font-semibold
{mobile ? 'w-full' : 'hidden md:inline-flex'}
">
    {link.label}
  </Button>
{/snippet}

{#snippet actionButtons(mobile)}
  {@render actionButton({
    link: actionLink,
    destructive: false,
    mobile: mobile,
  })}
  {#if actionLinkDestructive}
    {@render actionButton({
      link: actionLinkDestructive,
      destructive: true,
      mobile: mobile,
    })}
  {/if}
{/snippet}

{#snippet renderSimpleLink(link: SimpleLink, mobile = false, isSubItem = false)}
  {#if 'href' in link}
    <a
      href={path + link.href}
      class="text-base font-medium {mobile ? 'text-lg' : ''} {mobile &&
      !isSubItem
        ? 'text-left'
        : mobile && isSubItem
          ? 'text-left'
          : ''} {isLinkActive(link)
        ? mobile
          ? 'text-accent'
          : 'text-foreground'
        : 'text-muted-foreground'} hover:text-foreground transition-colors {mobile
        ? 'block w-full py-2'
        : ''}">
      {#if mobile && isSubItem}
        <span class="text-muted-foreground mr-2">→</span>
      {/if}
      {#if link.icon}
        <svelte:component this={link.icon} class="inline-block w-4 h-4 mr-2" />
      {/if}
      {link.label}
    </a>
  {:else}
    <button
      onclick={link.onClick}
      class="text-base font-medium {mobile ? 'text-lg' : ''} {mobile &&
      !isSubItem
        ? 'text-left'
        : mobile && isSubItem
          ? 'text-left'
          : ''} text-muted-foreground hover:text-foreground transition-colors {mobile
        ? 'block w-full py-2 text-left'
        : ''}">
      {#if mobile && isSubItem}
        <span class="text-muted-foreground mr-2">→</span>
      {/if}
      {#if link.icon}
        <svelte:component this={link.icon} class="inline-block w-4 h-4 mr-2" />
      {/if}
      {link.label}
    </button>
  {/if}
{/snippet}

<Collapsible.Root bind:open={isMobileMenuOpen} class="w-full">
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <div
      class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
      <div class="flex items-center gap-6">
        <a href={path} class="flex items-center space-x-2">
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
          <span class="font-bold" class:text-accent={isAdmin}>
            {#if isAdmin}
              Suffah Admin
            {:else}
              Masjid Suffah
            {/if}
          </span>
        </a>

        <!-- Desktop Navigation -->
        <NavigationMenu.Root class="hidden md:flex">
          <NavigationMenu.List>
            {#each navLinks as link}
              <NavigationMenu.Item>
                {#if isDropdown(link)}
                  <!-- Dropdown Navigation Item -->
                  <NavigationMenu.Trigger
                    class="text-base font-medium {isDropdownActive(link)
                      ? 'text-accent'
                      : 'text-muted-foreground'} hover:text-foreground transition-colors">
                    {link.label}
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content>
                    <ul class="grid w-[200px] gap-1 p-2">
                      {#each link.items as item}
                        <li>
                          <NavigationMenu.Link
                            href={'href' in item ? path + item.href : undefined}
                            onclick={'onClick' in item
                              ? item.onClick
                              : undefined}
                            active={isLinkActive(item)}
                            class="w-full text-center block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors {isLinkActive(
                              item,
                            )
                              ? 'text-accent bg-accent/10'
                              : 'text-muted-foreground'}">
                            {#if item.icon}
                              <svelte:component
                                this={item.icon}
                                class="inline-block w-4 h-4 mr-2" />
                            {/if}
                            {item.label}
                          </NavigationMenu.Link>
                        </li>
                      {/each}
                    </ul>
                  </NavigationMenu.Content>
                {:else}
                  <!-- Simple Navigation Item -->
                  <NavigationMenu.Link
                    href={'href' in link ? path + link.href : undefined}
                    onclick={'onClick' in link ? link.onClick : undefined}
                    active={isLinkActive(link)}
                    class="text-base font-medium {isLinkActive(link)
                      ? 'text-accent'
                      : 'text-muted-foreground'} hover:text-foreground transition-colors">
                    {#if link.icon}
                      <svelte:component
                        this={link.icon}
                        class="inline-block w-4 h-4 mr-2" />
                    {/if}
                    {link.label}
                  </NavigationMenu.Link>
                {/if}
              </NavigationMenu.Item>
            {/each}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>

      <div class="flex items-center space-x-4 md:space-x-6">
        <!-- Theme toggle -->
        <Button onclick={toggleMode} variant="ghost" size="icon">
          <Sun
            class="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Moon
            class="absolute size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <span class="sr-only">Toggle theme</span>
        </Button>

        <!-- Primary actions via snippet -->
        {@render actionButtons(false)}

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
          {#if isDropdown(link)}
            <!-- Dropdown section in mobile - show parent label and indented children -->
            <div
              class="text-lg font-medium text-left {isDropdownActive(link)
                ? 'text-accent'
                : 'text-muted-foreground'}">
              {link.label}
            </div>
            {#each link.items as item}
              <div class="pl-6">
                {@render renderSimpleLink(item, true, true)}
              </div>
            {/each}
          {:else}
            <!-- Simple link in mobile -->
            {@render renderSimpleLink(link, true, false)}
          {/if}
        {/each}
        <hr class="my-2" />
        <!-- Mobile actions -->
        {@render actionButtons(true)}
      </div>
    </Collapsible.Content>
  </header>
</Collapsible.Root>
