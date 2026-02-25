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
    <div
      class="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between"
    >
      <!-- Profile Name Input and Schema Target Toggle -->
      <div class="flex items-center gap-4 flex-shrink-0">
        <UInput
          v-model="profileName"
          placeholder="Profile name (optional)"
          class="w-48"
          size="sm"
        />

        <!-- Schema Target Toggle -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">Target:</span>
          <div class="inline-flex space-x-2">
            <UButton
              size="sm"
              :color="schemaTarget === 'document' ? 'secondary' : 'neutral'"
              :variant="schemaTarget === 'document' ? 'solid' : 'outline'"
              @click="schemaTarget = 'document'"
            >
              Document
            </UButton>

            <UButton
              size="sm"
              :color="schemaTarget === 'event' ? 'secondary' : 'neutral'"
              :variant="schemaTarget === 'event' ? 'solid' : 'outline'"
              @click="schemaTarget = 'event'"
            >
              Event
            </UButton>
          </div>
        </div>
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
          :disabled="configuredFields.length === 0"
          @click="exportProfile"
        >
          Export Profile
        </UButton>

        <UButton
          v-if="configuredFields.length > 0"
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
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 bg-amber-100 dark:bg-amber-900/50"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-5 h-5 text-amber-600 dark:text-amber-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h4
                class="text-sm font-semibold text-amber-800 dark:text-amber-200"
              >
                Profile Out of Sync
              </h4>
              <p class="text-xs text-amber-700 dark:text-amber-300 mt-1">
                The JSON profile has been manually edited and differs from the
                configured attributes on the left.
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
          :download-file-name="profileDownloadFilename"
          :placeholder="
            configuredFields.length > 0
              ? 'Your JSON Schema profile'
              : 'Add fields to generate your profile...'
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
useSeoMeta({
  title: "Profile Builder — Create EPCIS 2.0 Event Profiles",
  description: "Build custom EPCIS 2.0 JSON Schema profiles. Define event types, business steps, identifiers, and validation rules for document or event-level compliance checking.",
  ogImage: "/linkedin-banner.svg",
});

useSchemaOrg([
  defineWebPage({
    name: "EPCIS Profile Builder",
    description: "Build custom EPCIS 2.0 JSON Schema profiles for event validation.",
  }),
]);

import { ref, computed, onMounted } from "vue";
import type {
  ProfileFieldConfig,
  GeneratedJsonSchema,
  EpcListFieldConfig,
  SingleEpcFieldConfig,
  EpcisDimension,
  LocationConfig,
  BizTransactionListConfig,
  SourceDestListConfig,
  PersistentDispositionConfig,
  QuantityListConfig,
  UriArrayConfig,
  UriFieldConfig,
  SensorElementConfig,
  ProfileExport,
  ExtensionConfig,
  ExtensionElement,
  ExtensionNamespace,
  ContextListConfig,
  StringConstraintConfig,
} from "~/types/profile";
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

// Profile name for export
const profileName = ref<string>("");

// Computed: Dynamic filename for profile download
const profileDownloadFilename = computed(() =>
  profileName.value ? `${profileName.value}-profile.json` : 'epcis-profile.json'
);

// Schema target: 'document' for EPCISDocument, 'event' for single event
const schemaTarget = ref<"document" | "event">("document");

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

// Accordion state - all dimensions collapsed by default
const expandedDimensions = ref<string[]>([]);

// Accordion items computed from dimensions (filtered by schemaTarget)
const accordionItems = computed(() =>
  epcisDimensions
    .filter((dimension) => {
      // Hide "Document" dimension when target is "event" mode
      if (dimension.id === "document" && schemaTarget.value === "event") {
        return false;
      }
      return true;
    })
    .map((dimension) => ({
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
  "bg-indigo-100 dark:bg-indigo-900/30": color === "indigo",
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
  "text-indigo-600 dark:text-indigo-400": color === "indigo",
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
  "border-indigo-500": color === "indigo",
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
    indigo: "bg-indigo-50 dark:bg-indigo-900/20",
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

// Helper: Generate singleEpc schema (string, NOT array) for fields like parentID
const generateSingleEpcSchema = (config: SingleEpcFieldConfig): unknown => {
  // Handle "uri" mode - any valid URI
  if (config.mode === "uri") {
    return {
      type: "string",
      format: "uri",
    };
  }
  // Handle "custom" mode - user-provided regex pattern
  else if (config.mode === "custom" && config.customPattern) {
    return {
      type: "string",
      pattern: config.customPattern,
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
      return { type: "string" };
    } else if (patterns.length === 1) {
      return patterns[0];
    } else {
      return {
        anyOf: patterns,
      };
    }
  }
};

// Standard patterns for eventID (from CBV Section 8.9)
const EVENTID_STANDARD_PATTERNS = {
  uuid: "^urn:uuid:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[14][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
  "event-hash": "^ni:\\/\\/\\/[A-Za-z0-9._~-]+;[A-Za-z0-9_-]+\\?ver=CBV\\d+\\.\\d+(?:\\.\\d+)?$",
};

// Custom mode patterns for eventID
const EVENTID_CUSTOM_MODE_PATTERNS = {
  uri: "^[a-zA-Z][a-zA-Z0-9+.-]*:.*",
  url: "^https?://.*",
  urn: "^urn:.*",
};

// Helper: Generate URI field schema (eventID)
const generateUriFieldSchema = (config?: UriFieldConfig): unknown => {
  // Default to standard mode with both UUID and event-hash if no config
  if (!config) {
    return {
      anyOf: [
        { type: "string", pattern: EVENTID_STANDARD_PATTERNS.uuid },
        { type: "string", pattern: EVENTID_STANDARD_PATTERNS["event-hash"] },
      ],
    };
  }

  // Handle backwards compatibility with old "uri" mode
  if (config.mode === "uri" as string) {
    return { type: "string", format: "uri" };
  }

  // Handle standard mode (CBV-compliant eventID formats)
  if (config.mode === "standard") {
    const selectedTypes = config.selectedStandardTypes || ["uuid", "event-hash"];

    if (selectedTypes.length === 0) {
      // Fallback to any URI if nothing selected
      return { type: "string", format: "uri" };
    }

    const patterns = selectedTypes.map((type) => ({
      type: "string",
      pattern: EVENTID_STANDARD_PATTERNS[type],
    }));

    if (patterns.length === 1) {
      return patterns[0];
    }

    return { anyOf: patterns };
  }

  // Handle custom mode
  if (config.mode === "custom") {
    const customMode = config.customMode || "uri";

    // Pattern mode - use user-provided regex
    if (customMode === "pattern" && config.customPattern) {
      return {
        type: "string",
        pattern: config.customPattern,
      };
    }

    // Predefined custom modes (uri, url, urn)
    const pattern = EVENTID_CUSTOM_MODE_PATTERNS[customMode as keyof typeof EVENTID_CUSTOM_MODE_PATTERNS];
    if (pattern) {
      return {
        type: "string",
        pattern: pattern,
      };
    }

    // Default fallback
    return { type: "string", format: "uri" };
  }

  // Default fallback
  return { type: "string", format: "uri" };
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
  if (
    config.uomMode === "standard" &&
    config.uomSelectedValues &&
    config.uomSelectedValues.length > 0
  ) {
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
const generateSensorElementListSchema = (
  config?: SensorElementConfig
): unknown => {
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
const generateBizTransactionListSchema = (
  config: BizTransactionListConfig
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
  if (
    config.unsetMode === "standard" &&
    config.unsetSelectedValues.length > 0
  ) {
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

// Helper: Generate extension schema (userExtensions or ILMD)
const generateExtensionSchema = (config: ExtensionConfig): { schema: unknown; properties?: Record<string, unknown>; required?: string[] } => {
  if (config.elements.length === 0) {
    return { schema: { type: "object" } };
  }

  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  const processElement = (element: ExtensionElement, namespaces: ExtensionNamespace[]): unknown => {
    let schema: Record<string, unknown>;

    switch (element.valueType) {
      case "string":
        schema = { type: "string" };
        if (element.stringPattern) {
          schema.pattern = element.stringPattern;
        }
        break;

      case "number":
        schema = { type: "number" };
        if (element.numberMin !== undefined) schema.minimum = element.numberMin;
        if (element.numberMax !== undefined) schema.maximum = element.numberMax;
        break;

      case "boolean":
        schema = { type: "boolean" };
        break;

      case "array":
        if (element.arrayItemType === "object" && element.arrayItemElements && element.arrayItemElements.length > 0) {
          // Array of objects with defined structure
          const itemProps: Record<string, unknown> = {};
          const itemRequired: string[] = [];

          element.arrayItemElements.forEach((itemEl) => {
            const itemNs = namespaces.find((n) => n.id === itemEl.namespaceId);
            const itemKey = extensionPropertyKey(itemNs?.prefix || "ext", itemEl.localName);
            itemProps[itemKey] = processElement(itemEl, namespaces);
            if (itemEl.isRequired) itemRequired.push(itemKey);
          });

          schema = {
            type: "array",
            items: {
              type: "object",
              properties: itemProps,
              ...(itemRequired.length > 0 && { required: itemRequired }),
            },
          };
        } else if (element.arrayItemType === "object") {
          // Array of objects without defined structure
          schema = {
            type: "array",
            items: { type: "object" },
          };
        } else {
          // Array of primitives
          schema = {
            type: "array",
            items: { type: element.arrayItemType || "string" },
          };
        }
        if (element.arrayMinItems !== undefined) schema.minItems = element.arrayMinItems;
        if (element.arrayMaxItems !== undefined) schema.maxItems = element.arrayMaxItems;
        break;

      case "object":
        if (element.nestedElements && element.nestedElements.length > 0) {
          const nestedProps: Record<string, unknown> = {};
          const nestedRequired: string[] = [];

          element.nestedElements.forEach((nested) => {
            const nestedNs = namespaces.find((n) => n.id === nested.namespaceId);
            const nestedKey = extensionPropertyKey(nestedNs?.prefix || "ext", nested.localName);
            nestedProps[nestedKey] = processElement(nested, namespaces);
            if (nested.isRequired) nestedRequired.push(nestedKey);
          });

          schema = {
            type: "object",
            properties: nestedProps,
            ...(nestedRequired.length > 0 && { required: nestedRequired }),
          };
        } else {
          schema = { type: "object" };
        }
        break;

      default:
        schema = { type: "string" };
    }

    return schema;
  };

  config.elements.forEach((element) => {
    const ns = config.namespaces.find((n) => n.id === element.namespaceId);
    const key = extensionPropertyKey(ns?.prefix || "ext", element.localName);
    properties[key] = processElement(element, config.namespaces);
    if (element.isRequired) required.push(key);
  });

  return {
    schema: {
      type: "object",
      properties,
      ...(required.length > 0 && { required }),
      additionalProperties: false,
    },
    properties,
    required,
  };
};

// Helper: Generate @context schema from ContextListConfig
const generateContextListSchema = (
  config: ContextListConfig,
  extensionNamespaces: ContextNamespaceEntry[] = []
): unknown => {
  const containsConstraints: Array<Record<string, unknown>> = [];

  // String URI constraints (existing behavior)
  for (const uri of config.requiredContexts) {
    containsConstraints.push({ contains: { const: uri } });
  }

  // Object namespace constraints (from extensions)
  for (const ns of extensionNamespaces) {
    containsConstraints.push({
      contains: {
        type: "object",
        properties: { [ns.prefix]: { const: ns.uri } },
        required: [ns.prefix],
      },
    });
  }

  const schema: Record<string, unknown> = {};
  if (containsConstraints.length === 1) {
    Object.assign(schema, containsConstraints[0]);
  } else if (containsConstraints.length > 1) {
    schema.allOf = containsConstraints;
  }

  if (config.minItems !== undefined) {
    schema.minItems = config.minItems;
  }
  if (config.maxItems !== undefined) {
    schema.maxItems = config.maxItems;
  }

  // If no constraints at all, just validate it exists as an array
  if (Object.keys(schema).length === 0) {
    return {};
  }

  return schema;
};

// Helper: Generate string constraint schema from StringConstraintConfig
const generateStringConstraintSchema = (config: StringConstraintConfig): unknown => {
  if (config.mode === "uri") {
    return { type: "string", format: "uri" };
  }
  if (config.mode === "exact" && config.exactValue) {
    return { const: config.exactValue };
  }
  if (config.mode === "enum" && config.enumValues && config.enumValues.length > 0) {
    return { type: "string", enum: [...config.enumValues] };
  }
  if (config.mode === "pattern" && config.pattern) {
    return { type: "string", pattern: config.pattern };
  }
  // Fallback: just a string type
  return { type: "string" };
};

// Computed: Generate JSON Schema
const generatedSchema = computed<GeneratedJsonSchema>(() => {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  // Collect extension namespaces for @context propagation
  const extensionNamespaces = collectExtensionNamespaces(configuredFields.value);

  // Separate document-level fields from event-level fields
  const documentFields = configuredFields.value.filter(
    (f) => f.dimension === "document"
  );

  // Collect error dimension fields separately to build nested errorDeclaration object
  const errorFields = configuredFields.value.filter(
    (f) => f.dimension === "error"
  );
  const nonErrorFields = configuredFields.value.filter(
    (f) => f.dimension !== "error" && f.dimension !== "document"
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
      properties[field.schemaKey] = generateUriFieldSchema(uriConfig);
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
    // Handle epcList fields (arrays of EPCs)
    else if (
      field.fieldType === "epcList" &&
      field.epcConfig &&
      (field.epcConfig.mode === "uri" ||
        (field.epcConfig.mode === "custom" && field.epcConfig.customPattern) ||
        (field.epcConfig.mode === "standard" &&
          field.epcConfig.selectedIdentifiers.length > 0))
    ) {
      properties[field.schemaKey] = generateEpcListSchema(field.epcConfig);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle singleEpc fields (single EPC string like parentID - NOT an array)
    else if (
      field.fieldType === "singleEpc" &&
      field.singleEpcConfig &&
      (field.singleEpcConfig.mode === "uri" ||
        (field.singleEpcConfig.mode === "custom" && field.singleEpcConfig.customPattern) ||
        (field.singleEpcConfig.mode === "standard" &&
          field.singleEpcConfig.selectedIdentifiers.length > 0))
    ) {
      properties[field.schemaKey] = generateSingleEpcSchema(field.singleEpcConfig);
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle quantityList fields (quantityElement objects with epcClass, quantity, uom)
    else if (
      field.fieldType === "quantityList" &&
      field.quantityListConfig &&
      (field.quantityListConfig.epcClassMode === "uri" ||
        (field.quantityListConfig.epcClassMode === "custom" &&
          field.quantityListConfig.epcClassCustomPattern) ||
        field.quantityListConfig.selectedIdentifiers?.length)
    ) {
      properties[field.schemaKey] = generateQuantityListSchema(
        field.quantityListConfig
      );
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle location fields (readPoint, bizLocation)
    else if (
      field.fieldType === "location" &&
      field.locationConfig &&
      (field.locationConfig.selectedIdentifiers.length > 0 ||
        (field.locationConfig.mode === "manual" &&
          field.locationConfig.manualUriPattern))
    ) {
      properties[field.schemaKey] = generateLocationSchema(
        field.locationConfig
      );
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle sensorElement fields
    else if (field.fieldType === "sensorElement") {
      properties[field.schemaKey] = generateSensorElementListSchema(
        field.sensorElementConfig
      );
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle bizTransactionList fields
    else if (
      field.fieldType === "bizTransactionList" &&
      field.bizTransactionConfig
    ) {
      properties[field.schemaKey] = generateBizTransactionListSchema(
        field.bizTransactionConfig
      );
      if (field.isRequired) {
        required.push(field.schemaKey);
      }
    }
    // Handle sourceList/destinationList fields
    else if (
      field.fieldType === "sourceDestList" &&
      field.sourceDestListConfig
    ) {
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
    else if (
      field.fieldType === "persistentDisposition" &&
      field.persistentDispositionConfig
    ) {
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
    // Handle extension fields (userExtensions, ilmd)
    else if (field.fieldType === "extension" && field.extensionConfig) {
      const extensionResult = generateExtensionSchema(field.extensionConfig);

      if (field.extensionConfig.isIlmd) {
        // ILMD: Wrap in ilmd object
        properties["ilmd"] = extensionResult.schema;
        if (field.isRequired) {
          required.push("ilmd");
        }
      } else {
        // User Extensions: Merge properties directly into event properties
        if (extensionResult.properties) {
          Object.assign(properties, extensionResult.properties);
          if (extensionResult.required) {
            required.push(...extensionResult.required);
          }
        }
      }
    }
    // Handle enumWithCustom fields (bizStep, disposition)
    else if (field.fieldType === "enumWithCustom" && field.enumConfig) {
      if (
        field.enumConfig.mode === "standard" &&
        field.enumConfig.selectedValues.length > 0
      ) {
        properties[field.schemaKey] = {
          type: "string",
          enum: [...field.enumConfig.selectedValues],
        };
      } else if (
        field.enumConfig.mode === "custom" &&
        field.enumConfig.customUriPattern
      ) {
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
        errorDeclarationProps[fieldName] = generateUriArraySchema(
          field.uriArrayConfig
        );
        if (field.isRequired) {
          errorDeclarationRequired.push(fieldName);
        }
      } else if (field.fieldType === "enumWithCustom" && field.enumConfig) {
        // For reason field: CBV values (standard mode) OR custom URI pattern (custom mode)
        if (
          field.enumConfig.mode === "standard" &&
          field.enumConfig.selectedValues.length > 0
        ) {
          errorDeclarationProps[fieldName] = {
            type: "string",
            enum: [...field.enumConfig.selectedValues],
          };
        } else if (
          field.enumConfig.mode === "custom" &&
          field.enumConfig.customUriPattern
        ) {
          errorDeclarationProps[fieldName] = {
            type: "string",
            pattern: field.enumConfig.customUriPattern,
          };
        }
        if (field.isRequired) {
          errorDeclarationRequired.push(fieldName);
        }
      } else if (field.fieldType === "extension" && field.extensionConfig) {
        // For error extensions - merge into errorDeclaration
        const extensionResult = generateExtensionSchema(field.extensionConfig);
        if (extensionResult.properties) {
          Object.assign(errorDeclarationProps, extensionResult.properties);
          if (extensionResult.required) {
            errorDeclarationRequired.push(...extensionResult.required);
          }
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

  // Helper to clean undefined values from an object
  const cleanObject = (
    obj: Record<string, unknown>
  ): Record<string, unknown> => {
    const cleaned: Record<string, unknown> = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  // Build the event-level constraints object
  const eventConstraints = cleanObject({
    type: "object",
    properties: Object.keys(properties).length > 0 ? properties : undefined,
    required: required.length > 0 ? required : undefined,
    additionalProperties: true,
  });

  // Generate schema based on target mode
  if (schemaTarget.value === "document") {
    // Build document-level properties
    const docProperties: Record<string, unknown> = {};
    const docRequired: string[] = ["epcisBody"];

    // Process document-level fields
    for (const field of documentFields) {
      if (field.fieldType === "contextList" && field.contextListConfig) {
        const contextSchema = generateContextListSchema(field.contextListConfig, extensionNamespaces);
        if (Object.keys(contextSchema as Record<string, unknown>).length > 0) {
          docProperties[field.schemaKey] = contextSchema;
        }
      } else if (field.fieldType === "stringConstraint" && field.stringConstraintConfig) {
        docProperties[field.schemaKey] = generateStringConstraintSchema(field.stringConstraintConfig);
      } else if (field.fieldType === "datetime") {
        docProperties[field.schemaKey] = {
          type: "string",
          format: "date-time",
        };
      }

      if (field.isRequired && !docRequired.includes(field.schemaKey)) {
        docRequired.push(field.schemaKey);
      }
    }

    // Auto-inject @context constraints from extension namespaces if not explicitly configured
    if (extensionNamespaces.length > 0 && !docProperties["@context"]) {
      const autoContextConfig: ContextListConfig = {
        requiredContexts: [],
        allowAdditional: true,
      };
      const contextSchema = generateContextListSchema(autoContextConfig, extensionNamespaces);
      if (Object.keys(contextSchema as Record<string, unknown>).length > 0) {
        docProperties["@context"] = contextSchema;
      }
    }

    // If no configured field has schemaKey "type", add the hardcoded default
    const hasTypeField = documentFields.some((f) => f.schemaKey === "type");
    if (!hasTypeField) {
      docProperties["type"] = { const: "EPCISDocument" };
      if (!docRequired.includes("type")) {
        docRequired.push("type");
      }
    }

    // Wrap event constraints for EPCISDocument validation
    const documentSchema: GeneratedJsonSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      allOf: [
        {
          $ref: "https://ref.gs1.org/standards/epcis/epcis-json-schema.json",
        },
        {
          type: "object",
          properties: {
            ...docProperties,
            epcisBody: {
              type: "object",
              properties: {
                eventList: {
                  type: "array",
                  items: eventConstraints,
                },
              },
              required: ["eventList"],
            },
          },
          required: docRequired,
          additionalProperties: true,
        },
      ],
    };

    return documentSchema;
  } else {
    // Single event mode - original behavior
    if (Object.keys(properties).length > 0 || required.length > 0) {
      allOfItems.push(eventConstraints);
    }

    const schema: GeneratedJsonSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      allOf: allOfItems,
    };

    // Clean undefined values
    const cleanedAllOf = schema.allOf.map((item) =>
      cleanObject(item as Record<string, unknown>)
    );

    return { ...schema, allOf: cleanedAllOf } as GeneratedJsonSchema;
  }
});

// Computed: JSON string for preview
const generatedSchemaJson = computed(() => {
  if (configuredFields.value.length === 0) {
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

// Helper: Get EPC identifier labels for display (epcList fields)
const getEpcIdentifierLabels = (field: ProfileFieldConfig): string => {
  if (!field.epcConfig?.selectedIdentifiers.length) return "";
  return field.epcConfig.selectedIdentifiers
    .map((id) => {
      const identifier = getEpcIdentifierById(id);
      return identifier?.label || id;
    })
    .join(", ");
};

// Helper: Get single EPC identifier labels for display (parentID field)
const getSingleEpcIdentifierLabels = (field: ProfileFieldConfig): string => {
  if (!field.singleEpcConfig?.selectedIdentifiers.length) return "";
  return field.singleEpcConfig.selectedIdentifiers
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
  if (field.fieldType === "singleEpc") {
    const mode = field.singleEpcConfig?.mode || "standard";
    if (mode === "uri") {
      return "Any URI";
    } else if (mode === "custom") {
      return "Custom Pattern";
    }
    const count = field.singleEpcConfig?.selectedIdentifiers.length || 0;
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
    const typeLabel =
      field.bizTransactionConfig.typeMode === "standard"
        ? `${field.bizTransactionConfig.selectedTypes.length} type${field.bizTransactionConfig.selectedTypes.length !== 1 ? "s" : ""}`
        : "custom type";
    const valueLabel =
      field.bizTransactionConfig.valueMode === "uri" ? "URI" : "custom value";
    return `${typeLabel}, ${valueLabel}`;
  }
  if (field.fieldType === "sourceDestList" && field.sourceDestListConfig) {
    const typeLabel =
      field.sourceDestListConfig.typeMode === "standard"
        ? `${field.sourceDestListConfig.selectedTypes.length} type${field.sourceDestListConfig.selectedTypes.length !== 1 ? "s" : ""}`
        : "custom type";
    const valueLabel =
      field.sourceDestListConfig.valueMode === "uri" ? "URI" : "custom value";
    return `${typeLabel}, ${valueLabel}`;
  }
  if (
    field.fieldType === "persistentDisposition" &&
    field.persistentDispositionConfig
  ) {
    const setLabel =
      field.persistentDispositionConfig.setMode === "standard"
        ? `${field.persistentDispositionConfig.setSelectedValues.length} set`
        : "custom set";
    const unsetLabel =
      field.persistentDispositionConfig.unsetMode === "standard"
        ? `${field.persistentDispositionConfig.unsetSelectedValues.length} unset`
        : "custom unset";
    return `${setLabel}, ${unsetLabel}`;
  }
  if (field.fieldType === "certificationInfo") {
    return "certification";
  }
  if (field.fieldType === "extension" && field.extensionConfig) {
    const nsCount = field.extensionConfig.namespaces.length;
    const elCount = field.extensionConfig.elements.length;
    return `${nsCount} ns, ${elCount} element${elCount !== 1 ? "s" : ""}`;
  }
  if (field.fieldType === "enumWithCustom" && field.enumConfig) {
    if (field.enumConfig.mode === "standard") {
      const count = field.enumConfig.selectedValues.length;
      return `${count} value${count !== 1 ? "s" : ""}`;
    } else {
      return "custom pattern";
    }
  }
  if (field.fieldType === "contextList") {
    const count = field.contextListConfig?.requiredContexts.length || 0;
    return count > 0 ? `${count} required URI${count !== 1 ? "s" : ""}` : "context array";
  }
  if (field.fieldType === "stringConstraint" && field.stringConstraintConfig) {
    if (field.stringConstraintConfig.mode === "uri") {
      return "URI format";
    } else if (field.stringConstraintConfig.mode === "exact") {
      return "exact value";
    } else if (field.stringConstraintConfig.mode === "enum") {
      const count = field.stringConstraintConfig.enumValues?.length || 0;
      return `${count} value${count !== 1 ? "s" : ""}`;
    } else {
      return "pattern";
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
    // Handle backwards compatibility with old "uri" mode
    if (!config || config.mode === "uri" as string) {
      return "Any valid URI";
    }
    if (config.mode === "standard") {
      const types = config.selectedStandardTypes || ["uuid", "event-hash"];
      const labels = types.map((t) =>
        t === "uuid" ? "UUID URI" : "Event Hash ID"
      );
      return labels.join(" or ");
    }
    if (config.mode === "custom") {
      const customMode = config.customMode || "uri";
      if (customMode === "pattern" && config.customPattern) {
        return `Pattern: ${config.customPattern}`;
      }
      const modeLabels: Record<string, string> = {
        uri: "Any valid URI",
        url: "HTTP/HTTPS URL",
        urn: "URN format",
      };
      return modeLabels[customMode] || "Any valid URI";
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
  if (field.fieldType === "singleEpc") {
    const mode = field.singleEpcConfig?.mode || "standard";
    if (mode === "uri") {
      return "Any valid URI (single identifier)";
    } else if (mode === "custom" && field.singleEpcConfig?.customPattern) {
      return field.singleEpcConfig.customPattern;
    }
    return getSingleEpcIdentifierLabels(field);
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
    if (
      field.uriArrayConfig?.mode === "custom" &&
      field.uriArrayConfig.customPattern
    ) {
      return `Pattern: ${field.uriArrayConfig.customPattern}`;
    }
    return "Array of event ID URIs (any valid URI)";
  }
  if (field.fieldType === "bizTransactionList" && field.bizTransactionConfig) {
    const typeDesc =
      field.bizTransactionConfig.typeMode === "standard"
        ? field.bizTransactionConfig.selectedTypes
            .map((v) => getValueLabel(field, v))
            .join(", ") || "Any type"
        : `Type: ${field.bizTransactionConfig.customTypePattern || "custom pattern"}`;
    const valueDesc =
      field.bizTransactionConfig.valueMode === "uri"
        ? "any URI"
        : `Value: ${field.bizTransactionConfig.customValuePattern || "custom pattern"}`;
    return field.bizTransactionConfig.typeMode === "custom" ||
      field.bizTransactionConfig.valueMode === "custom"
      ? `${typeDesc}; ${valueDesc}`
      : typeDesc;
  }
  if (field.fieldType === "sourceDestList" && field.sourceDestListConfig) {
    const typeDesc =
      field.sourceDestListConfig.typeMode === "standard"
        ? field.sourceDestListConfig.selectedTypes
            .map((v) => getValueLabel(field, v))
            .join(", ") || "Any type"
        : `Type: ${field.sourceDestListConfig.customTypePattern || "custom pattern"}`;
    const valueDesc =
      field.sourceDestListConfig.valueMode === "uri"
        ? "any URI"
        : `Value: ${field.sourceDestListConfig.customValuePattern || "custom pattern"}`;
    return field.sourceDestListConfig.typeMode === "custom" ||
      field.sourceDestListConfig.valueMode === "custom"
      ? `${typeDesc}; ${valueDesc}`
      : typeDesc;
  }
  if (
    field.fieldType === "persistentDisposition" &&
    field.persistentDispositionConfig
  ) {
    const setDesc =
      field.persistentDispositionConfig.setMode === "standard"
        ? field.persistentDispositionConfig.setSelectedValues
            .map((v) => getValueLabel(field, v))
            .join(", ") || "No set values"
        : `Set pattern: ${field.persistentDispositionConfig.setCustomPattern || "custom"}`;
    const unsetDesc =
      field.persistentDispositionConfig.unsetMode === "standard"
        ? field.persistentDispositionConfig.unsetSelectedValues
            .map((v) => getValueLabel(field, v))
            .join(", ") || "No unset values"
        : `Unset pattern: ${field.persistentDispositionConfig.unsetCustomPattern || "custom"}`;
    return `Set: ${setDesc}; Unset: ${unsetDesc}`;
  }
  if (field.fieldType === "certificationInfo") {
    return "Certification standard, agency, value, ID";
  }
  if (field.fieldType === "extension" && field.extensionConfig) {
    const namespaces = field.extensionConfig.namespaces
      .map((ns) => `${ns.prefix}: ${ns.uri}`)
      .join(", ");
    const elements = field.extensionConfig.elements
      .map((el) => {
        const ns = field.extensionConfig!.namespaces.find((n) => n.id === el.namespaceId);
        return extensionPropertyKey(ns?.prefix || "ext", el.localName);
      })
      .join(", ");
    return elements || namespaces || "No elements defined";
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
  if (field.fieldType === "contextList" && field.contextListConfig) {
    const contexts = field.contextListConfig.requiredContexts;
    if (contexts.length === 0) return "No required contexts";
    return contexts.map((uri) => {
      // Shorten long URIs for display
      if (uri.length > 50) return `...${uri.slice(-40)}`;
      return uri;
    }).join(", ");
  }
  if (field.fieldType === "stringConstraint" && field.stringConstraintConfig) {
    const config = field.stringConstraintConfig;
    if (config.mode === "uri") {
      return "Any valid URI";
    } else if (config.mode === "exact" && config.exactValue) {
      return `Exact: "${config.exactValue}"`;
    } else if (config.mode === "enum" && config.enumValues?.length) {
      return config.enumValues.join(", ");
    } else if (config.mode === "pattern" && config.pattern) {
      return `Pattern: ${config.pattern}`;
    }
    return "No constraint configured";
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
  // Deep copy the field including configs
  const fieldCopy: ProfileFieldConfig = {
    ...field,
    selectedValues: [...field.selectedValues],
    epcConfig: field.epcConfig
      ? { selectedIdentifiers: [...field.epcConfig.selectedIdentifiers] }
      : undefined,
    extensionConfig: field.extensionConfig
      ? {
          mode: field.extensionConfig.mode,
          namespaces: [...field.extensionConfig.namespaces],
          elements: JSON.parse(JSON.stringify(field.extensionConfig.elements)),
          isIlmd: field.extensionConfig.isIlmd,
        }
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
