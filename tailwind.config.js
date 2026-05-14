const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* Driven by CSS vars in global.css (light / `.dark`) — see colors.json for hex parity. */
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        borderSubtle: "hsl(var(--border-subtle) / <alpha-value>)",
        canvas: "hsl(var(--background) / <alpha-value>)",
        ink: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border-subtle) / <alpha-value>)",
        input: "hsl(var(--border-subtle) / <alpha-value>)",
        ring: "hsl(var(--foreground) / <alpha-value>)",
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};
