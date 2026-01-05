<template>
  <div class="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-2 justify-end">
      <UButton
        color="primary"
        variant="outline"
        icon="i-heroicons-cloud-arrow-down"
        @click="isGitHubSelectorOpen = true"
      >
        Import from GitHub
      </UButton>

      <UButton
        v-if="configuredFields.length > 0 || importedSchemas.length > 0"
        color="neutral"
        variant="soft"
        @click="resetAll"
      >
        Reset All
      </UButton>

      <UButton
        color="secondary"
        :disabled="
          configuredFields.length === 0 && importedSchemas.length === 0
        "
        @click="downloadSchema"
      >
        Download Schema
      </UButton>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <!-- Left Panel: Dimension-based Field Accordions -->
      <div class="space-y-3">
        <!-- Imported Schemas Section using UAccordion -->
        <UAccordion
          v-if="importedSchemas.length > 0"
          v-model="expandedImportedSchemas"
          :items="importedSchemasAccordionItems"
          type="multiple"
          :ui="{
            item: 'mb-4 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-800/30 shadow-sm',
            header: 'flex',
            trigger:
              'group flex items-center gap-3 w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            content:
              'border-t border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30',
            body: 'p-4',
          }"
        >
          <template #leading>
            <div
              class="p-2 rounded-lg shrink-0 bg-gray-100 dark:bg-gray-900/30"
            >
              <UIcon
                name="i-heroicons-cloud-arrow-down"
                class="w-5 h-5 text-gray-600 dark:text-gray-400"
              />
            </div>
          </template>

          <template #default>
            <div class="flex-1 text-left min-w-0">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                Imported Schemas
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                From OpenEPCIS GitHub repository
              </p>
            </div>
          </template>

          <template #trailing>
            <UBadge color="neutral" variant="soft" size="sm" class="shrink-0">
              {{ importedSchemas.length }} imported
            </UBadge>
          </template>

          <template #body>
            <div class="space-y-3 border-l-4 pl-4 -ml-4 border-gray-400">
              <div class="space-y-2">
                <div
                  v-for="schema in importedSchemas"
                  :key="schema.id"
                  class="group flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm"
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span
                        class="font-medium text-sm text-gray-900 dark:text-gray-100"
                      >
                        {{ schema.name }}
                      </span>
                      <UBadge
                        size="xs"
                        :color="schema.mergeMode === 'ref' ? 'blue' : 'amber'"
                        variant="soft"
                      >
                        {{ schema.mergeMode === "ref" ? "$ref" : "inline" }}
                      </UBadge>
                      <UBadge
                        v-if="schema.isRequired"
                        size="xs"
                        color="error"
                        variant="soft"
                      >
                        Required
                      </UBadge>
                    </div>
                    <p
                      class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate"
                    >
                      {{ schema.filename }}
                    </p>
                  </div>
                  <UButton
                    variant="ghost"
                    size="xs"
                    color="error"
                    icon="i-heroicons-trash"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removeImportedSchema(schema.id)"
                  />
                </div>
              </div>
            </div>
          </template>
        </UAccordion>

        <!-- Dimension Accordions using Nuxt UI -->
        <UAccordion
          v-model="expandedDimensions"
          :items="accordionItems"
          type="multiple"
          :ui="{
            item: 'mb-4 rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm',
            header: 'flex',
            trigger:
              'group flex items-center gap-3 w-full p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            content:
              'border-t border-gray-200 dark:border-gray-700/50 bg-black/5 dark:bg-black/20',
            body: 'p-4',
          }"
        >
          <template #leading="{ item }" :ui="{ root: 'bg-green-500' }">
            <div
              class="p-2 rounded-lg shrink-0"
              :class="getDimensionIconBgClass(item.color)"
            >
              <UIcon
                :name="item.icon"
                class="w-5 h-5"
                :class="getDimensionIconClass(item.color)"
              />
            </div>
          </template>

          <template #default="{ item }">
            <div class="flex-1 text-left min-w-0">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ item.label }}
              </h3>

              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ item.description }}
              </p>
            </div>
          </template>

          <template #trailing="{ item }">
            <UBadge
              v-if="
                getFieldsByDimension(item.value as EpcisDimension).length > 0
              "
              :color="item.color"
              variant="soft"
              size="sm"
              class="shrink-0"
            >
              {{ getFieldsByDimension(item.value as EpcisDimension).length }}
              configured
            </UBadge>
          </template>

          <template #body="{ item }">
            <div
              class="space-y-3 border-l-4 pl-4 -ml-4"
              :class="getDimensionBorderClass(item.color)"
            >
              <!-- Configured Fields for this Dimension -->
              <div
                v-if="
                  getFieldsByDimension(item.value as EpcisDimension).length > 0
                "
                class="space-y-2"
              >
                <div
                  v-for="field in getFieldsByDimension(
                    item.value as EpcisDimension
                  )"
                  :key="field.id"
                  class="group flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm"
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
                class="text-center py-6 text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-700"
              >
                <UIcon
                  name="i-heroicons-inbox"
                  class="w-8 h-8 mx-auto mb-2 opacity-50"
                />
                <p class="text-sm">No fields configured</p>
              </div>

              <!-- Add Field Button for this Dimension -->
              <UButton
                v-if="
                  getAvailableFieldsByDimension(item.value as EpcisDimension)
                    .length > 0
                "
                color="neutral"
                variant="soft"
                size="sm"
                class="w-full"
                icon="i-heroicons-plus"
                @click="openAddModalForDimension(item.value as EpcisDimension)"
              >
                Add {{ item.label }} Field
              </UButton>

              <!-- All fields configured message -->
              <p
                v-else-if="
                  allFields.filter((f) => f.dimension === item.value).length > 0
                "
                class="text-xs text-gray-400 dark:text-gray-500 text-center py-2"
              >
                All {{ item.label.toLowerCase() }} fields configured
              </p>
            </div>
          </template>
        </UAccordion>

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
          title="Generated Profile"
          :placeholder="
            configuredFields.length > 0 || importedSchemas.length > 0
              ? 'Your JSON Schema profile'
              : 'Add fields or import schemas to generate...'
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

    <!-- GitHub Schema Selector Modal -->
    <GitHubSchemaSelector
      v-model:open="isGitHubSelectorOpen"
      :already-imported-ids="importedSchemaIds"
      @import="handleSchemaImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type {
  ProfileFieldConfig,
  GeneratedJsonSchema,
  EpcListFieldConfig,
  EpcisDimension,
} from "~/types/profile";
import type { ImportedSchema } from "~/types/github-schema";
import { getEpcisFields } from "~/data/epcis-fields";
import { useGitHubEpcIdentifiers } from "~/composables/useGitHubEpcIdentifiers";
import { epcisDimensions } from "~/data/epcis-dimensions";

// EPC Identifiers composable
const { fetchIdentifiers, getEpcIdentifierById } = useGitHubEpcIdentifiers();

// Fetch EPC identifiers on mount
onMounted(async () => {
  await fetchIdentifiers();
});

// All available EPCIS fields (loaded from external file)
const allFields = ref<ProfileFieldConfig[]>(getEpcisFields());

// Configured fields (fields that user has added)
const configuredFields = ref<ProfileFieldConfig[]>([]);

// Imported schemas from GitHub
const importedSchemas = ref<ImportedSchema[]>([]);

// Modal state
const isModalOpen = ref(false);
const editingField = ref<ProfileFieldConfig | null>(null);
const selectedDimension = ref<EpcisDimension | null>(null);

// GitHub Schema Selector modal state
const isGitHubSelectorOpen = ref(false);

// Computed: IDs of already imported schemas
const importedSchemaIds = computed(() => {
  return importedSchemas.value.map((s) => s.id);
});

// Accordion state - all dimensions collapsed by default
const expandedDimensions = ref<string[]>([]);

// Imported schemas accordion state - expanded by default when schemas exist
const expandedImportedSchemas = ref<string[]>(["imported-schemas"]);

// Imported schemas accordion items
const importedSchemasAccordionItems = computed(() => [
  {
    value: "imported-schemas",
    label: "Imported Schemas",
    description: "From OpenEPCIS GitHub repository",
  },
]);

// Accordion items computed from dimensions
const accordionItems = computed(() =>
  epcisDimensions.map((dimension) => ({
    value: dimension.id,
    label: dimension.label,
    description: dimension.description,
    icon: dimension.icon,
    color: dimension.color,
    class: getDimensionAccordionBgClass(dimension.color),
  }))
);

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
const getDimensionIconBgClass = (color: string): Record<string, boolean> => ({
  "bg-primary-100 dark:bg-primary-900/30": color === "primary",
  "bg-blue-100 dark:bg-blue-900/30": color === "blue",
  "bg-amber-100 dark:bg-amber-900/30": color === "amber",
  "bg-emerald-100 dark:bg-emerald-900/30": color === "emerald",
  "bg-yellow-300 dark:bg-yellow-600/30": color === "yellow",
  "bg-purple-100 dark:bg-purple-900/30": color === "purple",
  "bg-gray-100 dark:bg-gray-900/30": color === "neutral",
  "bg-red-100 dark:bg-red-900/30": color === "red",
  "bg-cyan-300 dark:bg-cyan-900/30": color === "cyan",
});

const getDimensionIconClass = (color: string): Record<string, boolean> => ({
  "text-primary-600 dark:text-primary-400": color === "primary",
  "text-blue-600 dark:text-blue-400": color === "blue",
  "text-amber-600 dark:text-amber-400": color === "amber",
  "text-emerald-600 dark:text-emerald-400": color === "emerald",
  "text-yellow-600 dark:text-yellow-400": color === "yellow",
  "text-purple-600 dark:text-purple-400": color === "purple",
  "text-gray-600 dark:text-gray-400": color === "neutral",
  "text-red-600 dark:text-red-400": color === "red",
  "text-cyan-600 dark:text-cyan-400": color === "cyan",
});

const getDimensionBorderClass = (color: string): Record<string, boolean> => ({
  "border-primary-500": color === "primary",
  "border-blue-500": color === "blue",
  "border-amber-500": color === "amber",
  "border-emerald-500": color === "emerald",
  "border-yellow-300": color === "yellow",
  "border-purple-500": color === "purple",
  "border-gray-400": color === "neutral",
  "border-red-500": color === "red",
  "border-cyan-500": color === "cyan",
});

const getDimensionAccordionBgClass = (color: string): string => {
  const classes: Record<string, string> = {
    primary: "bg-primary-50 dark:bg-primary-900/20",
    blue: "bg-blue-50 dark:bg-blue-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20",
    purple: "bg-purple-50 dark:bg-purple-900/20",
    neutral: "bg-gray-50 dark:bg-gray-800/20",
    red: "bg-red-50 dark:bg-red-900/20",
    cyan: "bg-cyan-50 dark:bg-cyan-900/20",
  };
  return classes[color] || "";
};

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

// Helper: Generate uriArray schema (for correctiveEventIDs)
const generateUriArraySchema = (): unknown => {
  return {
    type: "array",
    items: {
      type: "string",
      format: "uri",
    },
  };
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

// Helper: Generate bizTransactionList schema with type validation
const generateBizTransactionListSchema = (selectedTypes: string[]): unknown => {
  const typeSchema =
    selectedTypes.length > 0
      ? { type: "string", enum: [...selectedTypes] }
      : { type: "string" };

  return {
    type: "array",
    items: {
      type: "object",
      properties: {
        type: typeSchema,
        bizTransaction: { type: "string", format: "uri" },
      },
      required: ["type", "bizTransaction"],
    },
  };
};

// Helper: Generate sourceList/destinationList schema with type validation
const generateSourceDestListSchema = (
  selectedTypes: string[],
  fieldKey: "source" | "destination"
): unknown => {
  const typeSchema =
    selectedTypes.length > 0
      ? { type: "string", enum: [...selectedTypes] }
      : { type: "string" };

  return {
    type: "array",
    items: {
      type: "object",
      properties: {
        type: typeSchema,
        [fieldKey]: { type: "string", format: "uri" },
      },
      required: ["type", fieldKey],
    },
  };
};

// Helper: Generate persistentDisposition schema with set/unset arrays
const generatePersistentDispositionSchema = (
  selectedValues: string[]
): unknown => {
  const dispositionSchema =
    selectedValues.length > 0
      ? { type: "string", enum: [...selectedValues] }
      : { type: "string" };

  return {
    type: "object",
    properties: {
      set: {
        type: "array",
        items: dispositionSchema,
      },
      unset: {
        type: "array",
        items: dispositionSchema,
      },
    },
  };
};

// Helper: Generate certificationInfo schema
const generateCertificationInfoSchema = (): unknown => {
  return {
    type: "object",
    properties: {
      certificationStandard: { type: "string" },
      certificationAgency: { type: "string" },
      certificationValue: { type: "string" },
      certificationIdentification: { type: "string" },
    },
  };
};

// Computed: Generate JSON Schema
const generatedSchema = computed<GeneratedJsonSchema>(() => {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  // Collect error dimension fields separately to build nested errorDeclaration object
  const errorFields = configuredFields.value.filter(
    (f) => f.dimension === "error"
  );
  const nonErrorFields = configuredFields.value.filter(
    (f) => f.dimension !== "error"
  );

  // Process non-error fields
  nonErrorFields.forEach((field) => {
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
    // Handle uri fields (eventID)
    else if (field.fieldType === "uri") {
      properties[field.schemaKey] = {
        type: "string",
        format: "uri",
      };
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle timezone fields (eventTimeZoneOffset)
    else if (field.fieldType === "timezone") {
      properties[field.schemaKey] = {
        type: "string",
        pattern: "^([+]|[-])((0[0-9]|1[0-3]):([0-5][0-9])|14:00)$",
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
    // Handle sensorElement fields
    else if (field.fieldType === "sensorElement") {
      properties[field.schemaKey] = generateSensorElementListSchema();
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle bizTransactionList fields
    else if (field.fieldType === "bizTransactionList") {
      properties[field.schemaKey] = generateBizTransactionListSchema(
        field.selectedValues
      );
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle sourceList/destinationList fields
    else if (field.fieldType === "sourceDestList") {
      const fieldKey =
        field.schemaKey === "sourceList" ? "source" : "destination";
      properties[field.schemaKey] = generateSourceDestListSchema(
        field.selectedValues,
        fieldKey
      );
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle persistentDisposition fields
    else if (field.fieldType === "persistentDisposition") {
      properties[field.schemaKey] = generatePersistentDispositionSchema(
        field.selectedValues
      );
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle certificationInfo fields
    else if (field.fieldType === "certificationInfo") {
      properties[field.schemaKey] = generateCertificationInfoSchema();
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

  // Build errorDeclaration object if any error fields are configured
  if (errorFields.length > 0) {
    const errorDeclarationProps: Record<string, unknown> = {};
    const errorDeclarationRequired: string[] = [];

    errorFields.forEach((field) => {
      // Extract the field name from schemaKey (e.g., "errorDeclaration.declarationTime" -> "declarationTime")
      const fieldName = field.schemaKey.split(".").pop() || field.schemaKey;

      if (field.fieldType === "datetime") {
        errorDeclarationProps[fieldName] = {
          type: "string",
          format: "date-time",
        };
        if (field.isRequired) {
          errorDeclarationRequired.push(fieldName);
        }
      } else if (field.fieldType === "uriArray") {
        errorDeclarationProps[fieldName] = generateUriArraySchema();
        if (field.isRequired) {
          errorDeclarationRequired.push(fieldName);
        }
      } else if (field.fieldType === "enumOrUri") {
        // For reason field: anyOf with enum values OR custom URI
        const anyOfOptions: unknown[] = [
          {
            type: "string",
            format: "uri",
          },
        ];
        if (field.selectedValues.length > 0) {
          anyOfOptions.push({
            type: "string",
            enum: [...field.selectedValues],
          });
        }
        errorDeclarationProps[fieldName] = {
          anyOf: anyOfOptions,
        };
        if (field.isRequired) {
          errorDeclarationRequired.push(fieldName);
        }
      } else if (field.selectedValues.length > 0) {
        // For enum fields
        errorDeclarationProps[fieldName] = {
          type: "string",
          enum: [...field.selectedValues],
        };
        if (field.isRequired) {
          errorDeclarationRequired.push(fieldName);
        }
      }
    });

    if (Object.keys(errorDeclarationProps).length > 0) {
      properties["errorDeclaration"] = {
        type: "object",
        properties: errorDeclarationProps,
        ...(errorDeclarationRequired.length > 0 && {
          required: errorDeclarationRequired,
        }),
      };
    }
  }

  // Build allOf array
  const allOfItems: Array<Record<string, unknown>> = [
    {
      $ref: "https://ref.gs1.org/standards/epcis/epcis-json-schema.json",
    },
  ];

  // Add imported schemas with $ref mode
  importedSchemas.value
    .filter((s) => s.mergeMode === "ref")
    .forEach((s) => {
      allOfItems.push({ $ref: s.url });

      // If required, add a separate required constraint based on schema properties
      if (s.isRequired && s.content && typeof s.content === "object") {
        const content = s.content as Record<string, unknown>;
        const propKeys: string[] = [];

        // Get property keys from top-level properties
        if (content.properties && typeof content.properties === "object") {
          propKeys.push(...Object.keys(content.properties as object));
        }

        // Get property keys from $defs (for definition-based schemas)
        if (content.$defs && typeof content.$defs === "object") {
          Object.values(content.$defs as Record<string, unknown>).forEach(
            (def) => {
              if (
                def &&
                typeof def === "object" &&
                (def as Record<string, unknown>).properties
              ) {
                propKeys.push(
                  ...Object.keys(
                    (def as Record<string, unknown>).properties as object
                  )
                );
              }
            }
          );
        }

        // Add required constraint if we found properties
        if (propKeys.length > 0) {
          allOfItems.push({ required: propKeys });
        }
      }
    });

  // Collect $defs from inline imports
  const allDefs: Record<string, unknown> = {};

  // Add imported schemas with inline mode (merge properties and $defs)
  importedSchemas.value
    .filter((s) => s.mergeMode === "inline")
    .forEach((s) => {
      if (s.content && typeof s.content === "object") {
        const content = s.content as Record<string, unknown>;

        // Merge top-level properties if present
        if (content.properties && typeof content.properties === "object") {
          Object.assign(properties, content.properties);

          // If required, add all property keys to required array
          if (s.isRequired) {
            Object.keys(content.properties as object).forEach((key) => {
              if (!required.includes(key)) {
                required.push(key);
              }
            });
          }
        }

        // Merge $defs if present
        if (content.$defs && typeof content.$defs === "object") {
          Object.assign(allDefs, content.$defs);

          // If required, also add properties from $defs to required array
          if (s.isRequired) {
            Object.values(content.$defs as Record<string, unknown>).forEach(
              (def) => {
                if (
                  def &&
                  typeof def === "object" &&
                  (def as Record<string, unknown>).properties
                ) {
                  Object.keys(
                    (def as Record<string, unknown>).properties as object
                  ).forEach((key) => {
                    if (!required.includes(key)) {
                      required.push(key);
                    }
                  });
                }
              }
            );
          }
        }
      }
    });

  // Add custom dimension-based properties (if any)
  if (Object.keys(properties).length > 0 || required.length > 0) {
    allOfItems.push({
      type: "object",
      properties: Object.keys(properties).length > 0 ? properties : undefined,
      required: required.length > 0 ? required : undefined,
      additionalProperties: true,
    });
  }

  const schema: GeneratedJsonSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    ...(Object.keys(allDefs).length > 0 && { $defs: allDefs }),
    allOf: allOfItems,
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
  if (
    configuredFields.value.length === 0 &&
    importedSchemas.value.length === 0
  ) {
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
  if (field.fieldType === "uri") {
    return "URI";
  }
  if (field.fieldType === "timezone") {
    return "timezone";
  }
  if (field.fieldType === "epcList") {
    const count = field.epcConfig?.selectedIdentifiers.length || 0;
    return `${count} identifier${count !== 1 ? "s" : ""}`;
  }
  if (field.fieldType === "location") {
    const count = field.epcConfig?.selectedIdentifiers.length || 0;
    return `${count} format${count !== 1 ? "s" : ""}`;
  }
  if (field.fieldType === "sensorElement") {
    return "sensor data";
  }
  if (field.fieldType === "uriArray") {
    return "URI array";
  }
  if (field.fieldType === "enumOrUri") {
    const count = field.selectedValues.length;
    return count > 0
      ? `${count} value${count !== 1 ? "s" : ""} + URI`
      : "any URI";
  }
  if (field.fieldType === "bizTransactionList") {
    const count = field.selectedValues.length;
    return count > 0 ? `${count} type${count !== 1 ? "s" : ""}` : "all types";
  }
  if (field.fieldType === "sourceDestList") {
    const count = field.selectedValues.length;
    return count > 0 ? `${count} type${count !== 1 ? "s" : ""}` : "all types";
  }
  if (field.fieldType === "persistentDisposition") {
    const count = field.selectedValues.length;
    return count > 0
      ? `${count} disposition${count !== 1 ? "s" : ""}`
      : "all dispositions";
  }
  if (field.fieldType === "certificationInfo") {
    return "certification";
  }
  const count = field.selectedValues.length;
  return `${count} value${count !== 1 ? "s" : ""}`;
};

const getFieldDisplayValues = (field: ProfileFieldConfig): string => {
  if (field.fieldType === "datetime") {
    return "ISO 8601 format";
  }
  if (field.fieldType === "uri") {
    return "urn:uuid:... or ni:///sha-256;...";
  }
  if (field.fieldType === "timezone") {
    return "+HH:MM or -HH:MM format";
  }
  if (field.fieldType === "epcList") {
    return getEpcIdentifierLabels(field);
  }
  if (field.fieldType === "location") {
    return getEpcIdentifierLabels(field);
  }
  if (field.fieldType === "sensorElement") {
    return "sensorMetadata + sensorReport";
  }
  if (field.fieldType === "uriArray") {
    return "Array of event ID URIs";
  }
  if (field.fieldType === "enumOrUri") {
    const values = field.selectedValues
      .map((v) => getValueLabel(field, v))
      .join(", ");
    return values ? `${values} or custom URI` : "Any valid URI";
  }
  if (field.fieldType === "bizTransactionList") {
    const values = field.selectedValues
      .map((v) => getValueLabel(field, v))
      .join(", ");
    return values || "Any business transaction type";
  }
  if (field.fieldType === "sourceDestList") {
    const values = field.selectedValues
      .map((v) => getValueLabel(field, v))
      .join(", ");
    return values || "Any source/destination type";
  }
  if (field.fieldType === "persistentDisposition") {
    const values = field.selectedValues
      .map((v) => getValueLabel(field, v))
      .join(", ");
    return values || "Any disposition value";
  }
  if (field.fieldType === "certificationInfo") {
    return "Certification standard, agency, value, ID";
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

// GitHub schema import handlers
const handleSchemaImport = (schemas: ImportedSchema[]) => {
  // Filter out already imported schemas
  const newSchemas = schemas.filter(
    (s) => !importedSchemaIds.value.includes(s.id)
  );
  importedSchemas.value.push(...newSchemas);
};

const removeImportedSchema = (schemaId: string) => {
  importedSchemas.value = importedSchemas.value.filter(
    (s) => s.id !== schemaId
  );
};

const resetAll = () => {
  configuredFields.value = [];
  importedSchemas.value = [];
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
