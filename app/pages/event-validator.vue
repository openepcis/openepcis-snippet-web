<template>
  <div class="min-h-screen bg-background text-foreground p-6 space-y-6">
    <!-- Switch between available profile and editor theme -->
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <div class="flex flex-wrap gap-4 items-center">
        <USelectMenu
          v-model="selectedSchema"
          :items="schemaOptions"
          value-key="value"
          placeholder="Select a schema profile"
          size="lg"
          class="w-full sm:w-72"
          @update:modelValue="loadSchema"
        />

        <!-- Validation Target Toggle -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Validate:
          </span>

          <UButtonGroup size="sm" class="space-x-2">
            <UButton
              :color="validationTarget === 'document' ? 'secondary' : 'neutral'"
              :variant="validationTarget === 'document' ? 'solid' : 'outline'"
              @click="validationTarget = 'document'"
            >
              Document
            </UButton>

            <UButton
              :color="validationTarget === 'event' ? 'secondary' : 'neutral'"
              :variant="validationTarget === 'event' ? 'solid' : 'outline'"
              @click="validationTarget = 'event'"
            >
              Event
            </UButton>
          </UButtonGroup>
        </div>

        <!-- Auto-detection mismatch warning -->
        <UBadge
          v-if="showMismatchWarning"
          color="warning"
          variant="subtle"
          class="animate-pulse"
        >
          Input looks like
          {{ detectedType === "document" ? "EPCIS Document" : "Single Event" }}
        </UBadge>
      </div>
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
// Basic Vue imports
import { ref, watch, onMounted, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { nextTick } from "vue";

// Nuxt UI imports
import type { SelectItem } from "@nuxt/ui";

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

//Local variable ref
const jsonData = ref("");
const jsonSchema = ref("");
const selectedSchema = ref("");
const schemaOptions = ref<SelectItem[]>([]);
const errors = ref<
  { schemaPath: string; path: string; keyword: string; message: string }[]
>([]);
const validationSuccess = ref(false);

// Validation target: 'document' for EPCISDocument, 'event' for single event
const validationTarget = ref<"document" | "event">("document");

// Auto-detect the type of JSON data being validated
const detectedType = computed((): "document" | "event" | null => {
  try {
    const data = JSON.parse(jsonData.value);
    if (data?.type === "EPCISDocument" || data?.epcisBody) return "document";
    if (
      [
        "ObjectEvent",
        "AggregationEvent",
        "TransactionEvent",
        "TransformationEvent",
        "AssociationEvent",
      ].includes(data?.type)
    )
      return "event";
  } catch {
    // Invalid JSON, can't detect
  }
  return null;
});

// Show warning if detected type doesn't match the toggle
const showMismatchWarning = computed(
  () => detectedType.value && detectedType.value !== validationTarget.value
);

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

// Helper to detect if schema is for single event (has event type at root level)
const isSchemaForSingleEvent = (schema: any): boolean => {
  if (!schema?.allOf) return false;
  return schema.allOf.some((item: any) => {
    // Check for event type constraints at root level
    const eventTypes = [
      "ObjectEvent",
      "AggregationEvent",
      "TransactionEvent",
      "TransformationEvent",
      "AssociationEvent",
    ];
    const typeEnum = item?.properties?.type?.enum;
    const typeConst = item?.properties?.type?.const;
    if (typeEnum && eventTypes.some((et) => typeEnum.includes(et))) return true;
    if (typeConst && eventTypes.includes(typeConst)) return true;
    return false;
  });
};

// Helper to detect if schema is for EPCISDocument (has epcisBody.eventList structure)
const isSchemaForDocument = (schema: any): boolean => {
  if (!schema?.allOf) return false;
  return schema.allOf.some((item: any) => {
    return (
      item?.properties?.epcisBody?.properties?.eventList ||
      item?.properties?.type?.const === "EPCISDocument"
    );
  });
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
    let dataObject = JSON.parse(jsonData.value);

    // Determine schema type
    const schemaIsForEvent = isSchemaForSingleEvent(schemaObject);
    const schemaIsForDocument = isSchemaForDocument(schemaObject);

    // Adapt data based on validation target and schema type
    let dataToValidate = dataObject;
    let pathPrefix = "";

    if (validationTarget.value === "document" && schemaIsForEvent) {
      // Schema is for single event, but we want to validate a document
      // Extract events from document and validate each
      const events = dataObject?.epcisBody?.eventList;
      if (Array.isArray(events) && events.length > 0) {
        // Validate first event with event schema
        dataToValidate = events[0];
        pathPrefix = "/epcisBody/eventList/0";
      }
    } else if (
      validationTarget.value === "event" &&
      dataObject?.epcisBody?.eventList
    ) {
      // Data is a document but we want to validate as single event
      // Extract the first event
      const events = dataObject.epcisBody.eventList;
      if (Array.isArray(events) && events.length > 0) {
        dataToValidate = events[0];
        pathPrefix = "/epcisBody/eventList/0";
      }
    }

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
    const valid = validateFn(dataToValidate);

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
watch([jsonSchema, jsonData, validationTarget], () => {
  debouncedValidate();
});
</script>
