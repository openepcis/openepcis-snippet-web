<template>
  <div class="space-y-6">
    <!-- ILMD vs User Extensions Info Box -->
    <div
      v-if="isIlmd"
      class="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
    >
      <div class="flex items-start gap-3">
        <UIcon
          name="i-heroicons-cube"
          class="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0"
        />
        <div>
          <h4 class="text-sm font-medium text-purple-800 dark:text-purple-200">
            Instance/Lot Master Data (ILMD)
          </h4>

          <p class="text-xs text-purple-600 dark:text-purple-300 mt-1">
            Properties will be wrapped in the "ilmd" object. Define namespaces
            and elements for lot-specific data like expiration dates, batch
            numbers, etc.
          </p>
        </div>
      </div>
    </div>

    <div
      v-else
      class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
    >
      <div class="flex items-start gap-3">
        <UIcon
          name="i-heroicons-puzzle-piece"
          class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
        />
        <div>
          <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">
            User Extensions
          </h4>

          <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Properties will be added directly to the event. Define namespaces to
            allow custom extension fields like "ext1:customField".
          </p>
        </div>
      </div>
    </div>

    <!-- Mode Selector -->
    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Validation Mode
      </label>

      <USelectMenu
        v-model="selectedMode"
        :items="modeOptions"
        value-key="value"
        class="w-full"
      />
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {{
          selectedMode === "pattern"
            ? "Allows any property matching registered namespace prefixes."
            : "Define specific elements with exact types and validation rules."
        }}
      </p>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 dark:border-gray-700" />

    <!-- Namespace Management Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-globe-alt"
            class="w-4 h-4 text-emerald-500"
          />
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Namespaces
          </h4>
        </div>

        <UButton
          size="xs"
          color="secondary"
          variant="soft"
          icon="i-heroicons-plus"
          @click="showAddNamespaceForm = true"
        >
          Add Namespace
        </UButton>
      </div>

      <!-- Common Namespace Presets -->
      <div v-if="localNamespaces.length === 0 && !showAddNamespaceForm">
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Quick add common namespaces:
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in namespacePresets"
            :key="preset.prefix"
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="addPresetNamespace(preset)"
          >
            <span>{{ preset.label }}</span>
          </button>
        </div>
      </div>

      <!-- Add/Edit Namespace Form -->
      <div
        v-if="showAddNamespaceForm || editingNamespace"
        class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3"
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
            >
              Prefix
            </label>

            <UInput
              v-model="namespaceForm.prefix"
              placeholder="e.g., ext1"
              color="secondary"
              class="font-mono"
            />
          </div>

          <div class="sm:col-span-2">
            <label
              class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
            >
              Namespace URI
            </label>

            <UInput
              v-model="namespaceForm.uri"
              placeholder="e.g., http://example.com/ext1/"
              color="secondary"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <UButton size="xs" color="secondary" @click="saveNamespace">
            {{ editingNamespace ? "Update" : "Add" }}
          </UButton>

          <UButton
            size="xs"
            variant="ghost"
            color="neutral"
            @click="cancelNamespaceEdit"
          >
            Cancel
          </UButton>
        </div>
      </div>

      <!-- Namespace List -->
      <div v-if="localNamespaces.length > 0" class="space-y-2">
        <div
          v-for="ns in localNamespaces"
          :key="ns.id"
          class="group flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span
                class="font-mono font-semibold text-sm text-gray-900 dark:text-gray-100"
              >
                {{ ns.prefix }}:
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ ns.uri }}
              </span>
            </div>
          </div>
          <div
            class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              icon="i-heroicons-pencil"
              @click="editNamespace(ns)"
            />

            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-heroicons-trash"
              @click="removeNamespace(ns.id)"
            />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!showAddNamespaceForm"
        class="text-center py-4 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm">No namespaces defined</p>
        <p class="text-xs mt-1">
          Add a namespace to define extension properties
        </p>
      </div>
    </div>

    <!-- Specific Mode: Element Builder -->
    <template v-if="selectedMode === 'specific'">
      <div class="border-t border-gray-200 dark:border-gray-700" />

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-squares-2x2"
              class="w-4 h-4 text-amber-500"
            />
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Extension Elements
            </h4>
          </div>
          <UButton
            size="xs"
            color="secondary"
            variant="soft"
            icon="i-heroicons-plus"
            :disabled="localNamespaces.length === 0"
            @click="openAddElementModal(null, 'element')"
          >
            Add Element
          </UButton>
        </div>

        <div
          v-if="localNamespaces.length === 0"
          class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        >
          <p class="text-xs text-amber-600 dark:text-amber-300">
            Add at least one namespace before defining elements.
          </p>
        </div>

        <!-- Element Tree -->
        <div v-if="localElements.length > 0" class="space-y-1">
          <ExtensionElementTree
            v-for="element in localElements"
            :key="element.id"
            :element="element"
            :namespaces="localNamespaces"
            :depth="0"
            @remove="removeElement"
            @add-nested="openAddElementModal($event, 'nested')"
            @add-array-item="openAddElementModal($event, 'arrayItem')"
          />
        </div>

        <!-- Empty state for elements -->
        <div
          v-else-if="localNamespaces.length > 0"
          class="text-center py-4 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-700"
        >
          <p class="text-sm">No elements defined</p>
          <p class="text-xs mt-1">
            Add elements to define specific extension properties
          </p>
        </div>
      </div>

      <!-- Add/Edit Element Modal -->
      <UModal v-model:open="showElementModal" :title="elementModalTitle">
        <template #body>
          <div class="space-y-4">
            <p
              v-if="elementModalContext.parentId"
              class="text-sm text-gray-600 dark:text-gray-400"
            >
              Adding
              {{
                elementModalContext.type === "arrayItem"
                  ? "array item element"
                  : "nested element"
              }}
              to:
              <span class="font-mono font-medium">{{
                getFullElementName(elementModalContext.parentId)
              }}</span>
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Namespace
                </label>
                <USelectMenu
                  v-model="elementForm.namespaceId"
                  :items="namespaceOptions"
                  value-key="value"
                  placeholder="Prefix"
                />
              </div>
              <div class="sm:col-span-2">
                <label
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Element Name
                </label>
                <UInput
                  v-model="elementForm.localName"
                  placeholder="e.g., batchNumber"
                  color="secondary"
                  class="font-mono"
                />
              </div>

              <div>
                <label
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Type
                </label>

                <USelectMenu
                  v-model="elementForm.valueType"
                  :items="valueTypeOptions"
                  value-key="value"
                />
              </div>
            </div>

            <!-- Type-specific options -->
            <div v-if="elementForm.valueType === 'string'" class="space-y-2">
              <label
                class="block text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                Pattern (optional regex)
              </label>

              <UInput
                v-model="elementForm.stringPattern"
                placeholder="e.g., ^[A-Z0-9]+$"
                color="secondary"
                class="font-mono"
              />
            </div>

            <div
              v-if="elementForm.valueType === 'number'"
              class="grid grid-cols-2 gap-3"
            >
              <div>
                <label
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Minimum
                </label>

                <UInput
                  v-model.number="elementForm.numberMin"
                  type="number"
                  placeholder="Min"
                  color="secondary"
                />
              </div>

              <div>
                <label
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Maximum
                </label>

                <UInput
                  v-model.number="elementForm.numberMax"
                  type="number"
                  placeholder="Max"
                  color="secondary"
                />
              </div>
            </div>

            <div v-if="elementForm.valueType === 'array'" class="space-y-3">
              <div>
                <label
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Array Item Type
                  <span class="font-normal text-gray-400"
                    >(select "Object" for nested structures)</span
                  >
                </label>
                <USelectMenu
                  v-model="elementForm.arrayItemType"
                  :items="arrayItemTypeOptions"
                  value-key="value"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{
                    elementForm.arrayItemType === "object"
                      ? "You can define the object structure after adding this array."
                      : "Primitive arrays contain simple values without nested properties."
                  }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Min Items
                  </label>

                  <UInput
                    v-model.number="elementForm.arrayMinItems"
                    type="number"
                    placeholder="Min"
                    color="secondary"
                  />
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Max Items
                  </label>

                  <UInput
                    v-model.number="elementForm.arrayMaxItems"
                    type="number"
                    placeholder="Max"
                    color="secondary"
                  />
                </div>
              </div>

              <div
                v-if="elementForm.arrayItemType === 'object'"
                class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <p class="text-xs text-blue-600 dark:text-blue-300">
                  After adding this array, click the "+" button next to it to
                  define the object structure for array items.
                </p>
              </div>
            </div>

            <div v-if="elementForm.valueType === 'object'">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                After adding this element, click the "+" button to add nested
                properties.
              </p>
            </div>

            <!-- Required toggle -->
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="elementForm.isRequired"
                class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-secondary-600 focus:ring-secondary-500"
              />
              <label class="text-sm text-gray-700 dark:text-gray-300"
                >Required</label
              >
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              color="neutral"
              @click="showElementModal = false"
            >
              Cancel
            </UButton>
            <UButton color="secondary" @click="saveElement">
              {{ elementModalContext.parentId ? "Add" : "Add Element" }}
            </UButton>
          </div>
        </template>
      </UModal>
    </template>

    <!-- Schema Preview -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <div class="flex items-center gap-2 mb-2">
        <UIcon name="i-heroicons-code-bracket" class="w-4 h-4 text-gray-500" />
        <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Schema Preview
        </h4>
      </div>
      <pre
        class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono overflow-auto max-h-48 text-gray-700 dark:text-gray-300"
        >{{ schemaPreview }}</pre
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type {
  ExtensionConfig,
  ExtensionNamespace,
  ExtensionElement,
  ExtensionValueType,
  ExtensionMode,
} from "~/types/profile";
import ExtensionElementTree from "~/components/ExtensionElementTree.vue";

// Props
const props = defineProps<{
  extensionConfig: ExtensionConfig;
  isIlmd: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:extensionConfig", value: ExtensionConfig): void;
}>();

// Mode options
const modeOptions = [
  { label: "Pattern Mode (Flexible)", value: "pattern" },
  { label: "Specific Mode (Strict)", value: "specific" },
];

// Value type options
const valueTypeOptions = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Array", value: "array" },
  { label: "Object", value: "object" },
];

// Array item type options (includes object for arrays of objects)
const arrayItemTypeOptions = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Object", value: "object" },
];

// Common namespace presets
const namespacePresets = [
  { prefix: "cbvmda", uri: "urn:epcglobal:cbv:mda", label: "CBV Master Data" },
  { prefix: "gs1", uri: "https://gs1.org/voc/", label: "GS1 Vocabulary" },
  { prefix: "example", uri: "http://example.com/", label: "Example" },
];

// Local state
const selectedMode = ref<ExtensionMode>(
  props.extensionConfig?.mode || "pattern",
);
const localNamespaces = ref<ExtensionNamespace[]>([
  ...(props.extensionConfig?.namespaces || []),
]);
const localElements = ref<ExtensionElement[]>(
  JSON.parse(JSON.stringify(props.extensionConfig?.elements || [])),
);

// Namespace form state
const showAddNamespaceForm = ref(false);
const editingNamespace = ref<ExtensionNamespace | null>(null);
const namespaceForm = ref({ prefix: "", uri: "" });

// Element modal state
const showElementModal = ref(false);
const elementModalContext = ref<{
  parentId: string | null;
  type: "element" | "nested" | "arrayItem";
}>({ parentId: null, type: "element" });
const elementForm = ref<{
  namespaceId: string;
  localName: string;
  valueType: ExtensionValueType;
  isRequired: boolean;
  stringPattern?: string;
  numberMin?: number;
  numberMax?: number;
  arrayItemType?: ExtensionValueType;
  arrayMinItems?: number;
  arrayMaxItems?: number;
}>({
  namespaceId: "",
  localName: "",
  valueType: "string",
  isRequired: false,
  arrayItemType: "string",
});

// Computed: Modal title
const elementModalTitle = computed(() => {
  if (elementModalContext.value.type === "arrayItem") {
    return "Add Array Item Element";
  } else if (elementModalContext.value.type === "nested") {
    return "Add Nested Element";
  }
  return "Add Extension Element";
});

// Computed: Namespace options for dropdowns
const namespaceOptions = computed(() =>
  localNamespaces.value.map((ns) => ({
    label: `${ns.prefix}:`,
    value: ns.id,
  })),
);

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Namespace methods
const addPresetNamespace = (preset: { prefix: string; uri: string }) => {
  const exists = localNamespaces.value.some(
    (ns) => ns.prefix === preset.prefix,
  );
  if (!exists) {
    localNamespaces.value.push({
      id: generateId(),
      prefix: preset.prefix,
      uri: preset.uri,
    });
    emitUpdate();
  }
};

const saveNamespace = () => {
  if (!namespaceForm.value.prefix || !namespaceForm.value.uri) return;

  if (editingNamespace.value) {
    const idx = localNamespaces.value.findIndex(
      (ns) => ns.id === editingNamespace.value!.id,
    );
    if (idx >= 0) {
      localNamespaces.value[idx] = {
        ...editingNamespace.value,
        prefix: namespaceForm.value.prefix,
        uri: namespaceForm.value.uri,
      };
    }
    editingNamespace.value = null;
  } else {
    localNamespaces.value.push({
      id: generateId(),
      prefix: namespaceForm.value.prefix,
      uri: namespaceForm.value.uri,
    });
  }

  namespaceForm.value = { prefix: "", uri: "" };
  showAddNamespaceForm.value = false;
  emitUpdate();
};

const editNamespace = (ns: ExtensionNamespace) => {
  editingNamespace.value = ns;
  namespaceForm.value = { prefix: ns.prefix, uri: ns.uri };
};

const cancelNamespaceEdit = () => {
  editingNamespace.value = null;
  showAddNamespaceForm.value = false;
  namespaceForm.value = { prefix: "", uri: "" };
};

const removeNamespace = (id: string) => {
  localNamespaces.value = localNamespaces.value.filter((ns) => ns.id !== id);
  // Also remove elements using this namespace (recursively)
  const removeElementsWithNamespace = (
    elements: ExtensionElement[],
  ): ExtensionElement[] => {
    return elements
      .filter((el) => el.namespaceId !== id)
      .map((el) => ({
        ...el,
        nestedElements: el.nestedElements
          ? removeElementsWithNamespace(el.nestedElements)
          : undefined,
        arrayItemElements: el.arrayItemElements
          ? removeElementsWithNamespace(el.arrayItemElements)
          : undefined,
      }));
  };
  localElements.value = removeElementsWithNamespace(localElements.value);
  emitUpdate();
};

// Element methods
const openAddElementModal = (
  parentId: string | null,
  type: "element" | "nested" | "arrayItem",
) => {
  elementModalContext.value = { parentId, type };
  elementForm.value = {
    namespaceId: localNamespaces.value[0]?.id || "",
    localName: "",
    valueType: "string",
    isRequired: false,
    arrayItemType: "string",
  };
  showElementModal.value = true;
};

const getFullElementName = (elementId: string): string => {
  const findElement = (
    elements: ExtensionElement[],
  ): ExtensionElement | null => {
    for (const el of elements) {
      if (el.id === elementId) return el;
      if (el.nestedElements) {
        const found = findElement(el.nestedElements);
        if (found) return found;
      }
      if (el.arrayItemElements) {
        const found = findElement(el.arrayItemElements);
        if (found) return found;
      }
    }
    return null;
  };
  const element = findElement(localElements.value);
  if (!element) return "";
  const ns = localNamespaces.value.find((n) => n.id === element.namespaceId);
  return `${ns?.prefix || ""}:${element.localName}`;
};

const saveElement = () => {
  if (!elementForm.value.namespaceId || !elementForm.value.localName) return;

  const newElement: ExtensionElement = {
    id: generateId(),
    namespaceId: elementForm.value.namespaceId,
    localName: elementForm.value.localName,
    valueType: elementForm.value.valueType,
    isRequired: elementForm.value.isRequired,
  };

  // Add type-specific properties
  if (
    elementForm.value.valueType === "string" &&
    elementForm.value.stringPattern
  ) {
    newElement.stringPattern = elementForm.value.stringPattern;
  }
  if (elementForm.value.valueType === "number") {
    if (elementForm.value.numberMin !== undefined)
      newElement.numberMin = elementForm.value.numberMin;
    if (elementForm.value.numberMax !== undefined)
      newElement.numberMax = elementForm.value.numberMax;
  }
  if (elementForm.value.valueType === "array") {
    newElement.arrayItemType = elementForm.value.arrayItemType || "string";
    if (elementForm.value.arrayMinItems !== undefined)
      newElement.arrayMinItems = elementForm.value.arrayMinItems;
    if (elementForm.value.arrayMaxItems !== undefined)
      newElement.arrayMaxItems = elementForm.value.arrayMaxItems;
    if (elementForm.value.arrayItemType === "object") {
      newElement.arrayItemElements = [];
    }
  }
  if (elementForm.value.valueType === "object") {
    newElement.nestedElements = [];
  }

  if (!elementModalContext.value.parentId) {
    // Add to root level
    localElements.value.push(newElement);
  } else {
    // Add to parent element
    const addToParent = (elements: ExtensionElement[]): boolean => {
      for (const el of elements) {
        if (el.id === elementModalContext.value.parentId) {
          if (elementModalContext.value.type === "arrayItem") {
            if (!el.arrayItemElements) el.arrayItemElements = [];
            el.arrayItemElements.push(newElement);
          } else {
            if (!el.nestedElements) el.nestedElements = [];
            el.nestedElements.push(newElement);
          }
          return true;
        }
        if (el.nestedElements && addToParent(el.nestedElements)) return true;
        if (el.arrayItemElements && addToParent(el.arrayItemElements))
          return true;
      }
      return false;
    };
    addToParent(localElements.value);
  }

  showElementModal.value = false;
  emitUpdate();
};

const removeElement = (id: string) => {
  const removeFromList = (elements: ExtensionElement[]): ExtensionElement[] => {
    return elements
      .filter((el) => el.id !== id)
      .map((el) => ({
        ...el,
        nestedElements: el.nestedElements
          ? removeFromList(el.nestedElements)
          : undefined,
        arrayItemElements: el.arrayItemElements
          ? removeFromList(el.arrayItemElements)
          : undefined,
      }));
  };
  localElements.value = removeFromList(localElements.value);
  emitUpdate();
};

// Schema preview
const schemaPreview = computed(() => {
  const schema = generatePreviewSchema();
  return JSON.stringify(schema, null, 2);
});

const generatePreviewSchema = () => {
  if (selectedMode.value === "pattern") {
    if (localNamespaces.value.length === 0) {
      return { type: "object" };
    }

    const patternProperties: Record<string, unknown> = {};
    localNamespaces.value.forEach((ns) => {
      const pattern = `^${escapeRegExp(ns.prefix)}:.*$`;
      patternProperties[pattern] = {
        oneOf: [
          { type: "string" },
          { type: "number" },
          { type: "boolean" },
          { type: "array" },
          { type: "object" },
        ],
      };
    });

    return {
      type: "object",
      patternProperties,
      additionalProperties: false,
    };
  } else {
    // Specific mode
    if (localElements.value.length === 0) {
      return { type: "object" };
    }

    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    const processElement = (element: ExtensionElement): unknown => {
      let schema: Record<string, unknown>;

      switch (element.valueType) {
        case "string":
          schema = { type: "string" };
          if (element.stringPattern) schema.pattern = element.stringPattern;
          break;
        case "number":
          schema = { type: "number" };
          if (element.numberMin !== undefined)
            schema.minimum = element.numberMin;
          if (element.numberMax !== undefined)
            schema.maximum = element.numberMax;
          break;
        case "boolean":
          schema = { type: "boolean" };
          break;
        case "array":
          if (
            element.arrayItemType === "object" &&
            element.arrayItemElements &&
            element.arrayItemElements.length > 0
          ) {
            // Array of objects with defined structure
            const itemProps: Record<string, unknown> = {};
            const itemRequired: string[] = [];
            element.arrayItemElements.forEach((itemEl) => {
              const itemNs = localNamespaces.value.find(
                (n) => n.id === itemEl.namespaceId,
              );
              const itemKey = `${itemNs?.prefix || "ext"}:${itemEl.localName}`;
              itemProps[itemKey] = processElement(itemEl);
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
          if (element.arrayMinItems !== undefined)
            schema.minItems = element.arrayMinItems;
          if (element.arrayMaxItems !== undefined)
            schema.maxItems = element.arrayMaxItems;
          break;
        case "object":
          if (element.nestedElements && element.nestedElements.length > 0) {
            const nestedProps: Record<string, unknown> = {};
            const nestedRequired: string[] = [];
            element.nestedElements.forEach((nested) => {
              const nestedNs = localNamespaces.value.find(
                (n) => n.id === nested.namespaceId,
              );
              const nestedKey = `${nestedNs?.prefix || "ext"}:${nested.localName}`;
              nestedProps[nestedKey] = processElement(nested);
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

    localElements.value.forEach((element) => {
      const ns = localNamespaces.value.find(
        (n) => n.id === element.namespaceId,
      );
      const key = `${ns?.prefix || "ext"}:${element.localName}`;
      properties[key] = processElement(element);
      if (element.isRequired) required.push(key);
    });

    return {
      type: "object",
      properties,
      ...(required.length > 0 && { required }),
      additionalProperties: false,
    };
  }
};

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Emit update
const emitUpdate = () => {
  emit("update:extensionConfig", {
    mode: selectedMode.value,
    namespaces: [...localNamespaces.value],
    elements: JSON.parse(JSON.stringify(localElements.value)),
    isIlmd: props.isIlmd,
  });
};

// Watch for mode changes
watch(selectedMode, () => {
  emitUpdate();
});

// Watch for prop changes
watch(
  () => props.extensionConfig,
  (newConfig) => {
    if (newConfig) {
      selectedMode.value = newConfig.mode || "pattern";
      localNamespaces.value = [...(newConfig.namespaces || [])];
      localElements.value = JSON.parse(
        JSON.stringify(newConfig.elements || []),
      );
    }
  },
  { deep: true },
);

// Initialize element form namespace when namespaces change
watch(
  localNamespaces,
  (newNamespaces) => {
    if (newNamespaces.length > 0 && !elementForm.value.namespaceId) {
      elementForm.value.namespaceId = newNamespaces[0].id;
    }
  },
  { immediate: true },
);
</script>
