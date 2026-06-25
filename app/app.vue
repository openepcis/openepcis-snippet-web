<template>
  <UApp>
    <AppHeader />

    <!-- Main content -->
    <main class="flex-1">
      <NuxtPage />
    </main>

    <AppFooter />
  </UApp>
</template>

<script setup lang="ts">
const site = useSiteConfig();

// Site-wide SEO defaults. Any page can override by calling useSeoMeta again.
useSeoMeta({
  ogType: "website",
  ogImage: `${site.url}/linkedin-banner.png`,
  ogImageWidth: 1200,
  ogImageHeight: 627,
  ogImageAlt:
    "EPCIS Profile Checker — build, validate, and search EPCIS profiles",
  ogLocale: "en_US",
  ogTitle: "EPCIS Profile Checker",
  ogDescription:
    "Build, validate, and search EPCIS profiles in your browser. Free and open-source.",
  twitterCard: "summary_large_image",
  twitterTitle: "EPCIS Profile Checker",
  twitterDescription:
    "Build, validate, and search EPCIS profiles in your browser. Free and open-source.",
});

// Site-wide Schema.org: the website + the app as a whole
useSchemaOrg([
  defineWebSite({
    name: "EPCIS Profile Checker",
    description:
      "Open-source browser tools for building, validating, and searching EPCIS profiles and JSON Schema snippets.",
    inLanguage: "en-US",
  }),

  // SoftwareApplication: marks the whole app as free, web-based developer software, good for geo
  defineSoftwareApp({
    name: "EPCIS Profile Checker",
    description:
      "Open-source, browser-based tools to build EPCIS JSON Schema profiles, validate EPCIS JSON/JSON-LD events, and search reusable schema snippets for GS1 supply chain traceability.",
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "EPCIS / GS1 supply chain tooling",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    url: site.url,
    screenshot: `${site.url}/linkedin-banner.png`,
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      name: "OpenEPCIS",
      url: "https://openepcis.io",
    },
    sameAs: [
      "https://github.com/openepcis/openepcis-event-sentry",
      "https://openepcis.io",
    ],
    featureList: [
      "Build EPCIS JSON Schema profiles visually",
      "Validate EPCIS JSON/JSON-LD events against profiles",
      "Search reusable EPCIS JSON Schema snippets",
      "Runs entirely in the browser, no data sent to a server",
    ],
  }),
]);
</script>
