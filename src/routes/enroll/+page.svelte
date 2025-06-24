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
  import * as Select from '$lib/components/ui/select'
  import * as Form from '$lib/components/ui/form'
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

  const { data } = $props()
  const form = superForm(data.form, {
    dataType: 'json',
    onUpdated: ({ form }) => {
      if (form.errors?.confirmParent) {
        showParentWarning = true
      }
      if (form.valid) {
        toast.success('Registration submitted successfully!')
      }
    },
  })

  const { form: formData, enhance } = form
  let showParentWarning = $state(false)
  let formEl: HTMLFormElement

  // Derived Values
  const numChildren = $derived($formData.children.length)
  const totalCost = $derived(
    numChildren === 1 ? 100 : numChildren === 2 ? 160 : 200,
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
  const hasCompleteParent = $derived(fatherComplete || motherComplete)
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

  function handleSubmit(event: Event) {
    const fatherFilled =
      $formData.father.name && $formData.father.phone && $formData.father.email
    const motherFilled =
      $formData.mother.name && $formData.mother.phone && $formData.mother.email
    if (!(fatherFilled && motherFilled) && !$formData.confirmParent) {
      event.preventDefault()
      showParentWarning = true
    }
  }

  function proceedWithIncompleteInfo() {
    showParentWarning = false
    $formData.confirmParent = true
    formEl.requestSubmit()
  }
</script>

<svelte:head>
  <title>Maktab Registration - Masjid Suffah</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <div
    class="text-center py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
      Maktab Registration
    </h1>
    <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
      Register your child(ren) for our Islamic Studies program.
    </p>
    <div class="w-24 h-1 bg-primary mx-auto rounded-full mt-6"></div>
  </div>

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
        <!-- Father's Info -->
        <div class="space-y-4">
          <h4 class="font-medium flex items-center gap-2">
            Father's Information
            {#if fatherComplete}
              <Badge variant="secondary" class="text-xs">Complete</Badge>
            {/if}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Field {form} name="father.name">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Name</Form.Label>
                  <Input
                    {...props}
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
                  <Input
                    {...props}
                    bind:value={$formData.father.phone}
                    placeholder="(555) 123-4567" />
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
                    bind:value={$formData.father.email}
                    placeholder="father@example.com" />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
          </div>
        </div>
        <!-- Mother's Info -->
        <div class="space-y-4">
          <h4 class="font-medium flex items-center gap-2">
            Mother's Information
            {#if motherComplete}
              <Badge variant="secondary" class="text-xs">Complete</Badge>
            {/if}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Field {form} name="mother.name">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Name</Form.Label>
                  <Input
                    {...props}
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
                  <Input
                    {...props}
                    bind:value={$formData.mother.phone}
                    placeholder="(555) 123-4567" />
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
                    bind:value={$formData.mother.email}
                    placeholder="mother@example.com" />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
          </div>
        </div>
        <!-- Address -->
        <div class="space-y-4 pt-4 border-t">
          <h4 class="font-medium flex items-center gap-2">
            <MapPin class="w-4 h-4" /> Address Information
          </h4>
          <Form.Field {form} name="address">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>Street Address</Form.Label>
                <Input
                  {...props}
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
        <CardTitle class="flex items-center gap-2">
          <Baby class="w-5 h-5" /> Children Information
        </CardTitle>
        <p class="text-sm text-muted-foreground">
          Add information for each child you wish to register.
        </p>
      </CardHeader>
      <CardContent class="space-y-6">
        {#each $formData.children as child, index}
          <div class="border rounded-lg p-4 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="font-medium">Child {index + 1}</h4>
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
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              <Form.Field {form} name="children[{index}].name">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Name</Form.Label>
                    <Input
                      {...props}
                      bind:value={child.name}
                      placeholder="Child's full name" />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
              <Form.Field {form} name="children[{index}].dob">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Date of Birth</Form.Label>
                    <Input type="date" {...props} bind:value={child.dob} />
                  {/snippet}
                </Form.Control>
                <Form.FieldErrors />
              </Form.Field>
              <Form.Field {form} name="children[{index}].sex">
                <Form.Control>
                  {#snippet children({ props })}
                    <Form.Label>Gender</Form.Label>
                    <Select.Root bind:value={child.sex} type="single">
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

    <!-- Replace the existing pricing card and final payment card with this single card -->
    <Card
      class="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Users class="w-5 h-5" />
          Registration Summary & Payment
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Pricing Tiers Display -->
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

        <!-- Warning and Submit -->
        <div class="space-y-4">
          {#if !hasCompleteParent}
            <div
              class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
              ⚠️ Please provide complete information for at least one parent
              (name, phone, and email).
            </div>
          {/if}

          <Button
            type="submit"
            size="lg"
            class="w-full text-lg py-6"
            disabled={!hasCompleteParent}>
            Continue to Payment • ${totalCost}
          </Button>

          <p class="text-xs text-muted-foreground text-center">
            By submitting this form, you acknowledge any changes must be made by
            contacting Administration.
          </p>
        </div>
      </CardContent>
    </Card>
  </form>
</div>

<AlertDialog bind:open={showParentWarning}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Incomplete Parent Information</AlertDialogTitle>
      <AlertDialogDescription>
        You can proceed with just one parent's complete info, but we prefer
        both. Would you like to go back or continue?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Go Back</AlertDialogCancel>
      <AlertDialogAction onclick={proceedWithIncompleteInfo}>
        Continue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
