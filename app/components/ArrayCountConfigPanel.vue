<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UIcon
        name="i-heroicons-bars-3-bottom-left"
        class="w-4 h-4 text-purple-500"
      />
      <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {{ title || "Array Count Constraints" }}
      </h4>
    </div>

    <!-- Info Box -->
    <div
      class="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
    >
      <div class="flex items-start gap-3">
        <UIcon
          name="i-heroicons-information-circle"
          class="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0"
        />
        <div>
          <h4 class="text-sm font-medium text-purple-800 dark:text-purple-200">
            {{
              description ||
              "Set minimum and maximum number of items allowed in the array."
            }}
          </h4>
          <p class="text-xs text-purple-600 dark:text-purple-300 mt-1">
            Leave fields empty for no constraint.
          </p>
        </div>
      </div>
    </div>

    <!-- Min/Max Inputs -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Minimum Items
        </label>
        <UInput
          v-model.number="localMinItems"
          type="number"
          :min="0"
          placeholder="No minimum"
          class="w-full"
        />
      </div>
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Maximum Items
        </label>
        <UInput
          v-model.number="localMaxItems"
          type="number"
          :min="localMinItems || 0"
          placeholder="No maximum"
          class="w-full"
        />
      </div>
    </div>

    <!-- Validation Warning -->
    <div
      v-if="validationWarning"
      class="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-4 h-4 text-yellow-500"
        />
        <p class="text-xs text-yellow-700 dark:text-yellow-300">
          {{ validationWarning }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";

const props = defineProps<{
  minItems?: number;
  maxItems?: number;
  title?: string;
  description?: string;
}>();

const emit = defineEmits<{
  (e: "update:minItems", value: number | undefined): void;
  (e: "update:maxItems", value: number | undefined): void;
}>();

// Local state
const localMinItems = ref<number | undefined>(props.minItems);
const localMaxItems = ref<number | undefined>(props.maxItems);

// Validation warning
const validationWarning = computed(() => {
  if (
    localMinItems.value !== undefined &&
    localMaxItems.value !== undefined &&
    localMinItems.value > localMaxItems.value
  ) {
    return "Minimum items cannot be greater than maximum items.";
  }
  return null;
});

// Check if a preset is currently active
const isPresetActive = (preset: { min?: number; max?: number }) => {
  return (
    localMinItems.value === preset.min && localMaxItems.value === preset.max
  );
};

// Apply a preset
const applyPreset = (preset: { min?: number; max?: number }) => {
  localMinItems.value = preset.min;
  localMaxItems.value = preset.max;
  emitUpdate();
};

// Emit updates
const emitUpdate = () => {
  // Convert 0, NaN, or empty string to undefined
  const minVal =
    localMinItems.value && !isNaN(localMinItems.value)
      ? localMinItems.value
      : undefined;
  const maxVal =
    localMaxItems.value && !isNaN(localMaxItems.value)
      ? localMaxItems.value
      : undefined;
  emit("update:minItems", minVal);
  emit("update:maxItems", maxVal);
};

// Watchers
watch(localMinItems, () => {
  emitUpdate();
});

watch(localMaxItems, () => {
  emitUpdate();
});

// Watch for prop changes
watch(
  () => props.minItems,
  (newVal) => {
    localMinItems.value = newVal;
  }
);

watch(
  () => props.maxItems,
  (newVal) => {
    localMaxItems.value = newVal;
  }
);
</script>
