<template>
  <div class="min-h-screen bg-background text-foreground p-4 md:p-6">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Search Panel -->
      <div class="lg:col-span-1">
        <div class="lg:sticky lg:top-24">
          <SnippetSearch @select="selectedSnippet = $event" />
        </div>
      </div>

      <!-- Viewer Panel -->
      <div class="lg:col-span-3">
        <SnippetViewer :snippet="selectedSnippet" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const site = useSiteConfig();

useSeoMeta({
  title: "Snippet Search — Browse EPCIS JSON Schema Components",
  description:
    "Search and browse reusable JSON Schema components for EPCIS and supply chain applications. Building blocks for traceability system development.",
});

useSchemaOrg([
  defineWebPage({
    name: "EPCIS Snippet Search",
    description:
      "Browse reusable JSON Schema components for EPCIS applications.",
  }),
  defineSoftwareApp({
    name: "EPCIS Snippet Search",
    description:
      "Search and browse reusable JSON Schema components for EPCIS and supply chain applications, with instant full-text search and one-click download.",
    url: `${site.url}/snippet-search`,
    screenshot: `${site.url}/linkedin-banner.png`,
    featureList: [
      "Full-text search across reusable EPCIS JSON Schema snippets",
      "Instant search-as-you-type results",
      "Shows schema metadata: title, version, creation date, and URI",
      "One-click download of any snippet as JSON",
    ],
  }),
  // Breadcrumb trail: Home > Snippet Search (absolute URLs from site.url)
  defineBreadcrumb({
    itemListElement: [
      { name: "Home", item: site.url },
      { name: "Snippet Search", item: `${site.url}/snippet-search` },
    ],
  }),
]);

import { ref } from "vue";
import type { Snippet } from "~/types/snippet";

const selectedSnippet = ref<Snippet>();
</script>
