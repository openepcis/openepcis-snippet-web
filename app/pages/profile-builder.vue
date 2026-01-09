<template>
  <div class="min-h-screen bg-background text-foreground p-4 md:p-6 space-y-6">
    <!-- Hidden file input for import -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      class="hidden"
      @change="importProfile"
    />

    <!-- Action Buttons - Full width bar -->
    <div class="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
      <!-- Profile Name Input -->
      <div class="flex-shrink-0">
        <UInput
          v-model="profileName"
          placeholder="Profile name (optional)"
          class="w-48"
          size="sm"
        />
      </div>

      <!-- Action Buttons - Always right aligned -->
      <div class="flex flex-wrap gap-2 sm:ml-auto">
        <UButton
          color="secondary"
          variant="outline"
          icon="i-heroicons-arrow-up-tray"
          size="sm"
          @click="triggerImport"
        >
          Import Profile
        </UButton>

        <UButton
          color="secondary"
          variant="outline"
          icon="i-heroicons-arrow-down-tray"
          size="sm"
          :disabled="configuredFields.length === 0 && importedSchemas.length === 0"
          @click="exportProfile"
        >
          Export Profile
        </UButton>

        <UButton
          color="primary"
          variant="outline"
          icon="i-heroicons-cloud-arrow-down"
          size="sm"
          @click="isGitHubSelectorOpen = true"
        >
          Import from GitHub
        </UButton>

        <UButton
          v-if="configuredFields.length > 0 || importedSchemas.length > 0"
          color="neutral"
          variant="soft"
          size="sm"
          @click="resetAll"
        >
          Reset All
        </UButton>
      </div>
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
      <div class="lg:sticky lg:top-24 lg:self-start space-y-3">
        <!-- Out of Sync Warning -->
        <Transition name="fade">
          <div
            v-if="isEditorOutOfSync"
            class="flex items-start gap-3 p-4 rounded-xl border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
          >
            <div class="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 bg-amber-100 dark:bg-amber-900/50">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Profile Out of Sync
              </h4>
              <p class="text-xs text-amber-700 dark:text-amber-300 mt-1">
                The JSON profile has been manually edited and differs from the configured attributes on the left.
              </p>
              <div class="flex flex-wrap gap-2 mt-3">
                <UButton
                  size="xs"
                  color="amber"
                  variant="soft"
                  icon="i-heroicons-arrow-path"
                  @click="resetEditorToGenerated"
                >
                  Reset to Generated
                </UButton>
              </div>
            </div>
          </div>
        </Transition>

        <JsonEditor
          v-model="editorValue"
          title="Generated Profile"
          download-file-name="epcis-profile.json"
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
  LocationConfig,
  BizTransactionListConfig,
  SourceDestListConfig,
  PersistentDispositionConfig,
  QuantityListConfig,
  UriArrayConfig,
  SensorElementConfig,
  ProfileExport,
} from "~/types/profile";
import type { ImportedSchema } from "~/types/github-schema";
import { getEpcisFields } from "~/data/epcis-fields";
import { useGitHubEpcIdentifiers } from "~/composables/useGitHubEpcIdentifiers";
import { epcisDimensions } from "~/data/epcis-dimensions";

// EPC Identifiers composable
const {
  fetchIdentifiers,
  getEpcIdentifierById,
  fetchClassLevelIdentifiers,
  getClassLevelIdentifierById,
} = useGitHubEpcIdentifiers();

// Fetch EPC identifiers on mount (both instance-level and class-level)
onMounted(async () => {
  await Promise.all([fetchIdentifiers(), fetchClassLevelIdentifiers()]);
});

// All available EPCIS fields (loaded from external file)
const allFields = ref<ProfileFieldConfig[]>(getEpcisFields());

// Configured fields (fields that user has added)
const configuredFields = ref<ProfileFieldConfig[]>([]);

// Imported schemas from GitHub
const importedSchemas = ref<ImportedSchema[]>([]);

// Profile name for export
const profileName = ref<string>("");

// File input ref for import
const fileInputRef = ref<HTMLInputElement | null>(null);

// Toast notification
const toast = useToast();

// Editor value for manual editing (refs defined here, sync logic after generatedSchemaJson)
const editorValue = ref<string>("");
const isManuallyEdited = ref(false);

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
  // Build base schema
  let schema: Record<string, unknown>;

  // Handle "uri" mode - any valid URI
  if (config.mode === "uri") {
    schema = {
      type: "array",
      items: {
        type: "string",
        format: "uri",
      },
    };
  }
  // Handle "custom" mode - user-provided regex pattern
  else if (config.mode === "custom" && config.customPattern) {
    schema = {
      type: "array",
      items: {
        type: "string",
        pattern: config.customPattern,
      },
    };
  }
  // Handle "standard" mode - predefined identifiers
  else {
    const patterns = config.selectedIdentifiers
      .map((id) => getEpcIdentifierById(id))
      .filter(Boolean)
      .map((identifier) => ({
        type: "string",
        pattern: identifier!.pattern,
      }));

    if (patterns.length === 0) {
      schema = {
        type: "array",
        items: { type: "string" },
      };
    } else if (patterns.length === 1) {
      schema = {
        type: "array",
        items: patterns[0],
      };
    } else {
      schema = {
        type: "array",
        items: {
          anyOf: patterns,
        },
      };
    }
  }

  // Add minItems/maxItems if configured
  if (config.minItems !== undefined) {
    schema.minItems = config.minItems;
  }
  if (config.maxItems !== undefined) {
    schema.maxItems = config.maxItems;
  }

  return schema;
};

// Helper: Generate quantityList schema with quantityElement objects
// Per EPCIS schema: { epcClass: uri, quantity?: number, uom?: string }
// Uses class-level identifiers (urn:epc:class: / urn:epc:idpat:) instead of instance-level
const generateQuantityListSchema = (config: QuantityListConfig): unknown => {
  // Build epcClass schema based on mode
  let epcClassSchema: unknown;
  const mode = config.epcClassMode || "standard";

  if (mode === "uri") {
    // URI mode - accept any valid URI
    epcClassSchema = {
      type: "string",
      pattern: "^[a-z][a-z0-9+.-]*:.*$",
    };
  } else if (mode === "custom" && config.epcClassCustomPattern) {
    // Custom mode - use provided regex pattern
    epcClassSchema = {
      type: "string",
      pattern: config.epcClassCustomPattern,
    };
  } else {
    // Standard mode - use class-level identifiers from GitHub
    const patterns = config.selectedIdentifiers
      .map((id) => getClassLevelIdentifierById(id))
      .filter(Boolean)
      .map((identifier) => ({
        type: "string",
        pattern: identifier!.pattern,
      }));

    if (patterns.length === 0) {
      epcClassSchema = { type: "string" };
    } else if (patterns.length === 1) {
      epcClassSchema = patterns[0];
    } else {
      epcClassSchema = { anyOf: patterns };
    }
  }

  // Build quantity schema
  const quantitySchema: Record<string, unknown> = { type: "number" };
  if (config.quantityMin !== undefined) {
    quantitySchema.minimum = config.quantityMin;
  }
  if (config.quantityMax !== undefined) {
    quantitySchema.maximum = config.quantityMax;
  }

  // Build uom schema based on mode
  let uomSchema: unknown;
  if (config.uomMode === "standard" && config.uomSelectedValues && config.uomSelectedValues.length > 0) {
    // Standard mode - enum of selected values
    uomSchema = {
      type: "string",
      enum: config.uomSelectedValues,
    };
  } else if (config.uomMode === "custom" && config.uomCustomPattern) {
    // Custom mode - regex pattern
    uomSchema = {
      type: "string",
      pattern: config.uomCustomPattern,
    };
  } else {
    // Default - any string
    uomSchema = { type: "string" };
  }

  // Build required array
  const required: string[] = ["epcClass"];
  if (config.quantityRequired) {
    required.push("quantity");
  }
  if (config.uomRequired) {
    required.push("uom");
  }

  const schema: Record<string, unknown> = {
    type: "array",
    items: {
      type: "object",
      properties: {
        epcClass: epcClassSchema,
        quantity: quantitySchema,
        uom: uomSchema,
      },
      required,
    },
  };

  // Add arrayMinItems/arrayMaxItems if configured
  if (config.arrayMinItems !== undefined) {
    schema.minItems = config.arrayMinItems;
  }
  if (config.arrayMaxItems !== undefined) {
    schema.maxItems = config.arrayMaxItems;
  }

  return schema;
};

// Helper: Generate location schema (object with id property)
// Supports both SGLN mode (with selected identifiers) and Manual URI mode (with custom regex)
const generateLocationSchema = (config: LocationConfig): unknown => {
  const patterns: Array<{ type: string; pattern: string }> = [];

  if (config.mode === "sgln") {
    // Add SGLN patterns (can have multiple: URN + Digital Link)
    config.selectedIdentifiers
      .map((id) => getEpcIdentifierById(id))
      .filter(Boolean)
      .forEach((identifier) => {
        patterns.push({ type: "string", pattern: identifier!.pattern });
      });
  } else if (config.mode === "manual" && config.manualUriPattern) {
    // Single manual URI pattern
    patterns.push({ type: "string", pattern: config.manualUriPattern });
  }

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
      id: patterns.length === 1 ? patterns[0] : { anyOf: patterns },
    },
    required: ["id"],
  };
};

// Helper: Generate uriArray schema (for correctiveEventIDs)
const generateUriArraySchema = (config?: UriArrayConfig): unknown => {
  let schema: Record<string, unknown>;

  // Custom pattern mode
  if (config?.mode === "custom" && config.customPattern) {
    schema = {
      type: "array",
      items: {
        type: "string",
        pattern: config.customPattern,
      },
    };
  } else {
    // Default: any URI format
    schema = {
      type: "array",
      items: {
        type: "string",
        format: "uri",
      },
    };
  }

  // Add minItems/maxItems if configured
  if (config?.minItems !== undefined) {
    schema.minItems = config.minItems;
  }
  if (config?.maxItems !== undefined) {
    schema.maxItems = config.maxItems;
  }

  return schema;
};

// Helper: Generate sensorElementList schema
const generateSensorElementListSchema = (config?: SensorElementConfig): unknown => {
  const schema: Record<string, unknown> = {
    type: "array",
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

  // Add minItems/maxItems if configured, otherwise default to minItems: 1
  if (config?.minItems !== undefined) {
    schema.minItems = config.minItems;
  } else {
    schema.minItems = 1; // Default for sensor element list
  }
  if (config?.maxItems !== undefined) {
    schema.maxItems = config.maxItems;
  }

  return schema;
};

// Helper: Generate bizTransactionList schema with type and value validation
const generateBizTransactionListSchema = (config: BizTransactionListConfig): unknown => {
  // Build type schema based on typeMode
  let typeSchema: Record<string, unknown>;
  if (config.typeMode === "standard" && config.selectedTypes.length > 0) {
    typeSchema = { type: "string", enum: [...config.selectedTypes] };
  } else if (config.typeMode === "custom" && config.customTypePattern) {
    typeSchema = { type: "string", pattern: config.customTypePattern };
  } else {
    typeSchema = { type: "string" };
  }

  // Build value schema based on valueMode
  let valueSchema: Record<string, unknown>;
  if (config.valueMode === "custom" && config.customValuePattern) {
    valueSchema = { type: "string", pattern: config.customValuePattern };
  } else {
    valueSchema = { type: "string", format: "uri" };
  }

  const schema: Record<string, unknown> = {
    type: "array",
    items: {
      type: "object",
      properties: {
        type: typeSchema,
        bizTransaction: valueSchema,
      },
      required: ["type", "bizTransaction"],
    },
  };

  // Add minItems/maxItems if configured
  if (config.minItems !== undefined) {
    schema.minItems = config.minItems;
  }
  if (config.maxItems !== undefined) {
    schema.maxItems = config.maxItems;
  }

  return schema;
};

// Helper: Generate sourceList/destinationList schema with type validation
const generateSourceDestListSchema = (
  config: SourceDestListConfig,
  fieldKey: "source" | "destination"
): unknown => {
  // Build type schema based on typeMode
  let typeSchema: Record<string, unknown>;
  if (config.typeMode === "standard" && config.selectedTypes.length > 0) {
    typeSchema = { type: "string", enum: [...config.selectedTypes] };
  } else if (config.typeMode === "custom" && config.customTypePattern) {
    typeSchema = { type: "string", pattern: config.customTypePattern };
  } else {
    typeSchema = { type: "string" };
  }

  // Build value schema based on valueMode
  let valueSchema: Record<string, unknown>;
  if (config.valueMode === "custom" && config.customValuePattern) {
    valueSchema = { type: "string", pattern: config.customValuePattern };
  } else {
    valueSchema = { type: "string", format: "uri" };
  }

  const schema: Record<string, unknown> = {
    type: "array",
    items: {
      type: "object",
      properties: {
        type: typeSchema,
        [fieldKey]: valueSchema,
      },
      required: ["type", fieldKey],
    },
  };

  // Add minItems/maxItems if configured
  if (config.minItems !== undefined) {
    schema.minItems = config.minItems;
  }
  if (config.maxItems !== undefined) {
    schema.maxItems = config.maxItems;
  }

  return schema;
};

// Helper: Generate persistentDisposition schema with set/unset arrays
const generatePersistentDispositionSchema = (
  config: PersistentDispositionConfig
): unknown => {
  // Build set schema
  let setSchema: Record<string, unknown>;
  if (config.setMode === "standard" && config.setSelectedValues.length > 0) {
    setSchema = { type: "string", enum: [...config.setSelectedValues] };
  } else if (config.setMode === "custom" && config.setCustomPattern) {
    setSchema = { type: "string", pattern: config.setCustomPattern };
  } else {
    setSchema = { type: "string" };
  }

  // Build unset schema
  let unsetSchema: Record<string, unknown>;
  if (config.unsetMode === "standard" && config.unsetSelectedValues.length > 0) {
    unsetSchema = { type: "string", enum: [...config.unsetSelectedValues] };
  } else if (config.unsetMode === "custom" && config.unsetCustomPattern) {
    unsetSchema = { type: "string", pattern: config.unsetCustomPattern };
  } else {
    unsetSchema = { type: "string" };
  }

  // Build set array schema with minItems/maxItems
  const setArraySchema: Record<string, unknown> = {
    type: "array",
    items: setSchema,
  };
  if (config.setMinItems !== undefined) {
    setArraySchema.minItems = config.setMinItems;
  }
  if (config.setMaxItems !== undefined) {
    setArraySchema.maxItems = config.setMaxItems;
  }

  // Build unset array schema with minItems/maxItems
  const unsetArraySchema: Record<string, unknown> = {
    type: "array",
    items: unsetSchema,
  };
  if (config.unsetMinItems !== undefined) {
    unsetArraySchema.minItems = config.unsetMinItems;
  }
  if (config.unsetMaxItems !== undefined) {
    unsetArraySchema.maxItems = config.unsetMaxItems;
  }

  return {
    type: "object",
    properties: {
      set: setArraySchema,
      unset: unsetArraySchema,
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
      const uriConfig = field.uriConfig;
      if (uriConfig?.mode === "custom" && uriConfig.customPattern) {
        properties[field.schemaKey] = {
          type: "string",
          pattern: uriConfig.customPattern,
        };
      } else {
        properties[field.schemaKey] = {
          type: "string",
          format: "uri",
        };
      }
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
      field.epcConfig &&
      (field.epcConfig.mode === "uri" ||
        (field.epcConfig.mode === "custom" && field.epcConfig.customPattern) ||
        (field.epcConfig.mode === "standard" && field.epcConfig.selectedIdentifiers.length > 0))
    ) {
      properties[field.schemaKey] = generateEpcListSchema(field.epcConfig);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle quantityList fields (quantityElement objects with epcClass, quantity, uom)
    else if (
      field.fieldType === "quantityList" &&
      field.quantityListConfig &&
      (field.quantityListConfig.epcClassMode === "uri" ||
        (field.quantityListConfig.epcClassMode === "custom" && field.quantityListConfig.epcClassCustomPattern) ||
        field.quantityListConfig.selectedIdentifiers?.length)
    ) {
      properties[field.schemaKey] = generateQuantityListSchema(field.quantityListConfig);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle location fields (readPoint, bizLocation)
    else if (
      field.fieldType === "location" &&
      field.locationConfig &&
      (field.locationConfig.selectedIdentifiers.length > 0 ||
        (field.locationConfig.mode === "manual" && field.locationConfig.manualUriPattern))
    ) {
      properties[field.schemaKey] = generateLocationSchema(field.locationConfig);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle sensorElement fields
    else if (field.fieldType === "sensorElement") {
      properties[field.schemaKey] = generateSensorElementListSchema(field.sensorElementConfig);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle bizTransactionList fields
    else if (field.fieldType === "bizTransactionList" && field.bizTransactionConfig) {
      properties[field.schemaKey] = generateBizTransactionListSchema(
        field.bizTransactionConfig
      );
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle sourceList/destinationList fields
    else if (field.fieldType === "sourceDestList" && field.sourceDestListConfig) {
      const fieldKey =
        field.schemaKey === "sourceList" ? "source" : "destination";
      properties[field.schemaKey] = generateSourceDestListSchema(
        field.sourceDestListConfig,
        fieldKey
      );
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle persistentDisposition fields
    else if (field.fieldType === "persistentDisposition" && field.persistentDispositionConfig) {
      properties[field.schemaKey] = generatePersistentDispositionSchema(
        field.persistentDispositionConfig
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
    // Handle enumWithCustom fields (bizStep, disposition)
    else if (field.fieldType === "enumWithCustom" && field.enumConfig) {
      if (field.enumConfig.mode === "standard" && field.enumConfig.selectedValues.length > 0) {
        properties[field.schemaKey] = {
          type: "string",
          enum: [...field.enumConfig.selectedValues],
        };
      } else if (field.enumConfig.mode === "custom" && field.enumConfig.customUriPattern) {
        properties[field.schemaKey] = {
          type: "string",
          pattern: field.enumConfig.customUriPattern,
        };
      }
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
        errorDeclarationProps[fieldName] = generateUriArraySchema(field.uriArrayConfig);
        if (field.isRequired) {
          errorDeclarationRequired.push(fieldName);
        }
      } else if (field.fieldType === "enumWithCustom" && field.enumConfig) {
        // For reason field: CBV values (standard mode) OR custom URI pattern (custom mode)
        if (field.enumConfig.mode === "standard" && field.enumConfig.selectedValues.length > 0) {
          errorDeclarationProps[fieldName] = {
            type: "string",
            enum: [...field.enumConfig.selectedValues],
          };
        } else if (field.enumConfig.mode === "custom" && field.enumConfig.customUriPattern) {
          errorDeclarationProps[fieldName] = {
            type: "string",
            pattern: field.enumConfig.customUriPattern,
          };
        }
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
    $schema: "https://json-schema.org/draft/2020-12/schema",
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

// Computed: Check if editor is out of sync with generated schema
const isEditorOutOfSync = computed(() => {
  // Only show warning if there's content and it's been manually edited
  if (!editorValue.value || !isManuallyEdited.value) return false;

  // Compare parsed JSON to ignore formatting differences
  try {
    const editorJson = JSON.parse(editorValue.value);
    const generatedJson = generatedSchema.value;
    return JSON.stringify(editorJson) !== JSON.stringify(generatedJson);
  } catch {
    // If editor has invalid JSON, it's definitely out of sync
    return editorValue.value !== generatedSchemaJson.value;
  }
});

// Reset editor to generated schema
const resetEditorToGenerated = () => {
  editorValue.value = generatedSchemaJson.value;
  isManuallyEdited.value = false;
};

// Watch for generated schema changes and update editor (only if not manually edited)
watch(generatedSchemaJson, (newValue) => {
  if (!isManuallyEdited.value) {
    editorValue.value = newValue;
  }
});

// Watch for editor value changes to detect manual edits
watch(editorValue, (newValue, oldValue) => {
  // Only mark as manually edited if the change wasn't from a generated update
  if (oldValue !== "" && newValue !== generatedSchemaJson.value) {
    isManuallyEdited.value = true;
  }
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
    const config = field.uriConfig;
    if (config?.mode === "custom") {
      return "Custom Pattern";
    }
    return "Any URI";
  }
  if (field.fieldType === "timezone") {
    return "timezone";
  }
  if (field.fieldType === "epcList") {
    const mode = field.epcConfig?.mode || "standard";
    if (mode === "uri") {
      return "Any URI";
    } else if (mode === "custom") {
      return "Custom Pattern";
    }
    const count = field.epcConfig?.selectedIdentifiers.length || 0;
    return `${count} identifier${count !== 1 ? "s" : ""}`;
  }
  if (field.fieldType === "quantityList") {
    const mode = field.quantityListConfig?.epcClassMode || "standard";
    if (mode === "uri") {
      return "Any URI";
    } else if (mode === "custom") {
      return "Custom Pattern";
    }
    const count = field.quantityListConfig?.selectedIdentifiers.length || 0;
    return `${count} epcClass${count !== 1 ? "es" : ""}`;
  }
  if (field.fieldType === "location") {
    const count = field.epcConfig?.selectedIdentifiers.length || 0;
    return `${count} format${count !== 1 ? "s" : ""}`;
  }
  if (field.fieldType === "sensorElement") {
    return "sensor data";
  }
  if (field.fieldType === "uriArray") {
    if (field.uriArrayConfig?.mode === "custom") {
      return "custom pattern";
    }
    return "URI array";
  }
  if (field.fieldType === "bizTransactionList" && field.bizTransactionConfig) {
    const typeLabel = field.bizTransactionConfig.typeMode === "standard"
      ? `${field.bizTransactionConfig.selectedTypes.length} type${field.bizTransactionConfig.selectedTypes.length !== 1 ? "s" : ""}`
      : "custom type";
    const valueLabel = field.bizTransactionConfig.valueMode === "uri"
      ? "URI"
      : "custom value";
    return `${typeLabel}, ${valueLabel}`;
  }
  if (field.fieldType === "sourceDestList" && field.sourceDestListConfig) {
    const typeLabel = field.sourceDestListConfig.typeMode === "standard"
      ? `${field.sourceDestListConfig.selectedTypes.length} type${field.sourceDestListConfig.selectedTypes.length !== 1 ? "s" : ""}`
      : "custom type";
    const valueLabel = field.sourceDestListConfig.valueMode === "uri"
      ? "URI"
      : "custom value";
    return `${typeLabel}, ${valueLabel}`;
  }
  if (field.fieldType === "persistentDisposition" && field.persistentDispositionConfig) {
    const setLabel = field.persistentDispositionConfig.setMode === "standard"
      ? `${field.persistentDispositionConfig.setSelectedValues.length} set`
      : "custom set";
    const unsetLabel = field.persistentDispositionConfig.unsetMode === "standard"
      ? `${field.persistentDispositionConfig.unsetSelectedValues.length} unset`
      : "custom unset";
    return `${setLabel}, ${unsetLabel}`;
  }
  if (field.fieldType === "certificationInfo") {
    return "certification";
  }
  if (field.fieldType === "enumWithCustom" && field.enumConfig) {
    if (field.enumConfig.mode === "standard") {
      const count = field.enumConfig.selectedValues.length;
      return `${count} value${count !== 1 ? "s" : ""}`;
    } else {
      return "custom pattern";
    }
  }
  const count = field.selectedValues.length;
  return `${count} value${count !== 1 ? "s" : ""}`;
};

const getFieldDisplayValues = (field: ProfileFieldConfig): string => {
  if (field.fieldType === "datetime") {
    return "ISO 8601 format";
  }
  if (field.fieldType === "uri") {
    const config = field.uriConfig;
    if (config?.mode === "custom" && config.customPattern) {
      return config.customPattern;
    }
    return "urn:uuid:... or ni:///sha-256;...";
  }
  if (field.fieldType === "timezone") {
    return "+HH:MM or -HH:MM format";
  }
  if (field.fieldType === "epcList") {
    const mode = field.epcConfig?.mode || "standard";
    if (mode === "uri") {
      return "Any valid URI (urn:epc:id:..., https://...)";
    } else if (mode === "custom" && field.epcConfig?.customPattern) {
      return field.epcConfig.customPattern;
    }
    return getEpcIdentifierLabels(field);
  }
  if (field.fieldType === "quantityList") {
    const config = field.quantityListConfig;
    const mode = config?.epcClassMode || "standard";
    const parts: string[] = [];

    if (mode === "uri") {
      parts.push("epcClass: Any URI");
    } else if (mode === "custom" && config?.epcClassCustomPattern) {
      parts.push(`epcClass: ${config.epcClassCustomPattern}`);
    } else if (config?.selectedIdentifiers?.length) {
      // Standard mode - use class-level identifiers
      const labels = config.selectedIdentifiers
        .map((id) => {
          const identifier = getClassLevelIdentifierById(id);
          return identifier?.label || id;
        })
        .join(", ");
      parts.push(`epcClass: ${labels}`);
    }

    if (config?.quantityRequired) {
      parts.push("quantity (required)");
    }
    if (config?.uomRequired) {
      parts.push("uom (required)");
    }
    return parts.join(", ") || "";
  }
  if (field.fieldType === "location") {
    return getEpcIdentifierLabels(field);
  }
  if (field.fieldType === "sensorElement") {
    return "sensorMetadata + sensorReport";
  }
  if (field.fieldType === "uriArray") {
    if (field.uriArrayConfig?.mode === "custom" && field.uriArrayConfig.customPattern) {
      return `Pattern: ${field.uriArrayConfig.customPattern}`;
    }
    return "Array of event ID URIs (any valid URI)";
  }
  if (field.fieldType === "bizTransactionList" && field.bizTransactionConfig) {
    const typeDesc = field.bizTransactionConfig.typeMode === "standard"
      ? field.bizTransactionConfig.selectedTypes
          .map((v) => getValueLabel(field, v))
          .join(", ") || "Any type"
      : `Type: ${field.bizTransactionConfig.customTypePattern || "custom pattern"}`;
    const valueDesc = field.bizTransactionConfig.valueMode === "uri"
      ? "any URI"
      : `Value: ${field.bizTransactionConfig.customValuePattern || "custom pattern"}`;
    return field.bizTransactionConfig.typeMode === "custom" || field.bizTransactionConfig.valueMode === "custom"
      ? `${typeDesc}; ${valueDesc}`
      : typeDesc;
  }
  if (field.fieldType === "sourceDestList" && field.sourceDestListConfig) {
    const typeDesc = field.sourceDestListConfig.typeMode === "standard"
      ? field.sourceDestListConfig.selectedTypes
          .map((v) => getValueLabel(field, v))
          .join(", ") || "Any type"
      : `Type: ${field.sourceDestListConfig.customTypePattern || "custom pattern"}`;
    const valueDesc = field.sourceDestListConfig.valueMode === "uri"
      ? "any URI"
      : `Value: ${field.sourceDestListConfig.customValuePattern || "custom pattern"}`;
    return field.sourceDestListConfig.typeMode === "custom" || field.sourceDestListConfig.valueMode === "custom"
      ? `${typeDesc}; ${valueDesc}`
      : typeDesc;
  }
  if (field.fieldType === "persistentDisposition" && field.persistentDispositionConfig) {
    const setDesc = field.persistentDispositionConfig.setMode === "standard"
      ? field.persistentDispositionConfig.setSelectedValues
          .map((v) => getValueLabel(field, v))
          .join(", ") || "No set values"
      : `Set pattern: ${field.persistentDispositionConfig.setCustomPattern || "custom"}`;
    const unsetDesc = field.persistentDispositionConfig.unsetMode === "standard"
      ? field.persistentDispositionConfig.unsetSelectedValues
          .map((v) => getValueLabel(field, v))
          .join(", ") || "No unset values"
      : `Unset pattern: ${field.persistentDispositionConfig.unsetCustomPattern || "custom"}`;
    return `Set: ${setDesc}; Unset: ${unsetDesc}`;
  }
  if (field.fieldType === "certificationInfo") {
    return "Certification standard, agency, value, ID";
  }
  if (field.fieldType === "enumWithCustom" && field.enumConfig) {
    if (field.enumConfig.mode === "standard") {
      return field.enumConfig.selectedValues
        .map((v) => getValueLabel(field, v))
        .join(", ");
    } else if (field.enumConfig.customUriPattern) {
      return `Pattern: ${field.enumConfig.customUriPattern}`;
    }
    return "No values configured";
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
  profileName.value = "";
  isManuallyEdited.value = false;
};

// Export profile configuration to JSON file
const exportProfile = () => {
  const exportData: ProfileExport = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    profileName: profileName.value || undefined,
    configuredFields: configuredFields.value,
    importedSchemas: importedSchemas.value,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${profileName.value || "epcis-profile"}-config.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Trigger file input for import
const triggerImport = () => {
  fileInputRef.value?.click();
};

// Import profile configuration from JSON file
const importProfile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text) as ProfileExport;

    // Validate version compatibility
    if (!data.version || !data.configuredFields) {
      throw new Error("Invalid profile format");
    }

    // Import the data
    configuredFields.value = data.configuredFields;
    importedSchemas.value = data.importedSchemas || [];
    if (data.profileName) {
      profileName.value = data.profileName;
    }

    // Reset manual edit flag since we're importing a fresh profile
    isManuallyEdited.value = false;

    // Show success notification
    toast.add({
      title: "Profile Imported",
      description: `Successfully imported ${data.configuredFields.length} field${data.configuredFields.length !== 1 ? "s" : ""}`,
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "Import Failed",
      description: "Invalid profile file format",
      color: "error",
    });
  }

  // Reset file input
  input.value = "";
};
</script>

<style scoped>
/* Fade transition for sync warning */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
