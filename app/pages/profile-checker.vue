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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
      <UCard class="h-[70vh] flex flex-col dark:ring-gray-700 ring-gray-200">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">JSON Schema</h2>

            <div class="flex gap-2">
              <UButton
                :icon="
                  schemaClipboard.copied.value
                    ? 'mdi:check'
                    : 'mdi:content-copy'
                "
                color="gray"
                variant="soft"
                size="sm"
                @click="copyToClipBoard('schema')"
              />

              <UButton
                icon="mdi:code"
                color="gray"
                variant="soft"
                size="sm"
                @click="formatJson('schema')"
              />
            </div>
          </div>
        </template>

        <div class="flex-grow min-h-0 -m-4">
          <!-- JSON Schema Editor-->
          <JsonEditor
            v-model="jsonSchema"
            language="json"
            placeholder="Paste your JSON Schema here..."
            @editorDidMount="onJsonSchemaEditorMount"
            ref="jsonSchemaEditorRef"
          />
        </div>
      </UCard>

      <!-- JSON Data Editor -->
      <UCard class="h-[70vh] flex flex-col dark:ring-gray-700 ring-gray-200">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">JSON Data</h2>

            <div class="flex gap-2">
              <UButton
                :icon="
                  dataClipboard.copied.value ? 'mdi:check' : 'mdi:content-copy'
                "
                color="gray"
                variant="soft"
                size="sm"
                @click="copyToClipBoard('data')"
              />

              <UButton
                icon="mdi:code"
                color="gray"
                variant="soft"
                size="sm"
                @click="formatJson('data')"
              />
            </div>
          </div>
        </template>

        <div class="flex-grow min-h-0 -m-4">
          <!-- JSON Data Editor -->
          <JsonEditor
            v-model="jsonData"
            language="json"
            placeholder="Paste your JSON Data here..."
            @editorDidMount="onJsonDataEditorMount"
            ref="jsonDataEditorRef"
          />
        </div>
      </UCard>
    </div>

    <!-- Validation Errors -->
    <div v-if="errors.length" class="mt-6 space-y-2">
      <h3 class="text-lg font-semibold text-red-500">
        Validation Errors ({{ errors.length }})
      </h3>
      <ul
        class="divide-y divide-red-200 dark:divide-red-700 border border-red-300 dark:border-red-700 rounded-lg"
      >
        <li
          v-for="(err, index) in errors"
          :key="index"
          class="p-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50"
        >
          <div><strong>Path:</strong> {{ err.path || "/" }}</div>
          <div><strong>Keyword:</strong> {{ err.keyword }}</div>
          <div><strong>Message:</strong> {{ err.message }}</div>
          <div class="truncate">
            <strong>Schema:</strong> {{ err.schemaPath }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Basic Vue imports
import { ref, watch, onMounted } from "vue";
import { useClipboard } from "@vueuse/core";
import { useDebounceFn } from "@vueuse/core";
import { nextTick } from "vue";

// Nuxt UI imports
import { UButton, UCard, USelectMenu } from "#components";
import type { SelectItem } from "@nuxt/ui";

// CodeMirror imports
import { EditorView, type Diagnostic } from "@codemirror/view";
import { setDiagnostics } from "@codemirror/lint";
import { Text } from "@codemirror/state";

// JSON Schema validator imports
import Ajv2020, { ValidationError } from "ajv/dist/2020";
import addFormats from "ajv-formats";

// References for the CodeMirror
const jsonDataEditorRef = ref<InstanceType<typeof JsonEditor> | null>(null);
const jsonSchemaEditorRef = ref<InstanceType<typeof JsonEditor> | null>(null);

// Ref to the raw CodeMirror EditorView for validation/marker manipulation
const jsonDataEditorView = ref<EditorView | null>(null);
const jsonSchemaEditorView = ref<EditorView | null>(null);

const onJsonSchemaEditorMount = (payload: { view: EditorView; state: any }) => {
  jsonSchemaEditorView.value = payload.view;
};

const onJsonDataEditorMount = (payload: { view: EditorView; state: any }) => {
  jsonDataEditorView.value = payload.view;
  nextTick(() => {
    validate();
  });
};

//Local variable ref
const jsonData = ref("");
const jsonSchema = ref("");
const selectedSchema = ref("");
const schemaOptions = ref<SelectItem[]>([]);
const errors = ref<
  { schemaPath: string; path: string; keyword: string; message: string }[]
>([]);

onMounted(async () => {
  // Load profile files
  try {
    const files = await fetch("/profiles/index.json").then((res) => res.json());
    schemaOptions.value = files.map((f: string) => ({ label: f, value: f }));
  } catch (e) {
    console.error("Could not load schema index file.");
  }
});

// Based on the selected JSON Schema obtain the schema and load
const loadSchema = async (file: string) => {
  try {
    jsonSchema.value = "";
    errors.value = [];
    const content = await fetch(`/profiles/${file}`).then((res) => res.text());
    jsonSchema.value = content;
    validate();
  } catch (error: any) {
    errors.value = [
      {
        schemaPath: "",
        path: "/",
        keyword: "exception",
        message: "Failed to load schema: " + (error.message || "Network error"),
      },
    ];
  }
};

// Function to validate JSON Schema against the respective JSON Data
const validate = () => {
  // avoid validating empty schema or data
  if (jsonSchema.value == "" || jsonData.value == "") return;

  errors.value = [];
  try {
    const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);

    // Parse objects
    const schemaObject = JSON.parse(jsonSchema.value);
    const dataObject = JSON.parse(jsonData.value);

    const validateFn = ajv.compile(schemaObject);
    const valid = validateFn(dataObject);

    if (!valid && validateFn.errors) {
      // Update the list of errors for the Validation Errors section below the editor
      errors.value = validateFn.errors.map((err) => ({
        schemaPath: err.schemaPath,
        path: err.instancePath || "/",
        keyword: err.keyword,
        message: err.message || "Unknown error",
      }));
    }
  } catch (error: any) {
    console.error("Validation error:", error.message);
    errors.value = [
      {
        schemaPath: "",
        path: "/",
        keyword: "exception",
        // Provide context about which editor might have the syntax issue
        message:
          "Invalid JSON syntax in Data or Schema editor: " + error.message,
      },
    ];
  }
};

// Avoid calling validation for every keyboard change when typing in JSONData Editor
const debouncedValidate = useDebounceFn(() => {
  validate();
}, 1000);

// on change of any values trigger the validate to validate schema
watch([jsonSchema, jsonData], () => {
  debouncedValidate();
});

// Copy the contents based on selection
const schemaClipboard = useClipboard();
const dataClipboard = useClipboard();
const copyToClipBoard = (target: "schema" | "data") => {
  const content = target === "schema" ? jsonSchema.value : jsonData.value;
  target === "schema"
    ? schemaClipboard.copy(content)
    : dataClipboard.copy(content);
};

// Format the JSON in schema or Data by calling the JsonEditor format json method
const formatJson = (target: "schema" | "data") => {
  if (target === "schema" && jsonSchemaEditorRef.value) {
    jsonSchemaEditorRef.value.format();
  } else if (target === "data" && jsonDataEditorRef.value) {
    jsonDataEditorRef.value.format();
  }
};
</script>
