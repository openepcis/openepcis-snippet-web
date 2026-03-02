<template>
  <div class="space-y-6">
    <!-- Section 1: Source/Destination Type Configuration -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-tag"
          class="w-4 h-4 text-amber-500"
        />
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {{ fieldLabel }} Type
        </h4>
      </div>

      <!-- Type Mode Selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type Validation
        </label>
        <USelectMenu
          v-model="selectedTypeMode"
          :items="typeModeOptions"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- Standard CBV Types Mode -->
      <div v-if="selectedTypeMode === 'standard'" class="space-y-4">
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
                Standard CBV Source/Destination Types
              </h4>
              <p class="text-xs text-amber-600 dark:text-amber-300 mt-1">
                Select from the Core Business Vocabulary (CBV) standard types
                for {{ fieldLabel.toLowerCase() }} identification.
              </p>
            </div>
          </div>
        </div>

        <!-- Select All / Clear Buttons -->
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Allowed Types
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Select which {{ fieldLabel.toLowerCase() }} types are permitted
            </p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="text-xs text-secondary-600 dark:text-secondary-400 hover:underline"
              @click="selectAllTypes"
            >
              Select All
            </button>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <button
              type="button"
              class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              @click="clearAllTypes"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- Types Grid -->
        <div
          class="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
            <label
              v-for="option in options"
              :key="option.value"
              class="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors"
              :class="
                isTypeSelected(option.value)
                  ? 'bg-secondary-50 dark:bg-secondary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              "
            >
              <input
                type="checkbox"
                :checked="isTypeSelected(option.value)"
                class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
                @change="toggleType(option.value)"
              />
              <span
                class="text-sm"
                :class="
                  isTypeSelected(option.value)
                    ? 'text-secondary-700 dark:text-secondary-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                "
              >
                {{ option.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- Selected count -->
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          {{ localSelectedTypes.length }} of {{ options.length }} types selected
        </p>
      </div>

      <!-- Custom Type Pattern Mode -->
      <div v-else-if="selectedTypeMode === 'custom'" class="space-y-4">
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
                Custom Type Pattern
              </h4>
              <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Provide a regular expression pattern to validate custom {{ fieldLabel.toLowerCase() }} type URIs.
              </p>
            </div>
          </div>
        </div>

        <!-- Regex Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type Validation Pattern (Regex)
          </label>
          <UInput
            v-model="localCustomTypePattern"
            placeholder="Enter regex pattern (e.g., ^urn:epcglobal:cbv:sdt:.*)"
            class="w-full font-mono text-sm"
          />
        </div>

        <!-- Example Pattern Chips -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Example Patterns
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="example in typeExamplePatterns"
              :key="example.pattern"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              :class="
                localCustomTypePattern === example.pattern
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
              "
              @click="selectTypeExamplePattern(example.pattern)"
            >
              <span>{{ example.label }}</span>
            </button>
          </div>
          <div class="mt-3 space-y-1">
            <p
              v-for="example in typeExamplePatterns"
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

    <!-- Divider -->
    <div class="border-t border-gray-200 dark:border-gray-700" />

    <!-- Section 2: Source/Destination Value Configuration -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-link"
          class="w-4 h-4 text-emerald-500"
        />
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {{ fieldLabel }} Identifier ({{ valueFieldKey }})
        </h4>
      </div>

      <!-- Value Mode Selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Value Validation
        </label>
        <USelectMenu
          v-model="selectedValueMode"
          :items="valueModeOptions"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- Any URI Mode -->
      <div v-if="selectedValueMode === 'uri'">
        <div
          class="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
        >
          <div class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <h4 class="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Any Valid URI
              </h4>
              <p class="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
                The {{ valueFieldKey }} value will accept any valid URI format
                (e.g., https://id.gs1.org/414/..., https://id.gs1.org/417/..., or URN format).
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Value Pattern Mode -->
      <div v-else-if="selectedValueMode === 'custom'" class="space-y-4">
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
                Custom Value Pattern
              </h4>
              <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Provide a regular expression pattern to validate the {{ valueFieldKey }} URI value.
              </p>
            </div>
          </div>
        </div>

        <!-- Regex Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Value Validation Pattern (Regex)
          </label>
          <UInput
            v-model="localCustomValuePattern"
            placeholder="Enter regex pattern (e.g., ^https://id\\.gs1\\.org/414/.*)"
            class="w-full font-mono text-sm"
          />
        </div>

        <!-- Example Pattern Chips -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Example Patterns
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="example in valueExamplePatterns"
              :key="example.pattern"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              :class="
                localCustomValuePattern === example.pattern
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
              "
              @click="selectValueExamplePattern(example.pattern)"
            >
              <span>{{ example.label }}</span>
            </button>
          </div>
          <div class="mt-3 space-y-1">
            <p
              v-for="example in valueExamplePatterns"
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

    <!-- Divider -->
    <div class="border-t border-gray-200 dark:border-gray-700" />

    <!-- Section 3: Array Count Configuration -->
    <ArrayCountConfigPanel
      :min-items="localMinItems"
      :max-items="localMaxItems"
      :title="`${fieldLabel} List Array Constraints`"
      :description="`Set minimum and maximum number of ${fieldLabel.toLowerCase()} entries allowed in the list.`"
      @update:min-items="handleMinItemsUpdate"
      @update:max-items="handleMaxItemsUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { FieldOption, SourceDestListConfig } from "~/types/profile";

// Props
const props = defineProps<{
  sourceDestListConfig: SourceDestListConfig;
  options: FieldOption[];
  fieldKey: "source" | "destination"; // Which field this panel is configuring
}>();

// Emits
const emit = defineEmits<{
  (e: "update:sourceDestListConfig", value: SourceDestListConfig): void;
}>();

// Computed label based on field key
const fieldLabel = computed(() =>
  props.fieldKey === "source" ? "Source" : "Destination"
);

const valueFieldKey = computed(() => props.fieldKey);

// Mode options for dropdowns
const typeModeOptions = [
  { label: "Standard CBV Types", value: "standard" },
  { label: "Custom Type Pattern", value: "custom" },
];

const valueModeOptions = [
  { label: "Any Valid URI", value: "uri" },
  { label: "Custom Value Pattern", value: "custom" },
];

// Example regex patterns for custom type mode
const typeExamplePatterns = [
  {
    label: "CBV SDT URN",
    pattern: "^urn:epcglobal:cbv:sdt:.*",
    description: "EPCIS CBV source/destination type URN",
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

// Example regex patterns for custom value mode
const valueExamplePatterns = [
  {
    label: "SGLN Digital Link",
    pattern: "^https://id\\.gs1\\.org/414/.*",
    description: "GS1 Digital Link GLN (recommended)",
  },
  {
    label: "PGLN Digital Link",
    pattern: "^https://id\\.gs1\\.org/417/.*",
    description: "GS1 Digital Link Party GLN (recommended)",
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
const selectedTypeMode = ref<"standard" | "custom">(
  props.sourceDestListConfig?.typeMode || "standard"
);
const localSelectedTypes = ref<string[]>(
  props.sourceDestListConfig?.selectedTypes || []
);
const localCustomTypePattern = ref<string>(
  props.sourceDestListConfig?.customTypePattern || ""
);

const selectedValueMode = ref<"uri" | "custom">(
  props.sourceDestListConfig?.valueMode || "uri"
);
const localCustomValuePattern = ref<string>(
  props.sourceDestListConfig?.customValuePattern || ""
);
const localMinItems = ref<number | undefined>(
  props.sourceDestListConfig?.minItems
);
const localMaxItems = ref<number | undefined>(
  props.sourceDestListConfig?.maxItems
);

// Methods - Type configuration
const isTypeSelected = (value: string): boolean => {
  return localSelectedTypes.value.includes(value);
};

const toggleType = (value: string) => {
  const idx = localSelectedTypes.value.indexOf(value);
  if (idx >= 0) {
    localSelectedTypes.value.splice(idx, 1);
  } else {
    localSelectedTypes.value.push(value);
  }
  emitUpdate();
};

const selectAllTypes = () => {
  localSelectedTypes.value = props.options.map((o) => o.value);
  emitUpdate();
};

const clearAllTypes = () => {
  localSelectedTypes.value = [];
  emitUpdate();
};

const selectTypeExamplePattern = (pattern: string) => {
  localCustomTypePattern.value = pattern;
  emitUpdate();
};

// Methods - Value configuration
const selectValueExamplePattern = (pattern: string) => {
  localCustomValuePattern.value = pattern;
  emitUpdate();
};

// Methods - Array count configuration
const handleMinItemsUpdate = (value: number | undefined) => {
  localMinItems.value = value;
  emitUpdate();
};

const handleMaxItemsUpdate = (value: number | undefined) => {
  localMaxItems.value = value;
  emitUpdate();
};

const emitUpdate = () => {
  const config: SourceDestListConfig = {
    typeMode: selectedTypeMode.value,
    selectedTypes: [...localSelectedTypes.value],
    customTypePattern:
      selectedTypeMode.value === "custom" ? localCustomTypePattern.value : undefined,
    valueMode: selectedValueMode.value,
    customValuePattern:
      selectedValueMode.value === "custom" ? localCustomValuePattern.value : undefined,
    minItems: localMinItems.value,
    maxItems: localMaxItems.value,
  };
  emit("update:sourceDestListConfig", config);
};

// Watch for mode changes
watch(selectedTypeMode, () => {
  emitUpdate();
});

watch(selectedValueMode, () => {
  emitUpdate();
});

// Watch for custom pattern changes
watch(localCustomTypePattern, () => {
  if (selectedTypeMode.value === "custom") {
    emitUpdate();
  }
});

watch(localCustomValuePattern, () => {
  if (selectedValueMode.value === "custom") {
    emitUpdate();
  }
});

// Watch for prop changes to sync local state
watch(
  () => props.sourceDestListConfig,
  (newConfig) => {
    if (newConfig) {
      selectedTypeMode.value = newConfig.typeMode || "standard";
      localSelectedTypes.value = newConfig.selectedTypes || [];
      localCustomTypePattern.value = newConfig.customTypePattern || "";
      selectedValueMode.value = newConfig.valueMode || "uri";
      localCustomValuePattern.value = newConfig.customValuePattern || "";
      localMinItems.value = newConfig.minItems;
      localMaxItems.value = newConfig.maxItems;
    }
  },
  { deep: true, immediate: true }
);
</script>
