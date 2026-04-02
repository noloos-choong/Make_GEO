import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/screens/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          500: '#4f6ef7',
          600: '#3b57e8',
          700: '#2d44cc',
        },
        office: {
          floor:        '#f0ebe0',
          wall:         '#d4c9b8',
          desk:         '#8b6914',
          'desk-shadow':'#6b4f10',
        },
      },
    },
  },
  plugins: [],
}

export default config
