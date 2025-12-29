<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    :ui="{ width: 'sm:max-w-xl' }"
  >
    <template #body>
      <div class="space-y-5">
        <!-- Step 1: Select Field (only when adding new) -->
        <div v-if="!editingField">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Select EPCIS Field
          </label>

          <USelectMenu
            v-model="selectedFieldId"
            :items="availableFieldOptions"
            placeholder="Choose a field to configure..."
            value-key="value"
            class="w-full"
          />
        </div>

        <!-- Step 2: Configure Field (shown after field selection) -->
        <div v-if="selectedFieldConfig" class="space-y-5">
          <!-- Field Info -->
          <div
            class="p-3 rounded-lg bg-[var(--color-bg-card)] dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800"
          >
            <h4 class="font-medium text-gray-900 dark:text-gray-100">
              {{ selectedFieldConfig.label }}
            </h4>

            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {{ selectedFieldConfig.description }}
            </p>
          </div>

          <!-- Required Toggle -->
          <div class="flex items-center justify-between">
            <div>
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Required Field
              </label>

              <p class="text-xs text-gray-500 dark:text-gray-400">
                Mark this field as required in the schema
              </p>
            </div>

            <button
              type="button"
              role="switch"
              :aria-checked="fieldRequired"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
              :class="
                fieldRequired
                  ? 'bg-secondary-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              "
              @click="fieldRequired = !fieldRequired"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="fieldRequired ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- EPC List Configuration (for epcList field type) -->
          <div v-if="isEpcListField">
            <div class="mb-3">
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Allowed EPC Identifier Types
              </label>

              <p class="text-xs text-gray-500 dark:text-gray-400">
                Select which EPC identifier formats are permitted
              </p>
            </div>

            <EpcListConfigPanel
              :selected-identifiers="epcSelectedIdentifiers"
              @update:selected-identifiers="updateEpcIdentifiers"
            />
          </div>

          <!-- Allowed Values Selection (for enum fields) -->
          <div v-else>
            <div class="flex items-center justify-between mb-3">
              <div>
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Allowed Values
                </label>

                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Select which values are permitted for this field
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
            <div v-if="selectedFieldConfig.options.length > 8" class="mb-3">
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
                    selectedValues.includes(option.value)
                      ? 'bg-secondary-50 dark:bg-secondary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  "
                >
                  <input
                    type="checkbox"
                    :checked="selectedValues.includes(option.value)"
                    class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
                    @change="toggleValue(option.value)"
                  />
                  <span
                    class="text-sm"
                    :class="
                      selectedValues.includes(option.value)
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
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {{ selectedValues.length }} of
              {{ selectedFieldConfig.options.length }} values selected
            </p>
          </div>
        </div>

        <!-- Empty state when no field selected -->
        <div
          v-if="!selectedFieldConfig && !editingField"
          class="text-center py-8 text-gray-400 dark:text-gray-500"
        >
          <svg
            class="w-12 h-12 mx-auto mb-3 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <p class="text-sm">Select a field above to configure it</p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="secondary" variant="subtle" @click="closeModal">
          Cancel
        </UButton>

        <UButton color="secondary" :disabled="!canSave" @click="saveField">
          {{ editingField ? "Update Field" : "Add Field" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { ProfileFieldConfig } from "~/types/profile";

// Props
const props = defineProps<{
  open: boolean;
  availableFields: ProfileFieldConfig[];
  configuredFieldIds: string[];
  editingField?: ProfileFieldConfig | null;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "save", field: ProfileFieldConfig): void;
}>();

// Local state
const selectedFieldId = ref<string>("");
const selectedValues = ref<string[]>([]);
const fieldRequired = ref(true);
const searchQuery = ref("");

// EPC List specific state
const epcSelectedIdentifiers = ref<string[]>([]);

// Computed: Modal open state (two-way binding)
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

// Computed: Modal title
const modalTitle = computed(() => {
  if (props.editingField) {
    return `Edit: ${props.editingField.label}`;
  }
  return "Add Field";
});

// Computed: Available fields for dropdown (exclude already configured)
const availableFieldOptions = computed(() => {
  return props.availableFields
    .filter((f) => !props.configuredFieldIds.includes(f.id))
    .map((f) => ({
      label: f.label,
      value: f.id,
    }));
});

// Computed: Selected field configuration
const selectedFieldConfig = computed(() => {
  if (props.editingField) {
    return props.editingField;
  }
  return props.availableFields.find((f) => f.id === selectedFieldId.value);
});

// Computed: Check if selected field is epcList type
const isEpcListField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "epcList";
});

// Computed: Filtered options based on search
const filteredOptions = computed(() => {
  if (!selectedFieldConfig.value) return [];
  if (!searchQuery.value) return selectedFieldConfig.value.options;

  const query = searchQuery.value.toLowerCase();
  return selectedFieldConfig.value.options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
  );
});

// Computed: Can save (has field selected and at least one value/identifier)
const canSave = computed(() => {
  if (!selectedFieldConfig.value) return false;

  // For epcList fields, check if identifiers are selected
  if (isEpcListField.value) {
    return epcSelectedIdentifiers.value.length > 0;
  }

  // For enum fields, check if values are selected
  return selectedValues.value.length > 0;
});

// Watch for editing field changes
watch(
  () => props.editingField,
  (field) => {
    if (field) {
      selectedFieldId.value = field.id;
      selectedValues.value = [...field.selectedValues];
      fieldRequired.value = field.isRequired;

      // Handle epcList fields
      if (field.fieldType === "epcList" && field.epcConfig) {
        epcSelectedIdentifiers.value = [...field.epcConfig.selectedIdentifiers];
      } else {
        epcSelectedIdentifiers.value = [];
      }
    }
  },
  { immediate: true }
);

// Watch for modal open to reset state
watch(isOpen, (open) => {
  if (open && !props.editingField) {
    resetForm();
  }
});

// Methods
const toggleValue = (value: string) => {
  if (selectedValues.value.includes(value)) {
    selectedValues.value = selectedValues.value.filter((v) => v !== value);
  } else {
    selectedValues.value = [...selectedValues.value, value];
  }
};

const selectAllValues = () => {
  if (selectedFieldConfig.value) {
    selectedValues.value = selectedFieldConfig.value.options.map(
      (o) => o.value
    );
  }
};

const clearAllValues = () => {
  selectedValues.value = [];
};

// EPC List methods
const updateEpcIdentifiers = (identifiers: string[]) => {
  epcSelectedIdentifiers.value = identifiers;
};

const resetForm = () => {
  selectedFieldId.value = "";
  selectedValues.value = [];
  fieldRequired.value = true;
  searchQuery.value = "";
  epcSelectedIdentifiers.value = [];
};

const closeModal = () => {
  isOpen.value = false;
  resetForm();
};

const saveField = () => {
  if (!selectedFieldConfig.value) return;

  // Handle epcList fields
  if (isEpcListField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [], // Not used for epcList
      isRequired: fieldRequired.value,
      epcConfig: {
        selectedIdentifiers: [...epcSelectedIdentifiers.value],
      },
    };
    emit("save", field);
  } else {
    // Handle enum fields
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [...selectedValues.value],
      isRequired: fieldRequired.value,
    };
    emit("save", field);
  }

  closeModal();
};
</script>
