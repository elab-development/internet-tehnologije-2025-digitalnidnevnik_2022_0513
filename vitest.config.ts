/**
 * POKRETANJE:
 *   npm run test:run       # pokreni jednom sve testove
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  test: {
    // simulira browser okruzenje (document, window, itd.)
    environment: "jsdom",

    // omogucava globalne funkcije (describe, it, expect) bez importa
    globals: true,

    // setup fajl koji se izvrsava pre svih testova
    setupFiles: ["./__tests__/setup.ts"],

    // pattern za pronalazenje test fajlova
    include: ["__tests__/**/*.test.{ts,tsx}"],

    // konfiguracija za code coverage
    coverage: {
      provider: "v8", //
      reporter: ["text", "json", "html"], // formati izvestaja
      exclude: ["node_modules/", ".next/", "__tests__/"], // ignore foldere
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
