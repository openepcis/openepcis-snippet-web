import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2025-08-05",

  devtools: { enabled: true },
  modules: ["@nuxt/ui"],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      snippetApiUrl: process.env.SNIPPET_API_URL || "http://localhost:8090",
    },
  },

  // Nuxt UI Prefix
  ui: {
    colorMode: true,
  },

  app: {
    head: {
      title: "EPCIS Event Sentry Web",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: `/openepcis-snippet-logo-white.svg`,
        },
      ],
    },
  },
});
