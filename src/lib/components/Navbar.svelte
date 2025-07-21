<script lang="ts">
  import { page } from '$app/stores'
  import { afterNavigate } from '$app/navigation'
  import { Menu, Moon, Sun, X } from 'lucide-svelte'
  import type { ComponentType } from 'svelte'
  import * as NavigationMenu from '$lib/components/ui/navigation-menu'
  import * as Collapsible from '$lib/components/ui/collapsible'
  import { Button } from '$lib/components/ui/button'
  import { toggleMode } from 'mode-watcher'

  /* ---------- types ---------- */
  type HrefProps = { href: string }
  type ClickProps = { onClick: () => void }
  type SimpleLink = { label: string; icon?: ComponentType } & (
    | HrefProps
    | ClickProps
  )

  type DropdownLink = { label: string; items: SimpleLink[] }
  type NavLink = SimpleLink | DropdownLink

  /* ---------- props ---------- */
  let {
    isAdmin,
    navLinks,
    actionLink,
    actionLinkDestructive,
  }: {
    isAdmin: boolean
    navLinks: NavLink[]
    actionLink: SimpleLink
    actionLinkDestructive: SimpleLink | null
  } = $props()

  /* ---------- state ---------- */
  let mobileMenuOpen = $state(false)
  let pathPrefix = $derived(isAdmin ? '/admin' : '')
  let logoText = $derived(isAdmin ? 'Suffah Admin' : 'Masjid Suffah')

  /* ---------- helpers ---------- */
  const isDropdown = (link: NavLink): link is DropdownLink => 'items' in link
  const active = (link: SimpleLink) =>
    'href' in link && $page.url.pathname === pathPrefix + link.href

  afterNavigate(() => (mobileMenuOpen = false))
</script>

{#snippet logo()}
  <a href={pathPrefix} class="flex items-center space-x-2">
    <svg viewBox="0 0 256 256" class="h-6 w-6">
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
    <span class="font-bold" class:text-accent={isAdmin}>{logoText}</span>
  </a>
{/snippet}

{#snippet simpleNavLink(link: SimpleLink)}
  <NavigationMenu.Link
    href={'href' in link ? pathPrefix + link.href : undefined}
    onclick={'onClick' in link ? link.onClick : undefined}
    active={active(link)}
    class="text-base font-medium {active(link)
      ? 'text-accent'
      : 'text-muted-foreground'} hover:text-foreground transition-colors">
    {#if link.icon}
      <link.icon class="inline-block w-4 h-4 mr-2" />
    {/if}
    {link.label}
  </NavigationMenu.Link>
{/snippet}

{#snippet dropdownNavLink(dropdown: DropdownLink)}
  {@const anyActive = dropdown.items.some(active)}
  <NavigationMenu.Trigger
    class="text-base font-medium {anyActive
      ? 'text-accent'
      : 'text-muted-foreground'} hover:text-foreground transition-colors">
    {dropdown.label}
  </NavigationMenu.Trigger>
  <NavigationMenu.Content>
    <ul class="grid w-[200px] gap-1 p-2">
      {#each dropdown.items as item}
        <li>{@render simpleNavLink(item)}</li>
      {/each}
    </ul>
  </NavigationMenu.Content>
{/snippet}

{#snippet desktopNav()}
  <NavigationMenu.Root class="hidden md:flex">
    <NavigationMenu.List>
      {#each navLinks as link}
        <NavigationMenu.Item>
          {#if isDropdown(link)}
            {@render dropdownNavLink(link)}
          {:else}
            {@render simpleNavLink(link)}
          {/if}
        </NavigationMenu.Item>
      {/each}
    </NavigationMenu.List>
  </NavigationMenu.Root>
{/snippet}

{#snippet actionBtn(link: SimpleLink, destructive = false, mobile = false)}
  <Button
    size={mobile ? 'default' : 'lg'}
    variant={destructive ? 'destructive' : 'default'}
    data-sveltekit-preload-code="eager"
    href={'href' in link ? pathPrefix + link.href : undefined}
    onclick={'onClick' in link ? link.onClick : undefined}
    class="text-base font-semibold {mobile
      ? 'w-full'
      : 'hidden md:inline-flex'}">
    {link.label}
  </Button>
{/snippet}

{#snippet themeToggle()}
  <Button onclick={toggleMode} variant="ghost" size="icon">
    <Sun class="hidden size-5 dark:block" />
    <Moon class="block size-5 dark:hidden" />
    <span class="sr-only">Toggle theme</span>
  </Button>
{/snippet}

{#snippet mobileMenuToggle()}
  <div class="md:hidden">
    <Collapsible.Trigger asChild>
      {#snippet child({ props })}
        <Button {...props} variant="ghost" size="icon" class="h-10 w-10">
          {#if mobileMenuOpen}
            <X class="size-7" />
          {:else}
            <Menu class="size-7" />
          {/if}
          <span class="sr-only">Toggle Menu</span>
        </Button>
      {/snippet}
    </Collapsible.Trigger>
  </div>
{/snippet}

{#snippet mobileLinkItem(link: SimpleLink, sub = false)}
  {@const base = `text-lg font-medium text-left ${active(link) ? 'text-accent' : 'text-muted-foreground'} hover:text-foreground transition-colors block w-full py-2 ${sub ? 'pl-6' : ''}`}

  {#if 'href' in link}
    <a href={pathPrefix + link.href} class={base}>
      {#if sub}<span class="text-muted-foreground mr-2">→</span>{/if}
      {#if link.icon}
        <link.icon class="inline-block w-4 h-4 mr-2" />
      {/if}
      {link.label}
    </a>
  {:else}
    <button onclick={link.onClick} class="{base} text-left">
      {#if sub}<span class="text-muted-foreground mr-2">→</span>{/if}
      {#if link.icon}
        <link.icon class="inline-block w-4 h-4 mr-2" />
      {/if}
      {link.label}
    </button>
  {/if}
{/snippet}

{#snippet mobileNav()}
  <Collapsible.Content
    class="md:hidden w-full border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="grid gap-4">
      {#each navLinks as link}
        {#if isDropdown(link)}
          <div
            class="text-lg font-medium {link.items.some(active)
              ? 'text-accent'
              : 'text-muted-foreground'}">
            {link.label}
          </div>
          {#each link.items as item}
            {@render mobileLinkItem(item, true)}
          {/each}
        {:else}
          {@render mobileLinkItem(link)}
        {/if}
      {/each}

      <hr class="my-2" />

      {@render actionBtn(actionLink, false, true)}
      {#if actionLinkDestructive}
        {@render actionBtn(actionLinkDestructive, true, true)}
      {/if}
    </div>
  </Collapsible.Content>
{/snippet}

<Collapsible.Root bind:open={mobileMenuOpen} class="w-full">
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <div
      class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
      <div class="flex items-center gap-6">
        {@render logo()}
        {@render desktopNav()}
      </div>

      <div class="flex items-center space-x-4 md:space-x-6">
        {@render themeToggle()}
        {@render actionBtn(actionLink)}
        {#if actionLinkDestructive}
          {@render actionBtn(actionLinkDestructive, true)}
        {/if}
        {@render mobileMenuToggle()}
      </div>
    </div>

    {@render mobileNav()}
  </header>
</Collapsible.Root>
