<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-finger-print" class="w-4 h-4 text-primary-500" />
      <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Event ID Validation
      </h4>
    </div>

    <!-- CBV Info Box -->
    <div
      class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
    >
      <p class="text-xs text-amber-700 dark:text-amber-300">
        <strong>CBV Standard:</strong> The eventID field SHALL be a globally unique URI.
        CBV-compliant documents SHALL use UUID URI or EPCIS Event Hash ID formats.
      </p>
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

    <!-- Standard EventID URI Mode -->
    <div v-if="selectedMode === 'standard'" class="space-y-4">
      <!-- Info Box -->
      <div
        class="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-heroicons-check-badge"
            class="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
          />
          <div>
            <h4 class="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              CBV-Compliant Event ID
            </h4>
            <p class="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
              Select one or both standard URI formats defined in CBV Section 8.9.
            </p>
          </div>
        </div>
      </div>

      <!-- Standard Type Selection -->
      <div class="space-y-3">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Allowed Event ID Formats
        </label>

        <!-- UUID URI Option -->
        <div
          class="p-4 rounded-lg border cursor-pointer transition-all"
          :class="
            isStandardTypeSelected('uuid')
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
              : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          "
          @click="toggleStandardType('uuid')"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              :checked="isStandardTypeSelected('uuid')"
              class="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
              @click.stop
              @change="toggleStandardType('uuid')"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  UUID URI
                </h5>
                <UBadge size="xs" color="primary" variant="soft">RFC 4122</UBadge>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Universally Unique Identifier expressed as a URN (e.g., urn:uuid:550e8400-e29b-41d4-a716-446655440000)
              </p>
              <code class="mt-2 block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-600 dark:text-gray-400 overflow-x-auto">
                {{ STANDARD_PATTERNS.uuid }}
              </code>
            </div>
          </div>
        </div>

        <!-- EPCIS Event Hash ID Option -->
        <div
          class="p-4 rounded-lg border cursor-pointer transition-all"
          :class="
            isStandardTypeSelected('event-hash')
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
              : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          "
          @click="toggleStandardType('event-hash')"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              :checked="isStandardTypeSelected('event-hash')"
              class="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
              @click.stop
              @change="toggleStandardType('event-hash')"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  EPCIS Event Hash ID
                </h5>
                <UBadge size="xs" color="blue" variant="soft">RFC 6920</UBadge>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Named Information URI based on event hash (e.g., ni:///sha-256;abc123?ver=CBV2.0)
              </p>
              <code class="mt-2 block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-600 dark:text-gray-400 overflow-x-auto">
                {{ STANDARD_PATTERNS['event-hash'] }}
              </code>
            </div>
          </div>
        </div>

        <!-- Warning if none selected -->
        <div
          v-if="selectedStandardTypes.length === 0"
          class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <p class="text-xs text-red-600 dark:text-red-400">
            Please select at least one Event ID format.
          </p>
        </div>
      </div>
    </div>

    <!-- Custom EventID URI Mode -->
    <div v-else-if="selectedMode === 'custom'" class="space-y-4">
      <!-- Info Box -->
      <div
        class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-heroicons-cog-6-tooth"
            class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
          />
          <div>
            <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              Custom Event ID Format
            </h4>
            <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
              Define a custom validation rule for Event ID URIs.
            </p>
          </div>
        </div>
      </div>

      <!-- Custom Mode Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Validation Type
        </label>
        <USelectMenu
          v-model="selectedCustomMode"
          :items="customModeOptions"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- Description based on custom mode -->
      <div
        v-if="selectedCustomMode !== 'pattern'"
        class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
      >
        <p class="text-xs text-gray-600 dark:text-gray-400">
          <template v-if="selectedCustomMode === 'uri'">
            <strong>Any URI:</strong> Accepts any valid URI format according to RFC 3986.
          </template>
          <template v-else-if="selectedCustomMode === 'url'">
            <strong>URL Format:</strong> Accepts HTTP or HTTPS URLs only.
          </template>
          <template v-else-if="selectedCustomMode === 'urn'">
            <strong>URN Format:</strong> Accepts any URN format (urn:*).
          </template>
        </p>
      </div>

      <!-- Custom Pattern Input -->
      <div v-if="selectedCustomMode === 'pattern'" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Quick Examples
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="example in examplePatterns"
              :key="example.pattern"
              type="button"
              class="px-2 py-1 text-xs font-medium rounded transition-colors bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              @click="selectExamplePattern(example.pattern)"
            >
              {{ example.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { UriFieldConfig } from "~/types/profile";

// Standard patterns from OpenEPCIS snippets
const STANDARD_PATTERNS = {
  uuid: "^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[14][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
  "event-hash": "^ni:\\/\\/\\/[A-Za-z0-9._~-]+;[A-Za-z0-9_-]+\\?ver=CBV\\d+\\.\\d+(?:\\.\\d+)?$",
};

// Custom mode patterns
const CUSTOM_MODE_PATTERNS = {
  uri: "^[a-zA-Z][a-zA-Z0-9+.-]*:.*",
  url: "^https?://.*",
  urn: "^urn:.*",
};

const props = defineProps<{
  uriConfig?: UriFieldConfig;
}>();

const emit = defineEmits<{
  (e: "update:uriConfig", value: UriFieldConfig): void;
}>();

// Mode options for dropdown
const modeOptions = [
  { label: "Standard EventID URI (CBV-Compliant)", value: "standard" },
  { label: "Custom EventID URI", value: "custom" },
];

// Custom mode options
const customModeOptions = [
  { label: "Any Valid URI", value: "uri" },
  { label: "URL Only (HTTP/HTTPS)", value: "url" },
  { label: "URN Only", value: "urn" },
  { label: "Custom Pattern", value: "pattern" },
];

// Example regex patterns for custom mode
const examplePatterns = [
  { label: "UUID URN", pattern: "^urn:uuid:[0-9a-fA-F-]{36}$" },
  { label: "NI URI", pattern: "^ni:///.*" },
  { label: "HTTPS URL", pattern: "^https://.*" },
];

// Local state
const selectedMode = ref<"standard" | "custom">(
  // Map old "uri" mode to "custom" for backwards compatibility
  props.uriConfig?.mode === "uri" ? "custom" : (props.uriConfig?.mode || "standard")
);
const selectedStandardTypes = ref<("uuid" | "event-hash")[]>(
  props.uriConfig?.selectedStandardTypes || ["uuid", "event-hash"]
);
const selectedCustomMode = ref<"uri" | "url" | "urn" | "pattern">(
  props.uriConfig?.customMode || "uri"
);
const localCustomPattern = ref<string>(props.uriConfig?.customPattern || "");

// Computed
const isStandardTypeSelected = (type: "uuid" | "event-hash") => {
  return selectedStandardTypes.value.includes(type);
};

// Methods
const toggleStandardType = (type: "uuid" | "event-hash") => {
  const index = selectedStandardTypes.value.indexOf(type);
  if (index === -1) {
    selectedStandardTypes.value.push(type);
  } else {
    selectedStandardTypes.value.splice(index, 1);
  }
  emitUpdate();
};

const selectExamplePattern = (pattern: string) => {
  localCustomPattern.value = pattern;
  emitUpdate();
};

const emitUpdate = () => {
  const config: UriFieldConfig = {
    mode: selectedMode.value,
  };

  if (selectedMode.value === "standard") {
    config.selectedStandardTypes = [...selectedStandardTypes.value];
  } else {
    config.customMode = selectedCustomMode.value;
    if (selectedCustomMode.value === "pattern") {
      config.customPattern = localCustomPattern.value;
    }
  }

  emit("update:uriConfig", config);
};

// Watchers
watch(selectedMode, () => {
  emitUpdate();
});

watch(selectedCustomMode, () => {
  if (selectedMode.value === "custom") {
    emitUpdate();
  }
});

watch(localCustomPattern, () => {
  if (selectedMode.value === "custom" && selectedCustomMode.value === "pattern") {
    emitUpdate();
  }
});

// Watch for prop changes (when editing existing field)
watch(
  () => props.uriConfig,
  (newConfig) => {
    if (newConfig) {
      // Handle backwards compatibility with old "uri" mode
      selectedMode.value = newConfig.mode === "uri" ? "custom" : (newConfig.mode || "standard");
      selectedStandardTypes.value = newConfig.selectedStandardTypes || ["uuid", "event-hash"];
      selectedCustomMode.value = newConfig.customMode || "uri";
      localCustomPattern.value = newConfig.customPattern || "";
    }
  },
  { deep: true }
);

// Export patterns for use in schema generation
defineExpose({
  STANDARD_PATTERNS,
  CUSTOM_MODE_PATTERNS,
});
</script>
