/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* shadcn tokens (mapped to design CSS variables) */
        border: "var(--border)",
        input: "var(--border-strong)",
        ring: "var(--accent)",
        background: "var(--bg)",
        foreground: "var(--text-1)",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-1)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-2)",
        },
        accent: {
          DEFAULT: "var(--accent-soft)",
          foreground: "var(--accent)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-1)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-1)",
        },
        /* Vantage design tokens */
        canvas: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        line: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        ink: {
          1: "var(--text-1)",
          2: "var(--text-2)",
          3: "var(--text-3)",
        },
        brand: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          soft: "var(--accent-soft)",
          2: "var(--accent-2)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        chart: {
          1: "#00A99D",
          2: "#7AC143",
          3: "#F5C400",
          4: "#F7941E",
          5: "#E85D75",
          6: "#2F6FE0",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        xl: "20px",
        lg: "14px",
        md: "10px",
        sm: "6px",
        pill: "999px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
        glow: "0 0 24px rgba(0,169,157,.25)",
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "live-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "70%": { transform: "scale(1.9)", opacity: "0" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "live-pulse": "live-pulse 2s ease-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
