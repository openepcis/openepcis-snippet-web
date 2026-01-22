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

          <!-- DateTime Field Info (for datetime field type) -->
          <div v-if="isDateTimeField">
            <div
              class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            >
              <div class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4
                    class="text-sm font-medium text-blue-800 dark:text-blue-200"
                  >
                    ISO 8601 Date-Time Format
                  </h4>
                  <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    This field accepts date-time values in ISO 8601 format
                    (e.g., 2024-01-15T10:30:00.000Z)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- EPC List Configuration (for epcList field types - arrays) -->
          <div v-else-if="isEpcListField">
            <EpcListConfigPanel
              :epc-config="epcConfig"
              @update:epc-config="updateEpcConfig"
            />
          </div>

          <!-- Single EPC Configuration (for singleEpc field types like parentID - NOT an array) -->
          <div v-else-if="isSingleEpcField">
            <div class="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div class="flex items-start gap-2">
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p class="text-xs text-blue-600 dark:text-blue-300">
                  This is a <strong>single identifier</strong> field (not an array). Only one EPC value is allowed.
                </p>
              </div>
            </div>
            <EpcListConfigPanel
              :epc-config="singleEpcConfigAsEpcList"
              :hide-array-constraints="true"
              @update:epc-config="updateSingleEpcConfig"
            />
          </div>

          <!-- Quantity List Configuration (for quantityList field types) -->
          <div v-else-if="isQuantityListField">
            <QuantityListConfigPanel
              :quantity-list-config="quantityListConfig"
              @update:quantity-list-config="updateQuantityListConfig"
            />
          </div>

          <!-- Location Configuration (for location field type) -->
          <div v-else-if="isLocationField">
            <LocationConfigPanel
              :location-config="locationConfig"
              @update:location-config="updateLocationConfig"
            />
          </div>

          <!-- Sensor Element Info (for sensorElement field type) -->
          <div v-else-if="isSensorElementField" class="space-y-4">
            <div
              class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            >
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-cpu-chip"
                  class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                />
                <div>
                  <h4
                    class="text-sm font-medium text-blue-800 dark:text-blue-200"
                  >
                    EPCIS 2.0 Sensor Data
                  </h4>
                  <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    This field validates the presence of sensor element list containing
                    sensorMetadata and sensorReport arrays for IoT sensor data
                    (temperature, humidity, pressure, etc.)
                  </p>
                </div>
              </div>
            </div>

            <!-- Array Count Configuration for Sensor Elements -->
            <ArrayCountConfigPanel
              :min-items="sensorElementConfig.minItems"
              :max-items="sensorElementConfig.maxItems"
              title="Sensor Element List Array Constraints"
              description="Set minimum and maximum number of sensor elements allowed in the list."
              @update:min-items="handleSensorMinItemsUpdate"
              @update:max-items="handleSensorMaxItemsUpdate"
            />
          </div>

          <!-- URI Array Config Panel (for uriArray field type like correctiveEventIDs) -->
          <div v-else-if="isUriArrayField">
            <UriArrayConfigPanel
              :uri-array-config="uriArrayConfig"
              @update:uri-array-config="updateUriArrayConfig"
            />
          </div>

          <!-- URI Config Panel (for single uri field type like eventID) -->
          <div v-else-if="isUriField">
            <UriFieldConfigPanel
              :uri-config="uriConfig"
              @update:uri-config="updateUriConfig"
            />
          </div>

          <!-- Timezone Info (for timezone field type) -->
          <div v-else-if="isTimezoneField">
            <div
              class="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
            >
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-heroicons-globe-alt"
                  class="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
                />
                <div>
                  <h4
                    class="text-sm font-medium text-primary-800 dark:text-primary-200"
                  >
                    Timezone Offset
                  </h4>
                  <p class="text-xs text-primary-600 dark:text-primary-300 mt-1">
                    This field accepts a timezone offset in signed format
                    (e.g., +05:30, -08:00, +00:00). Range: -14:00 to +14:00.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Enum with Custom URI Configuration (for bizStep, disposition) -->
          <div v-else-if="isEnumWithCustomField">
            <EnumWithCustomConfigPanel
              :enum-config="enumConfig"
              :options="selectedFieldConfig.options"
              :field-label="selectedFieldConfig.label"
              @update:enum-config="updateEnumConfig"
            />
          </div>

          <!-- BizTransactionList Configuration -->
          <div v-else-if="isBizTransactionListField">
            <BizTransactionListConfigPanel
              :biz-transaction-config="bizTransactionConfig"
              :options="selectedFieldConfig.options"
              @update:biz-transaction-config="updateBizTransactionConfig"
            />
          </div>

          <!-- SourceDestList Configuration (sourceList, destinationList) -->
          <div v-else-if="isSourceDestListField">
            <SourceDestListConfigPanel
              :source-dest-list-config="sourceDestListConfig"
              :options="selectedFieldConfig.options"
              :field-key="selectedFieldConfig.schemaKey === 'sourceList' ? 'source' : 'destination'"
              @update:source-dest-list-config="updateSourceDestListConfig"
            />
          </div>

          <!-- PersistentDisposition Configuration -->
          <div v-else-if="isPersistentDispositionField">
            <PersistentDispositionConfigPanel
              :persistent-disposition-config="persistentDispositionConfig"
              :options="selectedFieldConfig.options"
              @update:persistent-disposition-config="updatePersistentDispositionConfig"
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
import type { ProfileFieldConfig, LocationConfig, EnumOrCustomConfig, BizTransactionListConfig, SourceDestListConfig, PersistentDispositionConfig, UriFieldConfig, UriArrayConfig, QuantityListConfig, EpcListFieldConfig, SingleEpcFieldConfig, SensorElementConfig } from "~/types/profile";

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

// EPC List specific state (for array fields like epcList, childEPCs)
const epcConfig = ref<EpcListFieldConfig>({
  mode: "standard",
  selectedIdentifiers: [],
});

// Single EPC specific state (for single EPC fields like parentID)
const singleEpcConfig = ref<SingleEpcFieldConfig>({
  mode: "standard",
  selectedIdentifiers: [],
});

// Location specific state
const locationConfig = ref<LocationConfig>({
  mode: "sgln",
  selectedIdentifiers: [],
});

// Enum with custom URI specific state (bizStep, disposition)
const enumConfig = ref<EnumOrCustomConfig>({
  mode: "standard",
  selectedValues: [],
});

// BizTransactionList specific state
const bizTransactionConfig = ref<BizTransactionListConfig>({
  typeMode: "standard",
  selectedTypes: [],
  valueMode: "uri",
});

// SourceDestList specific state (sourceList, destinationList)
const sourceDestListConfig = ref<SourceDestListConfig>({
  typeMode: "standard",
  selectedTypes: [],
  valueMode: "uri",
});

// PersistentDisposition specific state
const persistentDispositionConfig = ref<PersistentDispositionConfig>({
  setMode: "standard",
  setSelectedValues: [],
  unsetMode: "standard",
  unsetSelectedValues: [],
});

// URI field specific state (eventID, etc.)
const uriConfig = ref<UriFieldConfig>({
  mode: "uri",
});

// URI Array field specific state (correctiveEventIDs, etc.)
const uriArrayConfig = ref<UriArrayConfig>({
  mode: "uri",
});

// QuantityList specific state
const quantityListConfig = ref<QuantityListConfig>({
  selectedIdentifiers: [],
  quantityRequired: false,
  quantityMin: undefined,
  quantityMax: undefined,
  uomRequired: false,
  uomMode: "any",
  uomSelectedValues: [],
  uomCustomPattern: undefined,
});

// SensorElement specific state
const sensorElementConfig = ref<SensorElementConfig>({
  minItems: undefined,
  maxItems: undefined,
});

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

/// Computed: Check if selected field is epcList type (array)
const isEpcListField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "epcList";
});

// Computed: Check if selected field is singleEpc type (single identifier like parentID)
const isSingleEpcField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "singleEpc";
});

// Computed: Check if selected field is quantityList type
const isQuantityListField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "quantityList";
});

// Computed: Check if selected field is datetime type
const isDateTimeField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "datetime";
});

// Computed: Check if selected field is location type
const isLocationField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "location";
});

// Computed: Check if selected field is sensorElement type
const isSensorElementField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "sensorElement";
});

// Computed: Check if selected field is uriArray type
const isUriArrayField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "uriArray";
});

// Computed: Check if selected field is uri type (single URI)
const isUriField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "uri";
});

// Computed: Check if selected field is timezone type
const isTimezoneField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "timezone";
});

// Computed: Check if selected field is enumWithCustom type (bizStep, disposition)
const isEnumWithCustomField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "enumWithCustom";
});

// Computed: Check if selected field is bizTransactionList type
const isBizTransactionListField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "bizTransactionList";
});

// Computed: Check if selected field is sourceDestList type (sourceList, destinationList)
const isSourceDestListField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "sourceDestList";
});

// Computed: Check if selected field is persistentDisposition type
const isPersistentDispositionField = computed(() => {
  return selectedFieldConfig.value?.fieldType === "persistentDisposition";
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

  // For datetime fields, always allow save (no values to select)
  if (isDateTimeField.value) {
    return true;
  }

  // For sensorElement fields, always allow save (presence-based)
  if (isSensorElementField.value) {
    return true;
  }

  // For uriArray fields, always allow save (presence-based)
  if (isUriArrayField.value) {
    return true;
  }

  // For uri fields, check if uri mode OR custom mode has pattern
  if (isUriField.value) {
    if (uriConfig.value.mode === "uri") {
      return true;
    } else if (uriConfig.value.mode === "custom") {
      return !!uriConfig.value.customPattern;
    }
    return true;
  }

  // For timezone fields, always allow save (presence-based)
  if (isTimezoneField.value) {
    return true;
  }

  // For epcList fields, check based on mode
  if (isEpcListField.value) {
    if (epcConfig.value.mode === "standard") {
      return epcConfig.value.selectedIdentifiers.length > 0;
    } else if (epcConfig.value.mode === "uri") {
      return true; // Any URI mode always valid
    } else if (epcConfig.value.mode === "custom") {
      return !!epcConfig.value.customPattern;
    }
    return false;
  }

  // For singleEpc fields (like parentID), check based on mode
  if (isSingleEpcField.value) {
    if (singleEpcConfig.value.mode === "standard") {
      return singleEpcConfig.value.selectedIdentifiers.length > 0;
    } else if (singleEpcConfig.value.mode === "uri") {
      return true; // Any URI mode always valid
    } else if (singleEpcConfig.value.mode === "custom") {
      return !!singleEpcConfig.value.customPattern;
    }
    return false;
  }

  // For quantityList fields, check if identifiers are selected (for epcClass)
  if (isQuantityListField.value) {
    return quantityListConfig.value.selectedIdentifiers.length > 0;
  }

  // For location fields, check if identifiers are selected OR manual pattern is provided
  if (isLocationField.value) {
    if (locationConfig.value.mode === "sgln") {
      return locationConfig.value.selectedIdentifiers.length > 0;
    } else if (locationConfig.value.mode === "manual") {
      return !!locationConfig.value.manualUriPattern;
    }
    return false;
  }

  // For enumWithCustom fields, check if values are selected OR custom pattern is provided
  if (isEnumWithCustomField.value) {
    if (enumConfig.value.mode === "standard") {
      return enumConfig.value.selectedValues.length > 0;
    } else if (enumConfig.value.mode === "custom") {
      return !!enumConfig.value.customUriPattern;
    }
    return false;
  }

  // For bizTransactionList fields, check based on type and value modes
  if (isBizTransactionListField.value) {
    const typeValid =
      bizTransactionConfig.value.typeMode === "standard"
        ? bizTransactionConfig.value.selectedTypes.length > 0
        : !!bizTransactionConfig.value.customTypePattern;
    const valueValid =
      bizTransactionConfig.value.valueMode === "uri"
        ? true
        : !!bizTransactionConfig.value.customValuePattern;
    return typeValid && valueValid;
  }

  // For sourceDestList fields (sourceList, destinationList), check based on type and value modes
  if (isSourceDestListField.value) {
    const typeValid =
      sourceDestListConfig.value.typeMode === "standard"
        ? sourceDestListConfig.value.selectedTypes.length > 0
        : !!sourceDestListConfig.value.customTypePattern;
    const valueValid =
      sourceDestListConfig.value.valueMode === "uri"
        ? true
        : !!sourceDestListConfig.value.customValuePattern;
    return typeValid && valueValid;
  }

  // For persistentDisposition fields, check set and unset configs
  if (isPersistentDispositionField.value) {
    const setValid =
      persistentDispositionConfig.value.setMode === "standard"
        ? persistentDispositionConfig.value.setSelectedValues.length > 0
        : !!persistentDispositionConfig.value.setCustomPattern;
    const unsetValid =
      persistentDispositionConfig.value.unsetMode === "standard"
        ? persistentDispositionConfig.value.unsetSelectedValues.length > 0
        : !!persistentDispositionConfig.value.unsetCustomPattern;
    // At least one of set or unset must be configured
    return setValid || unsetValid;
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

      // Handle epcList fields (arrays)
      if (field.fieldType === "epcList" && field.epcConfig) {
        epcConfig.value = {
          mode: field.epcConfig.mode || "standard",
          selectedIdentifiers: [...(field.epcConfig.selectedIdentifiers || [])],
          customPattern: field.epcConfig.customPattern,
          minItems: field.epcConfig.minItems,
          maxItems: field.epcConfig.maxItems,
        };
      } else {
        epcConfig.value = { mode: "standard", selectedIdentifiers: [] };
      }

      // Handle singleEpc fields (single identifier like parentID)
      if (field.fieldType === "singleEpc" && field.singleEpcConfig) {
        singleEpcConfig.value = {
          mode: field.singleEpcConfig.mode || "standard",
          selectedIdentifiers: [...(field.singleEpcConfig.selectedIdentifiers || [])],
          customPattern: field.singleEpcConfig.customPattern,
        };
      } else {
        singleEpcConfig.value = { mode: "standard", selectedIdentifiers: [] };
      }

      // Handle quantityList fields
      if (field.fieldType === "quantityList" && field.quantityListConfig) {
        quantityListConfig.value = {
          selectedIdentifiers: [...(field.quantityListConfig.selectedIdentifiers || [])],
          quantityRequired: field.quantityListConfig.quantityRequired || false,
          quantityMin: field.quantityListConfig.quantityMin,
          quantityMax: field.quantityListConfig.quantityMax,
          uomRequired: field.quantityListConfig.uomRequired || false,
          uomMode: field.quantityListConfig.uomMode || "any",
          uomSelectedValues: [...(field.quantityListConfig.uomSelectedValues || [])],
          uomCustomPattern: field.quantityListConfig.uomCustomPattern,
          arrayMinItems: field.quantityListConfig.arrayMinItems,
          arrayMaxItems: field.quantityListConfig.arrayMaxItems,
        };
      } else {
        quantityListConfig.value = {
          selectedIdentifiers: [],
          quantityRequired: false,
          quantityMin: undefined,
          quantityMax: undefined,
          uomRequired: false,
          uomMode: "any",
          uomSelectedValues: [],
          uomCustomPattern: undefined,
        };
      }

      // Handle location fields
      if (field.fieldType === "location" && field.locationConfig) {
        locationConfig.value = {
          mode: field.locationConfig.mode || "sgln",
          selectedIdentifiers: [...(field.locationConfig.selectedIdentifiers || [])],
          manualUriPattern: field.locationConfig.manualUriPattern,
        };
      } else {
        locationConfig.value = { mode: "sgln", selectedIdentifiers: [] };
      }

      // Handle enumWithCustom fields (bizStep, disposition)
      if (field.fieldType === "enumWithCustom" && field.enumConfig) {
        enumConfig.value = {
          mode: field.enumConfig.mode || "standard",
          selectedValues: [...(field.enumConfig.selectedValues || [])],
          customUriPattern: field.enumConfig.customUriPattern,
        };
      } else {
        enumConfig.value = { mode: "standard", selectedValues: [] };
      }

      // Handle bizTransactionList fields
      if (field.fieldType === "bizTransactionList" && field.bizTransactionConfig) {
        bizTransactionConfig.value = {
          typeMode: field.bizTransactionConfig.typeMode || "standard",
          selectedTypes: [...(field.bizTransactionConfig.selectedTypes || [])],
          customTypePattern: field.bizTransactionConfig.customTypePattern,
          valueMode: field.bizTransactionConfig.valueMode || "uri",
          customValuePattern: field.bizTransactionConfig.customValuePattern,
          minItems: field.bizTransactionConfig.minItems,
          maxItems: field.bizTransactionConfig.maxItems,
        };
      } else {
        bizTransactionConfig.value = { typeMode: "standard", selectedTypes: [], valueMode: "uri" };
      }

      // Handle sourceDestList fields (sourceList, destinationList)
      if (field.fieldType === "sourceDestList" && field.sourceDestListConfig) {
        sourceDestListConfig.value = {
          typeMode: field.sourceDestListConfig.typeMode || "standard",
          selectedTypes: [...(field.sourceDestListConfig.selectedTypes || [])],
          customTypePattern: field.sourceDestListConfig.customTypePattern,
          valueMode: field.sourceDestListConfig.valueMode || "uri",
          customValuePattern: field.sourceDestListConfig.customValuePattern,
          minItems: field.sourceDestListConfig.minItems,
          maxItems: field.sourceDestListConfig.maxItems,
        };
      } else {
        sourceDestListConfig.value = { typeMode: "standard", selectedTypes: [], valueMode: "uri" };
      }

      // Handle persistentDisposition fields
      if (field.fieldType === "persistentDisposition" && field.persistentDispositionConfig) {
        persistentDispositionConfig.value = {
          setMode: field.persistentDispositionConfig.setMode || "standard",
          setSelectedValues: [...(field.persistentDispositionConfig.setSelectedValues || [])],
          setCustomPattern: field.persistentDispositionConfig.setCustomPattern,
          unsetMode: field.persistentDispositionConfig.unsetMode || "standard",
          unsetSelectedValues: [...(field.persistentDispositionConfig.unsetSelectedValues || [])],
          unsetCustomPattern: field.persistentDispositionConfig.unsetCustomPattern,
          setMinItems: field.persistentDispositionConfig.setMinItems,
          setMaxItems: field.persistentDispositionConfig.setMaxItems,
          unsetMinItems: field.persistentDispositionConfig.unsetMinItems,
          unsetMaxItems: field.persistentDispositionConfig.unsetMaxItems,
        };
      } else {
        persistentDispositionConfig.value = { setMode: "standard", setSelectedValues: [], unsetMode: "standard", unsetSelectedValues: [] };
      }

      // Handle URI fields (eventID, etc.)
      if (field.fieldType === "uri" && field.uriConfig) {
        uriConfig.value = {
          mode: field.uriConfig.mode || "uri",
          customPattern: field.uriConfig.customPattern,
        };
      } else {
        uriConfig.value = { mode: "uri" };
      }

      // Handle URI Array fields (correctiveEventIDs, etc.)
      if (field.fieldType === "uriArray" && field.uriArrayConfig) {
        uriArrayConfig.value = {
          mode: field.uriArrayConfig.mode || "uri",
          customPattern: field.uriArrayConfig.customPattern,
          minItems: field.uriArrayConfig.minItems,
          maxItems: field.uriArrayConfig.maxItems,
        };
      } else {
        uriArrayConfig.value = { mode: "uri" };
      }

      // Handle sensorElement fields
      if (field.fieldType === "sensorElement" && field.sensorElementConfig) {
        sensorElementConfig.value = {
          minItems: field.sensorElementConfig.minItems,
          maxItems: field.sensorElementConfig.maxItems,
        };
      } else {
        sensorElementConfig.value = { minItems: undefined, maxItems: undefined };
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
const updateEpcConfig = (config: EpcListFieldConfig) => {
  epcConfig.value = config;
};

// Single EPC methods (for parentID - uses EpcListConfigPanel but stores as SingleEpcFieldConfig)
const singleEpcConfigAsEpcList = computed<EpcListFieldConfig>(() => ({
  mode: singleEpcConfig.value.mode,
  selectedIdentifiers: singleEpcConfig.value.selectedIdentifiers,
  customPattern: singleEpcConfig.value.customPattern,
}));

const updateSingleEpcConfig = (config: EpcListFieldConfig) => {
  singleEpcConfig.value = {
    mode: config.mode,
    selectedIdentifiers: config.selectedIdentifiers,
    customPattern: config.customPattern,
  };
};

// Location config methods
const updateLocationConfig = (config: LocationConfig) => {
  locationConfig.value = config;
};

// Enum config methods (bizStep, disposition)
const updateEnumConfig = (config: EnumOrCustomConfig) => {
  enumConfig.value = config;
};

// BizTransactionList config methods
const updateBizTransactionConfig = (config: BizTransactionListConfig) => {
  bizTransactionConfig.value = config;
};

// SourceDestList config methods (sourceList, destinationList)
const updateSourceDestListConfig = (config: SourceDestListConfig) => {
  sourceDestListConfig.value = config;
};

// PersistentDisposition config methods
const updatePersistentDispositionConfig = (config: PersistentDispositionConfig) => {
  persistentDispositionConfig.value = config;
};

// URI config methods (eventID, etc.)
const updateUriConfig = (config: UriFieldConfig) => {
  uriConfig.value = config;
};

// URI Array config methods (correctiveEventIDs, etc.)
const updateUriArrayConfig = (config: UriArrayConfig) => {
  uriArrayConfig.value = config;
};

// QuantityList config methods
const updateQuantityListConfig = (config: QuantityListConfig) => {
  quantityListConfig.value = config;
};

// SensorElement config handlers
const handleSensorMinItemsUpdate = (value: number | undefined) => {
  sensorElementConfig.value.minItems = value;
};

const handleSensorMaxItemsUpdate = (value: number | undefined) => {
  sensorElementConfig.value.maxItems = value;
};

const resetForm = () => {
  selectedFieldId.value = "";
  selectedValues.value = [];
  fieldRequired.value = true;
  searchQuery.value = "";
  epcConfig.value = { mode: "standard", selectedIdentifiers: [] };
  singleEpcConfig.value = { mode: "standard", selectedIdentifiers: [] };
  locationConfig.value = { mode: "sgln", selectedIdentifiers: [] };
  enumConfig.value = { mode: "standard", selectedValues: [] };
  bizTransactionConfig.value = { typeMode: "standard", selectedTypes: [], valueMode: "uri" };
  sourceDestListConfig.value = { typeMode: "standard", selectedTypes: [], valueMode: "uri" };
  persistentDispositionConfig.value = { setMode: "standard", setSelectedValues: [], unsetMode: "standard", unsetSelectedValues: [] };
  uriConfig.value = { mode: "uri" };
  uriArrayConfig.value = { mode: "uri" };
  quantityListConfig.value = {
    selectedIdentifiers: [],
    quantityRequired: false,
    quantityMin: undefined,
    quantityMax: undefined,
    uomRequired: false,
    uomMode: "any",
    uomSelectedValues: [],
    uomCustomPattern: undefined,
  };
  sensorElementConfig.value = { minItems: undefined, maxItems: undefined };
};

const closeModal = () => {
  isOpen.value = false;
  resetForm();
};

const saveField = () => {
  if (!selectedFieldConfig.value) return;

  // Handle datetime fields
  if (isDateTimeField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
    };
    emit("save", field);
  }
  // Handle sensorElement fields
  else if (isSensorElementField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      sensorElementConfig: {
        minItems: sensorElementConfig.value.minItems,
        maxItems: sensorElementConfig.value.maxItems,
      },
    };
    emit("save", field);
  }
  // Handle uriArray fields
  else if (isUriArrayField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      uriArrayConfig: {
        mode: uriArrayConfig.value.mode,
        customPattern: uriArrayConfig.value.mode === "custom"
          ? uriArrayConfig.value.customPattern
          : undefined,
        minItems: uriArrayConfig.value.minItems,
        maxItems: uriArrayConfig.value.maxItems,
      },
    };
    emit("save", field);
  }
  // Handle uri fields
  else if (isUriField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      uriConfig: {
        mode: uriConfig.value.mode,
        customPattern: uriConfig.value.mode === "custom"
          ? uriConfig.value.customPattern
          : undefined,
      },
    };
    emit("save", field);
  }
  // Handle timezone fields
  else if (isTimezoneField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
    };
    emit("save", field);
  }
  // Handle epcList fields (arrays)
  else if (isEpcListField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      epcConfig: {
        mode: epcConfig.value.mode,
        selectedIdentifiers: [...epcConfig.value.selectedIdentifiers],
        customPattern: epcConfig.value.mode === "custom"
          ? epcConfig.value.customPattern
          : undefined,
        minItems: epcConfig.value.minItems,
        maxItems: epcConfig.value.maxItems,
      },
    };
    emit("save", field);
  }
  // Handle singleEpc fields (single identifier like parentID - NOT an array)
  else if (isSingleEpcField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      singleEpcConfig: {
        mode: singleEpcConfig.value.mode,
        selectedIdentifiers: [...singleEpcConfig.value.selectedIdentifiers],
        customPattern: singleEpcConfig.value.mode === "custom"
          ? singleEpcConfig.value.customPattern
          : undefined,
      },
    };
    emit("save", field);
  }
  // Handle quantityList fields (uses quantityListConfig)
  else if (isQuantityListField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      quantityListConfig: {
        selectedIdentifiers: [...quantityListConfig.value.selectedIdentifiers],
        quantityRequired: quantityListConfig.value.quantityRequired,
        quantityMin: quantityListConfig.value.quantityMin,
        quantityMax: quantityListConfig.value.quantityMax,
        uomRequired: quantityListConfig.value.uomRequired,
        uomMode: quantityListConfig.value.uomMode,
        uomSelectedValues: quantityListConfig.value.uomMode === "standard"
          ? [...(quantityListConfig.value.uomSelectedValues || [])]
          : undefined,
        uomCustomPattern: quantityListConfig.value.uomMode === "custom"
          ? quantityListConfig.value.uomCustomPattern
          : undefined,
        arrayMinItems: quantityListConfig.value.arrayMinItems,
        arrayMaxItems: quantityListConfig.value.arrayMaxItems,
      },
    };
    emit("save", field);
  }
  // Handle location fields
  else if (isLocationField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      locationConfig: {
        mode: locationConfig.value.mode,
        selectedIdentifiers: [...locationConfig.value.selectedIdentifiers],
        manualUriPattern: locationConfig.value.mode === "manual"
          ? locationConfig.value.manualUriPattern
          : undefined,
      },
    };
    emit("save", field);
  }
  // Handle enumWithCustom fields (bizStep, disposition)
  else if (isEnumWithCustomField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      enumConfig: {
        mode: enumConfig.value.mode,
        selectedValues: [...enumConfig.value.selectedValues],
        customUriPattern: enumConfig.value.mode === "custom"
          ? enumConfig.value.customUriPattern
          : undefined,
      },
    };
    emit("save", field);
  }
  // Handle bizTransactionList fields
  else if (isBizTransactionListField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      bizTransactionConfig: {
        typeMode: bizTransactionConfig.value.typeMode,
        selectedTypes: [...bizTransactionConfig.value.selectedTypes],
        customTypePattern: bizTransactionConfig.value.typeMode === "custom"
          ? bizTransactionConfig.value.customTypePattern
          : undefined,
        valueMode: bizTransactionConfig.value.valueMode,
        customValuePattern: bizTransactionConfig.value.valueMode === "custom"
          ? bizTransactionConfig.value.customValuePattern
          : undefined,
        minItems: bizTransactionConfig.value.minItems,
        maxItems: bizTransactionConfig.value.maxItems,
      },
    };
    emit("save", field);
  }
  // Handle sourceDestList fields (sourceList, destinationList)
  else if (isSourceDestListField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      sourceDestListConfig: {
        typeMode: sourceDestListConfig.value.typeMode,
        selectedTypes: [...sourceDestListConfig.value.selectedTypes],
        customTypePattern: sourceDestListConfig.value.typeMode === "custom"
          ? sourceDestListConfig.value.customTypePattern
          : undefined,
        valueMode: sourceDestListConfig.value.valueMode,
        customValuePattern: sourceDestListConfig.value.valueMode === "custom"
          ? sourceDestListConfig.value.customValuePattern
          : undefined,
        minItems: sourceDestListConfig.value.minItems,
        maxItems: sourceDestListConfig.value.maxItems,
      },
    };
    emit("save", field);
  }
  // Handle persistentDisposition fields
  else if (isPersistentDispositionField.value) {
    const field: ProfileFieldConfig = {
      ...selectedFieldConfig.value,
      selectedValues: [],
      isRequired: fieldRequired.value,
      persistentDispositionConfig: {
        setMode: persistentDispositionConfig.value.setMode,
        setSelectedValues: [...persistentDispositionConfig.value.setSelectedValues],
        setCustomPattern: persistentDispositionConfig.value.setMode === "custom"
          ? persistentDispositionConfig.value.setCustomPattern
          : undefined,
        unsetMode: persistentDispositionConfig.value.unsetMode,
        unsetSelectedValues: [...persistentDispositionConfig.value.unsetSelectedValues],
        unsetCustomPattern: persistentDispositionConfig.value.unsetMode === "custom"
          ? persistentDispositionConfig.value.unsetCustomPattern
          : undefined,
        setMinItems: persistentDispositionConfig.value.setMinItems,
        setMaxItems: persistentDispositionConfig.value.setMaxItems,
        unsetMinItems: persistentDispositionConfig.value.unsetMinItems,
        unsetMaxItems: persistentDispositionConfig.value.unsetMaxItems,
      },
    };
    emit("save", field);
  }
  // Handle enum fields
  else {
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
