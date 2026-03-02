<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon
        name="i-heroicons-code-bracket-square"
        class="w-4 h-4 text-primary-500"
      />
      <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Required Context URIs
      </h4>
    </div>

    <!-- Info -->
    <div
      class="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
    >
      <div class="flex items-start gap-3">
        <UIcon
          name="i-heroicons-information-circle"
          class="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
        />
        <div>
          <h4
            class="text-sm font-medium text-primary-800 dark:text-primary-200"
          >
            JSON-LD Context
          </h4>
          <p class="text-xs text-primary-600 dark:text-primary-300 mt-1">
            Define which context URIs must be present in the @context array. The
            generated schema uses JSON Schema <code>contains</code> to validate
            each required URI is present.
          </p>
        </div>
      </div>
    </div>

    <!-- Add Context URI -->
    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Add Context URI
      </label>
      <div class="flex gap-2">
        <UInput
          v-model="newContextUri"
          placeholder="https://ref.gs1.org/standards/epcis/epcis-context.jsonld"
          class="flex-1 font-mono text-sm"
          @keydown.enter="addContext"
        />
        <UButton
          color="secondary"
          size="sm"
          icon="i-heroicons-plus"
          :disabled="!newContextUri.trim()"
          @click="addContext"
        >
          Add
        </UButton>
      </div>
    </div>

    <!-- Suggested URIs -->
    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Common Contexts
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in availableSuggestions"
          :key="suggestion.uri"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
          @click="addSuggestion(suggestion.uri)"
        >
          <UIcon name="i-heroicons-plus" class="w-3 h-3" />
          {{ suggestion.label }}
        </button>
      </div>
    </div>

    <!-- Current Required Contexts -->
    <div v-if="localRequiredContexts.length > 0">
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Required Contexts ({{ localRequiredContexts.length }})
      </label>
      <div class="space-y-2">
        <div
          v-for="(uri, index) in localRequiredContexts"
          :key="index"
          class="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700"
        >
          <UIcon
            name="i-heroicons-check-circle"
            class="w-4 h-4 text-primary-500 flex-shrink-0"
          />
          <span
            class="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 truncate"
          >
            {{ uri }}
          </span>
          <UButton
            variant="ghost"
            size="xs"
            color="error"
            icon="i-heroicons-x-mark"
            @click="removeContext(index)"
          />
        </div>
      </div>
    </div>

    <!-- Allow Additional Toggle -->
    <div
      class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700"
    >
      <div>
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Allow Additional Contexts
        </label>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Allow extra context entries beyond the required ones
        </p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="localAllowAdditional"
        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
        :class="
          localAllowAdditional
            ? 'bg-secondary-600'
            : 'bg-gray-200 dark:bg-gray-700'
        "
        @click="toggleAllowAdditional"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="localAllowAdditional ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>

    <!-- Array Count Configuration -->
    <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
      <ArrayCountConfigPanel
        :min-items="localMinItems"
        :max-items="localMaxItems"
        title="Context Array Constraints"
        description="Set minimum and maximum number of context entries allowed."
        @update:min-items="handleMinItemsUpdate"
        @update:max-items="handleMaxItemsUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { ContextListConfig } from "~/types/profile";

const props = defineProps<{
  contextListConfig?: ContextListConfig;
}>();

const emit = defineEmits<{
  (e: "update:contextListConfig", value: ContextListConfig): void;
}>();

// Suggested context URIs
const suggestions = [
  {
    label: "EPCIS 2.0",
    uri: "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
  },
];

// Local state
const newContextUri = ref("");
const localRequiredContexts = ref<string[]>([
  ...(props.contextListConfig?.requiredContexts || []),
]);
const localAllowAdditional = ref(
  props.contextListConfig?.allowAdditional ?? true,
);
const localMinItems = ref<number | undefined>(
  props.contextListConfig?.minItems,
);
const localMaxItems = ref<number | undefined>(
  props.contextListConfig?.maxItems,
);

// Only show suggestions not already added
const availableSuggestions = computed(() =>
  suggestions.filter((s) => !localRequiredContexts.value.includes(s.uri)),
);

const addContext = () => {
  const uri = newContextUri.value.trim();
  if (uri && !localRequiredContexts.value.includes(uri)) {
    localRequiredContexts.value.push(uri);
    newContextUri.value = "";
    emitUpdate();
  }
};

const addSuggestion = (uri: string) => {
  if (!localRequiredContexts.value.includes(uri)) {
    localRequiredContexts.value.push(uri);
    emitUpdate();
  }
};

const removeContext = (index: number) => {
  localRequiredContexts.value.splice(index, 1);
  emitUpdate();
};

const toggleAllowAdditional = () => {
  localAllowAdditional.value = !localAllowAdditional.value;
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
  emit("update:contextListConfig", {
    requiredContexts: [...localRequiredContexts.value],
    allowAdditional: localAllowAdditional.value,
    minItems: localMinItems.value,
    maxItems: localMaxItems.value,
  });
};

// Watch for prop changes (when editing existing field)
watch(
  () => props.contextListConfig,
  (newConfig) => {
    if (newConfig) {
      localRequiredContexts.value = [...(newConfig.requiredContexts || [])];
      localAllowAdditional.value = newConfig.allowAdditional ?? true;
      localMinItems.value = newConfig.minItems;
      localMaxItems.value = newConfig.maxItems;
    }
  },
  { deep: true, immediate: true },
);
</script>
