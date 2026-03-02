<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-primary-500" />
      <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        String Constraint
      </h4>
    </div>

    <!-- Mode Selector -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Constraint Mode
      </label>
      <USelectMenu
        v-model="selectedMode"
        :items="modeOptions"
        value-key="value"
        class="w-full"
      />
    </div>

    <!-- Exact Value Mode -->
    <div v-if="selectedMode === 'exact'" class="space-y-3">
      <div
        class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
      >
        <p class="text-xs text-blue-600 dark:text-blue-300">
          The field must match this exact value. Generates a JSON Schema <code>const</code> constraint.
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Exact Value
        </label>
        <UInput
          v-model="localExactValue"
          :placeholder="exactPlaceholder"
          class="w-full font-mono text-sm"
        />
      </div>

      <!-- Suggestions for exact values -->
      <div v-if="exactSuggestions.length > 0">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Suggestions
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in exactSuggestions"
            :key="suggestion"
            type="button"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
            :class="
              localExactValue === suggestion
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            "
            @click="localExactValue = suggestion"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Enum Mode -->
    <div v-else-if="selectedMode === 'enum'" class="space-y-3">
      <div
        class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
      >
        <p class="text-xs text-blue-600 dark:text-blue-300">
          The field must match one of the specified values. Generates a JSON Schema <code>enum</code> constraint.
        </p>
      </div>

      <!-- Add value input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Allowed Values
        </label>
        <div class="flex gap-2">
          <UInput
            v-model="newEnumValue"
            :placeholder="enumPlaceholder"
            class="flex-1 font-mono text-sm"
            @keydown.enter="addEnumValue"
          />
          <UButton
            color="secondary"
            size="sm"
            icon="i-heroicons-plus"
            :disabled="!newEnumValue.trim()"
            @click="addEnumValue"
          >
            Add
          </UButton>
        </div>
      </div>

      <!-- Current enum values -->
      <div v-if="localEnumValues.length > 0" class="space-y-2">
        <div
          v-for="(val, index) in localEnumValues"
          :key="index"
          class="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700"
        >
          <span class="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300">
            {{ val }}
          </span>
          <UButton
            variant="ghost"
            size="xs"
            color="error"
            icon="i-heroicons-x-mark"
            @click="removeEnumValue(index)"
          />
        </div>
      </div>
    </div>

    <!-- URI Format Mode -->
    <div v-else-if="selectedMode === 'uri'" class="space-y-3">
      <div
        class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
      >
        <p class="text-xs text-blue-600 dark:text-blue-300">
          The field must be a valid URI. Generates a JSON Schema <code>format: "uri"</code> constraint.
        </p>
      </div>
    </div>

    <!-- Pattern Mode -->
    <div v-else-if="selectedMode === 'pattern'" class="space-y-3">
      <div
        class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
      >
        <p class="text-xs text-blue-600 dark:text-blue-300">
          The field must match the given regular expression. Generates a JSON Schema <code>pattern</code> constraint.
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Regex Pattern
        </label>
        <UInput
          v-model="localPattern"
          :placeholder="patternPlaceholder"
          class="w-full font-mono text-sm"
        />
      </div>

      <!-- Pattern suggestions -->
      <div v-if="patternSuggestions.length > 0">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Example Patterns
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in patternSuggestions"
            :key="suggestion.pattern"
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
            :class="
              localPattern === suggestion.pattern
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            "
            @click="localPattern = suggestion.pattern"
          >
            {{ suggestion.label }}
          </button>
        </div>
        <div class="mt-2 space-y-1">
          <p
            v-for="suggestion in patternSuggestions"
            :key="suggestion.pattern"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            <strong>{{ suggestion.label }}:</strong>
            <code class="ml-1 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{{ suggestion.pattern }}</code>
            - {{ suggestion.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Hint text -->
    <div v-if="hintText" class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ hintText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { StringConstraintConfig } from "~/types/profile";

const props = defineProps<{
  stringConstraintConfig?: StringConstraintConfig;
  fieldSchemaKey?: string;
}>();

const emit = defineEmits<{
  (e: "update:stringConstraintConfig", value: StringConstraintConfig): void;
}>();

// Mode options
const modeOptions = [
  { label: "Exact Value", value: "exact" },
  { label: "One of Several Values", value: "enum" },
  { label: "Regex Pattern", value: "pattern" },
  { label: "URI Format", value: "uri" },
];

// Context-specific suggestions based on field
const exactSuggestions = computed<string[]>(() => {
  if (props.fieldSchemaKey === "schemaVersion") {
    return ["2.0", "2.1"];
  }
  if (props.fieldSchemaKey === "type") {
    return ["EPCISDocument"];
  }
  return [];
});

const exactPlaceholder = computed(() => {
  if (props.fieldSchemaKey === "schemaVersion") return "e.g., 2.0";
  if (props.fieldSchemaKey === "type") return "e.g., EPCISDocument";
  if (props.fieldSchemaKey === "sender" || props.fieldSchemaKey === "receiver") return "e.g., https://id.gs1.org/414/9521141000010";
  return "Enter exact value";
});

const enumPlaceholder = computed(() => {
  if (props.fieldSchemaKey === "schemaVersion") return "e.g., 2.0";
  return "Enter a value";
});

const patternPlaceholder = computed(() => {
  if (props.fieldSchemaKey === "schemaVersion") return "e.g., ^\\d+(\\.\\d+)*$";
  if (props.fieldSchemaKey === "sender" || props.fieldSchemaKey === "receiver") return "e.g., ^https://id\\.gs1\\.org/414/";
  return "Enter regex pattern";
});

const patternSuggestions = computed(() => {
  if (props.fieldSchemaKey === "schemaVersion") {
    return [
      { label: "EPCIS Version", pattern: "^\\d+(\\.\\d+)*$", description: "Version format from EPCIS standard" },
      { label: "Version 2.x", pattern: "^2\\.", description: "Any 2.x version" },
    ];
  }
  if (props.fieldSchemaKey === "sender" || props.fieldSchemaKey === "receiver") {
    return [
      { label: "SGLN Digital Link", pattern: "^https://id\\.gs1\\.org/414/", description: "GS1 Digital Link SGLN format (recommended)" },
      { label: "Any URI", pattern: "^[a-zA-Z][a-zA-Z0-9+.-]*:", description: "Any valid URI format" },
    ];
  }
  return [];
});

const hintText = computed(() => {
  if (props.fieldSchemaKey === "sender" || props.fieldSchemaKey === "receiver") {
    return "Recommended format: GS1 Digital Link WebURI (e.g., https://id.gs1.org/414/<GLN>). URN format is also accepted.";
  }
  if (props.fieldSchemaKey === "schemaVersion") {
    return "Per the EPCIS standard, schemaVersion must match the pattern ^\\d+(\\.\\d+)*$ (e.g., \"2.0\").";
  }
  if (props.fieldSchemaKey === "type") {
    return 'For EPCIS documents, the type is typically "EPCISDocument".';
  }
  if (props.fieldSchemaKey === "id") {
    return "The document identifier. Must be a valid URI (e.g., https://example.com/doc/... or urn:uuid:...).";
  }
  return "";
});

// Local state
const selectedMode = ref<"exact" | "enum" | "pattern" | "uri">(props.stringConstraintConfig?.mode || "exact");
const localExactValue = ref(props.stringConstraintConfig?.exactValue || "");
const localEnumValues = ref<string[]>([...(props.stringConstraintConfig?.enumValues || [])]);
const localPattern = ref(props.stringConstraintConfig?.pattern || "");
const newEnumValue = ref("");

// Enum methods
const addEnumValue = () => {
  const val = newEnumValue.value.trim();
  if (val && !localEnumValues.value.includes(val)) {
    localEnumValues.value.push(val);
    newEnumValue.value = "";
    emitUpdate();
  }
};

const removeEnumValue = (index: number) => {
  localEnumValues.value.splice(index, 1);
  emitUpdate();
};

const emitUpdate = () => {
  emit("update:stringConstraintConfig", {
    mode: selectedMode.value,
    exactValue: selectedMode.value === "exact" ? localExactValue.value : undefined,
    enumValues: selectedMode.value === "enum" ? [...localEnumValues.value] : undefined,
    pattern: selectedMode.value === "pattern" ? localPattern.value : undefined,
  });
};

// Watchers
watch(selectedMode, () => emitUpdate());
watch(localExactValue, () => { if (selectedMode.value === "exact") emitUpdate(); });
watch(localPattern, () => { if (selectedMode.value === "pattern") emitUpdate(); });

// Watch for prop changes (when editing existing field)
watch(
  () => props.stringConstraintConfig,
  (newConfig) => {
    if (newConfig) {
      selectedMode.value = newConfig.mode || "exact";
      localExactValue.value = newConfig.exactValue || "";
      localEnumValues.value = [...(newConfig.enumValues || [])];
      localPattern.value = newConfig.pattern || "";
    }
  },
  { deep: true, immediate: true }
);
</script>
