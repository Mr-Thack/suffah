<script lang="ts">
  import { onMount } from 'svelte'
  import { db } from '$lib/db.ts'
  import type { Session } from '@supabase/supabase-js'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Button } from '$lib/components/ui/button'
  import { Progress } from '$lib/components/ui/progress'
  import { Eye, EyeOff } from 'lucide-svelte'
  import { toast } from 'svelte-sonner'
  import { goto } from '$app/navigation'
  import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
  import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'

  // configure zxcvbn options once
  zxcvbnOptions.setOptions({
    ...zxcvbnCommonPackage,
  })

  // Generate unique IDs for form controls
  const formId = 'admin-singup'
  const emailId = `email-${formId}`
  const fullNameId = `fullName-${formId}`
  const password1Id = `password1-${formId}`
  const password2Id = `password2-${formId}`

  let session: Session | null = $state(null)
  let fullName = $state('')
  let password1 = $state('')
  let password2 = $state('')
  let loading = $state(false)
  let errorMsg = $state('')
  let score = $state(0)
  let feedback = $state({ warning: '', suggestions: [] as string[] })
  let showPassword1 = $state(false)
  let showPassword2 = $state(false)

  // reactive effect: recalculate strength on password1 change
  $effect(() => {
    if (password1) {
      const result = zxcvbn(password1)
      score = result.score
      feedback = result.feedback
    } else {
      score = 0
      feedback = { warning: '', suggestions: [] }
    }
  })

  onMount(async () => {
    const { data, error } = await db.auth.getSession()
    if (error) {
      errorMsg = error.message
    } else {
      session = data.session
    }
  })

  async function setPassword() {
    errorMsg = ''
    if (!fullName.trim()) {
      errorMsg = 'Full name is required.'
      return
    }
    if (password1 !== password2) {
      errorMsg = 'Passwords do not match.'
      return
    }
    if (score < 2) {
      errorMsg = 'Password is too weak.'
      return
    }

    loading = true
    const { error } = await db.auth.updateUser({
      password: password1,
      data: { full_name: fullName.trim() },
    })
    loading = false

    if (error) {
      errorMsg = error.message
      toast.error(error.message)
    } else {
      toast.success('Password set successfully')
      goto('/admin')
    }
  }

  function togglePassword1Visibility() {
    showPassword1 = !showPassword1
  }

  function togglePassword2Visibility() {
    showPassword2 = !showPassword2
  }
</script>

{#snippet passwordToggleButton(showPassword, toggleFunction)}
  <button
    type="button"
    onclick={toggleFunction}
    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
    aria-label={showPassword ? 'Hide password' : 'Show password'}>
    {#if showPassword}
      <EyeOff size={16} />
    {:else}
      <Eye size={16} />
    {/if}
  </button>
{/snippet}

{#snippet passwordStrengthIndicator(score, feedback)}
  <Progress value={score * 25} max={100} class="mt-2" />
  <p class="text-sm text-foreground mt-1">
    Strength: {['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'][score]}
  </p>
  {#if feedback.warning}
    <p class="text-sm text-yellow-600">{feedback.warning}</p>
  {/if}
  {#if feedback.suggestions.length}
    <ul class="list-disc list-inside text-xs text-gray-600">
      {#each feedback.suggestions as s}
        <li>{s}</li>
      {/each}
    </ul>
  {/if}
{/snippet}

<div class="min-h-screen flex items-center justify-center bg-background p-4">
  <div class="max-w-md w-full space-y-6">
    <h1 class="text-2xl font-bold text-foreground text-center">
      Complete Your Profile
    </h1>

    {#if session}
      <div class="space-y-4">
        <div>
          <Label
            for={emailId}
            class="block text-sm font-medium text-muted-foreground">
            Email
          </Label>
          <Input
            type="email"
            id={emailId}
            value={session.user.email}
            disabled
            autocomplete="email"
            class="mt-1 w-full" />
        </div>

        <div>
          <Label
            for={fullNameId}
            class="block text-sm font-medium text-muted-foreground">
            Full Name
          </Label>
          <Input
            type="text"
            id={fullNameId}
            bind:value={fullName}
            placeholder="Your full name"
            aria-invalid={!fullName.trim() && errorMsg ? 'true' : 'false'}
            autocomplete="name"
            class="mt-1 w-full" />
        </div>

        <div>
          <Label
            for={password1Id}
            class="block text-sm font-medium text-muted-foreground">
            New Password
          </Label>
          <div class="relative">
            <Input
              type={showPassword1 ? 'text' : 'password'}
              id={password1Id}
              bind:value={password1}
              placeholder="Choose a password"
              aria-invalid={score < 2 && password1 ? 'true' : 'false'}
              autocomplete="new-password"
              class="mt-1 w-full pr-10" />
            {@render passwordToggleButton(
              showPassword1,
              togglePassword1Visibility,
            )}
          </div>
          {@render passwordStrengthIndicator(score, feedback)}
        </div>

        <div>
          <Label
            for={password2Id}
            class="block text-sm font-medium text-muted-foreground">
            Confirm Password
          </Label>
          <div class="relative">
            <Input
              type={showPassword2 ? 'text' : 'password'}
              id={password2Id}
              bind:value={password2}
              placeholder="Re-enter password"
              aria-invalid={password1 !== password2 && password2
                ? 'true'
                : 'false'}
              class="mt-1 w-full pr-10"
              autocomplete="new-password" />
            {@render passwordToggleButton(
              showPassword2,
              togglePassword2Visibility,
            )}
          </div>
        </div>

        {#if errorMsg}
          <p class="text-sm text-destructive" role="alert">{errorMsg}</p>
        {/if}

        <Button
          onclick={setPassword}
          disabled={loading ||
            !fullName.trim() ||
            password1.length < 6 ||
            password1 !== password2 ||
            score < 2}
          class="w-full">
          {#if loading}Setting...{:else}Set Password{/if}
        </Button>
      </div>
    {:else}
      <p class="text-center text-muted-foreground">Loading...</p>
    {/if}
  </div>
</div>
