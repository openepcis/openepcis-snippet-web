<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      width: 'sm:max-w-3xl',
    }"
  >
    <template #content>
      <div class="flex flex-col max-h-[80vh]">
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center gap-3">
            <div
              class="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30"
            >
              <UIcon
                name="i-heroicons-cloud-arrow-down"
                class="w-5 h-5 text-primary-600 dark:text-primary-400"
              />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Import GitHub Schemas
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Select pre-built schemas from OpenEPCIS repository
              </p>
            </div>
          </div>
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-heroicons-x-mark"
            @click="isOpen = false"
          />
        </div>

        <!-- Preview Panel (shown when a schema is selected for preview) -->
        <SchemaPreviewPanel
          v-if="previewSchema"
          :schema="previewSchema"
          @back="previewSchema = null"
          @add="handleAddSingle"
        />

        <!-- Main Content (schema list) -->
        <template v-else>
          <!-- Search -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <UInput
              v-model="searchQuery"
              placeholder="Search schemas..."
              icon="i-heroicons-magnifying-glass"
              :ui="{
                base: 'w-full',
              }"
            />
          </div>

          <!-- Loading State -->
          <div
            v-if="isLoading"
            class="flex-1 flex items-center justify-center p-8"
          >
            <div class="text-center">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4"
              />
              <p class="text-gray-500 dark:text-gray-400">
                Loading schemas from GitHub...
              </p>
            </div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="flex-1 flex items-center justify-center p-8"
          >
            <div class="text-center max-w-md">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-10 h-10 text-red-500 mx-auto mb-4"
              />
              <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
              <UButton
                color="primary"
                variant="soft"
                @click="loadSchemas"
              >
                Try Again
              </UButton>
            </div>
          </div>

          <!-- Schema Categories -->
          <div v-else class="flex-1 overflow-auto">
            <UAccordion
              v-model="expandedCategories"
              :items="accordionItems"
              type="multiple"
              :ui="{
                item: 'border-b border-gray-200 dark:border-gray-700 last:border-b-0',
                trigger: 'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50',
                body: 'px-4 pb-4',
              }"
            >
              <template #leading="{ item }">
                <div
                  class="p-1.5 rounded-md"
                  :class="getCategoryIconBgClass(item.color)"
                >
                  <UIcon
                    :name="item.icon"
                    class="w-4 h-4"
                    :class="getCategoryIconClass(item.color)"
                  />
                </div>
              </template>

              <template #default="{ item }">
                <div class="flex-1 text-left">
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ item.label }}
                  </span>
                  <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({{ item.count }})
                  </span>
                </div>
              </template>

              <template #trailing="{ item }">
                <div v-if="item.count > 0" class="flex items-center gap-1">
                  <UButton
                    variant="link"
                    color="primary"
                    size="xs"
                    @click.stop="selectAllInCategory(item.id)"
                  >
                    Select All
                  </UButton>
                  <span class="text-gray-300 dark:text-gray-600">|</span>
                  <UButton
                    variant="link"
                    color="neutral"
                    size="xs"
                    @click.stop="clearCategory(item.id)"
                  >
                    Clear
                  </UButton>
                </div>
              </template>

              <template #body="{ item }">
                <div
                  v-if="item.schemas.length > 0"
                  class="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  <div
                    v-for="schema in item.schemas"
                    :key="schema.name"
                    class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <UCheckbox
                      :model-value="selectedSchemas.has(schema.name)"
                      @update:model-value="toggleSchema(schema.name)"
                    />
                    <button
                      type="button"
                      class="flex-1 text-left text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 truncate"
                      @click="openPreview(schema)"
                    >
                      {{ schema.displayName }}
                    </button>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      icon="i-heroicons-eye"
                      @click="openPreview(schema)"
                    />
                  </div>
                </div>
                <p
                  v-else
                  class="text-sm text-gray-400 dark:text-gray-500 text-center py-2"
                >
                  No schemas in this category
                </p>
              </template>
            </UAccordion>
          </div>

          <!-- Footer -->
          <div
            class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3"
          >
            <!-- Merge Mode Selection (shown when schemas are selected) -->
            <div
              v-if="selectedSchemas.size > 0"
              class="flex items-center justify-between gap-4 pb-3 border-b border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center gap-4">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Import as:
                </span>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="bulkMergeMode"
                      type="radio"
                      value="ref"
                      class="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      $ref
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        (recommended)
                      </span>
                    </span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="bulkMergeMode"
                      type="radio"
                      value="inline"
                      class="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      Inline
                    </span>
                  </label>
                </div>
              </div>
              <!-- Required Toggle -->
              <div class="flex items-center gap-2">
                <USwitch v-model="bulkIsRequired" size="sm" />
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  Required
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UBadge
                  v-if="selectedSchemas.size > 0"
                  color="primary"
                  variant="soft"
                >
                  {{ selectedSchemas.size }} selected
                </UBadge>
              </div>
              <div class="flex gap-2">
                <UButton
                  color="neutral"
                  variant="soft"
                  @click="isOpen = false"
                >
                  Cancel
                </UButton>
                <UButton
                  color="primary"
                  :disabled="selectedSchemas.size === 0 || isImporting"
                  :loading="isImporting"
                  @click="handleImport"
                >
                  Import Selected
                </UButton>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type {
  GitHubSchemaFile,
  CategorizedSchemaFile,
  ImportedSchema,
  SchemaCategory,
} from "~/types/github-schema";
import { schemaCategories } from "~/types/github-schema";
import { useGitHubSchemas } from "~/composables/useGitHubSchemas";

const props = defineProps<{
  open: boolean;
  alreadyImportedIds?: string[];
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "import", schemas: ImportedSchema[]): void;
}>();

const {
  isLoading,
  error,
  files,
  categorizedFiles,
  activeCategories,
  fetchSchemaFiles,
  fetchSchemaContent,
  getSchemaUrl,
  searchFiles,
} = useGitHubSchemas();

// Local state
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const searchQuery = ref("");
const selectedSchemas = ref<Set<string>>(new Set());
const previewSchema = ref<CategorizedSchemaFile | null>(null);
const isImporting = ref(false);
const expandedCategories = ref<string[]>([]);
const bulkMergeMode = ref<"ref" | "inline">("ref");
const bulkIsRequired = ref(false);

// Computed: Filtered files based on search
const filteredCategories = computed(() => {
  return searchFiles(searchQuery.value);
});

// Computed: Accordion items for UAccordion
const accordionItems = computed(() => {
  return activeCategories.value.map((category) => {
    const categoryFiles = filteredCategories.value.get(category.id) || [];
    return {
      value: category.id,
      id: category.id,
      label: category.label,
      description: category.description,
      icon: category.icon,
      color: category.color,
      count: categoryFiles.length,
      schemas: categoryFiles,
    };
  });
});

// Computed: Total available schemas (excluding already imported)
const totalAvailableSchemas = computed(() => {
  let count = 0;
  filteredCategories.value.forEach((categoryFiles) => {
    categoryFiles.forEach((file) => {
      if (!props.alreadyImportedIds?.includes(file.name.replace(/\.json$/, ""))) {
        count++;
      }
    });
  });
  return count;
});

// Methods
const loadSchemas = async () => {
  try {
    await fetchSchemaFiles();
    // Expand first category by default
    if (activeCategories.value.length > 0) {
      expandedCategories.value = [activeCategories.value[0].id];
    }
  } catch {
    // Error is handled by the composable
  }
};

const toggleSchema = (schemaName: string) => {
  const newSet = new Set(selectedSchemas.value);
  if (newSet.has(schemaName)) {
    newSet.delete(schemaName);
  } else {
    newSet.add(schemaName);
  }
  selectedSchemas.value = newSet;
};

const selectAllInCategory = (categoryId: string) => {
  const categoryFiles = filteredCategories.value.get(categoryId) || [];
  const newSet = new Set(selectedSchemas.value);

  categoryFiles.forEach((file) => {
    // Don't add if already imported
    if (!props.alreadyImportedIds?.includes(file.name.replace(/\.json$/, ""))) {
      newSet.add(file.name);
    }
  });

  selectedSchemas.value = newSet;
};

const clearCategory = (categoryId: string) => {
  const categoryFiles = filteredCategories.value.get(categoryId) || [];
  const newSet = new Set(selectedSchemas.value);

  categoryFiles.forEach((file) => {
    newSet.delete(file.name);
  });

  selectedSchemas.value = newSet;
};

const selectAllSchemas = () => {
  const newSet = new Set(selectedSchemas.value);

  filteredCategories.value.forEach((categoryFiles) => {
    categoryFiles.forEach((file) => {
      // Don't add if already imported
      if (!props.alreadyImportedIds?.includes(file.name.replace(/\.json$/, ""))) {
        newSet.add(file.name);
      }
    });
  });

  selectedSchemas.value = newSet;
};

const clearSelection = () => {
  selectedSchemas.value = new Set();
};

const openPreview = (schema: CategorizedSchemaFile) => {
  previewSchema.value = schema;
};

const handleAddSingle = (schema: ImportedSchema) => {
  emit("import", [schema]);
  previewSchema.value = null;
  isOpen.value = false;
};

const handleImport = async () => {
  if (selectedSchemas.value.size === 0) return;

  isImporting.value = true;

  try {
    const importedSchemas: ImportedSchema[] = [];

    for (const schemaName of selectedSchemas.value) {
      const content = await fetchSchemaContent(schemaName);
      const file = files.value.find((f) => f.name === schemaName);

      if (file) {
        // Get display name from the file
        const baseName = schemaName.replace(/-\d+\.\d+\.\d+\.json$/, "").replace(/\.json$/, "");
        const displayName = baseName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        importedSchemas.push({
          id: schemaName.replace(/\.json$/, ""),
          name: displayName,
          filename: schemaName,
          url: getSchemaUrl(schemaName),
          content,
          mergeMode: bulkMergeMode.value,
          isRequired: bulkIsRequired.value,
        });
      }
    }

    emit("import", importedSchemas);
    selectedSchemas.value = new Set();
    isOpen.value = false;
  } catch (err) {
    console.error("Import failed:", err);
  } finally {
    isImporting.value = false;
  }
};

// Category styling helpers
const getCategoryIconBgClass = (color: string): Record<string, boolean> => ({
  "bg-primary-100 dark:bg-primary-900/30": color === "primary",
  "bg-blue-100 dark:bg-blue-900/30": color === "blue",
  "bg-amber-100 dark:bg-amber-900/30": color === "amber",
  "bg-emerald-100 dark:bg-emerald-900/30": color === "emerald",
  "bg-purple-100 dark:bg-purple-900/30": color === "purple",
  "bg-gray-100 dark:bg-gray-900/30": color === "neutral",
  "bg-red-100 dark:bg-red-900/30": color === "red",
});

const getCategoryIconClass = (color: string): Record<string, boolean> => ({
  "text-primary-600 dark:text-primary-400": color === "primary",
  "text-blue-600 dark:text-blue-400": color === "blue",
  "text-amber-600 dark:text-amber-400": color === "amber",
  "text-emerald-600 dark:text-emerald-400": color === "emerald",
  "text-purple-600 dark:text-purple-400": color === "purple",
  "text-gray-600 dark:text-gray-400": color === "neutral",
  "text-red-600 dark:text-red-400": color === "red",
});

// Load schemas when modal opens
watch(
  () => props.open,
  (newValue) => {
    if (newValue && files.value.length === 0) {
      loadSchemas();
    }
  },
  { immediate: true }
);

// Reset state when modal closes
watch(
  () => props.open,
  (newValue) => {
    if (!newValue) {
      searchQuery.value = "";
      previewSchema.value = null;
      bulkMergeMode.value = "ref";
      bulkIsRequired.value = false;
    }
  }
);
</script>
