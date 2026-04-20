import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d12",
        panel: "#13161e",
        border: "#232833",
        live: "#ef4444",
      },
    },
  },
  plugins: [],
};

export default config;
