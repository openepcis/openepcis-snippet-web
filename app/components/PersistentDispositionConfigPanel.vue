<template>
  <div class="space-y-6">
    <!-- Section 1: Set Dispositions -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-plus-circle"
          class="w-4 h-4 text-emerald-500"
        />
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Set Dispositions (to add)
        </h4>
      </div>

      <!-- Set Mode Selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Set Validation
        </label>
        <USelectMenu
          v-model="selectedSetMode"
          :items="modeOptions"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- Standard CBV Values Mode for Set -->
      <div v-if="selectedSetMode === 'standard'" class="space-y-4">
        <div
          class="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
        >
          <div class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-clipboard-document-list"
              class="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <h4 class="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Standard CBV Disposition Values
              </h4>
              <p class="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
                Select from the Core Business Vocabulary (CBV) disposition values
                to be added to persistent state.
              </p>
            </div>
          </div>
        </div>

        <!-- Select All / Clear Buttons -->
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Allowed Set Values
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Select which dispositions can be set
            </p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="text-xs text-secondary-600 dark:text-secondary-400 hover:underline"
              @click="selectAllSetValues"
            >
              Select All
            </button>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <button
              type="button"
              class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              @click="clearAllSetValues"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- Search -->
        <div v-if="options.length > 8">
          <input
            v-model="setSearchQuery"
            type="text"
            placeholder="Search values..."
            class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
          />
        </div>

        <!-- Values Grid -->
        <div
          class="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
            <label
              v-for="option in filteredSetOptions"
              :key="option.value"
              class="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors"
              :class="
                isSetValueSelected(option.value)
                  ? 'bg-secondary-50 dark:bg-secondary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              "
            >
              <input
                type="checkbox"
                :checked="isSetValueSelected(option.value)"
                class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
                @change="toggleSetValue(option.value)"
              />
              <span
                class="text-sm"
                :class="
                  isSetValueSelected(option.value)
                    ? 'text-secondary-700 dark:text-secondary-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                "
              >
                {{ option.label }}
              </span>
            </label>
          </div>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          {{ localSetSelectedValues.length }} of {{ options.length }} values selected
        </p>
      </div>

      <!-- Custom Set Pattern Mode -->
      <div v-else-if="selectedSetMode === 'custom'" class="space-y-4">
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
                Custom Set Pattern
              </h4>
              <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Provide a regular expression pattern to validate custom disposition URIs in the set array.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Set Validation Pattern (Regex)
          </label>
          <UInput
            v-model="localSetCustomPattern"
            placeholder="Enter regex pattern (e.g., ^urn:epcglobal:cbv:disp:.*)"
            class="w-full font-mono text-sm"
          />
        </div>

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
                localSetCustomPattern === example.pattern
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
              "
              @click="selectSetExamplePattern(example.pattern)"
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

    <!-- Divider -->
    <div class="border-t border-gray-200 dark:border-gray-700" />

    <!-- Section 2: Unset Dispositions -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-minus-circle"
          class="w-4 h-4 text-red-500"
        />
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Unset Dispositions (to remove)
        </h4>
      </div>

      <!-- Unset Mode Selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Unset Validation
        </label>
        <USelectMenu
          v-model="selectedUnsetMode"
          :items="modeOptions"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- Standard CBV Values Mode for Unset -->
      <div v-if="selectedUnsetMode === 'standard'" class="space-y-4">
        <div
          class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <div class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-clipboard-document-list"
              class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <h4 class="text-sm font-medium text-red-800 dark:text-red-200">
                Standard CBV Disposition Values
              </h4>
              <p class="text-xs text-red-600 dark:text-red-300 mt-1">
                Select from the Core Business Vocabulary (CBV) disposition values
                to be removed from persistent state.
              </p>
            </div>
          </div>
        </div>

        <!-- Select All / Clear Buttons -->
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Allowed Unset Values
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Select which dispositions can be unset
            </p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="text-xs text-secondary-600 dark:text-secondary-400 hover:underline"
              @click="selectAllUnsetValues"
            >
              Select All
            </button>
            <span class="text-gray-300 dark:text-gray-600">|</span>
            <button
              type="button"
              class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              @click="clearAllUnsetValues"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- Search -->
        <div v-if="options.length > 8">
          <input
            v-model="unsetSearchQuery"
            type="text"
            placeholder="Search values..."
            class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
          />
        </div>

        <!-- Values Grid -->
        <div
          class="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
            <label
              v-for="option in filteredUnsetOptions"
              :key="option.value"
              class="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors"
              :class="
                isUnsetValueSelected(option.value)
                  ? 'bg-secondary-50 dark:bg-secondary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              "
            >
              <input
                type="checkbox"
                :checked="isUnsetValueSelected(option.value)"
                class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
                @change="toggleUnsetValue(option.value)"
              />
              <span
                class="text-sm"
                :class="
                  isUnsetValueSelected(option.value)
                    ? 'text-secondary-700 dark:text-secondary-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                "
              >
                {{ option.label }}
              </span>
            </label>
          </div>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          {{ localUnsetSelectedValues.length }} of {{ options.length }} values selected
        </p>
      </div>

      <!-- Custom Unset Pattern Mode -->
      <div v-else-if="selectedUnsetMode === 'custom'" class="space-y-4">
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
                Custom Unset Pattern
              </h4>
              <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Provide a regular expression pattern to validate custom disposition URIs in the unset array.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unset Validation Pattern (Regex)
          </label>
          <UInput
            v-model="localUnsetCustomPattern"
            placeholder="Enter regex pattern (e.g., ^urn:epcglobal:cbv:disp:.*)"
            class="w-full font-mono text-sm"
          />
        </div>

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
                localUnsetCustomPattern === example.pattern
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
              "
              @click="selectUnsetExamplePattern(example.pattern)"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { FieldOption, PersistentDispositionConfig } from "~/types/profile";

// Props
const props = defineProps<{
  persistentDispositionConfig: PersistentDispositionConfig;
  options: FieldOption[];
}>();

// Emits
const emit = defineEmits<{
  (e: "update:persistentDispositionConfig", value: PersistentDispositionConfig): void;
}>();

// Mode options for dropdowns
const modeOptions = [
  { label: "Standard CBV Values", value: "standard" },
  { label: "Custom Pattern", value: "custom" },
];

// Example regex patterns
const examplePatterns = [
  {
    label: "CBV Disposition URN",
    pattern: "^urn:epcglobal:cbv:disp:.*",
    description: "EPCIS CBV disposition vocabulary URN",
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

// Local state - Set
const selectedSetMode = ref<"standard" | "custom">(
  props.persistentDispositionConfig?.setMode || "standard"
);
const localSetSelectedValues = ref<string[]>(
  props.persistentDispositionConfig?.setSelectedValues || []
);
const localSetCustomPattern = ref<string>(
  props.persistentDispositionConfig?.setCustomPattern || ""
);
const setSearchQuery = ref("");

// Local state - Unset
const selectedUnsetMode = ref<"standard" | "custom">(
  props.persistentDispositionConfig?.unsetMode || "standard"
);
const localUnsetSelectedValues = ref<string[]>(
  props.persistentDispositionConfig?.unsetSelectedValues || []
);
const localUnsetCustomPattern = ref<string>(
  props.persistentDispositionConfig?.unsetCustomPattern || ""
);
const unsetSearchQuery = ref("");

// Computed: Filtered options for Set
const filteredSetOptions = computed(() => {
  if (!setSearchQuery.value) return props.options;
  const query = setSearchQuery.value.toLowerCase();
  return props.options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
  );
});

// Computed: Filtered options for Unset
const filteredUnsetOptions = computed(() => {
  if (!unsetSearchQuery.value) return props.options;
  const query = unsetSearchQuery.value.toLowerCase();
  return props.options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
  );
});

// Methods - Set configuration
const isSetValueSelected = (value: string): boolean => {
  return localSetSelectedValues.value.includes(value);
};

const toggleSetValue = (value: string) => {
  const idx = localSetSelectedValues.value.indexOf(value);
  if (idx >= 0) {
    localSetSelectedValues.value.splice(idx, 1);
  } else {
    localSetSelectedValues.value.push(value);
  }
  emitUpdate();
};

const selectAllSetValues = () => {
  localSetSelectedValues.value = props.options.map((o) => o.value);
  emitUpdate();
};

const clearAllSetValues = () => {
  localSetSelectedValues.value = [];
  emitUpdate();
};

const selectSetExamplePattern = (pattern: string) => {
  localSetCustomPattern.value = pattern;
  emitUpdate();
};

// Methods - Unset configuration
const isUnsetValueSelected = (value: string): boolean => {
  return localUnsetSelectedValues.value.includes(value);
};

const toggleUnsetValue = (value: string) => {
  const idx = localUnsetSelectedValues.value.indexOf(value);
  if (idx >= 0) {
    localUnsetSelectedValues.value.splice(idx, 1);
  } else {
    localUnsetSelectedValues.value.push(value);
  }
  emitUpdate();
};

const selectAllUnsetValues = () => {
  localUnsetSelectedValues.value = props.options.map((o) => o.value);
  emitUpdate();
};

const clearAllUnsetValues = () => {
  localUnsetSelectedValues.value = [];
  emitUpdate();
};

const selectUnsetExamplePattern = (pattern: string) => {
  localUnsetCustomPattern.value = pattern;
  emitUpdate();
};

const emitUpdate = () => {
  const config: PersistentDispositionConfig = {
    setMode: selectedSetMode.value,
    setSelectedValues: [...localSetSelectedValues.value],
    setCustomPattern:
      selectedSetMode.value === "custom" ? localSetCustomPattern.value : undefined,
    unsetMode: selectedUnsetMode.value,
    unsetSelectedValues: [...localUnsetSelectedValues.value],
    unsetCustomPattern:
      selectedUnsetMode.value === "custom" ? localUnsetCustomPattern.value : undefined,
  };
  emit("update:persistentDispositionConfig", config);
};

// Watch for mode changes
watch(selectedSetMode, () => {
  emitUpdate();
});

watch(selectedUnsetMode, () => {
  emitUpdate();
});

// Watch for custom pattern changes
watch(localSetCustomPattern, () => {
  if (selectedSetMode.value === "custom") {
    emitUpdate();
  }
});

watch(localUnsetCustomPattern, () => {
  if (selectedUnsetMode.value === "custom") {
    emitUpdate();
  }
});

// Watch for prop changes to sync local state
watch(
  () => props.persistentDispositionConfig,
  (newConfig) => {
    if (newConfig) {
      selectedSetMode.value = newConfig.setMode || "standard";
      localSetSelectedValues.value = newConfig.setSelectedValues || [];
      localSetCustomPattern.value = newConfig.setCustomPattern || "";
      selectedUnsetMode.value = newConfig.unsetMode || "standard";
      localUnsetSelectedValues.value = newConfig.unsetSelectedValues || [];
      localUnsetCustomPattern.value = newConfig.unsetCustomPattern || "";
    }
  },
  { deep: true }
);
</script>
