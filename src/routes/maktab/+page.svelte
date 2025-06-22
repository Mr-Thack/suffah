<script lang="ts">
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from '$lib/components/ui/card'
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '$lib/components/ui/table'
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from '$lib/components/ui/accordion'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'

  let subjects: Array<[string, string]> = [
    [
      'Quraan Recitation (تلاوة)',
      'Reading the Quraan with proper pronunciation.',
    ],
    [
      'Duas/Surah Memorization (تحفيظ)',
      'Memorizing many important Duas and Surahs under proper survisement.',
    ],
    [
      'Islamic Jurispredence (فقه الإسلام)',
      'The basics of Islaam. How to pray, make wudu, fast, and rulings on common matters.',
    ],
    [
      'Biography of the Prophet (سيرة النبي ,صلى الله عليه و سلم)',
      'The life history of the Prophet, peace be upon Him, as well a brief history of some of the earlier Prophets, peace be upon Them so that the students cultivate love in their hearts.',
    ],
    [
      'Islamic Ethics (أخلاق الإسلام)',
      'Manners of Islam from a theoretical and practical standpoint. For example, how to talk, respect parents, eat, sleep, play, interact with Muslims as well as non-Muslims, etc.',
    ],
    [
      'Beliefs (عقائد)',
      "Beliefs that make someone a Muslim, including the beliefs held about Allah, His Angels, His Books, His Messengers, etc from the viewpoint of the Ahl us Sunnah wal Jamaa'ah",
    ],
  ]

  let faqs: Array<[string, string]> = [
    [
      'From what ages are children taken?',
      'Children aged 6 and up are eligible for admittance. Children under 6 may be admitted upon taking an aptitude test.',
    ],
    [
      "What if I can't make it for all 3 days?",
      'We encourage attendance so that there is no shortfall in the work learned. However, if a child can only come for certain days, we will try our best to accommodate the child.',
    ],
    [
      'Can I volunteer?',
      "Volunteers are always welcome. From teaching to being an aide, we're always looking for dedicated and child-friendly teachers.",
    ],
    [
      'How do I enroll my child?',
      "Simply complete our online registration form and we'll get back to you with next steps.",
    ],
    [
      'How can I support the school?',
      "One may be a well-wisher and keep the educational programs in one's duas (supplications) We also encourage your oral, physical and monetary support to keep the school – with the Beneficence of Allah – vibrant.",
    ],
    [
      'Who is teaching?',
      'The primary instructors are Imaam Muhammad Jaffari for boys and Aalimah Rabia Jaffari for girls. There are also a few volunteers.',
    ],
  ]

  function handleEnrollment() {
    // Navigate to enrollment portal
    console.log('Navigate to enrollment portal')
  }
</script>

{#snippet dot(emphasize)}
  <div
    class="w-3 h-3 bg-primary rounded-full"
    class:bg-accent={emphasize}
    class:bg-primary={!emphasize}
  ></div>
{/snippet}

<!-- Main Container -->
<div class="min-h-screen bg-background">
  <!-- Header Section -->
  <div class="text-center py-16 px-4">
    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
      Masjid Suffah Maktab Program
    </h1>
    <div class="w-24 h-1 bg-primary mx-auto rounded-full"></div>
  </div>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 pb-16 space-y-8">
    <!-- Top Row - Goal and Key Info -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Goal Card -->
      <Card class="lg:col-span-2">
        <CardHeader class="space-y-4">
          <CardTitle class="text-2xl flex items-center gap-3">
            {@render dot()}
            Goal
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <p class="text-muted-foreground leading-relaxed">
            The goal of the Evening Islamic Studies is to provide the children a
            sound foundation in their Islamic knowledge and practice, while
            inculcating the love of Allah and the Prophet, Peace be Upon Him.
          </p>
          <p class="text-muted-foreground leading-relaxed">
            The <span class="font-medium text-foreground"
              >'tarbiyyah' تربية</span
            > (upbringing) of the students is highly emphasized.
          </p>
        </CardContent>
      </Card>

      <!-- Quick Info Cards -->
      <!-- Schedule Card -->
      <Card class="bg-primary text-primary-foreground">
        <CardHeader class="pb-4">
          <CardTitle class="text-lg">Schedule</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <p class="opacity-90">Tuesday - Thursday</p>
          <p class="text-2xl font-bold">5:30 PM - 7:00 PM</p>
          <Badge variant="secondary" shade="dark">3 Days Weekly</Badge>
        </CardContent>
      </Card>
    </div>

    <!-- Curriculum Section -->
    <Card>
      <CardHeader class="space-y-4">
        <CardTitle class="text-2xl flex items-center gap-3">
          {@render dot()}
          Curriculum
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead class="font-semibold text-foreground">
                Subject Name
              </TableHead>
              <TableHead class="font-semibold text-foreground">
                Subject Description
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each subjects as subject}
              <TableRow>
                <TableCell class="font-medium align-top py-4">
                  {subject[0]}
                </TableCell>
                <TableCell class="text-muted-foreground leading-relaxed py-4">
                  {subject[1]}
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Bottom Row - Enrollment and FAQ -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Enrollment CTA -->
      <Card class="flex flex-col">
        <CardHeader class="space-y-4">
          <CardTitle class="text-2xl flex items-center gap-3">
            {@render dot(true)}
            Ready to Begin?
          </CardTitle>
        </CardHeader>
        <CardContent class="flex-1 flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <p class="text-muted-foreground leading-relaxed">
              Join our Islamic Studies program and give your child a strong
              foundation in their faith. Our experienced instructors are ready
              to guide them on their learning journey.
            </p>
            <div class="flex flex-wrap gap-2">
              {#each ['Ages 6+', '3 Days/Week', 'Small Classes'] as badge}
                <Badge variant="accent">{badge}</Badge>
              {/each}
            </div>
          </div>
          <Button
            size="lg"
            class="w-full text-lg font-semibold"
            on:click={handleEnrollment}
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Enroll Now
          </Button>
        </CardContent>
      </Card>

      <!-- FAQ Section -->
      <Card>
        <CardHeader class="space-y-4">
          <CardTitle class="text-2xl flex items-center gap-3">
            {@render dot()}
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion class="w-full">
            {#each faqs as faq, index}
              <AccordionItem value="item-{index}">
                <AccordionTrigger class="text-left font-medium">
                  {faq[0]}
                </AccordionTrigger>
                <AccordionContent class="text-muted-foreground leading-relaxed">
                  {faq[1]}
                </AccordionContent>
              </AccordionItem>
            {/each}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
