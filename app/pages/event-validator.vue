<template>
  <div class="min-h-screen bg-background text-foreground p-6 space-y-6">
    <!-- Schema profile selector -->
    <div class="flex flex-wrap gap-4 items-center">
      <USelectMenu
        v-model="selectedSchema"
        :items="profileOptions"
        value-key="value"
        :placeholder="
          isLoadingProfiles
            ? 'Loading profiles...'
            : 'Select from existing profile'
        "
        :loading="isLoadingProfiles"
        size="xl"
        class="w-full sm:w-1/4"
        @update:modelValue="onProfileSelected"
      />
      <span v-if="profileError" class="text-sm text-red-500">{{
        profileError
      }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
      <!-- JSON Schema Editor-->
      <JsonEditor
        v-model="jsonSchema"
        language="json"
        placeholder="Provide JSON Schema here..."
        title="JSON Schema"
        download-file-name="epcis-schema.json"
        @editorDidMount="onJsonSchemaEditorMount"
        ref="jsonSchemaEditorRef"
      />

      <JsonEditor
        v-model="jsonData"
        language="json"
        placeholder="Provide JSON Data here..."
        title="JSON Data"
        download-file-name="epcis-event.json"
        :schema-errors="errors"
        @editorDidMount="onJsonDataEditorMount"
        ref="jsonDataEditorRef"
      />
    </div>

    <!-- Floating Validation Status Panel -->
    <ValidationErrorPanel :errors="errors" :is-valid="validationSuccess" />
  </div>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Event Validator — Validate EPCIS Events Against Profiles",
  description:
    "Validate EPCIS 2.0 JSON/JSON-LD events or documents against custom profiles. Real-time conformance checking with detailed error reporting.",
  ogImage: "/linkedin-banner.svg",
});

useSchemaOrg([
  defineWebPage({
    name: "EPCIS Event Validator",
    description:
      "Validate EPCIS 2.0 events against custom JSON Schema profiles.",
  }),
]);

// Basic Vue imports
import { ref, watch, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { nextTick } from "vue";

// CodeMirror imports
import { EditorView, type Diagnostic } from "@codemirror/view";

// JSON Schema validator imports (support multiple drafts + remote refs)
import Ajv from "ajv";
import Ajv2019 from "ajv/dist/2019";
import Ajv2020 from "ajv/dist/2020";
import draft06 from "ajv/dist/refs/json-schema-draft-06.json";
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

// GitHub profiles composable
const {
  profileOptions,
  isLoading: isLoadingProfiles,
  error: profileError,
  fetchProfileList,
  loadProfileAndEvent,
} = useGitHubProfiles();

//Local variable ref
const jsonData = ref("");
const jsonSchema = ref("");
const selectedSchema = ref("");
const errors = ref<
  { schemaPath: string; path: string; keyword: string; message: string }[]
>([]);
const validationSuccess = ref(false);

onMounted(() => {
  fetchProfileList();
});

// Based on the selected profile, load both schema and matching event
const onProfileSelected = async (file: string) => {
  jsonSchema.value = "";
  jsonData.value = "";
  errors.value = [];

  const result = await loadProfileAndEvent(file);
  if (result) {
    jsonSchema.value = result.schema;
    jsonData.value = result.event;
    validate();
  } else {
    errors.value = [
      {
        schemaPath: "",
        path: "/",
        keyword: "exception",
        message:
          profileError.value || "Failed to load profile or event from GitHub",
      },
    ];
  }
};

// Function to validate JSON Schema against the respective JSON Data
const validate = async () => {
  // avoid validating empty schema or data
  if (jsonSchema.value == "" || jsonData.value == "") {
    validationSuccess.value = false;
    return;
  }

  errors.value = [];
  validationSuccess.value = false;
  try {
    // Parse objects
    const schemaObject = JSON.parse(jsonSchema.value);
    const dataObject = JSON.parse(jsonData.value);

    // Pick AJV instance based on $schema
    const schemaVersion: string | undefined = schemaObject?.$schema;

    // Cache for remote schemas to avoid re-fetching and re-adding
    const schemaCache = new Map<string, object>();

    // Provide remote loader so external $ref can be resolved
    const loadSchema = async (uri: string) => {
      if (uri.includes("json-schema.org/draft")) {
        return {};
      }

      // Return cached schema if available
      if (schemaCache.has(uri)) {
        return schemaCache.get(uri);
      }

      const res = await fetch(uri);
      if (!res.ok) {
        throw new Error(`Failed to load remote schema ${uri}: ${res.status}`);
      }
      const schema = await res.json();
      schemaCache.set(uri, schema);
      return schema;
    };

    let ajv: any;
    const commonOpts = {
      allErrors: true,
      allowUnionTypes: true,
      unicodeRegExp: false,
      loadSchema,
    };

    if (schemaVersion?.includes("2020-12")) {
      ajv = new Ajv2020(commonOpts);
    } else if (schemaVersion?.includes("2019-09")) {
      ajv = new Ajv2019(commonOpts);
    } else if (schemaVersion?.includes("draft-06")) {
      ajv = new Ajv(commonOpts);
      // enable draft-06 meta
      ajv.addMetaSchema(draft06);
      ajv.opts.schemaId = "auto";
    } else {
      // default to draft-07 (Ajv default supports draft-07 natively)
      ajv = new Ajv(commonOpts);
    }

    addFormats(ajv);

    // Compile (async to allow remote refs)
    const validateFn = await ajv.compileAsync(schemaObject);
    const valid = validateFn(dataObject);

    if (!valid && validateFn.errors) {
      const escapeJsonPointer = (s: string) =>
        s.replace(/~/g, "~0").replace(/\//g, "~1");
      const normalizePath = (err: any): string => {
        const base = err.instancePath || "";
        const k = err.keyword;
        const p = err.params || {};
        if (k === "required" && p.missingProperty) {
          return `${base}/${escapeJsonPointer(p.missingProperty)}`;
        }
        if (k === "additionalProperties" && p.additionalProperty) {
          return `${base}/${escapeJsonPointer(p.additionalProperty)}`;
        }
        if (k === "unevaluatedProperties" && p.unevaluatedProperty) {
          return `${base}/${escapeJsonPointer(p.unevaluatedProperty)}`;
        }
        if (
          (k === "items" || k === "maxItems" || k === "minItems") &&
          typeof p.index === "number"
        ) {
          return `${base}/${p.index}`;
        }
        if ((k === "oneOf" || k === "anyOf" || k === "allOf") && base) {
          // point to the base instance path
          return base;
        }
        if (k === "patternProperties" && p.propertyName) {
          return `${base}/${escapeJsonPointer(p.propertyName)}`;
        }
        if (k === "enum" && typeof p.allowedValues !== "undefined") {
          return base || "/";
        }
        return base || "/";
      };

      // Update the list of errors for the Validation Errors section below the editor
      errors.value = validateFn.errors.map((err) => ({
        schemaPath: err.schemaPath,
        path: normalizePath(err),
        keyword: err.keyword,
        message: err.message || "Unknown error",
      }));
    } else {
      // Validation passed
      validationSuccess.value = true;
    }
  } catch (error: any) {
    console.error("Validation exception:", error);
    const message = error?.message || String(error);
    const isJsonSyntax =
      error instanceof SyntaxError &&
      !message.includes("Invalid regular expression");
    const isRegexSyntax = message.includes("Invalid regular expression");
    errors.value = [
      {
        schemaPath: "",
        path: "/",
        keyword: "exception",
        message: isJsonSyntax
          ? "Invalid JSON syntax in Data or Schema editor: " + message
          : isRegexSyntax
            ? "Invalid regular expression in schema 'pattern': " + message
            : "Validator error: " + message,
      },
    ];
  }
};

// Avoid calling validation for every keyboard change when typing in JSONData Editor
const debouncedValidate = useDebounceFn(() => {
  void validate();
}, 1000);

// on change of any values trigger the validate to validate schema
watch([jsonSchema, jsonData], () => {
  debouncedValidate();
});
</script>
