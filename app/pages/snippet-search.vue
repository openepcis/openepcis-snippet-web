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
useSeoMeta({
  title: "Snippet Search — Browse EPCIS JSON Schema Components",
  description:
    "Search and browse reusable JSON Schema components for EPCIS 2.0 and supply chain applications. Building blocks for traceability system development.",
  ogImage: "/linkedin-banner.svg",
});

useSchemaOrg([
  defineWebPage({
    name: "EPCIS Snippet Search",
    description:
      "Browse reusable JSON Schema components for EPCIS 2.0 applications.",
  }),
]);

import { ref } from "vue";
import type { Snippet } from "~/types/snippet";

const selectedSnippet = ref<Snippet>();
</script>
