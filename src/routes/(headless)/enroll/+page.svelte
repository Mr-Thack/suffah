<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client'
  import { toast } from 'svelte-sonner'
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import * as Select from '$lib/components/ui/select'
  import * as Form from '$lib/components/ui/form'
  import { Checkbox } from '$lib/components/ui/checkbox'
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
  import { Plus, Trash2, Users, Baby, MapPin, Mail, Phone } from 'lucide-svelte'
  import PhoneInput from '$lib/components/PhoneInput.svelte'
  import { browser } from '$app/environment'
  import { db } from '$lib/db.js'
  import { onMount } from 'svelte'
  import ParentAlert from '$lib/components/ParentAlert.svelte'
  import PaymentAlert from '$lib/components/PaymentAlert.svelte'
  import {
    PUBLIC_SQUARE_APP_ID,
    PUBLIC_SQUARE_LOCATION_ID,
  } from '$env/static/public'
  import { dev } from '$app/environment'

  const { data } = $props()
  const form = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onUpdated: ({ form }) => {
      isSubmitting = false
      if (!form.valid) return

      if (form.errors?.confirmParent) {
        showParentWarning = true
      }

      toast.success('Registration submitted successfully!')
      showPaymentAlert = true
    },
    onError: ({ result }) => {
      console.error('Form submission error:', result)
      isSubmitting = false
      toast.error('Submission failed. Please try again.')
    },
  })

  const { form: formData, enhance } = form
  let showParentWarning = $state(false)
  let showPaymentAlert = $state(false)
  let formEl: HTMLFormElement = $state()

  const childrenCost = [100, 160, 200]
  const numChildren = $derived($formData.children.length)
  const totalCost = $derived(childrenCost[Math.min(numChildren - 1, 2)])

  const isChildComplete = (child) => {
    if (!child.name || !child.dob || !child.sex) return false
    const year = new Date(child.dob).getFullYear()
    return year >= 2000
  }

  const childrenComplete = $derived(
    $formData.children.length > 0 && $formData.children.every(isChildComplete),
  )

  const fatherComplete = $derived(
    !!(
      $formData.father.name &&
      $formData.father.phone &&
      $formData.father.email
    ),
  )
  const motherComplete = $derived(
    !!(
      $formData.mother.name &&
      $formData.mother.phone &&
      $formData.mother.email
    ),
  )
  const addressComplete = $derived(
    !!($formData.address && $formData.city && $formData.zipCode),
  )
  const completedForm = $derived(
    (fatherComplete || motherComplete) &&
      addressComplete &&
      childrenComplete &&
      $formData.cardHolderName,
  )

  const pricingTiers = $derived([
    {
      count: 1,
      price: childrenCost[0],
      label: '1 Child',
      isActive: numChildren === 1,
    },
    {
      count: 2,
      price: childrenCost[1],
      label: '2 Children',
      isActive: numChildren === 2,
    },
    {
      count: 3,
      price: childrenCost[2],
      label: '3+ Children',
      isActive: numChildren >= 3,
    },
  ])

  function addChild() {
    $formData.children = [
      ...$formData.children,
      { name: '', sex: 'male', dob: '' },
    ]
  }

  function removeChild(index: number) {
    if ($formData.children.length > 1) {
      $formData.children = $formData.children.filter((_, i) => i !== index)
    }
  }

  let tokenizationAttempts = 0
  const MAX_ATTEMPTS = 3
  const TIMEOUT = 10000 / MAX_ATTEMPTS
  async function tokenizeWithTimeoutAndRetry() {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        console.log(`Tokenization attempt ${attempt}/${MAX_ATTEMPTS}`)

        // Race both of these promises
        const tokenizationPromise = card.tokenize()
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error(`Tokenization timeout after ${TIMEOUT}ms`)),
            TIMEOUT,
          )
        })

        const result = await Promise.race([tokenizationPromise, timeoutPromise])

        // Validate the result
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid tokenization result')
        }

        const { status, token } = result

        if (status === 'OK' && token) {
          console.log(
            `Tokenization successful on attempt ${attempt}/${MAX_ATTEMPTS}`,
          )
          return { status, token }
        } else {
          console.log(
            `Tokenization failed on attempt ${attempt}/${MAX_ATTEMPTS}:`,
            {
              status,
              token,
            },
          )
          if (attempt === MAX_ATTEMPTS) {
            console.error('REACHED MAX SQUARE ATTEMPTS!')
            console.error('SQUARE ISSUE')
            return { status: status || 'FAILED', token: token || null }
          }
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      } catch (error) {
        console.error(`Tokenization attempt ${attempt} failed:`, error)

        if (attempt === MAX_ATTEMPTS) {
          throw error
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  let cardReady = $state(false)
  let isSubmitting = $state(false)
  async function handleSubmit(e: Event) {
    e.preventDefault()

    if (isSubmitting) {
      return
    }

    isSubmitting = true

    if (!cardReady || !card) {
      isSubmitting = false
      toast.error(
        'Payment system loading. Please wait a few seconds and try again.',
      )
      return
    }

    const fatherFilled =
      $formData.father.name && $formData.father.phone && $formData.father.email
    const motherFilled =
      $formData.mother.name && $formData.mother.phone && $formData.mother.email

    if (!completedForm) {
      isSubmitting = false
      toast.error('Complete the form first.')
      return
    }

    if (!(fatherFilled && motherFilled) && !$formData.confirmParent) {
      showParentWarning = true
      isSubmitting = false
      return
    }

    toast.info('Processing Payment...')

    try {
      let { status, token } = await tokenizeWithTimeoutAndRetry()

      console.log('FINAL Tokenization Result:', status, token)

      if (status !== 'OK' || !token) {
        isSubmitting = false
        toast.error('Card info invalid. Please try again.')
        return
      }

      $formData.nonce = token

      toast.info('Checking Information...')

      // Delay to ensure nonce has actually been set
      await new Promise((resolve) => setTimeout(resolve, 50))
      formEl.requestSubmit()
    } catch (error) {
      console.error('Payment processing error:', error)

      if (error.message.includes('timeout')) {
        toast.error('Payment processing timed out. Please try again.')
      } else {
        toast.error('Payment processing failed. Please try again.')
      }
    } finally {
      // Only reset isSubmitting if we're not proceeding to form submission
      if (!$formData.nonce) {
        isSubmitting = false
      }
    }
  }

  function proceedPayment() {
    showPaymentAlert = false
    if (!dev) {
      window.location.href = 'https://masjidsuffah.com/'
    }
  }

  let termInfo: {
    name: string
    length: number
    p1: number
    p2: number
    p3: number
  } | null = $state(null)
  let termStatus: 'loading' | 'closed' | 'ok' = $state('loading')

  let card = $state(null)

  async function loadSquare() {
    return new Promise((resolve, reject) => {
      // Check if Square is already loaded
      if (window.Square) {
        console.log('Square already loaded, initializing...')
        initializeSquarePayments().then(resolve).catch(reject)
        return
      }

      console.log('Loading Square SDK...')
      const script = document.createElement('script')
      script.src = `https://${dev ? 'sandbox.' : ''}web.squarecdn.com/v1/square.js`
      script.async = true

      script.onload = async () => {
        try {
          console.log('Square SDK loaded, initializing payments...')
          await initializeSquarePayments()
          resolve()
        } catch (error) {
          console.error('Failed to initialize Square payments:', error)
          reject(error)
        }
      }

      script.onerror = (error) => {
        console.error('Failed to load Square SDK:', error)
        reject(new Error('Failed to load Square SDK'))
      }

      document.head.appendChild(script)
    })
  }

  async function initializeSquarePayments() {
    // Wait for Square to be fully available
    let attempts = 0
    while (!window.Square && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++
    }

    if (!window.Square) {
      throw new Error('Square SDK not available after waiting')
    }

    const payments = Square.payments(
      PUBLIC_SQUARE_APP_ID,
      PUBLIC_SQUARE_LOCATION_ID,
    )
    card = await payments.card()
    await card.attach('#card-container')

    cardReady = true
    console.log('Square payments initialized successfully')
  }

  onMount(async () => {
    try {
      const { data: cfg, error: e1 } = await db
        .from('config')
        .select('value')
        .eq('key', (dev ? 'dev_' : '') + 'active_term_id')
        .single()

      if (e1 || !cfg?.value) {
        termStatus = 'closed'
        return
      }

      const { data: term, error: e2 } = await db
        .from('maktab_term')
        .select('name, length, p1, p2, p3')
        .eq('id', +cfg.value)
        .single()

      if (!term) {
        termStatus = 'closed'
      } else {
        termInfo = term

        childrenCost[0] = term.p1
        childrenCost[1] = term.p2
        childrenCost[2] = term.p3

        termStatus = 'ok'
        await loadSquare()
      }
    } catch (error) {
      console.error('Initialization Error', error)
      termStatus = 'closed'
      toast.error(
        'Dev/Admin probably updating system. Something went wrong with init. Error code:',
        error,
      )
    }
  })

  const submitText = $derived(
    termInfo && totalCost
      ? `• Pay $${totalCost}/Month • For ${termInfo.length} Months •`
      : '',
  )

  const submitButtonText = $derived.by(() => {
    if (!cardReady) {
      return 'Loading payment system...'
    }
    if (isSubmitting) {
      return 'Processing...'
    }
    return submitText
  })

  function proceedIncomplete() {
    showParentWarning = false
    $formData.confirmParent = true
    formEl.requestSubmit()
  }
</script>

<svelte:head>
  <title>Maktab Registration - Masjid Suffah</title>
</svelte:head>

{#snippet completionIndicator(complete)}
  {#if complete}
    <Badge variant="success">✓ Complete</Badge>
  {/if}
{/snippet}

<div class="min-h-screen bg-background">
  <div
    class="text-center py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
      {#if termStatus === 'loading'}
        Loading..
      {:else if termStatus === 'closed'}
        Registration is currently closed.
      {:else}
        Maktab Year {termInfo.name} Registration Form
      {/if}
    </h1>

    {#if termStatus !== 'closed'}
      <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
        Register your child(ren) for our Islamic Studies program.
      </p>
      <div class="w-24 h-1 bg-primary mx-auto rounded-full mt-6"></div>
    {/if}
  </div>

  {#if termStatus === 'ok'}
    <form
      bind:this={formEl}
      method="POST"
      use:enhance
      class="max-w-4xl mx-auto px-4 pb-16 space-y-8"
      onsubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Users class="w-5 h-5" />
            Parent Information
          </CardTitle>
          <p class="text-sm text-muted-foreground">
            Please provide at least one parent's complete information.
          </p>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-4">
            <h4 class="font-medium flex items-center gap-2">
              Father's Information
              {@render completionIndicator(fatherComplete)}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Field {form} name="father.name">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Name</Form.Label>
                    <Input
                      {...props}
                      autocomplete="name"
                      bind:value={$formData.father.name}
                      placeholder="Father's full name" />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="father.phone">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label class="flex items-center gap-1">
                      <Phone class="w-3 h-3" /> Phone
                    </Form.Label>
                    <PhoneInput
                      {...props}
                      bind:phone={$formData.father.phone} />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="father.email">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label class="flex items-center gap-1">
                      <Mail class="w-3 h-3" /> Email
                    </Form.Label>
                    <Input
                      type="email"
                      {...props}
                      autocomplete="email"
                      bind:value={$formData.father.email}
                      placeholder="father@example.com" />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>
          </div>
          <div class="space-y-4">
            <h4 class="font-medium flex items-center gap-2">
              Mother's Information
              {@render completionIndicator(motherComplete)}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Field {form} name="mother.name">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Name</Form.Label>
                    <Input
                      {...props}
                      autocomplete="name"
                      bind:value={$formData.mother.name}
                      placeholder="Mother's full name" />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="mother.phone">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label class="flex items-center gap-1">
                      <Phone class="w-3 h-3" /> Phone
                    </Form.Label>
                    <PhoneInput
                      {...props}
                      bind:phone={$formData.mother.phone} />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>

              <Form.Field {form} name="mother.email">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label class="flex items-center gap-1">
                      <Mail class="w-3 h-3" /> Email
                    </Form.Label>
                    <Input
                      type="email"
                      {...props}
                      autocomplete="email"
                      bind:value={$formData.mother.email}
                      placeholder="mother@example.com" />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>
          </div>
          <div class="space-y-4 pt-4 border-t">
            <h4 class="font-medium flex items-center gap-2">
              <MapPin class="w-4 h-4" /> Address Information
              {@render completionIndicator(addressComplete)}
            </h4>
            <Form.Field {form} name="address">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Street Address</Form.Label>
                  <Input
                    {...props}
                    autocomplete="street-address"
                    bind:value={$formData.address}
                    placeholder="123 Main Street" />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Field {form} name="city">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>City</Form.Label>
                    <Input
                      {...props}
                      autocomplete="address-level2"
                      bind:value={$formData.city}
                      placeholder="City" />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
              <Form.Field {form} name="zipCode">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>ZIP Code</Form.Label>
                    <Input
                      {...props}
                      autocomplete="postal-code"
                      bind:value={$formData.zipCode}
                      placeholder="12345" />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 justify-center">
            <Baby class="w-5 h-5" />
            Children Information
          </CardTitle>
          <p class="text-sm text-muted-foreground text-center">
            Add information for each child you wish to register.
          </p>
        </CardHeader>
        <CardContent class="space-y-6">
          {#each $formData.children as child, index}
            <div class="border rounded-lg p-4 space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="font-medium">Child {index + 1}</h4>
                <div class="flex items-center gap-2">
                  {@render completionIndicator(isChildComplete(child))}
                  {#if $formData.children.length > 1}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onclick={() => removeChild(index)}
                      class="text-destructive hover:text-destructive">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  {/if}
                </div>
              </div>
              <div class="flex flex-wrap gap-4 items-start">
                <Form.Field
                  {form}
                  name="children[{index}].name"
                  class="flex-1 min-w-0">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label class="block">Name</Form.Label>
                      <Input
                        {...props}
                        bind:value={child.name}
                        placeholder="Child's full name" />
                    {/snippet}
                  </Form.Control>
                  <Form.FieldErrors />
                </Form.Field>
                <Form.Field
                  {form}
                  name="children[{index}].dob"
                  class="basis-full md:basis-auto flex-shrink-0">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label class="block">Date of Birth</Form.Label>
                      <Input type="date" {...props} bind:value={child.dob} />
                    {/snippet}
                  </Form.Control>
                  <Form.FieldErrors />
                </Form.Field>
                <Form.Field
                  {form}
                  name="children[{index}].sex"
                  class="basis-full md:basis-auto flex-shrink-0">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label class="block">Gender</Form.Label>
                      <Select.Root type="single" bind:value={child.sex}>
                        <Select.Trigger {...props}>
                          {child.sex === 'male'
                            ? 'Male'
                            : child.sex === 'female'
                              ? 'Female'
                              : 'Select gender'}
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="male">Male</Select.Item>
                          <Select.Item value="female">Female</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    {/snippet}
                  </Form.Control>
                  <Form.FieldErrors />
                </Form.Field>
              </div>
            </div>
          {/each}

          <Button
            type="button"
            variant="outline"
            onclick={addChild}
            class="w-full">
            <Plus class="w-4 h-4 mr-2" />
            Add Another Child
          </Button>
        </CardContent>
      </Card>

      <Card
        class="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Users class="w-5 h-5" />
            Registration Summary & Payment
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {#each pricingTiers as tier}
              <div
                class="text-center p-4 rounded-lg border transition-colors"
                class:bg-primary={tier.isActive}
                class:border-primary={tier.isActive}
                class:text-primary-foreground={tier.isActive}
                class:border-muted={!tier.isActive}
                class:bg-muted={!tier.isActive}>
                <div class="text-2xl font-bold">${tier.price}</div>
                <div class="text-sm opacity-70">{tier.label}</div>
              </div>
            {/each}
          </div>

          <div id="card-container" class="mt-16"></div>

          <input type="hidden" name="nonce" bind:value={$formData.nonce} />
          <Form.Field {form} name="cardHolderName">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Card Holder Name</Form.Label>
                <Input
                  {...props}
                  autocomplete="cc-name"
                  bind:value={$formData.cardHolderName}
                  placeholder="Name on Card" />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          <div
            class="prose mt-20 dark:prose-invert mx-auto items-center text-center">
            <h1>When you continue to payment, you agree to the following:</h1>
            <ol>
              <li>
                You are signing up for the
                <strong>full program ({termInfo.length} months)</strong>, not
                just one month at a time.
              </li>
              <li>
                <strong>There are no refunds</strong>, even if your child stops
                coming.
              </li>
              <li>
                <strong>You will still be charged each month</strong>, even if
                your child does not attend.
              </li>
              <li>
                <strong>You cannot cancel or leave</strong> the program once you
                are signed up.
              </li>
              <li>
                Your card will be
                <strong>charged automatically every month</strong>.
              </li>
            </ol>
            <p class="mt-6 text-lg">
              By clicking the <em>"{submitText}”</em> button below, you agree to
              these rules.
            </p>
            <Button
              type="submit"
              size="lg"
              class="w-full text-lg py-6"
              disabled={!completedForm || isSubmitting || !cardReady}>
              {submitButtonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  {/if}
</div>

<ParentAlert bind:open={showParentWarning} onProceed={proceedIncomplete} />
<PaymentAlert bind:open={showPaymentAlert} onProceed={proceedPayment} />
