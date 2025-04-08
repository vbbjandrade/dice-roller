import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { base } from "./src/utils";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
});
