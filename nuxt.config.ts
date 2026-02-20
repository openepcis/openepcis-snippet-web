import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2025-08-05",

  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/seo", "nuxt-llms"],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      snippetApiUrl: process.env.SNIPPET_API_URL || "http://localhost:8080",
    },
  },

  site: {
    url: "https://profile-checker.openepcis.io",
    name: "EPCIS Profile Checker",
    description:
      "Open-source tools for EPCIS 2.0 profile building, event validation, and JSON Schema snippet search. Speed up GS1 traceability and visibility implementations.",
    defaultLocale: "en",
  },

  // Nuxt UI Prefix
  ui: {
    colorMode: true,
  },

  monacoEditor: {
    locale: "en",
    componentName: {
      codeEditor: "MonacoEditor",
      diffEditor: "MonacoDiffEditor",
    },
  },

  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: `/favicon.svg`,
        },
      ],
    },
  },

  // Robots configuration with AI crawler rules
  robots: {
    groups: [
      {
        userAgent: "*",
        allow: "/",
      },
      // Allow AI assistants that cite sources (search/chat assistants)
      {
        userAgent: ["ChatGPT-User", "Perplexity-User", "PerplexityBot"],
        allow: "/",
      },
      // Block AI training crawlers (not search assistants)
      {
        userAgent: ["GPTBot", "CCBot", "Google-Extended", "anthropic-ai"],
        disallow: ["/"],
      },
    ],
  },

  sitemap: {
    xslColumns: [
      { label: "URL", width: "65%" },
      { label: "Last Modified", select: "sitemap:lastmod", width: "35%" },
    ],
  },

  schemaOrg: {
    identity: {
      type: "Organization",
      name: "OpenEPCIS",
      url: "https://openepcis.io",
      logo: "/openepcis-logo.svg",
      sameAs: ["https://github.com/openepcis", "https://www.benelog.com/"],
    },
  },

  ogImage: {
    enabled: false,
  },

  linkChecker: {
    failOnError: false,
  },

  llms: {
    domain: "https://profile-checker.openepcis.io",
    title: "EPCIS Profile Checker",
    description:
      "Open-source tools for building EPCIS 2.0 profiles, validating EPCIS events/documents, and searching reusable JSON Schema snippets for GS1 supply chain traceability.",
    sections: [
      {
        title: "Tools",
        description: "Web-based tools for EPCIS 2.0 development",
        links: [
          {
            title: "Profile Builder",
            description:
              "Create and edit EPCIS 2.0 event profiles. Define business steps, identifiers, and validation rules for document or event-level schemas.",
            href: "/profile-builder",
          },
          {
            title: "Event Validator",
            description:
              "Validate EPCIS 2.0 JSON/JSON-LD events or documents against custom profiles. Instant conformance checking with detailed error reporting.",
            href: "/event-validator",
          },
          {
            title: "Snippet Search",
            description:
              "Browse and search reusable JSON Schema components for EPCIS and beyond. Useful building blocks for supply chain applications.",
            href: "/snippet-search",
          },
        ],
      },
      {
        title: "About",
        description: "Project information",
        links: [
          {
            title: "OpenEPCIS",
            description:
              "Open-source EPCIS tools and libraries developed by benelog GmbH & Co. KG.",
            href: "https://openepcis.io",
          },
          {
            title: "benelog GmbH & Co. KG",
            description:
              "Organization involved in development and conception of the EPCIS Profile Checker.",
            href: "https://www.benelog.com/",
          },
          {
            title: "Source Code",
            description:
              "GitHub repository for the EPCIS Event Sentry project.",
            href: "https://github.com/openepcis/openepcis-event-sentry",
          },
        ],
      },
    ],

    notes: [
      "This is an open-source project licensed under Apache 2.0.",
      "All tools work client-side in the browser — no data is sent to external servers for validation.",
    ],

    // Enable /llms-full.txt endpoint
    full: {
      title: "EPCIS Profile Checker",
      description:
        "Complete guide on Open-source tools for building EPCIS 2.0 profiles, validating EPCIS events/documents, and searching reusable JSON Schema snippets for GS1 supply chain traceability.",
    },
  },
});
