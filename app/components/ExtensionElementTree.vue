<template>
  <div
    class="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    :class="{ 'ml-6': depth > 0 }"
  >
    <div class="flex items-center justify-between p-3">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Type icon -->
        <div class="p-1 rounded" :class="getTypeIconBgClass(element.valueType)">
          <UIcon
            :name="getTypeIcon(element.valueType)"
            class="w-4 h-4"
            :class="getTypeIconClass(element.valueType)"
          />
        </div>

        <!-- Element name -->
        <span
          class="font-mono font-medium text-sm text-gray-900 dark:text-gray-100 truncate"
        >
          {{ getFullName() }}
        </span>

        <!-- Badges -->
        <UBadge size="xs" color="neutral" variant="soft">
          {{ element.valueType
          }}{{
            element.valueType === "array"
              ? `[${element.arrayItemType || "string"}]`
              : ""
          }}
        </UBadge>

        <UBadge
          v-if="element.isRequired"
          size="xs"
          color="error"
          variant="soft"
        >
          Required
        </UBadge>
      </div>

      <!-- Actions - Always visible for easier access -->
      <div class="flex items-center gap-1">
        <!-- Add nested element (for object type) -->
        <UButton
          v-if="element.valueType === 'object'"
          size="xs"
          variant="soft"
          color="secondary"
          icon="i-heroicons-plus"
          title="Add nested property"
          @click="$emit('add-nested', element.id)"
        >
          Add Property
        </UButton>

        <!-- Add array item element (for array of objects) -->
        <UButton
          v-if="
            element.valueType === 'array' && element.arrayItemType === 'object'
          "
          size="xs"
          variant="soft"
          color="blue"
          icon="i-heroicons-plus"
          title="Define array item structure"
          @click="$emit('add-array-item', element.id)"
        >
          Add Item Property
        </UButton>

        <!-- Remove -->
        <UButton
          size="xs"
          variant="ghost"
          color="error"
          icon="i-heroicons-trash"
          title="Remove element"
          @click="$emit('remove', element.id)"
        />
      </div>
    </div>

    <!-- Nested elements for object type -->
    <div
      v-if="
        element.valueType === 'object' &&
        element.nestedElements &&
        element.nestedElements.length > 0
      "
      class="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-gray-50/50 dark:bg-gray-900/20"
    >
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Nested properties:
      </p>
      <ExtensionElementTree
        v-for="nested in element.nestedElements"
        :key="nested.id"
        :element="nested"
        :namespaces="namespaces"
        :depth="depth + 1"
        @remove="$emit('remove', $event)"
        @add-nested="$emit('add-nested', $event)"
        @add-array-item="$emit('add-array-item', $event)"
      />
    </div>

    <!-- Array item elements for array of objects -->
    <div
      v-if="
        element.valueType === 'array' &&
        element.arrayItemType === 'object' &&
        element.arrayItemElements &&
        element.arrayItemElements.length > 0
      "
      class="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-blue-50/50 dark:bg-blue-900/10"
    >
      <p class="text-xs text-blue-600 dark:text-blue-400 mb-2">
        Array item object structure:
      </p>
      <ExtensionElementTree
        v-for="itemEl in element.arrayItemElements"
        :key="itemEl.id"
        :element="itemEl"
        :namespaces="namespaces"
        :depth="depth + 1"
        @remove="$emit('remove', $event)"
        @add-nested="$emit('add-nested', $event)"
        @add-array-item="$emit('add-array-item', $event)"
      />
    </div>

    <!-- Empty state for object without nested elements -->
    <div
      v-if="
        element.valueType === 'object' &&
        (!element.nestedElements || element.nestedElements.length === 0)
      "
      class="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-900/20"
    >
      <p class="text-xs text-gray-400 dark:text-gray-500 italic">
        No nested properties. Click + to add.
      </p>
    </div>

    <!-- Empty state for array of objects without item elements -->
    <div
      v-if="
        element.valueType === 'array' &&
        element.arrayItemType === 'object' &&
        (!element.arrayItemElements || element.arrayItemElements.length === 0)
      "
      class="border-t border-gray-200 dark:border-gray-700 p-3 bg-blue-50/50 dark:bg-blue-900/10"
    >
      <p class="text-xs text-blue-400 dark:text-blue-500 italic">
        No array item structure defined. Click "Add Item Property" to define
        object structure.
      </p>
    </div>

    <!-- Info for arrays of primitives (no nested structure possible) -->
    <div
      v-if="element.valueType === 'array' && element.arrayItemType !== 'object'"
      class="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-gray-900/20"
    >
      <p class="text-xs text-gray-400 dark:text-gray-500 italic">
        Array of {{ element.arrayItemType }}s - items are validated as
        {{ element.arrayItemType }} type.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ExtensionElement,
  ExtensionNamespace,
  ExtensionValueType,
} from "~/types/profile";

// Required for recursive component in Vue 3 <script setup>
defineOptions({
  name: "ExtensionElementTree",
});

const props = defineProps<{
  element: ExtensionElement;
  namespaces: ExtensionNamespace[];
  depth: number;
}>();

defineEmits<{
  (e: "remove", id: string): void;
  (e: "add-nested", parentId: string): void;
  (e: "add-array-item", parentId: string): void;
}>();

const getFullName = (): string => {
  const ns = props.namespaces.find((n) => n.id === props.element.namespaceId);
  return extensionPropertyKey(ns?.prefix || "ext", props.element.localName);
};

const getTypeIcon = (type: ExtensionValueType): string => {
  switch (type) {
    case "string":
      return "i-heroicons-document-text";
    case "number":
      return "i-heroicons-hashtag";
    case "boolean":
      return "i-heroicons-check-circle";
    case "array":
      return "i-heroicons-queue-list";
    case "object":
      return "i-heroicons-cube";
    default:
      return "i-heroicons-question-mark-circle";
  }
};

const getTypeIconClass = (type: ExtensionValueType): string => {
  switch (type) {
    case "string":
      return "text-emerald-500";
    case "number":
      return "text-blue-500";
    case "boolean":
      return "text-purple-500";
    case "array":
      return "text-amber-500";
    case "object":
      return "text-rose-500";
    default:
      return "text-gray-500";
  }
};

const getTypeIconBgClass = (type: ExtensionValueType): string => {
  switch (type) {
    case "string":
      return "bg-emerald-100 dark:bg-emerald-900/30";
    case "number":
      return "bg-blue-100 dark:bg-blue-900/30";
    case "boolean":
      return "bg-purple-100 dark:bg-purple-900/30";
    case "array":
      return "bg-amber-100 dark:bg-amber-900/30";
    case "object":
      return "bg-rose-100 dark:bg-rose-900/30";
    default:
      return "bg-gray-100 dark:bg-gray-900/30";
  }
};
</script>
