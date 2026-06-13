import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/** Wrap a CSS variable as an HSL color with optional opacity support. */
const hsl = (v: string) => `hsl(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        border: hsl("--border"),
        input: hsl("--input"),
        ring: hsl("--ring"),
        background: hsl("--background"),
        foreground: hsl("--foreground"),
        card: {
          DEFAULT: hsl("--card"),
          foreground: hsl("--card-foreground"),
        },
        popover: {
          DEFAULT: hsl("--popover"),
          foreground: hsl("--popover-foreground"),
        },
        muted: {
          DEFAULT: hsl("--muted"),
          foreground: hsl("--muted-foreground"),
        },
        accent: {
          DEFAULT: hsl("--accent"),
          foreground: hsl("--accent-foreground"),
        },
        secondary: {
          DEFAULT: hsl("--secondary"),
          foreground: hsl("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: hsl("--destructive"),
          foreground: hsl("--destructive-foreground"),
        },
        primary: {
          DEFAULT: hsl("--primary"),
          foreground: hsl("--primary-foreground"),
          muted: hsl("--primary-muted"),
          "muted-foreground": hsl("--primary-muted-foreground"),
          border: hsl("--primary-border"),
        },
        ai: {
          DEFAULT: hsl("--ai"),
          foreground: hsl("--ai-foreground"),
          muted: hsl("--ai-muted"),
          "muted-foreground": hsl("--ai-muted-foreground"),
          border: hsl("--ai-border"),
        },
        success: {
          DEFAULT: hsl("--success"),
          foreground: hsl("--success-foreground"),
          muted: hsl("--success-muted"),
          "muted-foreground": hsl("--success-muted-foreground"),
          border: hsl("--success-border"),
        },
        warning: {
          DEFAULT: hsl("--warning"),
          foreground: hsl("--warning-foreground"),
          muted: hsl("--warning-muted"),
          "muted-foreground": hsl("--warning-muted-foreground"),
          border: hsl("--warning-border"),
        },
        danger: {
          DEFAULT: hsl("--danger"),
          foreground: hsl("--danger-foreground"),
          muted: hsl("--danger-muted"),
          "muted-foreground": hsl("--danger-muted-foreground"),
          border: hsl("--danger-border"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(16 24 40 / 0.04)",
        card: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.05)",
        "card-hover":
          "0 2px 4px -1px rgb(16 24 40 / 0.06), 0 6px 12px -2px rgb(16 24 40 / 0.08)",
        md: "0 2px 4px -1px rgb(16 24 40 / 0.06), 0 4px 8px -2px rgb(16 24 40 / 0.08)",
        lg: "0 4px 6px -2px rgb(16 24 40 / 0.05), 0 12px 20px -4px rgb(16 24 40 / 0.10)",
        popover: "0 8px 28px -6px rgb(16 24 40 / 0.18)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
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
        "fade-in": "fade-in 0.2s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
