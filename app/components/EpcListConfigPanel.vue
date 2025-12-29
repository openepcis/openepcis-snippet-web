<template>
  <div class="space-y-5">
    <!-- Search -->
    <div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search identifiers..."
        class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
      />
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

    <!-- GS1 Digital Link Identifiers Section -->
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

    <!-- Selected count -->
    <p class="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
      {{ selectedIdentifiers.length }} of {{ totalIdentifiers }} identifier
      types selected
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  getEpcUriIdentifiers,
  getGs1DlIdentifiers,
  epcIdentifiers,
} from "~/data/epc-identifiers";
import type { EpcIdentifierType } from "~/types/profile";

// Props
const props = defineProps<{
  selectedIdentifiers: string[];
}>();

// Emits
const emit = defineEmits<{
  (e: "update:selectedIdentifiers", value: string[]): void;
}>();

// Local state
const searchQuery = ref("");

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
const totalIdentifiers = computed(() => epcIdentifiers.length);

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
    category === "epc-uri" ? epcUriIdentifiers.value : gs1DlIdentifiers.value;
  const categoryIds = categoryIdentifiers.map((i) => i.id);
  const current = [...props.selectedIdentifiers];

  // Add all from category that aren't already selected
  categoryIds.forEach((id) => {
    if (!current.includes(id)) {
      current.push(id);
    }
  });

  emit("update:selectedIdentifiers", current);
};

const clearAllInCategory = (category: "epc-uri" | "gs1-dl") => {
  const categoryIdentifiers =
    category === "epc-uri" ? epcUriIdentifiers.value : gs1DlIdentifiers.value;
  const categoryIds = new Set(categoryIdentifiers.map((i) => i.id));

  // Remove all from this category
  const filtered = props.selectedIdentifiers.filter(
    (id) => !categoryIds.has(id)
  );

  emit("update:selectedIdentifiers", filtered);
};
</script>
