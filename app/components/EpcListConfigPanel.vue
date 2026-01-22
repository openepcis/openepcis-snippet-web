<template>
  <div class="space-y-5">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="text-center">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 text-secondary-500 animate-spin mx-auto mb-3"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Loading EPC identifiers...
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
        <UButton color="secondary" variant="soft" size="sm" @click="retry">
          Try Again
        </UButton>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Mode Selector -->
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Identifier Validation Mode
        </label>
        <USelectMenu
          v-model="selectedMode"
          :items="modeOptions"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- Standard Mode: Select predefined identifiers -->
      <div v-if="selectedMode === 'standard'" class="space-y-4">
        <!-- Search -->
        <div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search identifiers..."
            class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
          />
        </div>

        <!-- GS1 Digital Link Identifiers Section (First to encourage DL usage) -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                GS1 Digital Link Identifiers
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Web URI format (https://...)
              </p>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="text-xs text-secondary-600 dark:text-secondary-400 hover:underline"
                @click="selectAllInCategory('gs1-dl')"
              >
                Select All
              </button>
              <span class="text-gray-300 dark:text-gray-600">|</span>
              <button
                type="button"
                class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                @click="clearAllInCategory('gs1-dl')"
              >
                Clear
              </button>
            </div>
          </div>

          <div
            class="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
              <label
                v-for="identifier in filteredGs1DlIdentifiers"
                :key="identifier.id"
                class="flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors"
                :class="
                  isSelected(identifier.id)
                    ? 'bg-secondary-50 dark:bg-secondary-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                "
              >
                <input
                  type="checkbox"
                  :checked="isSelected(identifier.id)"
                  class="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
                  @change="toggleIdentifier(identifier.id)"
                />
                <div class="flex-1 min-w-0">
                  <span
                    class="text-sm block"
                    :class="
                      isSelected(identifier.id)
                        ? 'text-secondary-700 dark:text-secondary-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    "
                  >
                    {{ identifier.label }}
                  </span>
                  <span
                    class="text-xs text-gray-500 dark:text-gray-400 block truncate"
                  >
                    {{ identifier.description }}
                  </span>
                </div>
              </label>
            </div>

            <div
              v-if="searchQuery && filteredGs1DlIdentifiers.length === 0"
              class="text-center py-4 text-gray-400 text-sm"
            >
              No GS1 Digital Link identifiers match "{{ searchQuery }}"
            </div>
          </div>
        </div>

        <!-- EPC URN Identifiers Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                EPC URN Identifiers
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Standard EPC URI format (urn:epc:id:...)
              </p>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="text-xs text-secondary-600 dark:text-secondary-400 hover:underline"
                @click="selectAllInCategory('epc-uri')"
              >
                Select All
              </button>
              <span class="text-gray-300 dark:text-gray-600">|</span>
              <button
                type="button"
                class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                @click="clearAllInCategory('epc-uri')"
              >
                Clear
              </button>
            </div>
          </div>

          <div
            class="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
              <label
                v-for="identifier in filteredEpcUriIdentifiers"
                :key="identifier.id"
                class="flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors"
                :class="
                  isSelected(identifier.id)
                    ? 'bg-secondary-50 dark:bg-secondary-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                "
              >
                <input
                  type="checkbox"
                  :checked="isSelected(identifier.id)"
                  class="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
                  @change="toggleIdentifier(identifier.id)"
                />
                <div class="flex-1 min-w-0">
                  <span
                    class="text-sm block"
                    :class="
                      isSelected(identifier.id)
                        ? 'text-secondary-700 dark:text-secondary-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    "
                  >
                    {{ identifier.label }}
                  </span>
                  <span
                    class="text-xs text-gray-500 dark:text-gray-400 block truncate"
                  >
                    {{ identifier.description }}
                  </span>
                </div>
              </label>
            </div>

            <div
              v-if="searchQuery && filteredEpcUriIdentifiers.length === 0"
              class="text-center py-4 text-gray-400 text-sm"
            >
              No EPC URN identifiers match "{{ searchQuery }}"
            </div>
          </div>
        </div>

        <!-- Selected count -->
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
          {{ localSelectedIdentifiers.length }} of {{ totalIdentifiers }}
          identifier types selected
        </p>
      </div>

      <!-- Any URI Mode -->
      <div v-else-if="selectedMode === 'uri'" class="space-y-4">
        <div
          class="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
        >
          <div class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <h4
                class="text-sm font-medium text-primary-800 dark:text-primary-200"
              >
                Any Valid URI
              </h4>
              <p class="text-xs text-primary-600 dark:text-primary-300 mt-1">
                Accepts any valid URI format including EPC URN (urn:epc:id:...),
                GS1 Digital Link (https://id.gs1.org/...), or custom URIs.
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
                Custom Regex Pattern
              </h4>
              <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Provide a regular expression pattern to validate EPC
                identifiers.
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
            placeholder="Enter regex pattern (e.g., ^urn:epc:id:sgtin:.*)"
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

      <!-- Array Count Configuration (hidden for single EPC fields like parentID) -->
      <div v-if="!hideArrayConstraints" class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <ArrayCountConfigPanel
          :min-items="localMinItems"
          :max-items="localMaxItems"
          title="EPC List Array Constraints"
          description="Set minimum and maximum number of EPCs allowed in the list."
          @update:min-items="handleMinItemsUpdate"
          @update:max-items="handleMaxItemsUpdate"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useGitHubEpcIdentifiers } from "~/composables/useGitHubEpcIdentifiers";
import type { EpcIdentifierType, EpcListFieldConfig } from "~/types/profile";

// Props
const props = defineProps<{
  epcConfig?: EpcListFieldConfig;
  hideArrayConstraints?: boolean; // Hide array min/max for single EPC fields like parentID
}>();

// Emits
const emit = defineEmits<{
  (e: "update:epcConfig", value: EpcListFieldConfig): void;
}>();

// Composable
const {
  isLoading,
  error,
  identifiers,
  fetchIdentifiers,
  getEpcUriIdentifiers,
  getGs1DlIdentifiers,
} = useGitHubEpcIdentifiers();

// Mode options for dropdown
const modeOptions = [
  { label: "Standard EPC Identifiers", value: "standard" },
  { label: "Any Valid URI", value: "uri" },
  { label: "Custom Regex Pattern", value: "custom" },
];

// Example regex patterns for custom mode
const examplePatterns = [
  {
    label: "SGTIN URN",
    pattern: "^urn:epc:id:sgtin:.*",
    description: "Matches SGTIN EPC URN format",
  },
  {
    label: "SSCC URN",
    pattern: "^urn:epc:id:sscc:.*",
    description: "Matches SSCC EPC URN format",
  },
  {
    label: "Any EPC URN",
    pattern: "^urn:epc:id:.*",
    description: "Matches any EPC URN identifier",
  },
  {
    label: "GS1 Digital Link",
    pattern: "^https://id\\.gs1\\.org/.*",
    description: "Matches GS1 Digital Link URLs",
  },
  {
    label: "Any URN",
    pattern: "^urn:.*",
    description: "Matches any URN format",
  },
  {
    label: "Any URI",
    pattern: "^[a-zA-Z][a-zA-Z0-9+.-]*:.*",
    description: "RFC 3986 compliant URI",
  },
];

// Local state
const selectedMode = ref<"standard" | "uri" | "custom">(
  props.epcConfig?.mode || "standard"
);
const localSelectedIdentifiers = ref<string[]>(
  props.epcConfig?.selectedIdentifiers || []
);
const localCustomPattern = ref<string>(props.epcConfig?.customPattern || "");
const searchQuery = ref("");
const localMinItems = ref<number | undefined>(props.epcConfig?.minItems);
const localMaxItems = ref<number | undefined>(props.epcConfig?.maxItems);

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

// Computed: All identifiers by category
const epcUriIdentifiers = computed<EpcIdentifierType[]>(() =>
  getEpcUriIdentifiers()
);
const gs1DlIdentifiers = computed<EpcIdentifierType[]>(() =>
  getGs1DlIdentifiers()
);

// Computed: Filtered identifiers based on search
const filteredEpcUriIdentifiers = computed(() => {
  if (!searchQuery.value) return epcUriIdentifiers.value;
  const query = searchQuery.value.toLowerCase();
  return epcUriIdentifiers.value.filter(
    (i) =>
      i.label.toLowerCase().includes(query) ||
      i.description.toLowerCase().includes(query)
  );
});

const filteredGs1DlIdentifiers = computed(() => {
  if (!searchQuery.value) return gs1DlIdentifiers.value;
  const query = searchQuery.value.toLowerCase();
  return gs1DlIdentifiers.value.filter(
    (i) =>
      i.label.toLowerCase().includes(query) ||
      i.description.toLowerCase().includes(query)
  );
});

// Computed: Total identifiers count
const totalIdentifiers = computed(() => identifiers.value.length);

// Methods
const isSelected = (id: string): boolean => {
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

const selectAllInCategory = (category: "epc-uri" | "gs1-dl") => {
  const categoryIdentifiers =
    category === "epc-uri" ? epcUriIdentifiers.value : gs1DlIdentifiers.value;
  const categoryIds = categoryIdentifiers.map((i) => i.id);

  // Add all from category that aren't already selected
  categoryIds.forEach((id) => {
    if (!localSelectedIdentifiers.value.includes(id)) {
      localSelectedIdentifiers.value.push(id);
    }
  });

  emitUpdate();
};

const clearAllInCategory = (category: "epc-uri" | "gs1-dl") => {
  const categoryIdentifiers =
    category === "epc-uri" ? epcUriIdentifiers.value : gs1DlIdentifiers.value;
  const categoryIds = new Set(categoryIdentifiers.map((i) => i.id));

  // Remove all from this category
  localSelectedIdentifiers.value = localSelectedIdentifiers.value.filter(
    (id) => !categoryIds.has(id)
  );

  emitUpdate();
};

const selectExamplePattern = (pattern: string) => {
  localCustomPattern.value = pattern;
  emitUpdate();
};

const handleMinItemsUpdate = (value: number | undefined) => {
  localMinItems.value = value;
  emitUpdate();
};

const handleMaxItemsUpdate = (value: number | undefined) => {
  localMaxItems.value = value;
  emitUpdate();
};

const emitUpdate = () => {
  const config: EpcListFieldConfig = {
    mode: selectedMode.value,
    selectedIdentifiers: [...localSelectedIdentifiers.value],
    customPattern:
      selectedMode.value === "custom" ? localCustomPattern.value : undefined,
    minItems: localMinItems.value,
    maxItems: localMaxItems.value,
  };
  emit("update:epcConfig", config);
};

// Watch for mode changes
watch(selectedMode, () => {
  emitUpdate();
});

// Watch for custom pattern changes
watch(localCustomPattern, () => {
  if (selectedMode.value === "custom") {
    emitUpdate();
  }
});

// Watch for prop changes to sync local state
watch(
  () => props.epcConfig,
  (newConfig) => {
    if (newConfig) {
      selectedMode.value = newConfig.mode || "standard";
      localSelectedIdentifiers.value = newConfig.selectedIdentifiers || [];
      localCustomPattern.value = newConfig.customPattern || "";
      localMinItems.value = newConfig.minItems;
      localMaxItems.value = newConfig.maxItems;
    }
  },
  { deep: true, immediate: true }
);
</script>
