import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn76w8fswz9hy73pg5zjc6g9zx7sj1m6/design-tokens/tailwind.preset";

const config: Config = {
  darkMode: ["class"],
  presets: [tailwindPreset],
  content: ["./src/**/*.{{ts,tsx}}"],
  plugins: [],
};

export default config;
