<template>
  <div class="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
    <!-- Page Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1
          class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
        >
          EPCIS Profile Builder
        </h1>

        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Build JSON Schema profiles for EPCIS event validation
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="configuredFields.length > 0"
          color="neutral"
          variant="soft"
          @click="resetAll"
        >
          Reset All
        </UButton>

        <UButton
          color="secondary"
          :disabled="configuredFields.length === 0"
          @click="downloadSchema"
        >
          Download Schema
        </UButton>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <!-- Left Panel: Configured Fields -->
      <div class="space-y-4">
        <div
          class="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700"
        >
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Profile Fields
          </h2>

          <UButton
            color="secondary"
            variant="soft"
            size="md"
            :disabled="availableFieldsForModal.length === 0"
            @click="openAddModal"
            icon="mdi:plus"
          >
            Add Field
          </UButton>
        </div>

        <!-- Configured Fields List -->
        <div v-if="configuredFields.length > 0" class="space-y-3">
          <div
            v-for="field in configuredFields"
            :key="field.id"
            class="group rounded-xl bg-[var(--color-bg-card)] dark:bg-gray-800/50 border border-secondary-200 dark:border-gray-700/50 p-4 transition-all duration-200 hover:shadow-md hover:border-secondary-400 dark:hover:border-secondary-600"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-medium text-gray-900 dark:text-gray-100">
                    {{ field.label }}
                  </h3>
                  <UBadge
                    v-if="field.isRequired"
                    size="xs"
                    color="error"
                    variant="soft"
                  >
                    Required
                  </UBadge>

                  <UBadge size="xs" color="primary" variant="soft">
                    {{ getFieldDisplayLabel(field) }}
                  </UBadge>
                </div>
                <p
                  class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1"
                >
                  {{ getFieldDisplayValues(field) }}
                </p>
              </div>

              <!-- Actions -->
              <div
                class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <UButton
                  variant="soft"
                  size="md"
                  @click="openEditModal(field)"
                  icon="mdi:text-box-edit"
                  class="p-1.5 rounded-md text-gray-400 hover:text-warning-600 hover:bg-warning-50 dark:hover:bg-warning-900/20 transition-colors"
                />

                <UButton
                  variant="soft"
                  size="md"
                  @click="removeField(field.id)"
                  icon="mdi:delete"
                  class="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="rounded-xl border-2 border-dashed border-secondary-200 dark:border-secondary-800 bg-secondary-50/30 dark:bg-secondary-900/10 p-8 text-center"
        >
          <svg
            class="w-12 h-12 mx-auto text-secondary-300 dark:text-secondary-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>

          <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            No fields configured
          </h3>

          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Click "Add Field" to start building your EPCIS profile
          </p>

          <UButton
            color="secondary"
            size="sm"
            @click="openAddModal"
            icon="mdi:plus"
          >
            Add Your First Field
          </UButton>
        </div>

        <!-- Available Fields Info -->
        <div
          v-if="
            configuredFields.length > 0 && availableFieldsForModal.length > 0
          "
          class="text-xs text-gray-400 dark:text-gray-500 text-center pt-2"
        >
          {{ availableFieldsForModal.length }} more field{{
            availableFieldsForModal.length !== 1 ? "s" : ""
          }}
          available to add
        </div>
      </div>

      <!-- Right Panel: JSON Preview -->
      <div class="lg:sticky lg:top-24 lg:self-start">
        <JsonEditor
          :model-value="generatedSchemaJson"
          :is-read-only="true"
          title="Generated Schema"
          :placeholder="
            configuredFields.length > 0
              ? 'Your JSON Schema profile'
              : 'Add fields to generate schema...'
          "
        />
      </div>
    </div>

    <!-- Field Configuration Modal -->
    <FieldConfigModal
      v-model:open="isModalOpen"
      :available-fields="allFields"
      :configured-field-ids="configuredFieldIds"
      :editing-field="editingField"
      @save="handleSaveField"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type {
  ProfileFieldConfig,
  GeneratedJsonSchema,
  EpcListFieldConfig,
} from "~/types/profile";
import { getEpcisFields } from "~/data/epcis-fields";
import { getEpcIdentifierById } from "~/data/epc-identifiers";

// All available EPCIS fields (loaded from external file)
const allFields = ref<ProfileFieldConfig[]>(getEpcisFields());

// Configured fields (fields that user has added)
const configuredFields = ref<ProfileFieldConfig[]>([]);

// Modal state
const isModalOpen = ref(false);
const editingField = ref<ProfileFieldConfig | null>(null);

// Computed: IDs of configured fields
const configuredFieldIds = computed(() => {
  return configuredFields.value.map((f) => f.id);
});

// Computed: Available fields for modal (not yet configured)
const availableFieldsForModal = computed(() => {
  return allFields.value.filter(
    (f) => !configuredFieldIds.value.includes(f.id)
  );
});

// Helper: Generate epcList schema with pattern validation
const generateEpcListSchema = (config: EpcListFieldConfig): unknown => {
  const patterns = config.selectedIdentifiers
    .map((id) => getEpcIdentifierById(id))
    .filter(Boolean)
    .map((identifier) => ({
      type: "string",
      pattern: identifier!.pattern,
    }));

  if (patterns.length === 0) {
    return {
      type: "array",
      items: { type: "string" },
    };
  }

  return {
    type: "array",
    items: {
      anyOf: patterns,
    },
  };
};

// Computed: Generate JSON Schema
const generatedSchema = computed<GeneratedJsonSchema>(() => {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  configuredFields.value.forEach((field) => {
    // Handle epcList fields
    if (
      field.fieldType === "epcList" &&
      field.epcConfig?.selectedIdentifiers.length
    ) {
      properties[field.schemaKey] = generateEpcListSchema(field.epcConfig);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle enum fields
    else if (field.selectedValues.length > 0) {
      properties[field.schemaKey] = {
        type: "string",
        enum: [...field.selectedValues],
      };
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
  });

  const schema: GeneratedJsonSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    allOf: [
      {
        $ref: "https://ref.gs1.org/standards/epcis/epcis-json-schema.json",
      },
      {
        type: "object",
        properties: Object.keys(properties).length > 0 ? properties : undefined,
        required: required.length > 0 ? required : undefined,
        additionalProperties: true,
      },
    ],
  };

  // Clean undefined values
  const cleanedAllOf = schema.allOf.map((item) => {
    const cleaned: Record<string, unknown> = {};
    Object.entries(item).forEach(([key, value]) => {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  });

  return { ...schema, allOf: cleanedAllOf } as GeneratedJsonSchema;
});

// Computed: JSON string for preview
const generatedSchemaJson = computed(() => {
  if (configuredFields.value.length === 0) {
    return "";
  }
  return JSON.stringify(generatedSchema.value, null, 2);
});

// Helper: Get label for a value
const getValueLabel = (field: ProfileFieldConfig, value: string): string => {
  const option = field.options.find((o) => o.value === value);
  return option?.label || value;
};

// Helper: Get EPC identifier labels for display
const getEpcIdentifierLabels = (field: ProfileFieldConfig): string => {
  if (!field.epcConfig?.selectedIdentifiers.length) return "";
  return field.epcConfig.selectedIdentifiers
    .map((id) => {
      const identifier = getEpcIdentifierById(id);
      return identifier?.label || id;
    })
    .join(", ");
};

// Helper: Get field display info
const getFieldDisplayCount = (field: ProfileFieldConfig): number => {
  if (field.fieldType === "epcList") {
    return field.epcConfig?.selectedIdentifiers.length || 0;
  }
  return field.selectedValues.length;
};

const getFieldDisplayLabel = (field: ProfileFieldConfig): string => {
  if (field.fieldType === "epcList") {
    const count = field.epcConfig?.selectedIdentifiers.length || 0;
    return `${count} identifier${count !== 1 ? "s" : ""}`;
  }
  const count = field.selectedValues.length;
  return `${count} value${count !== 1 ? "s" : ""}`;
};

const getFieldDisplayValues = (field: ProfileFieldConfig): string => {
  if (field.fieldType === "epcList") {
    return getEpcIdentifierLabels(field);
  }
  return field.selectedValues.map((v) => getValueLabel(field, v)).join(", ");
};

// Modal handlers
const openAddModal = () => {
  editingField.value = null;
  isModalOpen.value = true;
};

const openEditModal = (field: ProfileFieldConfig) => {
  // Deep copy the field including epcConfig
  const fieldCopy: ProfileFieldConfig = {
    ...field,
    selectedValues: [...field.selectedValues],
    epcConfig: field.epcConfig
      ? { selectedIdentifiers: [...field.epcConfig.selectedIdentifiers] }
      : undefined,
  };
  editingField.value = fieldCopy;
  isModalOpen.value = true;
};

const handleSaveField = (field: ProfileFieldConfig) => {
  const existingIndex = configuredFields.value.findIndex(
    (f) => f.id === field.id
  );
  if (existingIndex >= 0) {
    // Update existing
    configuredFields.value[existingIndex] = field;
  } else {
    // Add new
    configuredFields.value.push(field);
  }
};

const removeField = (fieldId: string) => {
  configuredFields.value = configuredFields.value.filter(
    (f) => f.id !== fieldId
  );
};

const resetAll = () => {
  configuredFields.value = [];
};

// Download schema
const downloadSchema = () => {
  const blob = new Blob([generatedSchemaJson.value], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "epcis-profile.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>
