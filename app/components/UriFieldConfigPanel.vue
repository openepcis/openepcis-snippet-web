<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-finger-print" class="w-4 h-4 text-primary-500" />
      <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        URI Validation
      </h4>
    </div>

    <!-- Mode Selector -->
    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Validation Mode
      </label>
      <USelectMenu
        v-model="selectedMode"
        :items="modeOptions"
        value-key="value"
        class="w-full"
      />
    </div>

    <!-- Any URI Mode -->
    <div v-if="selectedMode === 'uri'">
      <div
        class="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-heroicons-check-circle"
            class="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
          />
          <div>
            <h4 class="text-sm font-medium text-primary-800 dark:text-primary-200">
              Any Valid URI
            </h4>
            <p class="text-xs text-primary-600 dark:text-primary-300 mt-1">
              Accepts any valid URI format (e.g., urn:uuid:..., ni:///sha-256;...,
              https://example.com/event/123).
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Pattern Mode -->
    <div v-else-if="selectedMode === 'custom'" class="space-y-4">
      <!-- Info Box -->
      <div
        class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-heroicons-code-bracket"
            class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
          />
          <div>
            <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              Custom Pattern
            </h4>
            <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
              Provide a regular expression pattern to validate the URI format.
            </p>
          </div>
        </div>
      </div>

      <!-- Regex Input -->
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Validation Pattern (Regex)
        </label>
        <UInput
          v-model="localCustomPattern"
          placeholder="Enter regex pattern (e.g., ^urn:uuid:[0-9a-fA-F-]{36}$)"
          class="w-full font-mono text-sm"
        />
      </div>

      <!-- Example Pattern Chips -->
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Example Patterns
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="example in examplePatterns"
            :key="example.pattern"
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
            :class="
              localCustomPattern === example.pattern
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            "
            @click="selectExamplePattern(example.pattern)"
          >
            <span>{{ example.label }}</span>
          </button>
        </div>
        <div class="mt-3 space-y-1">
          <p
            v-for="example in examplePatterns"
            :key="example.pattern"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            <strong>{{ example.label }}:</strong>
            <code
              class="ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded"
              >{{ example.pattern }}</code
            >
            - {{ example.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { UriFieldConfig } from "~/types/profile";

const props = defineProps<{
  uriConfig?: UriFieldConfig;
}>();

const emit = defineEmits<{
  (e: "update:uriConfig", value: UriFieldConfig): void;
}>();

// Mode options for dropdown
const modeOptions = [
  { label: "Any Valid URI", value: "uri" },
  { label: "Custom Pattern", value: "custom" },
];

// Example regex patterns for eventID and similar fields
const examplePatterns = [
  {
    label: "UUID URN",
    pattern: "^urn:uuid:[0-9a-fA-F-]{36}$",
    description: "Standard UUID URN format",
  },
  {
    label: "NI URI (SHA-256)",
    pattern: "^ni:///sha-256;.*",
    description: "Named Information URI with SHA-256 hash",
  },
  {
    label: "Any URN",
    pattern: "^urn:.*",
    description: "Matches any URN format",
  },
  {
    label: "URL Format",
    pattern: "^https?://.*",
    description: "Matches HTTP/HTTPS URLs",
  },
  {
    label: "Any URI",
    pattern: "^[a-zA-Z][a-zA-Z0-9+.-]*:.*",
    description: "RFC 3986 compliant URI",
  },
];

// Local state
const selectedMode = ref<"uri" | "custom">(props.uriConfig?.mode || "uri");
const localCustomPattern = ref<string>(props.uriConfig?.customPattern || "");

// Methods
const selectExamplePattern = (pattern: string) => {
  localCustomPattern.value = pattern;
  emitUpdate();
};

const emitUpdate = () => {
  emit("update:uriConfig", {
    mode: selectedMode.value,
    customPattern:
      selectedMode.value === "custom" ? localCustomPattern.value : undefined,
  });
};

// Watchers
watch(selectedMode, () => {
  emitUpdate();
});

watch(localCustomPattern, () => {
  if (selectedMode.value === "custom") {
    emitUpdate();
  }
});

// Watch for prop changes (when editing existing field)
watch(
  () => props.uriConfig,
  (newConfig) => {
    if (newConfig) {
      selectedMode.value = newConfig.mode || "uri";
      localCustomPattern.value = newConfig.customPattern || "";
    }
  },
  { deep: true }
);
</script>
