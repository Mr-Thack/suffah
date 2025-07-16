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

  const { data } = $props()
  const form = superForm(data.form, {
    dataType: 'json',
    onUpdated: ({ form }) => {
      if (!form.valid) return

      if (form.errors?.confirmParent) {
        showParentWarning = true
      }

      toast.success('Registration submitted successfully!')
      showPaymentAlert = true
    },
  })

  const { form: formData, enhance } = form
  let showParentWarning = $state(false)
  let showPaymentAlert = $state(false)
  let termsAccepted = $state(false)
  let formEl: HTMLFormElement = $state()

  const childrenCost = [100, 160, 200]
  const numChildren = $derived($formData.children.length)
  const totalCost = $derived(childrenCost[numChildren - 1])

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
      termsAccepted &&
      $formData.cardHolderName,
  )

  const pricingTiers = $derived([
    { count: 1, price: 100, label: '1 Child', isActive: numChildren === 1 },
    { count: 2, price: 160, label: '2 Children', isActive: numChildren === 2 },
    { count: 3, price: 200, label: '3+ Children', isActive: numChildren >= 3 },
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

  let isSubmitting = $state(false)
  async function handleSubmit(e: Event) {
    if (isSubmitting) {
      return
    }
    isSubmitting = true

    event.preventDefault()

    const fatherFilled =
      $formData.father.name && $formData.father.phone && $formData.father.email
    const motherFilled =
      $formData.mother.name && $formData.mother.phone && $formData.mother.email

    if (!completedForm) return toast.error('Complete the form first.')

    if (!(fatherFilled && motherFilled) && !$formData.confirmParent) {
      showParentWarning = true
    } else {
      let { status, token } = await card.tokenize()
      console.log(status, token)
      if (status !== 'OK')
        return toast.error('Card info invalid—please try again.')

      $formData.nonce = token
      formEl.requestSubmit()
    }
    isSubmitting = false
  }

  function proceedIncomplete() {
    showParentWarning = false
    $formData.confirmParent = true
    formEl.requestSubmit()
  }

  function proceedPayment() {
    showPaymentAlert = false
  }

  let currentTerm: {
    name: string
    length: number
    p1: number
    p2: number
    p3: number
  } | null = $state(null)
  let termStatus: 'loading' | 'closed' | 'ok' = $state('loading')

  let card = null

  async function loadSquare() {
    console.log('Loading Square')
    const s = document.createElement('script')
    s.src = 'https://sandbox.web.squarecdn.com/v1/square.js'
    s.onload = async () => {
      setTimeout(async () => {
        let payments = Square.payments(
          PUBLIC_SQUARE_APP_ID,
          PUBLIC_SQUARE_LOCATION_ID,
        )
        card = await payments.card()
        await card.attach('#card-container')
        console.log('Square Attached')
      }, 200)
    }
    document.body.appendChild(s)
  }

  onMount(async () => {
    const { data: cfg, error: e1 } = await db
      .from('config')
      .select('value')
      .eq('key', 'active_term_id')
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
      currentTerm = term

      pricingTiers[0].price = term.p1
      pricingTiers[1].price = term.p2
      pricingTiers[2].price = term.p3

      termStatus = 'ok'
      await loadSquare()
    }
  })
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
        Maktab Registration – {currentTerm.name} ({currentTerm.length} Months)
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
            <h1>By submitting this form, you acknowledge:</h1>
            <ol>
              <li>
                When you enroll, you are signing up for the
                <strong>entire program ({currentTerm.length} months)</strong> (not
                just month-to-month)
              </li>
              <li>
                <strong>No refunds</strong> will be given — even if your child(ren)
                stop(s) coming.
              </li>
              <li>
                <strong>Monthly payments will still be charged</strong>, even if
                your child does not attend.
              </li>
              <li>
                <strong>You cannot cancel or withdraw</strong> from the program after
                enrolling
              </li>
              <li>
                Your card will be
                <strong>automatically charged each month</strong>.
              </li>
            </ol>
            <div class="my-4 text-xl text-center flex items-center gap-3">
              <Checkbox bind:checked={termsAccepted} id="terms" />
              <Label for="terms" class="text-lg"
                >We accept these terms and conditions</Label>
            </div>

            <Button
              type="submit"
              size="lg"
              class="w-full text-lg py-6"
              disabled={!completedForm}>
              Pay • ${totalCost}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  {/if}
</div>

<ParentAlert bind:open={showParentWarning} onProceed={proceedIncomplete} />
<PaymentAlert bind:open={showPaymentAlert} onProceed={proceedPayment} />
