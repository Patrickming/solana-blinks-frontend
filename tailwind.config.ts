import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  // Add safelist for dynamic tag classes
  safelist: [
    'bg-red-500/20',
    'text-red-500',
    'border-red-500/30',
    'bg-primary/20',
    'text-primary',
    'border-primary/30',
    'bg-yellow-500/20',
    'text-yellow-600',
    'border-yellow-500/30',
    'bg-green-500/20',
    'text-green-600',
    'border-green-500/30',
    // Add the fallback classes used in forum-content.tsx as well, just in case
    'bg-secondary',
    'text-secondary-foreground',
    'border-border',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Solana 相关颜色
        solana: {
          blue: "hsl(var(--solana-blue))",
          purple: "hsl(var(--solana-purple))",
          green: "hsl(var(--solana-green))",
          techBlue: "hsl(var(--solana-tech-blue))",
          errorRed: "hsl(var(--solana-error-red))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "solana-gradient": "linear-gradient(to right, #9945FF, #14F195)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

