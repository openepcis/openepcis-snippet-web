<template>
  <div class="space-y-6">
    <!-- EPC Class Section -->
    <div>
      <UAccordion
        :items="[
          {
            label: 'EPC Class Identifiers',
            icon: 'i-heroicons-cube',
            defaultOpen: true,
            slot: 'epcClass',
          },
        ]"
        :ui="{
          item: {
            base: 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
          },
        }"
      >
        <template #epcClass>
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Select which class-level EPC identifier formats are allowed for
              the epcClass property (these are identifiers without serial
              numbers)
            </p>

            <!-- Mode Selector -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Identifier Mode
              </label>
              <USelectMenu
                v-model="localConfig.epcClassMode"
                :items="epcClassModeOptions"
                value-key="value"
                class="w-full"
                @update:model-value="emitUpdate"
              />
            </div>

            <!-- Standard Mode: Class-level identifiers -->
            <div v-if="localConfig.epcClassMode === 'standard'" class="space-y-4">
              <!-- Loading state -->
              <div
                v-if="isClassLoading"
                class="flex items-center justify-center py-8"
              >
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="w-6 h-6 text-gray-400 animate-spin"
                />
                <span class="ml-2 text-sm text-gray-500">
                  Loading identifiers from GitHub...
                </span>
              </div>

              <!-- Identifiers loaded -->
              <template v-else>
                <!-- GS1 Digital Link Class Identifiers Section (First to encourage DL usage) -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <h4
                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        GS1 Digital Link Class Identifiers
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
                        v-for="identifier in gs1DlClassIdentifiers"
                        :key="identifier.id"
                        class="flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors"
                        :class="
                          isIdentifierSelected(identifier.id)
                            ? 'bg-secondary-50 dark:bg-secondary-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        "
                      >
                        <input
                          type="checkbox"
                          :checked="isIdentifierSelected(identifier.id)"
                          class="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
                          @change="toggleIdentifier(identifier.id)"
                        />
                        <div class="flex-1 min-w-0">
                          <span
                            class="text-sm block"
                            :class="
                              isIdentifierSelected(identifier.id)
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
                      v-if="gs1DlClassIdentifiers.length === 0"
                      class="text-center py-4 text-gray-400 text-sm"
                    >
                      No Digital Link class identifiers available
                    </div>
                  </div>
                </div>

                <!-- EPC URN Class Identifiers Section -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <h4
                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        EPC URN Class Identifiers
                      </h4>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        Standard EPC class URI format (urn:epc:class: / urn:epc:idpat:)
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
                        v-for="identifier in epcUriClassIdentifiers"
                        :key="identifier.id"
                        class="flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors"
                        :class="
                          isIdentifierSelected(identifier.id)
                            ? 'bg-secondary-50 dark:bg-secondary-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        "
                      >
                        <input
                          type="checkbox"
                          :checked="isIdentifierSelected(identifier.id)"
                          class="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
                          @change="toggleIdentifier(identifier.id)"
                        />
                        <div class="flex-1 min-w-0">
                          <span
                            class="text-sm block"
                            :class="
                              isIdentifierSelected(identifier.id)
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
                  </div>
                </div>

                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ localConfig.selectedIdentifiers.length }} of
                  {{ classLevelIdentifiers.length }} identifiers selected
                </p>
              </template>
            </div>

            <!-- URI Mode Info -->
            <div v-else-if="localConfig.epcClassMode === 'uri'">
              <div
                class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
              >
                <div class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p class="text-sm text-primary-800 dark:text-primary-200">
                      Any valid URI is accepted for the epcClass property.
                    </p>
                    <p
                      class="text-xs text-primary-600 dark:text-primary-300 mt-1"
                    >
                      Pattern: <code class="font-mono">^[a-z][a-z0-9+.-]*:.*$</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Custom Pattern Mode -->
            <div v-else-if="localConfig.epcClassMode === 'custom'" class="space-y-3">
              <div
                class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <div class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-code-bracket"
                    class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <p class="text-sm text-blue-800 dark:text-blue-200">
                    Provide a custom regex pattern to validate epcClass values
                  </p>
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Validation Pattern (Regex)
                </label>
                <UInput
                  v-model="localConfig.epcClassCustomPattern"
                  placeholder="Enter regex pattern"
                  class="w-full font-mono text-sm"
                  @update:model-value="emitUpdate"
                />
              </div>

              <!-- Example Patterns -->
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
                >
                  Example Patterns
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="example in epcClassExamplePatterns"
                    :key="example.pattern"
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                    :class="
                      localConfig.epcClassCustomPattern === example.pattern
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    "
                    @click="selectEpcClassExamplePattern(example.pattern)"
                  >
                    {{ example.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UAccordion>
    </div>

    <!-- Quantity Configuration Section -->
    <div>
      <UAccordion
        :items="[
          {
            label: 'Quantity Configuration',
            icon: 'i-heroicons-hashtag',
            defaultOpen: true,
            slot: 'quantity',
          },
        ]"
        :ui="{
          item: {
            base: 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
          },
        }"
      >
        <template #quantity>
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
            <!-- Required Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Require Quantity
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Make the quantity property required in quantityElement
                </p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="localConfig.quantityRequired"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                :class="
                  localConfig.quantityRequired
                    ? 'bg-secondary-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                "
                @click="toggleQuantityRequired"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="
                    localConfig.quantityRequired
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  "
                />
              </button>
            </div>

            <!-- Min/Max Values -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Minimum Value
                </label>
                <UInput
                  :model-value="localConfig.quantityMin"
                  type="number"
                  placeholder="No minimum"
                  class="w-full"
                  @update:model-value="updateQuantityMin"
                />
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Maximum Value
                </label>
                <UInput
                  :model-value="localConfig.quantityMax"
                  type="number"
                  placeholder="No maximum"
                  class="w-full"
                  @update:model-value="updateQuantityMax"
                />
              </div>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400">
              Leave empty for no restriction. Quantity represents the count or
              amount of items.
            </p>
          </div>
        </template>
      </UAccordion>
    </div>

    <!-- UOM Configuration Section -->
    <div>
      <UAccordion
        :items="[
          {
            label: 'Unit of Measure (UOM) Configuration',
            icon: 'i-heroicons-scale',
            defaultOpen: true,
            slot: 'uom',
          },
        ]"
        :ui="{
          item: {
            base: 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
          },
        }"
      >
        <template #uom>
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
            <!-- Required Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <label
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Require UOM
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Make the uom property required in quantityElement
                </p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="localConfig.uomRequired"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                :class="
                  localConfig.uomRequired
                    ? 'bg-secondary-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                "
                @click="toggleUomRequired"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="
                    localConfig.uomRequired ? 'translate-x-5' : 'translate-x-0'
                  "
                />
              </button>
            </div>

            <!-- UOM Mode Selector -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Validation Mode
              </label>
              <USelectMenu
                v-model="localConfig.uomMode"
                :items="uomModeOptions"
                value-key="value"
                class="w-full"
                @update:model-value="emitUpdate"
              />
            </div>

            <!-- Any UOM Mode Info -->
            <div v-if="localConfig.uomMode === 'any'">
              <div
                class="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
              >
                <div class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p class="text-sm text-primary-800 dark:text-primary-200">
                      Any valid string is accepted as unit of measure.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Standard UOM Mode -->
            <div v-else-if="localConfig.uomMode === 'standard'" class="space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Select allowed UN/CEFACT measurement units
                </p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="text-xs text-secondary-600 dark:text-secondary-400 hover:underline"
                    @click="selectAllUomValues"
                  >
                    Select All
                  </button>
                  <span class="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    type="button"
                    class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                    @click="clearAllUomValues"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <!-- Search -->
              <div>
                <input
                  v-model="uomSearchQuery"
                  type="text"
                  placeholder="Search units..."
                  class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                />
              </div>

              <!-- UOM Values Grid -->
              <div
                class="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-1 p-2">
                  <label
                    v-for="unit in filteredUomUnits"
                    :key="unit.code"
                    class="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors"
                    :class="
                      isUomSelected(unit.code)
                        ? 'bg-secondary-50 dark:bg-secondary-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    "
                    :title="unit.description"
                  >
                    <input
                      type="checkbox"
                      :checked="isUomSelected(unit.code)"
                      class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
                      @change="toggleUomValue(unit.code)"
                    />
                    <div class="flex-1 min-w-0">
                      <span
                        class="text-sm font-mono"
                        :class="
                          isUomSelected(unit.code)
                            ? 'text-secondary-700 dark:text-secondary-300 font-medium'
                            : 'text-gray-700 dark:text-gray-300'
                        "
                      >
                        {{ unit.code }}
                      </span>
                      <span
                        class="text-xs text-gray-500 dark:text-gray-400 block truncate"
                      >
                        {{ unit.name }}
                      </span>
                    </div>
                  </label>
                </div>

                <div
                  v-if="uomSearchQuery && filteredUomUnits.length === 0"
                  class="text-center py-4 text-gray-400 text-sm"
                >
                  No units match "{{ uomSearchQuery }}"
                </div>
              </div>

              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ localConfig.uomSelectedValues?.length || 0 }} of
                {{ standardUomUnits.length }} units selected
              </p>
            </div>

            <!-- Custom Pattern Mode -->
            <div v-else-if="localConfig.uomMode === 'custom'" class="space-y-3">
              <div
                class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <div class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-code-bracket"
                    class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <p class="text-sm text-blue-800 dark:text-blue-200">
                    Provide a custom regex pattern to validate UOM values
                  </p>
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Validation Pattern (Regex)
                </label>
                <UInput
                  v-model="localConfig.uomCustomPattern"
                  placeholder="Enter regex pattern (e.g., ^(KGM|LBR|MTR)$)"
                  class="w-full font-mono text-sm"
                  @update:model-value="emitUpdate"
                />
              </div>

              <!-- Example Pattern Chips -->
              <div>
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
                >
                  Example Patterns
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="example in uomExamplePatterns"
                    :key="example.pattern"
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                    :class="
                      localConfig.uomCustomPattern === example.pattern
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    "
                    @click="selectUomExamplePattern(example.pattern)"
                  >
                    {{ example.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UAccordion>
    </div>

    <!-- Array Count Configuration Section -->
    <div>
      <UAccordion
        :items="[
          {
            label: 'Array Count Constraints',
            icon: 'i-heroicons-bars-3-bottom-left',
            defaultOpen: false,
            slot: 'arrayCount',
          },
        ]"
        :ui="{
          item: {
            base: 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
          },
        }"
      >
        <template #arrayCount>
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50">
            <ArrayCountConfigPanel
              :min-items="localConfig.arrayMinItems"
              :max-items="localConfig.arrayMaxItems"
              title="Quantity List Array Constraints"
              description="Set minimum and maximum number of quantity elements allowed in the list."
              @update:min-items="handleArrayMinItemsUpdate"
              @update:max-items="handleArrayMaxItemsUpdate"
            />
          </div>
        </template>
      </UAccordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { QuantityListConfig, EpcIdentifierType } from "~/types/profile";
import { useGitHubEpcIdentifiers } from "~/composables/useGitHubEpcIdentifiers";

const props = defineProps<{
  quantityListConfig?: QuantityListConfig;
}>();

const emit = defineEmits<{
  (e: "update:quantityListConfig", value: QuantityListConfig): void;
}>();

// Get class-level identifiers from composable (fetched from GitHub)
const {
  isClassLoading,
  classIdentifiers,
  fetchClassLevelIdentifiers,
} = useGitHubEpcIdentifiers();

// Use the reactive classIdentifiers directly
const classLevelIdentifiers = computed<EpcIdentifierType[]>(() => [
  ...classIdentifiers.value,
]);

// Fetch class-level identifiers on mount
onMounted(() => {
  fetchClassLevelIdentifiers();
});

// Default config
const defaultConfig: QuantityListConfig = {
  epcClassMode: "standard",
  selectedIdentifiers: [],
  epcClassCustomPattern: undefined,
  quantityRequired: false,
  quantityMin: undefined,
  quantityMax: undefined,
  uomRequired: false,
  uomMode: "any",
  uomSelectedValues: [],
  uomCustomPattern: undefined,
  arrayMinItems: undefined,
  arrayMaxItems: undefined,
};

// Local state
const localConfig = ref<QuantityListConfig>({
  ...defaultConfig,
  ...props.quantityListConfig,
});

const uomSearchQuery = ref("");

// EPC Class mode options
const epcClassModeOptions = [
  { label: "Standard Class-Level Identifiers", value: "standard" },
  { label: "Any URI (No Validation)", value: "uri" },
  { label: "Custom Pattern (Regex)", value: "custom" },
];

// Example patterns for custom epcClass validation
const epcClassExamplePatterns = [
  { label: "GTIN Digital Link", pattern: "^https://id\\.gs1\\.org/01/.*" },
  { label: "LGTIN Only", pattern: "^urn:epc:class:lgtin:[0-9]{6,12}\\.[0-9]{1,7}\\.[!%-?A-Z_a-z\\x22]+$" },
  { label: "Any Class URN", pattern: "^urn:epc:(class|idpat):.*$" },
];

// UOM mode options
const uomModeOptions = [
  { label: "Any String", value: "any" },
  { label: "Standard UN/CEFACT Units", value: "standard" },
  { label: "Custom Pattern", value: "custom" },
];

// Standard UN/CEFACT measurement units commonly used in EPCIS
const standardUomUnits = [
  // Mass units
  { code: "KGM", name: "Kilogram", description: "SI base unit of mass", category: "mass" },
  { code: "GRM", name: "Gram", description: "One thousandth of a kilogram", category: "mass" },
  { code: "MGM", name: "Milligram", description: "One millionth of a kilogram", category: "mass" },
  { code: "TNE", name: "Metric Ton", description: "1000 kilograms", category: "mass" },
  { code: "LBR", name: "Pound", description: "Imperial unit of mass", category: "mass" },
  { code: "ONZ", name: "Ounce", description: "One sixteenth of a pound", category: "mass" },

  // Length units
  { code: "MTR", name: "Meter", description: "SI base unit of length", category: "length" },
  { code: "CMT", name: "Centimeter", description: "One hundredth of a meter", category: "length" },
  { code: "MMT", name: "Millimeter", description: "One thousandth of a meter", category: "length" },
  { code: "KMT", name: "Kilometer", description: "1000 meters", category: "length" },
  { code: "INH", name: "Inch", description: "Imperial unit of length", category: "length" },
  { code: "FOT", name: "Foot", description: "12 inches", category: "length" },
  { code: "YRD", name: "Yard", description: "3 feet", category: "length" },

  // Volume units
  { code: "LTR", name: "Liter", description: "SI derived unit of volume", category: "volume" },
  { code: "MLT", name: "Milliliter", description: "One thousandth of a liter", category: "volume" },
  { code: "MTQ", name: "Cubic Meter", description: "SI unit of volume", category: "volume" },
  { code: "GLI", name: "Gallon (UK)", description: "Imperial gallon", category: "volume" },
  { code: "GLL", name: "Gallon (US)", description: "US liquid gallon", category: "volume" },
  { code: "QT", name: "Quart (US)", description: "US liquid quart", category: "volume" },
  { code: "PT", name: "Pint (US)", description: "US liquid pint", category: "volume" },

  // Count/Quantity units
  { code: "EA", name: "Each", description: "Individual item count", category: "count" },
  { code: "PCE", name: "Piece", description: "Single piece", category: "count" },
  { code: "BX", name: "Box", description: "Box container", category: "count" },
  { code: "CS", name: "Case", description: "Case container", category: "count" },
  { code: "PK", name: "Pack", description: "Package/pack", category: "count" },
  { code: "DZN", name: "Dozen", description: "12 items", category: "count" },
  { code: "GRO", name: "Gross", description: "144 items", category: "count" },
  { code: "PR", name: "Pair", description: "2 items", category: "count" },
  { code: "SET", name: "Set", description: "A set of items", category: "count" },

  // Area units
  { code: "MTK", name: "Square Meter", description: "SI unit of area", category: "area" },
  { code: "CMK", name: "Square Centimeter", description: "One ten-thousandth of sq meter", category: "area" },
  { code: "FTK", name: "Square Foot", description: "Imperial unit of area", category: "area" },

  // Temperature units
  { code: "CEL", name: "Celsius", description: "Degree Celsius", category: "temperature" },
  { code: "FAH", name: "Fahrenheit", description: "Degree Fahrenheit", category: "temperature" },
  { code: "KEL", name: "Kelvin", description: "SI unit of temperature", category: "temperature" },
];

// Example patterns for custom UOM validation
const uomExamplePatterns = [
  { label: "Mass Units", pattern: "^(KGM|GRM|MGM|TNE|LBR|ONZ)$" },
  { label: "Length Units", pattern: "^(MTR|CMT|MMT|KMT|INH|FOT|YRD)$" },
  { label: "Volume Units", pattern: "^(LTR|MLT|MTQ|GLI|GLL)$" },
  { label: "Count Units", pattern: "^(EA|PCE|BX|CS|PK)$" },
];

// Computed: Filtered UOM units based on search
const filteredUomUnits = computed(() => {
  if (!uomSearchQuery.value) return standardUomUnits;
  const query = uomSearchQuery.value.toLowerCase();
  return standardUomUnits.filter(
    (u) =>
      u.code.toLowerCase().includes(query) ||
      u.name.toLowerCase().includes(query) ||
      u.description.toLowerCase().includes(query)
  );
});

// Computed: EPC URN class identifiers
const epcUriClassIdentifiers = computed(() =>
  classLevelIdentifiers.value.filter((i) => i.category === "epc-uri")
);

// Computed: GS1 Digital Link class identifiers
const gs1DlClassIdentifiers = computed(() =>
  classLevelIdentifiers.value.filter((i) => i.category === "gs1-dl")
);

// Methods
const emitUpdate = () => {
  emit("update:quantityListConfig", { ...localConfig.value });
};

// Class-level identifier methods
const isIdentifierSelected = (id: string): boolean => {
  return localConfig.value.selectedIdentifiers.includes(id);
};

const toggleIdentifier = (id: string) => {
  const current = [...localConfig.value.selectedIdentifiers];
  const idx = current.indexOf(id);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(id);
  }
  localConfig.value.selectedIdentifiers = current;
  emitUpdate();
};

const selectAllClassIdentifiers = () => {
  localConfig.value.selectedIdentifiers = classLevelIdentifiers.value.map(
    (i) => i.id
  );
  emitUpdate();
};

const clearAllClassIdentifiers = () => {
  localConfig.value.selectedIdentifiers = [];
  emitUpdate();
};

const selectAllInCategory = (category: "epc-uri" | "gs1-dl") => {
  const categoryIds = classLevelIdentifiers.value
    .filter((i) => i.category === category)
    .map((i) => i.id);
  const current = new Set(localConfig.value.selectedIdentifiers);
  categoryIds.forEach((id) => current.add(id));
  localConfig.value.selectedIdentifiers = Array.from(current);
  emitUpdate();
};

const clearAllInCategory = (category: "epc-uri" | "gs1-dl") => {
  const categoryIds = classLevelIdentifiers.value
    .filter((i) => i.category === category)
    .map((i) => i.id);
  localConfig.value.selectedIdentifiers = localConfig.value.selectedIdentifiers.filter(
    (id) => !categoryIds.includes(id)
  );
  emitUpdate();
};

const selectEpcClassExamplePattern = (pattern: string) => {
  localConfig.value.epcClassCustomPattern = pattern;
  emitUpdate();
};

const toggleQuantityRequired = () => {
  localConfig.value.quantityRequired = !localConfig.value.quantityRequired;
  emitUpdate();
};

const updateQuantityMin = (value: number | string | undefined) => {
  localConfig.value.quantityMin =
    value === "" || value === undefined ? undefined : Number(value);
  emitUpdate();
};

const updateQuantityMax = (value: number | string | undefined) => {
  localConfig.value.quantityMax =
    value === "" || value === undefined ? undefined : Number(value);
  emitUpdate();
};

const toggleUomRequired = () => {
  localConfig.value.uomRequired = !localConfig.value.uomRequired;
  emitUpdate();
};

const isUomSelected = (code: string): boolean => {
  return localConfig.value.uomSelectedValues?.includes(code) || false;
};

const toggleUomValue = (code: string) => {
  const current = [...(localConfig.value.uomSelectedValues || [])];
  const idx = current.indexOf(code);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(code);
  }
  localConfig.value.uomSelectedValues = current;
  emitUpdate();
};

const selectAllUomValues = () => {
  localConfig.value.uomSelectedValues = standardUomUnits.map((u) => u.code);
  emitUpdate();
};

const clearAllUomValues = () => {
  localConfig.value.uomSelectedValues = [];
  emitUpdate();
};

const selectUomExamplePattern = (pattern: string) => {
  localConfig.value.uomCustomPattern = pattern;
  emitUpdate();
};

// Array count handlers
const handleArrayMinItemsUpdate = (value: number | undefined) => {
  localConfig.value.arrayMinItems = value;
  emitUpdate();
};

const handleArrayMaxItemsUpdate = (value: number | undefined) => {
  localConfig.value.arrayMaxItems = value;
  emitUpdate();
};

// Watch for prop changes (when editing existing field)
watch(
  () => props.quantityListConfig,
  (newConfig) => {
    if (newConfig) {
      localConfig.value = { ...defaultConfig, ...newConfig };
    }
  },
  { deep: true, immediate: true }
);
</script>
