import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2026-03-18",

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
      "Open-source tools for EPCIS profile building, event validation, and JSON Schema snippet search. Speed up GS1 traceability and visibility implementations.",
    defaultLocale: "en",
  },

  // Nuxt UI Prefix
  ui: {
    colorMode: true,
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
          href: `/favicon-circle.svg`,
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

  fonts: {
    providers: {
      google: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      googleicons: false,
      adobe: false,
    },
    provider: "local",
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
      "Open-source browser-based tools for GS1 EPCIS (Electronic Product Code Information Services) supply chain traceability: build event profiles, validate EPCIS JSON/JSON-LD documents, and search reusable JSON Schema snippets. No server-side processing — all validation runs client-side.",
    sections: [
      {
        title: "Tools",
        description: "Browser-based tools for EPCIS development and validation",
        links: [
          {
            title: "Profile Builder",
            description:
              "Visually create EPCIS JSON Schema profiles. Configure fields across 9 EPCIS dimensions (What, When, Where, Why, How, etc.), define business steps, EPC identifiers, sensor elements, and validation rules. Supports document-level and event-level schemas. Export and import profiles as JSON.",
            href: "/profile-builder",
          },
          {
            title: "Event Validator",
            description:
              "Validate EPCIS JSON/JSON-LD events or documents against JSON Schema profiles. Side-by-side editors with real-time validation, detailed error reporting with JSON Pointer paths, and multi-draft JSON Schema support (Draft-06, Draft-07, 2019-09, 2020-12). Loads pre-built profiles from GitHub.",
            href: "/event-validator",
          },
          {
            title: "Snippet Search",
            description:
              "Search and browse a library of reusable JSON Schema components for EPCIS and supply chain applications. Full-text search with instant results, schema metadata display, and one-click download.",
            href: "/snippet-search",
          },
        ],
      },
      {
        title: "Standards",
        description: "Industry standards supported by this application",
        links: [
          {
            title: "GS1 EPCIS",
            description:
              "Electronic Product Code Information Services — the GS1 standard for supply chain event data capture and sharing across trading partners.",
            href: "https://www.gs1.org/standards/epcis",
          },
          {
            title: "GS1 CBV",
            description:
              "Core Business Vocabulary — standard values for business steps (shipping, receiving, etc.), dispositions, and actions used in EPCIS events.",
            href: "https://www.gs1.org/standards/epcis",
          },
          {
            title: "JSON Schema",
            description:
              "Validation standard for JSON documents. This application supports Draft-06, Draft-07, 2019-09, and 2020-12.",
            href: "https://json-schema.org",
          },
        ],
      },
      {
        title: "About",
        description: "Project and organization information",
        links: [
          {
            title: "OpenEPCIS",
            description:
              "Open-source EPCIS tools and libraries for supply chain traceability, developed by benelog GmbH & Co. KG.",
            href: "https://openepcis.io",
          },
          {
            title: "benelog GmbH & Co. KG",
            description:
              "German technology company specializing in GS1 standards, supply chain visibility, and EPCIS implementations.",
            href: "https://www.benelog.com/",
          },
          {
            title: "Source Code",
            description:
              "GitHub repository for the EPCIS Profile Checker and Event Sentry project. Open-source under Apache 2.0 license.",
            href: "https://github.com/openepcis/openepcis-event-sentry",
          },
        ],
      },
    ],

    notes: [
      "Open-source project licensed under Apache 2.0.",
      "All validation and schema generation runs client-side in the browser — no event data is sent to external servers.",
      "Supports GS1 EPC identifier formats: SGTIN, SSCC, GRAI, GDTI, LGTIN, SGLN, GSIN, GINC in both URN and GS1 Digital Link formats.",
      "Sensor element support covers 71 measurement types including temperature, humidity, speed, and more.",
      "Built with Nuxt 4, Vue.js, CodeMirror 6, and AJV for JSON Schema validation.",
    ],

    // Enable /llms-full.txt endpoint with comprehensive documentation
    full: {
      title: "EPCIS Profile Checker — Complete Documentation",
      description:
        "Comprehensive reference for the EPCIS Profile Checker: an open-source web application for building EPCIS profiles, validating events/documents against JSON Schema, and searching reusable schema snippets for GS1 supply chain traceability.",
    },
  },
});
