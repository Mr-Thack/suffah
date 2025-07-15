<script lang="ts">
  import { onMount } from 'svelte'
  import { db } from '$lib/db'
  import { CheckCircle } from 'lucide-svelte'
  import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle,
    CardContent,
    CardFooter,
  } from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'

  onMount(async () => {
    const token = localStorage.getItem('verifyToken')
    if (token) {
      const { data: success, error } = await db.rpc('verify_payment', {
        token: token,
        method: 'RETURN',
      })
      if (error) {
        console.error('Verification failed:', error.message)
      } else if (success) {
        localStorage.removeItem('verifyToken')
      }
    }
  })
</script>

<div class="flex items-center justify-center min-h-screen">
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>
        <h1 class="inline-flex text-2xl font-bold">
          <CheckCircle class="mr-4 w-8 h-8 text-green-500" />
          Thank You!
        </h1>
        <br />
        <h2 class="mb-8">Your payment has been submitted successfully</h2>
      </CardTitle>
      <CardDescription>
        Our team may need to make some adjustments. You will receive a receipt
        via email once everything is verified.
      </CardDescription>
    </CardHeader>
    <!--
      <CardContent>
        <Button href="/">Return to Homepage</Button>
      </CardContent>
    -->
  </Card>
</div>
