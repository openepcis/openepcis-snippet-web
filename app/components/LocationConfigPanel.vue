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
              Location Identifier Format
            </h4>
            <p class="text-xs text-emerald-600 dark:text-emerald-300 mt-1">
              Select the location identifier formats to validate. Locations use
              SGLN (Serialized Global Location Number) or PGLN (Party Global
              Location Number) URIs.
            </p>
          </div>
        </div>
      </div>

      <!-- EPC URN Location Identifiers -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
              EPC URN Format
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

        <div class="rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 gap-1 p-2">
            <label
              v-for="identifier in epcUriLocationIdentifiers"
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
                  class="text-xs text-gray-500 dark:text-gray-400 block"
                >
                  {{ identifier.description }}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- GS1 Digital Link Location Identifiers -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
              GS1 Digital Link Format
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

        <div class="rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 gap-1 p-2">
            <label
              v-for="identifier in gs1DlLocationIdentifiers"
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
                  class="text-xs text-gray-500 dark:text-gray-400 block"
                >
                  {{ identifier.description }}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Selected count -->
      <p class="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
        {{ selectedIdentifiers.length }} of {{ totalLocationIdentifiers }} location
        identifier types selected
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useGitHubEpcIdentifiers } from "~/composables/useGitHubEpcIdentifiers";
import type { EpcIdentifierType } from "~/types/profile";

// Props
const props = defineProps<{
  selectedIdentifiers: string[];
}>();

// Emits
const emit = defineEmits<{
  (e: "update:selectedIdentifiers", value: string[]): void;
}>();

// Composable
const {
  isLoading,
  error,
  identifiers,
  fetchIdentifiers,
  getLocationIdentifiers,
} = useGitHubEpcIdentifiers();

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

// Get all location identifiers
const allLocationIdentifiers = computed<EpcIdentifierType[]>(() =>
  getLocationIdentifiers()
);

// Split by category
const epcUriLocationIdentifiers = computed(() =>
  allLocationIdentifiers.value.filter((i) => i.category === "epc-uri")
);

const gs1DlLocationIdentifiers = computed(() =>
  allLocationIdentifiers.value.filter((i) => i.category === "gs1-dl")
);

// Total count
const totalLocationIdentifiers = computed(() => allLocationIdentifiers.value.length);

// Methods
const isSelected = (id: string): boolean => {
  return props.selectedIdentifiers.includes(id);
};

const toggleIdentifier = (id: string) => {
  const current = [...props.selectedIdentifiers];
  const idx = current.indexOf(id);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(id);
  }
  emit("update:selectedIdentifiers", current);
};

const selectAllInCategory = (category: "epc-uri" | "gs1-dl") => {
  const categoryIdentifiers =
    category === "epc-uri"
      ? epcUriLocationIdentifiers.value
      : gs1DlLocationIdentifiers.value;
  const categoryIds = categoryIdentifiers.map((i) => i.id);
  const current = [...props.selectedIdentifiers];

  categoryIds.forEach((id) => {
    if (!current.includes(id)) {
      current.push(id);
    }
  });

  emit("update:selectedIdentifiers", current);
};

const clearAllInCategory = (category: "epc-uri" | "gs1-dl") => {
  const categoryIdentifiers =
    category === "epc-uri"
      ? epcUriLocationIdentifiers.value
      : gs1DlLocationIdentifiers.value;
  const categoryIds = new Set(categoryIdentifiers.map((i) => i.id));

  const filtered = props.selectedIdentifiers.filter(
    (id) => !categoryIds.has(id)
  );

  emit("update:selectedIdentifiers", filtered);
};
</script>
