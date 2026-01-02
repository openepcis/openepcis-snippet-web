<template>
  <div class="flex flex-col h-full">
    <!-- Header with back button -->
    <div
      class="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700"
    >
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-heroicons-arrow-left"
        @click="$emit('back')"
      >
        Back
      </UButton>

      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 dark:text-white truncate">
          {{ displayName }}
        </h3>

        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
          {{ filename }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3"
        />

        <p class="text-sm text-gray-500 dark:text-gray-400">
          Loading schema...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-8 h-8 text-red-500 mx-auto mb-3"
        />

        <p class="text-sm text-red-600 dark:text-red-400 mb-3">
          {{ error }}
        </p>

        <UButton color="neutral" variant="soft" size="sm" @click="loadContent">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Schema Content -->
    <div v-else class="flex-1 overflow-auto p-4">
      <div
        class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
      >
        <pre
          class="p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-[400px]"
        ><code>{{ formattedContent }}</code></pre>
      </div>
    </div>

    <!-- Footer with merge mode and actions -->
    <div
      class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
    >
      <!-- Merge Mode Selection -->
      <div class="mb-4">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Include Mode
        </label>
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="selectedMergeMode"
              type="radio"
              value="ref"
              class="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Use $ref
              <span class="text-xs text-gray-500 dark:text-gray-400">
                (recommended)
              </span>
            </span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="selectedMergeMode"
              type="radio"
              value="inline"
              class="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Inline properties
            </span>
          </label>
        </div>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{
            selectedMergeMode === "ref"
              ? "References the schema URL - cleaner output, no conflicts"
              : "Merges schema properties directly into your profile"
          }}
        </p>
      </div>

      <!-- Required Toggle -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Required Field
          </span>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Mark properties as required in the schema
          </p>
        </div>
        <USwitch v-model="isRequired" />
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="soft" @click="$emit('back')">
          Cancel
        </UButton>
        <UButton
          color="primary"
          :disabled="!content || isLoading"
          @click="handleAdd"
        >
          Add to Profile
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { GitHubSchemaFile, ImportedSchema } from "~/types/github-schema";
import { getSchemaDisplayName } from "~/types/github-schema";
import { useGitHubSchemas } from "~/composables/useGitHubSchemas";

const props = defineProps<{
  schema: GitHubSchemaFile;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "add", schema: ImportedSchema): void;
}>();

const { fetchSchemaContent, getSchemaUrl } = useGitHubSchemas();

// State
const isLoading = ref(false);
const error = ref<string | null>(null);
const content = ref<Record<string, unknown> | null>(null);
const selectedMergeMode = ref<"ref" | "inline">("ref");
const isRequired = ref(false);

// Computed
const filename = computed(() => props.schema.name);
const displayName = computed(() => getSchemaDisplayName(props.schema.name));

const formattedContent = computed(() => {
  if (!content.value) return "";
  return JSON.stringify(content.value, null, 2);
});

// Methods
const loadContent = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    content.value = await fetchSchemaContent(props.schema.name);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to load schema content";
    content.value = null;
  } finally {
    isLoading.value = false;
  }
};

const handleAdd = () => {
  if (!content.value) return;

  const importedSchema: ImportedSchema = {
    id: props.schema.name.replace(/\.json$/, ""),
    name: displayName.value,
    filename: props.schema.name,
    url: getSchemaUrl(props.schema.name),
    content: content.value,
    mergeMode: selectedMergeMode.value,
    isRequired: isRequired.value,
  };

  emit("add", importedSchema);
};

// Load content when schema changes
watch(
  () => props.schema,
  () => {
    loadContent();
  },
  { immediate: false }
);

// Load content on mount
onMounted(() => {
  loadContent();
});
</script>
