<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="text-center">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Loading location identifiers...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center py-8">
      <div class="text-center max-w-md">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-8 h-8 text-red-500 mx-auto mb-3"
        />
        <p class="text-sm text-red-600 dark:text-red-400 mb-3">{{ error }}</p>
        <UButton color="emerald" variant="soft" size="sm" @click="retry">
          Try Again
        </UButton>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Mode Selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location Identifier Type
        </label>
        <USelectMenu
          v-model="selectedMode"
          :items="modeOptions"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- SGLN Mode Section -->
      <div v-if="selectedMode === 'sgln'" class="space-y-4">
        <!-- Info Box -->
        <div
          class="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
        >
          <div class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-map-pin"
              class="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <h4 class="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                SGLN - Serialized Global Location Number
              </h4>
              <p class="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
                Uses GS1 AI 414 (GLN) with optional AI 254 (extension). Select the
                format(s) to validate against.
              </p>
            </div>
          </div>
        </div>

        <!-- SGLN Format Selection -->
        <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div class="space-y-3">
            <!-- EPC URN Format -->
            <label
              v-for="identifier in sglnIdentifiers"
              :key="identifier.id"
              class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              :class="
                isIdentifierSelected(identifier.id)
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
              "
            >
              <input
                type="checkbox"
                :checked="isIdentifierSelected(identifier.id)"
                class="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
                @change="toggleIdentifier(identifier.id)"
              />
              <div class="flex-1 min-w-0">
                <span
                  class="text-sm font-medium block"
                  :class="
                    isIdentifierSelected(identifier.id)
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-300'
                  "
                >
                  {{ identifier.label }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                  {{ identifier.description }}
                </span>
                <code class="text-xs text-gray-400 dark:text-gray-500 block mt-1">
                  {{ identifier.category === 'epc-uri' ? 'urn:epc:id:sgln:...' : 'https://id.gs1.org/414/...' }}
                </code>
              </div>
            </label>
          </div>
        </div>

        <!-- Selected count -->
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          {{ localSelectedIdentifiers.length }} format(s) selected
        </p>
      </div>

      <!-- Manual URI Mode Section -->
      <div v-else-if="selectedMode === 'manual'" class="space-y-4">
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
                Custom URI Pattern
              </h4>
              <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Provide a regular expression pattern to validate location URIs.
                The pattern will be used to validate readPoint/bizLocation IDs.
              </p>
            </div>
          </div>
        </div>

        <!-- Regex Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URI Validation Pattern (Regex)
          </label>
          <UInput
            v-model="localManualPattern"
            placeholder="Enter regex pattern (e.g., ^https?://.*)"
            class="w-full font-mono text-sm"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter a valid regular expression to match allowed URI formats.
          </p>
        </div>

        <!-- Example Pattern Chips -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Example Patterns
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="example in examplePatterns"
              :key="example.pattern"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              :class="
                localManualPattern === example.pattern
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
              <code class="ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{{
                example.pattern
              }}</code>
              - {{ example.description }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useGitHubEpcIdentifiers } from "~/composables/useGitHubEpcIdentifiers";
import type { EpcIdentifierType, LocationConfig } from "~/types/profile";

// Props
const props = defineProps<{
  locationConfig: LocationConfig;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:locationConfig", value: LocationConfig): void;
}>();

// Composable
const {
  isLoading,
  error,
  identifiers,
  fetchIdentifiers,
  getLocationIdentifiers,
} = useGitHubEpcIdentifiers();

// Mode options for dropdown
const modeOptions = [
  { label: "SGLN (AI 414 + optional AI 254)", value: "sgln" },
  { label: "Manual URI", value: "manual" },
];

// Example regex patterns for manual URI mode
const examplePatterns = [
  {
    label: "SGLN Digital Link",
    pattern: "^https://id\\.gs1\\.org/414/.*",
    description: "GS1 Digital Link GLN format (recommended)",
  },
  {
    label: "URL Format",
    pattern: "^https?://.*",
    description: "Matches HTTP/HTTPS URLs",
  },
  {
    label: "Any URI",
    pattern: "^[a-zA-Z][a-zA-Z0-9+.-]*:.*",
    description: "Any valid URI (including URN)",
  },
];

// Local state
const selectedMode = ref<"sgln" | "manual">(props.locationConfig?.mode || "sgln");
const localSelectedIdentifiers = ref<string[]>(
  props.locationConfig?.selectedIdentifiers || []
);
const localManualPattern = ref<string>(
  props.locationConfig?.manualUriPattern || ""
);

// Fetch identifiers on mount
onMounted(async () => {
  if (identifiers.value.length === 0) {
    await fetchIdentifiers();
  }
});

// Retry function for error state
const retry = async () => {
  await fetchIdentifiers();
};

// Get only SGLN identifiers (both EPC URN and Digital Link)
const sglnIdentifiers = computed<EpcIdentifierType[]>(() => {
  return getLocationIdentifiers();
});

// Methods
const isIdentifierSelected = (id: string): boolean => {
  return localSelectedIdentifiers.value.includes(id);
};

const toggleIdentifier = (id: string) => {
  const idx = localSelectedIdentifiers.value.indexOf(id);
  if (idx >= 0) {
    localSelectedIdentifiers.value.splice(idx, 1);
  } else {
    localSelectedIdentifiers.value.push(id);
  }
  emitUpdate();
};

const selectExamplePattern = (pattern: string) => {
  localManualPattern.value = pattern;
  emitUpdate();
};

const emitUpdate = () => {
  const config: LocationConfig = {
    mode: selectedMode.value,
    selectedIdentifiers: [...localSelectedIdentifiers.value],
    manualUriPattern:
      selectedMode.value === "manual" ? localManualPattern.value : undefined,
  };
  emit("update:locationConfig", config);
};

// Watch for mode changes
watch(selectedMode, () => {
  emitUpdate();
});

// Watch for manual pattern changes
watch(localManualPattern, () => {
  if (selectedMode.value === "manual") {
    emitUpdate();
  }
});

// Watch for prop changes to sync local state
watch(
  () => props.locationConfig,
  (newConfig) => {
    if (newConfig) {
      selectedMode.value = newConfig.mode || "sgln";
      localSelectedIdentifiers.value = newConfig.selectedIdentifiers || [];
      localManualPattern.value = newConfig.manualUriPattern || "";
    }
  },
  { deep: true }
);
</script>
