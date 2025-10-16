import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn76w8fswz9hy73pg5zjc6g9zx7sj1m6/design-tokens/tailwind.preset";

const config: Config = {
  presets: [tailwindPreset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/components/src/**/*.{ts,tsx}"
  ],
  darkMode: ["class"],
};

export default config;
