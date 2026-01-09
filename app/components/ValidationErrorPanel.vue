<template>
  <Transition name="slide-up">
    <div
      v-if="showPanel"
      class="fixed bottom-4 right-4 z-50 w-full max-w-md"
      :class="{ 'max-w-[calc(100%-2rem)]': !isMinimized && hasErrors }"
    >
      <!-- Success State -->
      <div
        v-if="isValid && !hasErrors"
        class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-green-500 dark:from-emerald-600 dark:to-green-600 text-white"
      >
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
          <UIcon name="i-heroicons-check" class="w-5 h-5" />
        </div>
        <div>
          <div class="font-semibold">Validation Passed</div>
          <div class="text-sm text-white/80">JSON data is valid against the schema</div>
        </div>
      </div>

      <!-- Error Minimized State -->
      <div
        v-else-if="hasErrors && isMinimized"
        class="flex items-center gap-2 p-3 rounded-lg cursor-pointer shadow-lg transition-all hover:scale-105 bg-red-500 dark:bg-red-600 text-white"
        @click="isMinimized = false"
      >
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
        <span class="font-medium">{{ errors.length }} Validation Error{{ errors.length > 1 ? 's' : '' }}</span>
        <UIcon name="i-heroicons-chevron-up" class="w-4 h-4 ml-auto" />
      </div>

      <!-- Error Expanded State -->
      <div
        v-else-if="hasErrors"
        class="rounded-xl shadow-2xl border overflow-hidden bg-white dark:bg-gray-900 border-red-200 dark:border-red-800"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
            <span class="font-semibold">Validation Errors</span>
            <UBadge color="white" variant="solid" size="sm">
              {{ errors.length }}
            </UBadge>
          </div>
          <div class="flex items-center gap-1">
            <UButton
              icon="i-heroicons-minus"
              color="white"
              variant="ghost"
              size="xs"
              class="hover:bg-white/20"
              @click="isMinimized = true"
            />
            <UButton
              icon="i-heroicons-x-mark"
              color="white"
              variant="ghost"
              size="xs"
              class="hover:bg-white/20"
              @click="isDismissed = true"
            />
          </div>
        </div>

        <!-- Error List -->
        <div class="max-h-80 overflow-y-auto">
          <UAccordion
            :items="accordionItems"
            :default-open="[accordionItems[0]?.value]"
            class="divide-y divide-gray-100 dark:divide-gray-800"
          >
            <template #leading="{ item }">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-heroicons-exclamation-circle"
                  class="w-4 h-4 text-red-500 flex-shrink-0"
                />
              </div>
            </template>

            <template #default="{ item }">
              <span class="font-mono text-sm text-gray-700 dark:text-gray-300 truncate">
                {{ item.label }}
              </span>
            </template>

            <template #trailing="{ item }">
              <UBadge
                :color="getKeywordColor(item.keyword)"
                variant="subtle"
                size="xs"
              >
                {{ item.keyword }}
              </UBadge>
            </template>

            <template #content="{ item }">
              <div class="px-4 pb-4 space-y-3">
                <!-- Message -->
                <div
                  class="p-3 rounded-lg text-sm bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                >
                  {{ item.message }}
                </div>

                <!-- Details -->
                <div class="grid grid-cols-1 gap-2 text-xs">
                  <div class="flex items-start gap-2">
                    <span class="font-medium text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                      Path:
                    </span>
                    <code
                      class="px-2 py-1 rounded font-mono break-all bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {{ item.path || '/' }}
                    </code>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="font-medium text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                      Schema:
                    </span>
                    <code
                      class="px-2 py-1 rounded font-mono break-all text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      {{ item.schemaPath }}
                    </code>
                  </div>
                </div>
              </div>
            </template>
          </UAccordion>
        </div>

        <!-- Footer -->
        <div
          class="px-4 py-2 text-xs border-t bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400"
        >
          Click on an error to see details
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface ValidationError {
  schemaPath: string;
  path: string;
  keyword: string;
  message: string;
}

const props = defineProps<{
  errors: ValidationError[];
  isValid: boolean;
}>();

const isMinimized = ref(false);

// Computed properties
const hasErrors = computed(() => props.errors.length > 0);
const showPanel = computed(() => props.isValid || hasErrors.value);

// Reset minimized state when errors change
watch(
  () => props.errors,
  (newErrors, oldErrors) => {
    // Expand panel when new errors come in
    if (newErrors.length > 0 && oldErrors.length === 0) {
      isMinimized.value = false;
    }
  }
);

// Convert errors to accordion items
const accordionItems = computed(() =>
  props.errors.map((err, index) => ({
    value: `error-${index}`,
    label: err.path || "/",
    keyword: err.keyword,
    message: err.message,
    path: err.path,
    schemaPath: err.schemaPath,
  }))
);

// Get color based on keyword type
const getKeywordColor = (keyword: string): string => {
  const colorMap: Record<string, string> = {
    required: "red",
    pattern: "amber",
    type: "blue",
    enum: "purple",
    format: "cyan",
    minimum: "orange",
    maximum: "orange",
    minLength: "orange",
    maxLength: "orange",
    minItems: "orange",
    maxItems: "orange",
    additionalProperties: "yellow",
    unevaluatedProperties: "yellow",
    oneOf: "violet",
    anyOf: "violet",
    allOf: "violet",
    const: "emerald",
  };
  return colorMap[keyword] || "neutral";
};
</script>

<style scoped>
/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .fixed {
    left: 0.5rem;
    right: 0.5rem;
    bottom: 0.5rem;
  }
}
</style>
