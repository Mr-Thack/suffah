# Masijd Suffah Website

This is just a modernized version of the current Masjid Suffah Website.

## Setup
1) See Tech Stack below for build information
2) You should just have to run ``bun run dev`` and push to the Git repo
3) Set up Netlify to auto read from pushes to your Git repo on Github or something and auto build and auto publish for you
4) Also, don't forget to set the ``.env.local`` (copy from ``.env.example``) with all required values

## Philosophy

The goal is to make **scale this to community needs** with **as few movings parts as possible**.

Personally, that means that I'm going to attempt to simplify the feature requests as much as possible such that they:

1) Satisfy the need of the original request
2) As simple to implement as possible
3) Use the simplest feasible (fits current needs + can scale to a reasonable max when needed) tech stack

If you find yourself to be the maintainer of this, may Allah help you. Feel free to tweak anything you'd like!

## Tech Stack (Current)
As I've been going through this project, I've reevaluated the Tech stack a lot, so here's how it is right now:
- **SvelteKit** instead of React or NextJS or Angular (HTML Framework) because:
  1) SvelteKit is simpler to use
  2) This isn't a super complex project, so we can't benefit from their increased scalability
  3) I have more experience with SvelteKit
- **Typescript** because:
  1) Type-Safety over JS
  2) I already know how to use it well
- **Shadcn UI + TailwindCSS** (Styling) because:
  1) Allows for extreme personalization / tailoring to our own needs
  2) Easy to style (I suck at UI design, or atleast, I think I suck at UI design)
  3) I have experience in Tailwind
- **Supabase** (Backend + DB) because:
  1) Backend as a Service, so we don't need our own VPS for our own full-fledged backend; we can rely on server-functions
  2) Simple enough to use
  3) Has OAuth
  4) Lots of Data Types
- **Netlify** (Hosting) because:
  1) Easy development experience
  2) Free!
  3) Integrates nicely with other major technologies that we're using

### Our "Isnaad"
1. I think it was some relative of Faizan (the first Imam of this Masjid), maybe his sister, who set up the Wordpress Site. 
2. I think then that my dad, Mazhar, contracted a friend of his, Hussain, who then contracted someone else to setup the Display Page.
3. Then my dad took care of it for a long time, with occasional stability patches from either Hussain or his contractor; I don't know which.
4. Finally, it's me, AbdulMuqeet. However, the code here was all made from scratch. I don't think any DNA of the original will survive in code, but it will surely survive in asthetics and functionality.
