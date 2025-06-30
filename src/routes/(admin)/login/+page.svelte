<script lang="ts">
  import { db } from '$lib/db.ts'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Button } from '$lib/components/ui/button'
  import { toast } from 'svelte-sonner'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import PasswordInput from '$lib/components/PasswordInput.svelte'

  let email = $state('')
  let password = $state('')
  let loading = $state(false)
  let errorMsg = $state('')

  onMount(async () => {
    const {
      data: { session },
    } = await db.auth.getSession()
    if (session) goto('/admin')
  })

  async function handleLogin(event: Event) {
    event.preventDefault()
    errorMsg = ''
    loading = true

    const { error } = await db.auth.signInWithPassword({ email, password })
    loading = false

    if (error) {
      errorMsg = error.message
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      goto('/admin')
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-background p-4">
  <form class="w-full max-w-md space-y-6" onsubmit={handleLogin}>
    <h1 class="text-2xl font-bold text-center">Admin Login</h1>

    <div class="space-y-4">
      <div>
        <Label for="email">Email</Label>
        <Input
          id="email"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          autocomplete="email"
          class="mt-1 w-full" />
      </div>

      <div>
        <Label for="password">Password</Label>

        <PasswordInput
          id="password"
          bind:value={password}
          placeholder="••••••••"
          autocomplete="current-password"
          invalid={!!errorMsg} />
      </div>

      {#if errorMsg}
        <p class="text-sm text-destructive" role="alert">{errorMsg}</p>
      {/if}

      <Button
        class="w-full"
        type="submit"
        disabled={loading || !email || !password}>
        {#if loading}Logging in…{:else}Log In{/if}
      </Button>
    </div>
  </form>
</div>
