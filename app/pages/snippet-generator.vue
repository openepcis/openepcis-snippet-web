<template>
  <div
    class="min-h-screen bg-slate-200 dark:bg-slate-950 flex items-center justify-center"
  >
    <UCard class="w-full max-w-4xl bg-white dark:bg-slate-900">
      <!-- Header Section-->
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            JSON Schema Extractor
          </h1>

          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Extract a property and its dependencies from GS1 EPCIS 2.0 schema
          </p>
        </div>
      </template>

      <!-- Main content for inputs -->
      <UForm
        :state="state"
        class="flex flex-col justify-center items-center"
        @submit="generateChunk"
      >
        <!-- Schema URL -->
        <UFormField label="Schema URL" name="schemaUrl" size="xl" class="p-4">
          <UInput
            v-model="schemaUrl"
            type="text"
            placeholder="https://example.com/schema.json"
            size="xl"
            color="neutral"
            variant="subtle"
            disabled
            :ui="{
              root: 'min-w-lg',
            }"
          />
        </UFormField>

        <!-- Property Name -->
        <UFormField
          label="Property to Extract"
          name="propertyName"
          size="xl"
          class="p-4"
        >
          <UInput
            v-model="propertyName"
            type="text"
            placeholder="e.g., bizStep, disposition"
            size="xl"
            color="neutral"
            variant="subtle"
            :ui="{
              root: 'min-w-lg',
            }"
            @keyup.enter="generateChunk"
          />
        </UFormField>

        <!-- Generate Button -->
        <div class="pt-4">
          <UButton
            :loading="loading"
            @click="generateChunk"
            size="lg"
            block
            color="secondary"
            class="hover:cursor-pointer"
          >
            {{ loading ? "Generating..." : "Generate Schema" }}
          </UButton>
        </div>
      </UForm>

      <!-- Output Section -->
      <div
        v-if="outputSchema || error"
        class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800"
      >
        <!-- Error Alert -->
        <UAlert
          v-if="error"
          icon="i-heroicons-exclamation-triangle"
          color="error"
          variant="subtle"
          title="Error"
          :description="error"
          class="mb-6"
          :ui="{ title: 'font-semibold' }"
        />

        <!-- Output Display -->
        <div v-if="outputSchema" class="space-y-3">
          <div class="flex justify-between items-center">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Generated Schema
            </h3>

            <UButton
              :icon="
                copied
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-clipboard-document'
              "
              :color="copied ? 'primary' : 'neutral'"
              variant="soft"
              size="lg"
              @click="copy()"
            >
              {{ copied ? "Copied!" : "Copy" }}
            </UButton>
          </div>

          <!-- Code block for output schema-->
          <div class="relative">
            <pre
              class="bg-gray-100 dark:bg-gray-800/50 p-4 rounded-md border border-gray-200 dark:border-gray-700 max-h-[40vh] overflow-auto"
            > <code class="text-sm font-mono">{{ outputSchema }} </code> </pre>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useClipboard, useDebounceFn } from "@vueuse/core";

const schemaUrl = ref(
  "https://ref.gs1.org/standards/epcis/epcis-json-schema.json"
);
const propertyName = ref("");
const outputSchema = ref("");
const loading = ref(false);
const error = ref("");
const fullSchemaCache = ref<{ [url: string]: any }>({});

const state = ref({
  schemaUrl: undefined,
  propertyName: undefined,
});

// Handle clipboard actions
const { copy, copied, isSupported } = useClipboard({ source: outputSchema });

const generateChunk = async () => {
  // reset previous state
  error.value = "";
  loading.value = true;
  outputSchema.value = "";

  try {
    // validate the provided input
    if (!propertyName.value) {
      error.value = "Please provide both a schema URL and a property name.";
      return;
    }

    // Fetch schema
    let fullSchema = fullSchemaCache.value[schemaUrl.value];
    if (!fullSchema) {
      const res: any = await $fetch(schemaUrl.value, {
        responseType: "json",
        onResponseError: ({ response }) => {
          throw new Error(
            `Failed to fetch schema. Status: ${response.status} - ${response.statusText}`
          );
        },
      });
      fullSchema = res;
      fullSchemaCache.value[schemaUrl.value] = fullSchema;
    }

    // Find the property definition
    const definitions = fullSchema.definitions || fullSchema.$defs;
    if (!definitions || !definitions[propertyName.value]) {
      error.value = `Property ${propertyName.value} is not found in schema's definitions.`;
      return;
    }

    const propertyDefinitions = definitions[propertyName.value];

    // resolve definition
    const dependencies = new Set<string>();
    findDependencies(propertyDefinitions, fullSchema, dependencies);

    const newDefs: any = {};
    for (const depName of dependencies) {
      if (definitions[depName]) {
        newDefs[depName] = definitions[depName];
      }
    }

    const newSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: `https://openepcis.github.io/openepcis-event-sentry/json-schema-epcis-snippets/${propertyName.value}-schema.json`,
      title: `Schema for ${propertyName.value}`,
      ...propertyDefinitions,
      $defs: newDefs,
    };

    // Format and set output, replacing old definition paths
    outputSchema.value = JSON.stringify(newSchema, null, 4).replace(
      /"#\/definitions\//g,
      '"#/$defs/'
    );
  } catch (err: any) {
    console.error("Schema Generation Error : ", err);
    error.value = err.message || "An unknown error occurred.";
  } finally {
    loading.value = false;
  }
};

/**
 * Recursively finds all dependent definitions for a given schema part.
 *
 * @param schemaPart - The current schema being inspected.
 * @param fullSchema - The complete parent schema to look up definitions.
 * @param dependencies - A Set to store the names of dependent definitions.
 */
const findDependencies = (
  schemaPart: any,
  fullSchema: any,
  dependencies: Set<string>
) => {
  // Base cases: ignore non-objects or null values
  if (typeof schemaPart !== "object" || schemaPart === null) return;

  // If it's an array, recurse on each item
  if (Array.isArray(schemaPart)) {
    for (const item of schemaPart) {
      findDependencies(item, fullSchema, dependencies);
    }
    return;
  }

  // Iterate over object keys
  for (const key in schemaPart) {
    if (key === "$ref") {
      const refName = schemaPart[key].split("/").pop();
      // If the dependency is new, add it and recurse into its definition
      if (refName && !dependencies.has(refName)) {
        dependencies.add(refName);
        const definitions = fullSchema.definitions || fullSchema.$defs;
        if (definitions && definitions[refName]) {
          findDependencies(definitions[refName], fullSchema, dependencies);
        }
      }
    } else {
      // Recurse on other properties
      findDependencies(schemaPart[key], fullSchema, dependencies);
    }
  }
};

const debouncedGenerate = useDebounceFn(generateChunk, 300);
</script>
