import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      height: {
        'header': '15%',
        'footer': '12%',
        'main': '73%'
      }
    },
  },
  plugins: [],
} satisfies Config 