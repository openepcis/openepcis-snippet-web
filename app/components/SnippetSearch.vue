<template>
  <div class="relative w-full space-y-4">
    <!-- Search Card -->
    <div
      class="p-4 rounded-xl bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700/50 shadow-sm"
    >
      <div class="flex items-center gap-2 mb-3">
        <div class="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
          />
        </div>

        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Search Snippets
        </span>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <UInput
          v-model="searchText"
          placeholder="Type to search..."
          icon="i-heroicons-magnifying-glass"
          size="lg"
          color="secondary"
          class="w-full"
          :ui="{
            base: 'rounded-xl',
            icon: { trailing: { pointer: '' } },
          }"
          @input="handleSearch"
        />

        <!-- Suggestions Dropdown -->
        <div
          v-if="suggestions.length > 0"
          class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
        >
          <div
            v-for="(suggestion, index) in suggestions"
            :key="suggestion.$id"
            class="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
            :class="{
              'rounded-t-xl': index === 0,
              'rounded-b-xl': index === suggestions.length - 1,
            }"
            @click="selectSnippet(suggestion)"
          >
            <h4
              class="font-medium text-gray-900 dark:text-gray-100 text-sm"
              v-html="suggestion.highlight?.title || suggestion.title"
            />
            <p
              class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
              v-html="
                suggestion.highlight?.description || suggestion.description
              "
            />
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Type at least 3 characters to search
      </p>
    </div>

    <!-- Reset Button -->
    <UButton
      block
      color="neutral"
      variant="soft"
      size="md"
      icon="i-heroicons-arrow-path"
      class="rounded-xl"
      @click="resetAll"
    >
      Reset
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Snippet } from "~/types";

const config = useRuntimeConfig();
const searchText = ref("");
const suggestions = ref<Snippet[]>([]);
const debounceTimeout = ref<NodeJS.Timeout>();

const emit = defineEmits<{
  (e: "select", snippet: Snippet | undefined): void;
}>();

async function fetchSuggestions() {
  if (searchText.value.length < 3) {
    suggestions.value = [];
    return;
  }

  try {
    const response = await fetch(
      `${config.public.snippetApiUrl}/snippet?searchText=${encodeURIComponent(searchText.value)}`,
    );
    if (!response.ok) throw new Error("Failed to fetch suggestions");
    const data = await response.json();
    suggestions.value = data.slice(0, 10);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    suggestions.value = [];
  }
}

function handleSearch() {
  if (debounceTimeout.value) clearTimeout(debounceTimeout.value);
  debounceTimeout.value = setTimeout(fetchSuggestions, 300);
}

function selectSnippet(snippet: Snippet) {
  emit("select", snippet);
  suggestions.value = [];
  searchText.value = "";
}

function resetAll() {
  searchText.value = "";
  suggestions.value = [];
  emit("select", undefined);
}
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
