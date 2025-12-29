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
      <!-- Left Panel: Dimension-based Field Accordions -->
      <div class="space-y-3">
        <!-- Dimension Accordions -->
        <div
          v-for="dimension in epcisDimensions"
          :key="dimension.id"
          class="rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-800/30"
        >
          <!-- Accordion Header -->
          <button
            type="button"
            class="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            @click="toggleDimension(dimension.id)"
          >
            <!-- Dimension Icon -->
            <div
              class="p-2 rounded-lg"
              :class="getDimensionIconBgClass(dimension.color)"
            >
              <UIcon
                :name="dimension.icon"
                class="w-5 h-5"
                :class="getDimensionIconClass(dimension.color)"
              />
            </div>

            <!-- Dimension Info -->
            <div class="flex-1 text-left">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ dimension.label }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ dimension.description }}
              </p>
            </div>

            <!-- Configured Count Badge -->
            <UBadge
              v-if="getFieldsByDimension(dimension.id).length > 0"
              :color="dimension.color"
              variant="soft"
              size="sm"
            >
              {{ getFieldsByDimension(dimension.id).length }} configured
            </UBadge>

            <!-- Chevron -->
            <UIcon
              :name="
                expandedDimensions.includes(dimension.id)
                  ? 'i-heroicons-chevron-up'
                  : 'i-heroicons-chevron-down'
              "
              class="w-5 h-5 text-gray-400"
            />
          </button>

          <!-- Accordion Content -->
          <div
            v-show="expandedDimensions.includes(dimension.id)"
            class="border-t border-gray-100 dark:border-gray-700/50"
          >
            <div class="p-4 space-y-3">
              <!-- Configured Fields for this Dimension -->
              <div
                v-if="getFieldsByDimension(dimension.id).length > 0"
                class="space-y-2"
              >
                <div
                  v-for="field in getFieldsByDimension(dimension.id)"
                  :key="field.id"
                  class="group flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span
                        class="font-medium text-sm text-gray-900 dark:text-gray-100"
                      >
                        {{ field.label }}
                      </span>
                      <UBadge
                        v-if="field.isRequired"
                        size="xs"
                        color="error"
                        variant="soft"
                      >
                        Required
                      </UBadge>
                      <UBadge size="xs" color="neutral" variant="soft">
                        {{ getFieldDisplayLabel(field) }}
                      </UBadge>
                    </div>
                    <p
                      class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate"
                    >
                      {{ getFieldDisplayValues(field) }}
                    </p>
                  </div>

                  <!-- Field Actions -->
                  <div
                    class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <UButton
                      variant="ghost"
                      size="xs"
                      color="neutral"
                      @click.stop="openEditModal(field)"
                      icon="i-heroicons-pencil-square"
                    />
                    <UButton
                      variant="ghost"
                      size="xs"
                      color="error"
                      @click.stop="removeField(field.id)"
                      icon="i-heroicons-trash"
                    />
                  </div>
                </div>
              </div>

              <!-- Empty State for Dimension -->
              <div
                v-else
                class="text-center py-4 text-gray-400 dark:text-gray-500"
              >
                <p class="text-sm">No fields configured</p>
              </div>

              <!-- Add Field Button for this Dimension -->
              <UButton
                v-if="getAvailableFieldsByDimension(dimension.id).length > 0"
                color="neutral"
                variant="soft"
                size="sm"
                class="w-full"
                icon="i-heroicons-plus"
                @click="openAddModalForDimension(dimension.id)"
              >
                Add {{ dimension.label }} Field
              </UButton>

              <!-- All fields configured message -->
              <p
                v-else-if="
                  allFields.filter((f) => f.dimension === dimension.id).length >
                  0
                "
                class="text-xs text-gray-400 dark:text-gray-500 text-center"
              >
                All {{ dimension.label.toLowerCase() }} fields configured
              </p>
            </div>
          </div>
        </div>

        <!-- Summary Info -->
        <div
          v-if="configuredFields.length > 0"
          class="text-xs text-gray-400 dark:text-gray-500 text-center pt-2"
        >
          {{ configuredFields.length }} field{{
            configuredFields.length !== 1 ? "s" : ""
          }}
          configured across {{ getConfiguredDimensionsCount }} dimension{{
            getConfiguredDimensionsCount !== 1 ? "s" : ""
          }}
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
      :available-fields="modalAvailableFields"
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
  EpcisDimension,
} from "~/types/profile";
import { getEpcisFields } from "~/data/epcis-fields";
import { getEpcIdentifierById } from "~/data/epc-identifiers";
import { epcisDimensions } from "~/data/epcis-dimensions";

// All available EPCIS fields (loaded from external file)
const allFields = ref<ProfileFieldConfig[]>(getEpcisFields());

// Configured fields (fields that user has added)
const configuredFields = ref<ProfileFieldConfig[]>([]);

// Modal state
const isModalOpen = ref(false);
const editingField = ref<ProfileFieldConfig | null>(null);
const selectedDimension = ref<EpcisDimension | null>(null);

// Accordion state - all dimensions expanded by default
const expandedDimensions = ref<EpcisDimension[]>(
  epcisDimensions.map((d) => d.id)
);

// Toggle dimension accordion
const toggleDimension = (dimensionId: EpcisDimension) => {
  const index = expandedDimensions.value.indexOf(dimensionId);
  if (index >= 0) {
    expandedDimensions.value.splice(index, 1);
  } else {
    expandedDimensions.value.push(dimensionId);
  }
};

// Computed: IDs of configured fields
const configuredFieldIds = computed(() => {
  return configuredFields.value.map((f) => f.id);
});

// Get fields by dimension (configured)
const getFieldsByDimension = (dimensionId: EpcisDimension) => {
  return configuredFields.value.filter((f) => f.dimension === dimensionId);
};

// Get available fields by dimension (not yet configured)
const getAvailableFieldsByDimension = (dimensionId: EpcisDimension) => {
  return allFields.value.filter(
    (f) =>
      f.dimension === dimensionId && !configuredFieldIds.value.includes(f.id)
  );
};

// Computed: Available fields for modal (filtered by selected dimension)
const modalAvailableFields = computed(() => {
  if (editingField.value) {
    // When editing, show all fields (modal handles filtering)
    return allFields.value;
  }
  if (selectedDimension.value) {
    // When adding, filter by selected dimension
    return allFields.value.filter(
      (f) => f.dimension === selectedDimension.value
    );
  }
  return allFields.value;
});

// Get count of dimensions with configured fields
const getConfiguredDimensionsCount = computed(() => {
  const dimensions = new Set(configuredFields.value.map((f) => f.dimension));
  return dimensions.size;
});

// Dimension styling helpers
const getDimensionIconBgClass = (
  color: string
): Record<string, boolean> => ({
  "bg-primary-100 dark:bg-primary-900/30": color === "primary",
  "bg-blue-100 dark:bg-blue-900/30": color === "blue",
  "bg-amber-100 dark:bg-amber-900/30": color === "amber",
  "bg-emerald-100 dark:bg-emerald-900/30": color === "emerald",
  "bg-purple-100 dark:bg-purple-900/30": color === "purple",
  "bg-gray-100 dark:bg-gray-900/30": color === "neutral",
});

const getDimensionIconClass = (color: string): Record<string, boolean> => ({
  "text-primary-600 dark:text-primary-400": color === "primary",
  "text-blue-600 dark:text-blue-400": color === "blue",
  "text-amber-600 dark:text-amber-400": color === "amber",
  "text-emerald-600 dark:text-emerald-400": color === "emerald",
  "text-purple-600 dark:text-purple-400": color === "purple",
  "text-gray-600 dark:text-gray-400": color === "neutral",
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

// Helper: Generate location schema (object with id property)
const generateLocationSchema = (config: EpcListFieldConfig): unknown => {
  const patterns = config.selectedIdentifiers
    .map((id) => getEpcIdentifierById(id))
    .filter(Boolean)
    .map((identifier) => ({
      type: "string",
      pattern: identifier!.pattern,
    }));

  if (patterns.length === 0) {
    return {
      type: "object",
      properties: {
        id: { type: "string", format: "uri" },
      },
      required: ["id"],
    };
  }

  return {
    type: "object",
    properties: {
      id: {
        anyOf: patterns,
      },
    },
    required: ["id"],
  };
};

// Helper: Generate errorDeclaration schema
const generateErrorDeclarationSchema = (selectedReasons: string[]): unknown => {
  const schema: Record<string, unknown> = {
    type: "object",
    properties: {
      declarationTime: {
        type: "string",
        format: "date-time",
      },
    },
    required: ["declarationTime"],
  };

  if (selectedReasons.length > 0) {
    (schema.properties as Record<string, unknown>).reason = {
      type: "string",
      enum: selectedReasons,
    };
  }

  return schema;
};

// Helper: Generate sensorElementList schema
const generateSensorElementListSchema = (): unknown => {
  return {
    type: "array",
    minItems: 1,
    items: {
      type: "object",
      properties: {
        sensorReport: {
          type: "array",
          minItems: 1,
        },
      },
      required: ["sensorReport"],
    },
  };
};

// Computed: Generate JSON Schema
const generatedSchema = computed<GeneratedJsonSchema>(() => {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  configuredFields.value.forEach((field) => {
    // Handle datetime fields (eventTime, recordTime)
    if (field.fieldType === "datetime") {
      properties[field.schemaKey] = {
        type: "string",
        format: "date-time",
      };
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle epcList fields
    else if (
      field.fieldType === "epcList" &&
      field.epcConfig?.selectedIdentifiers.length
    ) {
      properties[field.schemaKey] = generateEpcListSchema(field.epcConfig);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle location fields (readPoint, bizLocation)
    else if (
      field.fieldType === "location" &&
      field.epcConfig?.selectedIdentifiers.length
    ) {
      properties[field.schemaKey] = generateLocationSchema(field.epcConfig);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle errorDeclaration fields
    else if (field.fieldType === "errorDeclaration" && field.selectedValues.length > 0) {
      properties[field.schemaKey] = generateErrorDeclarationSchema(field.selectedValues);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle sensorElement fields
    else if (field.fieldType === "sensorElement") {
      properties[field.schemaKey] = generateSensorElementListSchema();
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
const getFieldDisplayLabel = (field: ProfileFieldConfig): string => {
  if (field.fieldType === "datetime") {
    return "date-time";
  }
  if (field.fieldType === "epcList") {
    const count = field.epcConfig?.selectedIdentifiers.length || 0;
    return `${count} identifier${count !== 1 ? "s" : ""}`;
  }
  if (field.fieldType === "location") {
    const count = field.epcConfig?.selectedIdentifiers.length || 0;
    return `${count} format${count !== 1 ? "s" : ""}`;
  }
  if (field.fieldType === "errorDeclaration") {
    const count = field.selectedValues.length;
    return `${count} reason${count !== 1 ? "s" : ""}`;
  }
  if (field.fieldType === "sensorElement") {
    return "sensor data";
  }
  const count = field.selectedValues.length;
  return `${count} value${count !== 1 ? "s" : ""}`;
};

const getFieldDisplayValues = (field: ProfileFieldConfig): string => {
  if (field.fieldType === "datetime") {
    return "ISO 8601 format";
  }
  if (field.fieldType === "epcList") {
    return getEpcIdentifierLabels(field);
  }
  if (field.fieldType === "location") {
    return getEpcIdentifierLabels(field);
  }
  if (field.fieldType === "errorDeclaration") {
    return field.selectedValues.map((v) => getValueLabel(field, v)).join(", ");
  }
  if (field.fieldType === "sensorElement") {
    return "sensorMetadata + sensorReport";
  }
  return field.selectedValues.map((v) => getValueLabel(field, v)).join(", ");
};

// Modal handlers
const openAddModalForDimension = (dimensionId: EpcisDimension) => {
  selectedDimension.value = dimensionId;
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
  selectedDimension.value = null;
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
