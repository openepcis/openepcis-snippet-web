<template>
  <div class="min-h-screen bg-background text-foreground p-6 space-y-6">
    <!-- Switch between available profile and editor theme -->
    <div class="flex flex-wrap gap-4 items-center">
      <USelectMenu
        v-model="selectedSchema"
        :items="schemaOptions"
        value-key="value"
        placeholder="Select a schema profile"
        size="lg"
        class="w-64"
        @update:modelValue="loadSchema"
      />
    </div>

    <!-- JSON Editors -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- JSON Schema Editor-->
      <UCard class="h-[70vh] overflow-hidden bg-slate-100 dark:bg-gray-800">
        <template #header>
          <h2 class="text-xl font-semibold">JSON Schema</h2>
        </template>

        <MonacoEditor
          v-model="jsonSchema"
          lang="json"
          class="h-[70vh]"
          :options="editorOptions"
        />
      </UCard>

      <!-- JSON Data Editor -->
      <UCard class="h-[70vh] overflow-hidden bg-slate-100 dark:bg-gray-800">
        <template #header>
          <h2 class="text-xl font-semibold">JSON Data</h2>
        </template>

        <MonacoEditor
          v-model="jsonData"
          lang="json"
          class="h-[70vh]"
          :options="editorOptions"
        />
      </UCard>
    </div>

    <!-- Validation Errors -->
    <div v-if="errors.length" class="mt-6 space-y-2">
      <h3 class="text-lg font-semibold text-red-500">Validation Errors</h3>

      <ul class="divide-y divide-red-300 border border-red-300 rounded-md">
        <li
          v-for="(err, index) in errors"
          :key="index"
          class="p-3 text-sm text-red-700"
        >
          <div><strong>Path:</strong> {{ err.path }}</div>
          <div><strong>Keyword:</strong> {{ err.keyword }}</div>
          <div><strong>Message:</strong> {{ err.message }}</div>
          <div><strong>Schema:</strong> {{ err.schemaPath }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { UCard, USelectMenu } from "#components";
import type { SelectItem } from "@nuxt/ui";
import Ajv2020 from "ajv/dist/2020";

const jsonData = ref("");

// watch for color mode changes to update monaco editor theme
const colorMode = useColorMode();

const editorOptions = ref({
  theme: colorMode.value === "dark" ? "vs-dark" : "vs-light",
  minimap: { enabled: false },
  wordWrap: "on",
  fontSize: 16,
  lineHeight: 24,
  smoothScrolling: true,
});

// Auto-switch with color mode unless user picked manually
watch(colorMode, (newMode) => {
  editorOptions.value = {
    ...editorOptions.value,
    theme: newMode.value === "dark" ? "vs-dark" : "vs-light",
  };
});

// Load various available file names from /public/profiles
const schemaOptions = ref<SelectItem[]>([]);
onMounted(async () => {
  const files = await fetch("/profiles/index.json").then((res) => res.json());
  schemaOptions.value = files.map((f: string) => [{ label: f, value: f }]);
});

// Load the respective schema file on change of dropdown option
const jsonSchema = ref("");
const selectedSchema = ref("");
const loadSchema = async (file: string) => {
  try {
    const content = await fetch(`/profiles/${file}`).then((res) => res.text());
    jsonSchema.value = content;
    validate();
  } catch (error: any) {
    errors.value = ["Failed to load schema"];
  }
};

// Validate the provided jsonData against specified jsonSchema
const errors = ref<
  { schemaPath: string; path: string; keyword: string; message: string }[]
>([]);
const validate = () => {
  if (jsonData.value == "" || jsonSchema.value == "") return;
  errors.value = [];

  try {
    const ajv = new Ajv2020();
    const validateFn = ajv.compile(JSON.parse(jsonSchema.value));
    const valid = validateFn(JSON.parse(jsonData.value));

    if (!valid) {
      errors.value = validateFn.errors.map((err) => ({
        schemaPath: err.schemaPath,
        path: err.instancePath || "/",
        keyword: err.keyword,
        message: err.message || "Unknown error",
      }));
    }
  } catch (error: any) {
    errors.value = [
      {
        schemaPath: "",
        path: "/",
        keyword: "exception",
        message: "Invalid JSON or Schema format: " + error.message,
      },
    ];
  }
};

// on change of any values trigger the validate to validate schema
watch([jsonSchema, jsonData], () => {
  validate();
});
</script>
