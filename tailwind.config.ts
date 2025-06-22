// tailwind.config.ts
import { fontFamily } from "tailwindcss/defaultTheme";
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // ShadCN theming is done via CSS variables in app.css,
      // so you don't need much here by default.
      // You can extend other properties if you wish.
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
    },
  },
  plugins: [
    // Add your plugins here
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} satisfies Config
