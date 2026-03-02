<template>
  <div class="space-y-3">
    <!-- Empty State -->
    <div
      v-if="!snippet"
      class="flex flex-col items-center justify-center py-16 px-4"
    >
      <div class="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="w-8 h-8 text-gray-400 dark:text-gray-500"
        />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
        Search for Snippets
      </h3>
      <p
        class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md"
      >
        Use the search box to find EPCIS JSON Schema snippets. Start typing to
        see suggestions.
      </p>
    </div>

    <!-- Content -->
    <div v-else class="space-y-3">
      <!-- Metadata Badges -->
      <div class="flex flex-wrap items-center gap-2">
        <UBadge size="sm" color="secondary" variant="soft">
          <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5 mr-1" />
          <span v-html="displayTitle" />
        </UBadge>

        <UBadge v-if="schemaVersion" size="sm" color="neutral" variant="soft">
          {{ schemaVersion }}
        </UBadge>

        <UBadge v-if="formattedDate" size="sm" color="neutral" variant="soft">
          <UIcon name="i-heroicons-calendar" class="w-3 h-3 mr-1" />
          {{ formattedDate }}
        </UBadge>

        <a
          v-if="snippet.$id"
          :href="snippet.$id"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-mono transition-colors"
        >
          <UIcon name="i-heroicons-link" class="w-3 h-3" />
          <span class="truncate max-w-[200px]">{{ snippet.$id }}</span>
        </a>
      </div>

      <!-- JSON Editor (Read-only) - Full Schema -->
      <div class="rounded-xl overflow-hidden">
        <JsonEditor
          :model-value="formattedSource"
          :is-read-only="true"
          title="JSON Schema"
          :placeholder="snippet.title"
          :download-file-name="downloadFileName"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Snippet } from "~/types";

const props = defineProps<{
  snippet?: Snippet;
}>();

// Computed properties for display title and description
const displayTitle = computed(() => {
  if (!props.snippet) return "";
  // Use highlight title if available, otherwise use original title
  return props.snippet.highlight?.title || props.snippet.title;
});

const displayDescription = computed(() => {
  if (!props.snippet) return "";
  // Use highlight description if available, otherwise use original description
  return props.snippet.highlight?.description || props.snippet.description;
});

// Format the date from createdAt field
const formattedDate = computed(() => {
  if (!props.snippet?.createdAt) return "";
  try {
    const date = new Date(props.snippet.createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return props.snippet.createdAt;
  }
});

// Extract schema version from $schema field
const schemaVersion = computed(() => {
  if (!props.snippet?.$schema) return "";
  // Try to extract version from common JSON Schema draft URLs
  if (props.snippet.$schema.includes("2020-12")) return "JSON Schema 2020-12";
  if (props.snippet.$schema.includes("draft-07")) return "JSON Schema Draft-07";
  if (props.snippet.$schema.includes("draft-06")) return "JSON Schema Draft-06";
  if (props.snippet.$schema.includes("draft-04")) return "JSON Schema Draft-04";
  return "JSON Schema";
});

// Generate the JSON source without the highlight property
const formattedSource = computed(() => {
  if (!props.snippet) return "";
  // Create a copy and remove the highlight property
  const { highlight, ...snippetWithoutHighlight } = props.snippet;
  return JSON.stringify(snippetWithoutHighlight, null, 2);
});

// Generate download filename based on snippet title
const downloadFileName = computed(() => {
  if (!props.snippet?.title) return "schema.json";
  // Convert title to filename-friendly format
  const safeName = props.snippet.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${safeName}.json`;
});
</script>

<style scoped>
/* Styling for highlighted text in em tags (from search results) */
:deep(em) {
  font-style: normal;
  font-weight: bold;
  background-color: #fef3c7;
  color: #92400e;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

.dark :deep(em) {
  background-color: #451a03;
  color: #fbbf24;
}
</style>
