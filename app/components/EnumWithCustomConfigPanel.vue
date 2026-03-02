<template>
  <div class="space-y-4">
    <!-- Mode Selector -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Value Type
      </label>
      <USelectMenu
        v-model="selectedMode"
        :items="modeOptions"
        value-key="value"
        class="w-full"
      />
    </div>

    <!-- Standard CBV Values Mode -->
    <div v-if="selectedMode === 'standard'" class="space-y-4">
      <!-- Info Box -->
      <div
        class="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-heroicons-clipboard-document-list"
            class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
          />
          <div>
            <h4 class="text-sm font-medium text-amber-800 dark:text-amber-200">
              Standard CBV Values
            </h4>
            <p class="text-xs text-amber-600 dark:text-amber-300 mt-1">
              Select from the Core Business Vocabulary (CBV) standard values.
              These are the predefined {{ fieldLabel.toLowerCase() }} values per GS1 EPCIS standard.
            </p>
          </div>
        </div>
      </div>

      <!-- Select All / Clear Buttons -->
      <div class="flex items-center justify-between">
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Allowed Values
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Select which values are permitted
          </p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="text-xs text-secondary-600 dark:text-secondary-400 hover:underline"
            @click="selectAllValues"
          >
            Select All
          </button>
          <span class="text-gray-300 dark:text-gray-600">|</span>
          <button
            type="button"
            class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
            @click="clearAllValues"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Search for large lists -->
      <div v-if="options.length > 8">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search values..."
          class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
        />
      </div>

      <!-- Values Grid -->
      <div
        class="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
          <label
            v-for="option in filteredOptions"
            :key="option.value"
            class="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors"
            :class="
              isValueSelected(option.value)
                ? 'bg-secondary-50 dark:bg-secondary-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            "
          >
            <input
              type="checkbox"
              :checked="isValueSelected(option.value)"
              class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
              @change="toggleValue(option.value)"
            />
            <span
              class="text-sm"
              :class="
                isValueSelected(option.value)
                  ? 'text-secondary-700 dark:text-secondary-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300'
              "
            >
              {{ option.label }}
            </span>
          </label>
        </div>

        <!-- No results -->
        <div
          v-if="searchQuery && filteredOptions.length === 0"
          class="text-center py-4 text-gray-400 text-sm"
        >
          No values match "{{ searchQuery }}"
        </div>
      </div>

      <!-- Selected count -->
      <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
        {{ localSelectedValues.length }} of {{ options.length }} values selected
      </p>
    </div>

    <!-- Custom URI Pattern Mode -->
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
              Custom URI Pattern
            </h4>
            <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
              Provide a regular expression pattern to validate custom {{ fieldLabel.toLowerCase() }} URIs.
              Use this for proprietary or extension values not in the standard CBV.
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
          v-model="localCustomPattern"
          placeholder="Enter regex pattern (e.g., ^urn:epcglobal:cbv:.*)"
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
            <code class="ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{{
              example.pattern
            }}</code>
            - {{ example.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { FieldOption, EnumOrCustomConfig } from "~/types/profile";

// Props
const props = defineProps<{
  enumConfig: EnumOrCustomConfig;
  options: FieldOption[];
  fieldLabel: string;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:enumConfig", value: EnumOrCustomConfig): void;
}>();

// Mode options for dropdown
const modeOptions = [
  { label: "Standard CBV Values", value: "standard" },
  { label: "Custom URI Pattern", value: "custom" },
];

// Example regex patterns for custom URI mode
const examplePatterns = [
  {
    label: "CBV URN",
    pattern: "^urn:epcglobal:cbv:.*",
    description: "EPCIS CBV vocabulary URN format",
  },
  {
    label: "Any URN",
    pattern: "^urn:.*",
    description: "Matches any URN (contains colons)",
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
const selectedMode = ref<"standard" | "custom">(props.enumConfig?.mode || "standard");
const localSelectedValues = ref<string[]>(
  props.enumConfig?.selectedValues || []
);
const localCustomPattern = ref<string>(
  props.enumConfig?.customUriPattern || ""
);
const searchQuery = ref("");

// Computed: Filtered options based on search
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;

  const query = searchQuery.value.toLowerCase();
  return props.options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
  );
});

// Methods
const isValueSelected = (value: string): boolean => {
  return localSelectedValues.value.includes(value);
};

const toggleValue = (value: string) => {
  const idx = localSelectedValues.value.indexOf(value);
  if (idx >= 0) {
    localSelectedValues.value.splice(idx, 1);
  } else {
    localSelectedValues.value.push(value);
  }
  emitUpdate();
};

const selectAllValues = () => {
  localSelectedValues.value = props.options.map((o) => o.value);
  emitUpdate();
};

const clearAllValues = () => {
  localSelectedValues.value = [];
  emitUpdate();
};

const selectExamplePattern = (pattern: string) => {
  localCustomPattern.value = pattern;
  emitUpdate();
};

const emitUpdate = () => {
  const config: EnumOrCustomConfig = {
    mode: selectedMode.value,
    selectedValues: [...localSelectedValues.value],
    customUriPattern:
      selectedMode.value === "custom" ? localCustomPattern.value : undefined,
  };
  emit("update:enumConfig", config);
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
  () => props.enumConfig,
  (newConfig) => {
    if (newConfig) {
      selectedMode.value = newConfig.mode || "standard";
      localSelectedValues.value = newConfig.selectedValues || [];
      localCustomPattern.value = newConfig.customUriPattern || "";
    }
  },
  { deep: true }
);
</script>
