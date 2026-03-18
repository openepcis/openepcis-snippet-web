<template>
  <div class="space-y-5">
    <!-- ============================================ -->
    <!-- Header Info Box -->
    <!-- ============================================ -->
    <div
      class="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800"
    >
      <div class="flex items-start gap-3">
        <UIcon
          name="i-heroicons-cpu-chip"
          class="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0"
        />
        <div>
          <h4 class="text-sm font-medium text-cyan-800 dark:text-cyan-200">
            Sensor Element
          </h4>
          <p class="text-xs text-cyan-600 dark:text-cyan-300 mt-1">
            Configure sensor element list containing sensorMetadata and
            sensorReport arrays. Each sensor element contains optional metadata
            and one or more sensor reports with measurement readings.
          </p>
        </div>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- Sensor Metadata Configuration Section (collapsible) -->
    <!-- ============================================ -->
    <div
      class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <!-- Collapsible header -->
      <button
        type="button"
        class="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        @click="showMetadataSection = !showMetadataSection"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="
              showMetadataSection
                ? 'i-heroicons-chevron-down'
                : 'i-heroicons-chevron-right'
            "
            class="w-4 h-4 text-gray-500"
          />
          <UIcon
            name="i-heroicons-information-circle"
            class="w-4 h-4 text-cyan-500"
          />
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Sensor Metadata
          </h4>
          <span class="text-xs text-gray-400"
            >({{ countMetadataFields }} fields configured)</span
          >
        </div>
        <UButton
          size="xs"
          :color="localMetadataConfig.isRequired ? 'secondary' : 'neutral'"
          :variant="localMetadataConfig.isRequired ? 'solid' : 'outline'"
          @click.stop="
            localMetadataConfig.isRequired = !localMetadataConfig.isRequired;
            emitUpdate();
          "
        >
          {{ localMetadataConfig.isRequired ? "Required" : "Optional" }}
        </UButton>
      </button>

      <!-- Collapsible content -->
      <div
        v-if="showMetadataSection"
        class="p-3 space-y-3 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Metadata about the sensor device and data processing context.
          Configure each field individually.
        </p>
        <div class="space-y-2">
          <div
            v-for="field in metadataFields"
            :key="field.key"
            class="rounded-md border transition-colors"
            :class="
              localMetadataConfig[field.key]
                ? 'border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            "
          >
            <!-- Field toggle row -->
            <div class="flex items-center justify-between p-2">
              <label class="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  :checked="localMetadataConfig[field.key]"
                  class="rounded border-gray-300 dark:border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  @change="toggleMetadataField(field.key)"
                />
                <span
                  class="text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  {{ field.label }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  ({{ field.type }})
                </span>
              </label>

              <!-- Required/Optional toggle for enabled fields -->
              <UButton
                v-if="localMetadataConfig[field.key]"
                size="xs"
                :color="
                  getMetadataOverride(field.fieldName).required
                    ? 'secondary'
                    : 'neutral'
                "
                :variant="
                  getMetadataOverride(field.fieldName).required
                    ? 'solid'
                    : 'outline'
                "
                class="mr-1"
                @click="toggleMetadataFieldRequired(field.fieldName)"
              >
                {{
                  getMetadataOverride(field.fieldName).required
                    ? "Required"
                    : "Optional"
                }}
              </UButton>

              <!-- Gear icon to expand validation config -->
              <button
                v-if="localMetadataConfig[field.key]"
                type="button"
                class="flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors"
                :class="
                  expandedMetadataFields.has(field.fieldName)
                    ? 'text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/40'
                    : 'text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                "
                @click="toggleMetadataFieldExpanded(field.fieldName)"
              >
                <UIcon name="i-heroicons-cog-6-tooth" class="w-3 h-3" />
                <span v-if="field.type === 'URI'">{{
                  getMetadataOverride(field.fieldName).validationMode ===
                  "pattern"
                    ? "Pattern"
                    : "Any URI"
                }}</span>
                <span v-else>{{
                  getMetadataOverride(field.fieldName).dateTimeConstraint ===
                  "pattern"
                    ? "Pattern"
                    : "Any DateTime"
                }}</span>
              </button>
            </div>

            <!-- Inline validation config for URI fields -->
            <div
              v-if="
                field.type === 'URI' &&
                localMetadataConfig[field.key] &&
                expandedMetadataFields.has(field.fieldName)
              "
              class="px-3 pb-2 pt-0 space-y-2 border-t border-cyan-200 dark:border-cyan-800"
            >
              <div class="flex gap-2 pt-2">
                <UButton
                  size="xs"
                  :color="
                    getMetadataOverride(field.fieldName).validationMode !==
                    'pattern'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getMetadataOverride(field.fieldName).validationMode !==
                    'pattern'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="setMetadataFieldUriMode(field.fieldName, 'uri')"
                >
                  Any URI
                </UButton>
                <UButton
                  size="xs"
                  :color="
                    getMetadataOverride(field.fieldName).validationMode ===
                    'pattern'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getMetadataOverride(field.fieldName).validationMode ===
                    'pattern'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="setMetadataFieldUriMode(field.fieldName, 'pattern')"
                >
                  Custom Pattern
                </UButton>
              </div>
              <div
                v-if="
                  getMetadataOverride(field.fieldName).validationMode ===
                  'pattern'
                "
              >
                <UInput
                  :model-value="
                    getMetadataOverride(field.fieldName).pattern || ''
                  "
                  placeholder="e.g., ^https://example\.com/.*$ or ^urn:epc:id:sgln:.*$"
                  size="sm"
                  class="font-mono text-sm"
                  @update:model-value="
                    updateMetadataFieldPattern(
                      field.fieldName,
                      $event as string,
                    )
                  "
                />
              </div>
              <p v-else class="text-xs text-gray-500 dark:text-gray-400">
                Validates as any valid URI (format: uri).
              </p>
            </div>

            <!-- Inline validation config for dateTime fields -->
            <div
              v-if="
                field.type === 'dateTime' &&
                localMetadataConfig[field.key] &&
                expandedMetadataFields.has(field.fieldName)
              "
              class="px-3 pb-2 pt-0 space-y-2 border-t border-cyan-200 dark:border-cyan-800"
            >
              <div class="flex gap-2 pt-2">
                <UButton
                  size="xs"
                  :color="
                    getMetadataOverride(field.fieldName).dateTimeConstraint !==
                    'pattern'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getMetadataOverride(field.fieldName).dateTimeConstraint !==
                    'pattern'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="setMetadataFieldDateTimeMode(field.fieldName, 'any')"
                >
                  Any DateTime
                </UButton>
                <UButton
                  size="xs"
                  :color="
                    getMetadataOverride(field.fieldName).dateTimeConstraint ===
                    'pattern'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getMetadataOverride(field.fieldName).dateTimeConstraint ===
                    'pattern'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="
                    setMetadataFieldDateTimeMode(field.fieldName, 'pattern')
                  "
                >
                  Custom Pattern
                </UButton>
              </div>
              <div
                v-if="
                  getMetadataOverride(field.fieldName).dateTimeConstraint ===
                  'pattern'
                "
              >
                <UInput
                  :model-value="
                    getMetadataOverride(field.fieldName).dateTimePattern || ''
                  "
                  placeholder="e.g., ^2024-.*T.*Z$ or ^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$"
                  size="sm"
                  class="font-mono text-sm"
                  @update:model-value="
                    updateMetadataFieldDateTimePattern(
                      field.fieldName,
                      $event as string,
                    )
                  "
                />
              </div>
              <p v-else class="text-xs text-gray-500 dark:text-gray-400">
                Validates as any valid date-time (format: date-time).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- ============================================ -->
    <!-- Sensor Report Configuration Section (collapsible) -->
    <!-- ============================================ -->
    <div
      class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <!-- Collapsible header -->
      <button
        type="button"
        class="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        @click="showReportSection = !showReportSection"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="
              showReportSection
                ? 'i-heroicons-chevron-down'
                : 'i-heroicons-chevron-right'
            "
            class="w-4 h-4 text-gray-500"
          />
          <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 text-cyan-500" />
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Sensor Report
          </h4>
          <span class="text-xs text-gray-400"
            >({{ countReportFields }} fields configured)</span
          >
        </div>
      </button>

      <!-- Collapsible content -->
      <div
        v-if="showReportSection"
        class="p-3 space-y-3 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Configure sensorReport fields from the EPCIS 2.0 JSON Schema. Each
          field can be enabled, marked as required/optional, and configured with
          type-specific validation.
        </p>
        <div class="space-y-2">
          <div
            v-for="field in reportFields"
            :key="field.key"
            class="rounded-md border transition-colors"
            :class="
              localReportConfig[field.key]
                ? 'border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            "
          >
            <!-- Field toggle row -->
            <div class="flex items-center justify-between p-2">
              <label class="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  :checked="localReportConfig[field.key]"
                  class="rounded border-gray-300 dark:border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  @change="toggleReportField(field.key)"
                />
                <span
                  class="text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  {{ field.label }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  ({{ field.type }})
                </span>
              </label>

              <!-- Required/Optional toggle + gear icon for enabled fields -->
              <div
                v-if="localReportConfig[field.key]"
                class="flex items-center gap-1"
              >
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).required
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).required
                      ? 'solid'
                      : 'outline'
                  "
                  @click="toggleReportFieldRequired(field.fieldName)"
                >
                  {{
                    getReportOverride(field.fieldName).required
                      ? "Required"
                      : "Optional"
                  }}
                </UButton>

                <!-- Gear icon (not for boolean - no extra config) -->
                <button
                  v-if="field.type !== 'boolean'"
                  type="button"
                  class="flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors"
                  :class="
                    expandedReportFields.has(field.fieldName)
                      ? 'text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/40'
                      : 'text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  "
                  @click="toggleReportFieldExpanded(field.fieldName)"
                >
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-3 h-3" />
                  <span>{{ getReportFieldConfigSummary(field) }}</span>
                </button>
              </div>
            </div>

            <!-- ==================== -->
            <!-- Inline config panels -->
            <!-- ==================== -->

            <!-- URI config -->
            <div
              v-if="
                field.type === 'uri' &&
                localReportConfig[field.key] &&
                expandedReportFields.has(field.fieldName)
              "
              class="px-3 pb-2 pt-0 space-y-2 border-t border-cyan-200 dark:border-cyan-800"
            >
              <div class="flex gap-2 pt-2">
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).validationMode !==
                    'pattern'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).validationMode !==
                    'pattern'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="setReportFieldUriMode(field.fieldName, 'uri')"
                >
                  Any URI
                </UButton>
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).validationMode ===
                    'pattern'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).validationMode ===
                    'pattern'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="setReportFieldUriMode(field.fieldName, 'pattern')"
                >
                  Custom Pattern
                </UButton>
              </div>
              <div
                v-if="
                  getReportOverride(field.fieldName).validationMode ===
                  'pattern'
                "
              >
                <UInput
                  :model-value="
                    getReportOverride(field.fieldName).pattern || ''
                  "
                  placeholder="e.g., ^https://example\.com/.*$ or ^urn:epc:id:sgln:.*$"
                  size="sm"
                  class="font-mono text-sm"
                  @update:model-value="
                    updateReportFieldPattern(field.fieldName, $event as string)
                  "
                />
              </div>
              <p v-else class="text-xs text-gray-500 dark:text-gray-400">
                Validates as any valid URI (format: uri).
              </p>
            </div>

            <!-- DateTime config -->
            <div
              v-if="
                field.type === 'dateTime' &&
                localReportConfig[field.key] &&
                expandedReportFields.has(field.fieldName)
              "
              class="px-3 pb-2 pt-0 space-y-2 border-t border-cyan-200 dark:border-cyan-800"
            >
              <div class="flex gap-2 pt-2">
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).dateTimeConstraint !==
                    'pattern'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).dateTimeConstraint !==
                    'pattern'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="setReportFieldDateTimeMode(field.fieldName, 'any')"
                >
                  Any DateTime
                </UButton>
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).dateTimeConstraint ===
                    'pattern'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).dateTimeConstraint ===
                    'pattern'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="
                    setReportFieldDateTimeMode(field.fieldName, 'pattern')
                  "
                >
                  Custom Pattern
                </UButton>
              </div>
              <div
                v-if="
                  getReportOverride(field.fieldName).dateTimeConstraint ===
                  'pattern'
                "
              >
                <UInput
                  :model-value="
                    getReportOverride(field.fieldName).dateTimePattern || ''
                  "
                  placeholder="e.g., ^2024-.*T.*Z$ or ^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$"
                  size="sm"
                  class="font-mono text-sm"
                  @update:model-value="
                    updateReportFieldDateTimePattern(
                      field.fieldName,
                      $event as string,
                    )
                  "
                />
              </div>
              <p v-else class="text-xs text-gray-500 dark:text-gray-400">
                Validates as any valid date-time (format: date-time).
              </p>
            </div>

            <!-- Decimal config (min/max range) -->
            <div
              v-if="
                field.type === 'decimal' &&
                localReportConfig[field.key] &&
                expandedReportFields.has(field.fieldName)
              "
              class="px-3 pb-2 pt-0 space-y-2 border-t border-cyan-200 dark:border-cyan-800"
            >
              <div class="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label
                    class="block text-xs text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Min Value
                  </label>
                  <UInput
                    :model-value="getReportOverride(field.fieldName).decimalMin"
                    type="number"
                    placeholder="No minimum"
                    size="sm"
                    @update:model-value="
                      updateReportFieldDecimalMin(
                        field.fieldName,
                        $event === '' || $event === undefined
                          ? undefined
                          : Number($event),
                      )
                    "
                  />
                </div>
                <div>
                  <label
                    class="block text-xs text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Max Value
                  </label>
                  <UInput
                    :model-value="getReportOverride(field.fieldName).decimalMax"
                    type="number"
                    placeholder="No maximum"
                    size="sm"
                    @update:model-value="
                      updateReportFieldDecimalMax(
                        field.fieldName,
                        $event === '' || $event === undefined
                          ? undefined
                          : Number($event),
                      )
                    "
                  />
                </div>
              </div>
            </div>

            <!-- String / hexBinary config (optional pattern) -->
            <div
              v-if="
                (field.type === 'string' || field.type === 'hexBinary') &&
                localReportConfig[field.key] &&
                expandedReportFields.has(field.fieldName)
              "
              class="px-3 pb-2 pt-0 space-y-2 border-t border-cyan-200 dark:border-cyan-800"
            >
              <div class="pt-2">
                <label
                  class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Validation Pattern (Regex, optional)
                </label>
                <UInput
                  :model-value="
                    getReportOverride(field.fieldName).stringPattern || ''
                  "
                  :placeholder="
                    field.fieldName === 'uom'
                      ? 'e.g., ^[A-Z0-9]{2,3}$'
                      : field.type === 'hexBinary'
                        ? 'e.g., ^[0-9A-Fa-f]+$'
                        : 'e.g., ^[a-zA-Z0-9]+$'
                  "
                  size="sm"
                  class="font-mono text-sm"
                  @update:model-value="
                    updateReportFieldStringPattern(
                      field.fieldName,
                      $event as string,
                    )
                  "
                />
              </div>

              <!-- UOM quick-fill example patterns -->
              <div v-if="field.fieldName === 'uom'">
                <label
                  class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2"
                >
                  Quick-fill Patterns
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="example in uomExamplePatterns"
                    :key="example.pattern"
                    type="button"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors"
                    :class="
                      getReportOverride(field.fieldName).stringPattern ===
                      example.pattern
                        ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    "
                    @click="
                      updateReportFieldStringPattern(
                        field.fieldName,
                        example.pattern,
                      )
                    "
                  >
                    {{ example.label }}
                  </button>
                </div>
              </div>

              <p
                v-if="!getReportOverride(field.fieldName).stringPattern"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                No pattern set - any {{ field.type }} value accepted.
              </p>
            </div>

            <!-- MeasurementType config -->
            <div
              v-if="
                field.type === 'measurementType' &&
                localReportConfig[field.key] &&
                expandedReportFields.has(field.fieldName)
              "
              class="px-3 pb-2 pt-0 space-y-2 border-t border-cyan-200 dark:border-cyan-800"
            >
              <!-- Mode selector -->
              <div class="flex gap-2 pt-2">
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).measurementTypeMode !==
                      'standard' &&
                    getReportOverride(field.fieldName).measurementTypeMode !==
                      'custom'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).measurementTypeMode !==
                      'standard' &&
                    getReportOverride(field.fieldName).measurementTypeMode !==
                      'custom'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="
                    setReportFieldMeasurementTypeMode(field.fieldName, 'any')
                  "
                >
                  Any Type
                </UButton>
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).measurementTypeMode ===
                    'standard'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).measurementTypeMode ===
                    'standard'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="
                    setReportFieldMeasurementTypeMode(
                      field.fieldName,
                      'standard',
                    )
                  "
                >
                  Standard Types
                </UButton>
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).measurementTypeMode ===
                    'custom'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).measurementTypeMode ===
                    'custom'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="
                    setReportFieldMeasurementTypeMode(field.fieldName, 'custom')
                  "
                >
                  Custom Pattern
                </UButton>
              </div>

              <!-- Standard mode: searchable multi-select -->
              <div
                v-if="
                  getReportOverride(field.fieldName).measurementTypeMode ===
                  'standard'
                "
                class="space-y-2"
              >
                <div class="flex items-center justify-between">
                  <label class="text-xs text-gray-600 dark:text-gray-400">
                    Select allowed measurement types ({{
                      (
                        getReportOverride(field.fieldName)
                          .selectedMeasurementTypes || []
                      ).length
                    }}
                    selected)
                  </label>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="text-xs text-secondary-600 dark:text-secondary-400 hover:underline"
                      @click="selectAllMeasurementTypes(field.fieldName)"
                    >
                      All
                    </button>
                    <span class="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      type="button"
                      class="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                      @click="clearAllMeasurementTypes(field.fieldName)"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <!-- Search -->
                <input
                  v-model="typeSearchQuery"
                  type="text"
                  placeholder="Search measurement types..."
                  class="w-full px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                />

                <!-- Type List -->
                <div
                  class="max-h-48 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg p-2"
                >
                  <label
                    v-for="mt in filteredMeasurementTypes"
                    :key="mt.value"
                    class="flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors"
                    :class="
                      (
                        getReportOverride(field.fieldName)
                          .selectedMeasurementTypes || []
                      ).includes(mt.value)
                        ? 'bg-cyan-50 dark:bg-cyan-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    "
                  >
                    <input
                      type="checkbox"
                      :checked="
                        (
                          getReportOverride(field.fieldName)
                            .selectedMeasurementTypes || []
                        ).includes(mt.value)
                      "
                      class="rounded border-gray-300 dark:border-gray-600 text-cyan-500 focus:ring-cyan-500"
                      @change="
                        toggleReportFieldMeasurementType(
                          field.fieldName,
                          mt.value,
                        )
                      "
                    />
                    <span class="text-xs text-gray-800 dark:text-gray-200">{{
                      mt.label
                    }}</span>
                  </label>
                </div>
              </div>

              <!-- Custom mode: regex pattern -->
              <div
                v-if="
                  getReportOverride(field.fieldName).measurementTypeMode ===
                  'custom'
                "
                class="space-y-2"
              >
                <label class="text-xs text-gray-600 dark:text-gray-400">
                  Custom regex pattern for measurement type
                </label>
                <UInput
                  :model-value="
                    getReportOverride(field.fieldName)
                      .customMeasurementTypePattern || ''
                  "
                  placeholder="e.g., ^(Temperature|Humidity|Pressure)$"
                  size="sm"
                  class="font-mono text-sm"
                  @update:model-value="
                    updateReportFieldCustomMeasurementTypePattern(
                      field.fieldName,
                      $event as string,
                    )
                  "
                />
              </div>

              <!-- Any mode info -->
              <p
                v-if="
                  getReportOverride(field.fieldName).measurementTypeMode !==
                    'standard' &&
                  getReportOverride(field.fieldName).measurementTypeMode !==
                    'custom'
                "
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                Any valid measurement type URI accepted.
              </p>
            </div>

            <!-- Component config -->
            <div
              v-if="
                field.type === 'component' &&
                localReportConfig[field.key] &&
                expandedReportFields.has(field.fieldName)
              "
              class="px-3 pb-2 pt-0 space-y-2 border-t border-cyan-200 dark:border-cyan-800"
            >
              <!-- Mode selector -->
              <div class="flex gap-2 pt-2">
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).componentMode !==
                      'standard' &&
                    getReportOverride(field.fieldName).componentMode !==
                      'custom'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).componentMode !==
                      'standard' &&
                    getReportOverride(field.fieldName).componentMode !==
                      'custom'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="setReportFieldComponentMode(field.fieldName, 'any')"
                >
                  Any
                </UButton>
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).componentMode ===
                    'standard'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).componentMode ===
                    'standard'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="
                    setReportFieldComponentMode(field.fieldName, 'standard')
                  "
                >
                  Standard Values
                </UButton>
                <UButton
                  size="xs"
                  :color="
                    getReportOverride(field.fieldName).componentMode ===
                    'custom'
                      ? 'secondary'
                      : 'neutral'
                  "
                  :variant="
                    getReportOverride(field.fieldName).componentMode ===
                    'custom'
                      ? 'solid'
                      : 'outline'
                  "
                  @click="
                    setReportFieldComponentMode(field.fieldName, 'custom')
                  "
                >
                  Custom Pattern
                </UButton>
              </div>

              <!-- Standard mode: multi-select grid -->
              <div
                v-if="
                  getReportOverride(field.fieldName).componentMode ===
                  'standard'
                "
                class="space-y-2"
              >
                <label class="text-xs text-gray-600 dark:text-gray-400">
                  Select allowed components ({{
                    (
                      getReportOverride(field.fieldName).selectedComponents ||
                      []
                    ).length
                  }}
                  selected)
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <label
                    v-for="comp in componentOptions"
                    :key="comp.value"
                    class="flex items-center gap-2 p-1.5 rounded-md border cursor-pointer transition-colors"
                    :class="
                      (
                        getReportOverride(field.fieldName).selectedComponents ||
                        []
                      ).includes(comp.value)
                        ? 'border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    "
                  >
                    <input
                      type="checkbox"
                      :checked="
                        (
                          getReportOverride(field.fieldName)
                            .selectedComponents || []
                        ).includes(comp.value)
                      "
                      class="rounded border-gray-300 dark:border-gray-600 text-cyan-500 focus:ring-cyan-500"
                      @change="
                        toggleReportFieldComponent(field.fieldName, comp.value)
                      "
                    />
                    <span class="text-xs text-gray-800 dark:text-gray-200">{{
                      comp.label
                    }}</span>
                  </label>
                </div>
              </div>

              <!-- Custom mode -->
              <div
                v-if="
                  getReportOverride(field.fieldName).componentMode === 'custom'
                "
                class="space-y-2"
              >
                <label class="text-xs text-gray-600 dark:text-gray-400">
                  Custom regex pattern for component
                </label>
                <UInput
                  :model-value="
                    getReportOverride(field.fieldName).customComponentPattern ||
                    ''
                  "
                  placeholder="e.g., ^(x|y|z)$"
                  size="sm"
                  class="font-mono text-sm"
                  @update:model-value="
                    updateReportFieldCustomComponentPattern(
                      field.fieldName,
                      $event as string,
                    )
                  "
                />
              </div>

              <!-- Any mode info -->
              <p
                v-if="
                  getReportOverride(field.fieldName).componentMode !==
                    'standard' &&
                  getReportOverride(field.fieldName).componentMode !== 'custom'
                "
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                Any valid component string accepted.
              </p>
            </div>

            <!-- SensorAlertType (exception) config -->
            <div
              v-if="
                field.type === 'sensorAlertType' &&
                localReportConfig[field.key] &&
                expandedReportFields.has(field.fieldName)
              "
              class="px-3 pb-2 pt-0 space-y-2 border-t border-cyan-200 dark:border-cyan-800"
            >
              <div class="pt-2">
                <label class="text-xs text-gray-600 dark:text-gray-400">
                  Restrict to specific exception values (leave unchecked for any
                  string)
                </label>
                <div class="grid grid-cols-2 gap-2 mt-2">
                  <label
                    v-for="exc in exceptionOptions"
                    :key="exc.value"
                    class="flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors"
                    :class="
                      (
                        getReportOverride(field.fieldName).selectedExceptions ||
                        []
                      ).includes(exc.value)
                        ? 'border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    "
                  >
                    <input
                      type="checkbox"
                      :checked="
                        (
                          getReportOverride(field.fieldName)
                            .selectedExceptions || []
                        ).includes(exc.value)
                      "
                      class="rounded border-gray-300 dark:border-gray-600 text-cyan-500 focus:ring-cyan-500"
                      @change="
                        toggleReportFieldException(field.fieldName, exc.value)
                      "
                    />
                    <span class="text-xs text-gray-800 dark:text-gray-200">{{
                      exc.label
                    }}</span>
                  </label>
                </div>
              </div>
              <p
                v-if="
                  !(getReportOverride(field.fieldName).selectedExceptions || [])
                    .length
                "
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                No restriction - any string value accepted.
              </p>
            </div>
          </div>
        </div>

        <!-- ========== Sensor Report Array Constraints ========== -->
        <div class="border-t border-gray-100 dark:border-gray-800" />

        <ArrayCountConfigPanel
          :min-items="localReportConfig.minItems"
          :max-items="localReportConfig.maxItems"
          title="Sensor Report Array Constraints"
          description="Set minimum and maximum number of sensor reports allowed per sensor element."
          @update:min-items="
            (v) => {
              localReportConfig.minItems = v;
              emitUpdate();
            }
          "
          @update:max-items="
            (v) => {
              localReportConfig.maxItems = v;
              emitUpdate();
            }
          "
        />
      </div>
    </div>

    <!-- ============================================ -->
    <!-- Sensor Element List Array Constraints -->
    <!-- ============================================ -->
    <ArrayCountConfigPanel
      :min-items="localConfig.minItems"
      :max-items="localConfig.maxItems"
      title="Sensor Element List Array Constraints"
      description="Set minimum and maximum number of sensor elements allowed in the list."
      @update:min-items="
        (v) => {
          localConfig.minItems = v;
          emitUpdate();
        }
      "
      @update:max-items="
        (v) => {
          localConfig.maxItems = v;
          emitUpdate();
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type {
  SensorElementConfig,
  SensorMetadataConfig,
  SensorReportConfig,
  SensorFieldOverride,
} from "~/types/profile";
import {
  measurementTypes,
  componentOptions,
  exceptionOptions,
  uomExamplePatterns,
  metadataFields,
  reportFields,
} from "~/data/sensor-constants";

// ============================================
// Props & Emits
// ============================================

const props = defineProps<{
  sensorElementConfig: SensorElementConfig;
}>();

const emit = defineEmits<{
  (e: "update:sensorElementConfig", config: SensorElementConfig): void;
}>();

// ============================================
// Track which fields have their validation panel expanded
// ============================================
const expandedMetadataFields = ref<Set<string>>(new Set());
const expandedReportFields = ref<Set<string>>(new Set());

// Collapsible section state
const showMetadataSection = ref(false);
const showReportSection = ref(false);
const typeSearchQuery = ref("");

// ============================================
// Default configurations
// ============================================

const defaultMetadataConfig = (): SensorMetadataConfig => ({
  enabled: false,
  isRequired: false,
  includeTime: false,
  includeDeviceID: false,
  includeDeviceMetadata: false,
  includeRawData: false,
  includeStartTime: false,
  includeEndTime: false,
  includeDataProcessingMethod: false,
  includeBizRules: false,
});

const defaultReportConfig = (): SensorReportConfig => ({
  includeType: false,
  includeException: false,
  includeDeviceID: false,
  includeDeviceMetadata: false,
  includeRawData: false,
  includeDataProcessingMethod: false,
  includeBizRules: false,
  includeTime: false,
  includeMicroorganism: false,
  includeChemicalSubstance: false,
  includeCoordinateReferenceSystem: false,
  includeValue: false,
  includeComponent: false,
  includeStringValue: false,
  includeBooleanValue: false,
  includeHexBinaryValue: false,
  includeUriValue: false,
  includeMinValue: false,
  includeMaxValue: false,
  includeMeanValue: false,
  includeSDev: false,
  includePercRank: false,
  includePercValue: false,
  includeUom: false,
  minItems: undefined,
  maxItems: undefined,
});

// ============================================
// Local state
// ============================================

const localConfig = ref<SensorElementConfig>({
  minItems: props.sensorElementConfig.minItems,
  maxItems: props.sensorElementConfig.maxItems,
});

const localMetadataConfig = ref<SensorMetadataConfig>(
  props.sensorElementConfig.sensorMetadataConfig
    ? { ...props.sensorElementConfig.sensorMetadataConfig }
    : defaultMetadataConfig(),
);

const localReportConfig = ref<SensorReportConfig>(
  props.sensorElementConfig.sensorReportConfig
    ? { ...props.sensorElementConfig.sensorReportConfig }
    : defaultReportConfig(),
);

// Per-field override state for metadata fields (keyed by EPCIS field name)
const localMetadataOverrides = ref<Record<string, SensorFieldOverride>>(
  props.sensorElementConfig.sensorMetadataConfig?.fieldOverrides
    ? JSON.parse(
        JSON.stringify(
          props.sensorElementConfig.sensorMetadataConfig.fieldOverrides,
        ),
      )
    : {},
);

// Per-field override state for report fields (keyed by EPCIS field name)
const localReportOverrides = ref<Record<string, SensorFieldOverride>>(
  props.sensorElementConfig.sensorReportConfig?.fieldOverrides
    ? JSON.parse(
        JSON.stringify(
          props.sensorElementConfig.sensorReportConfig.fieldOverrides,
        ),
      )
    : {},
);

// ============================================
// EPCIS 2.0 Measurement Types (all 71 from GS1 standard)
// ============================================
// Constants and field definitions imported from ~/data/sensor-constants


// ============================================
// Computed values
// ============================================

// Count of enabled metadata fields (for section header)
const countMetadataFields = computed(
  () => metadataFields.filter((f) => localMetadataConfig.value[f.key]).length,
);

// Count of enabled report fields (for section header)
const countReportFields = computed(
  () => reportFields.filter((f) => localReportConfig.value[f.key]).length,
);

// Filtered measurement types based on search
const filteredMeasurementTypes = computed(() => {
  if (!typeSearchQuery.value) return measurementTypes;
  const query = typeSearchQuery.value.toLowerCase();
  return measurementTypes.filter(
    (mt) =>
      mt.label.toLowerCase().includes(query) ||
      mt.value.toLowerCase().includes(query),
  );
});

// ============================================
// Gear icon config summary text
// ============================================
const getReportFieldConfigSummary = (field: {
  fieldName: string;
  type: SensorReportFieldType;
}): string => {
  const override = getReportOverride(field.fieldName);
  switch (field.type) {
    case "uri":
      return override.validationMode === "pattern" ? "Pattern" : "Any URI";
    case "dateTime":
      return override.dateTimeConstraint === "pattern"
        ? "Pattern"
        : "Any DateTime";
    case "decimal": {
      const parts: string[] = [];
      if (override.decimalMin !== undefined)
        parts.push(`min:${override.decimalMin}`);
      if (override.decimalMax !== undefined)
        parts.push(`max:${override.decimalMax}`);
      return parts.length > 0 ? parts.join(", ") : "Any number";
    }
    case "string":
    case "hexBinary":
      return override.stringPattern ? "Pattern" : "Any string";
    case "measurementType":
      if (override.measurementTypeMode === "standard") {
        const count = (override.selectedMeasurementTypes || []).length;
        return `${count} types`;
      }
      if (override.measurementTypeMode === "custom") return "Custom";
      return "Any type";
    case "component":
      if (override.componentMode === "standard") {
        const count = (override.selectedComponents || []).length;
        return `${count} values`;
      }
      if (override.componentMode === "custom") return "Custom";
      return "Any";
    case "sensorAlertType": {
      const count = (override.selectedExceptions || []).length;
      return count > 0 ? `${count} selected` : "Any";
    }
    default:
      return "Configure";
  }
};

// ============================================
// Field override helpers (metadata)
// ============================================

const getMetadataOverride = (fieldName: string): SensorFieldOverride => {
  if (!localMetadataOverrides.value[fieldName]) {
    localMetadataOverrides.value[fieldName] = {};
  }
  return localMetadataOverrides.value[fieldName];
};

const toggleMetadataFieldRequired = (fieldName: string) => {
  const override = getMetadataOverride(fieldName);
  override.required = !override.required;
  emitUpdate();
};

const setMetadataFieldUriMode = (
  fieldName: string,
  mode: "uri" | "pattern",
) => {
  const override = getMetadataOverride(fieldName);
  override.validationMode = mode;
  if (mode === "uri") override.pattern = undefined;
  emitUpdate();
};

const setMetadataFieldDateTimeMode = (
  fieldName: string,
  mode: "any" | "pattern",
) => {
  const override = getMetadataOverride(fieldName);
  override.dateTimeConstraint = mode;
  if (mode === "any") override.dateTimePattern = undefined;
  emitUpdate();
};

const updateMetadataFieldPattern = (fieldName: string, pattern: string) => {
  const override = getMetadataOverride(fieldName);
  override.pattern = pattern || undefined;
  emitUpdate();
};

const updateMetadataFieldDateTimePattern = (
  fieldName: string,
  pattern: string,
) => {
  const override = getMetadataOverride(fieldName);
  override.dateTimePattern = pattern || undefined;
  emitUpdate();
};

// ============================================
// Field override helpers (report)
// ============================================

const getReportOverride = (fieldName: string): SensorFieldOverride => {
  if (!localReportOverrides.value[fieldName]) {
    localReportOverrides.value[fieldName] = {};
  }
  return localReportOverrides.value[fieldName];
};

const toggleReportFieldRequired = (fieldName: string) => {
  const override = getReportOverride(fieldName);
  override.required = !override.required;
  emitUpdate();
};

// --- URI ---
const setReportFieldUriMode = (fieldName: string, mode: "uri" | "pattern") => {
  const override = getReportOverride(fieldName);
  override.validationMode = mode;
  if (mode === "uri") override.pattern = undefined;
  emitUpdate();
};

const updateReportFieldPattern = (fieldName: string, pattern: string) => {
  const override = getReportOverride(fieldName);
  override.pattern = pattern || undefined;
  emitUpdate();
};

// --- DateTime ---
const setReportFieldDateTimeMode = (
  fieldName: string,
  mode: "any" | "pattern",
) => {
  const override = getReportOverride(fieldName);
  override.dateTimeConstraint = mode;
  if (mode === "any") override.dateTimePattern = undefined;
  emitUpdate();
};

const updateReportFieldDateTimePattern = (
  fieldName: string,
  pattern: string,
) => {
  const override = getReportOverride(fieldName);
  override.dateTimePattern = pattern || undefined;
  emitUpdate();
};

// --- Decimal ---
const updateReportFieldDecimalMin = (
  fieldName: string,
  value: number | undefined,
) => {
  const override = getReportOverride(fieldName);
  override.decimalMin = value;
  emitUpdate();
};

const updateReportFieldDecimalMax = (
  fieldName: string,
  value: number | undefined,
) => {
  const override = getReportOverride(fieldName);
  override.decimalMax = value;
  emitUpdate();
};

// --- String / hexBinary ---
const updateReportFieldStringPattern = (fieldName: string, pattern: string) => {
  const override = getReportOverride(fieldName);
  override.stringPattern = pattern || undefined;
  emitUpdate();
};

// --- MeasurementType ---
const setReportFieldMeasurementTypeMode = (
  fieldName: string,
  mode: "any" | "standard" | "custom",
) => {
  const override = getReportOverride(fieldName);
  override.measurementTypeMode = mode;
  if (mode !== "standard") override.selectedMeasurementTypes = [];
  if (mode !== "custom") override.customMeasurementTypePattern = undefined;
  emitUpdate();
};

const toggleReportFieldMeasurementType = (
  fieldName: string,
  typeValue: string,
) => {
  const override = getReportOverride(fieldName);
  if (!override.selectedMeasurementTypes) {
    override.selectedMeasurementTypes = [];
  }
  const idx = override.selectedMeasurementTypes.indexOf(typeValue);
  if (idx >= 0) {
    override.selectedMeasurementTypes.splice(idx, 1);
  } else {
    override.selectedMeasurementTypes.push(typeValue);
  }
  emitUpdate();
};

const selectAllMeasurementTypes = (fieldName: string) => {
  const override = getReportOverride(fieldName);
  override.selectedMeasurementTypes = measurementTypes.map((mt) => mt.value);
  emitUpdate();
};

const clearAllMeasurementTypes = (fieldName: string) => {
  const override = getReportOverride(fieldName);
  override.selectedMeasurementTypes = [];
  emitUpdate();
};

const updateReportFieldCustomMeasurementTypePattern = (
  fieldName: string,
  pattern: string,
) => {
  const override = getReportOverride(fieldName);
  override.customMeasurementTypePattern = pattern || undefined;
  emitUpdate();
};

// --- Component ---
const setReportFieldComponentMode = (
  fieldName: string,
  mode: "any" | "standard" | "custom",
) => {
  const override = getReportOverride(fieldName);
  override.componentMode = mode;
  if (mode !== "standard") override.selectedComponents = [];
  if (mode !== "custom") override.customComponentPattern = undefined;
  emitUpdate();
};

const toggleReportFieldComponent = (
  fieldName: string,
  componentValue: string,
) => {
  const override = getReportOverride(fieldName);
  if (!override.selectedComponents) {
    override.selectedComponents = [];
  }
  const idx = override.selectedComponents.indexOf(componentValue);
  if (idx >= 0) {
    override.selectedComponents.splice(idx, 1);
  } else {
    override.selectedComponents.push(componentValue);
  }
  emitUpdate();
};

const updateReportFieldCustomComponentPattern = (
  fieldName: string,
  pattern: string,
) => {
  const override = getReportOverride(fieldName);
  override.customComponentPattern = pattern || undefined;
  emitUpdate();
};

// --- SensorAlertType (exception) ---
const toggleReportFieldException = (
  fieldName: string,
  exceptionValue: string,
) => {
  const override = getReportOverride(fieldName);
  if (!override.selectedExceptions) {
    override.selectedExceptions = [];
  }
  const idx = override.selectedExceptions.indexOf(exceptionValue);
  if (idx >= 0) {
    override.selectedExceptions.splice(idx, 1);
  } else {
    override.selectedExceptions.push(exceptionValue);
  }
  emitUpdate();
};

// ============================================
// Expanded field toggles
// ============================================

const toggleMetadataFieldExpanded = (fieldName: string) => {
  if (expandedMetadataFields.value.has(fieldName)) {
    expandedMetadataFields.value.delete(fieldName);
  } else {
    expandedMetadataFields.value.add(fieldName);
  }
};

const toggleReportFieldExpanded = (fieldName: string) => {
  if (expandedReportFields.value.has(fieldName)) {
    expandedReportFields.value.delete(fieldName);
  } else {
    expandedReportFields.value.add(fieldName);
  }
};

// ============================================
// Collect active field overrides (only non-default overrides)
// ============================================
const collectActiveOverrides = (
  overrides: Record<string, SensorFieldOverride>,
): Record<string, SensorFieldOverride> | undefined => {
  const active: Record<string, SensorFieldOverride> = {};
  for (const [fieldName, override] of Object.entries(overrides)) {
    const hasRequired = override.required === true;
    const hasUriPattern =
      override.validationMode === "pattern" && override.pattern;
    const hasDateTimePattern =
      override.dateTimeConstraint === "pattern" && override.dateTimePattern;
    const hasDecimalRange =
      override.decimalMin !== undefined || override.decimalMax !== undefined;
    const hasStringPattern = !!override.stringPattern;
    const hasMeasurementType =
      (override.measurementTypeMode === "standard" &&
        (override.selectedMeasurementTypes || []).length > 0) ||
      (override.measurementTypeMode === "custom" &&
        !!override.customMeasurementTypePattern);
    const hasComponent =
      (override.componentMode === "standard" &&
        (override.selectedComponents || []).length > 0) ||
      (override.componentMode === "custom" &&
        !!override.customComponentPattern);
    const hasExceptions = (override.selectedExceptions || []).length > 0;

    if (
      hasRequired ||
      hasUriPattern ||
      hasDateTimePattern ||
      hasDecimalRange ||
      hasStringPattern ||
      hasMeasurementType ||
      hasComponent ||
      hasExceptions
    ) {
      active[fieldName] = { ...override };
    }
  }
  return Object.keys(active).length > 0 ? active : undefined;
};

// ============================================
// Emit update - constructs complete SensorElementConfig from local state
// ============================================
const emitUpdate = () => {
  // Build metadata field overrides
  const metadataOverrides = collectActiveOverrides(
    localMetadataOverrides.value,
  );

  // Build report field overrides
  const reportOverrides = collectActiveOverrides(localReportOverrides.value);

  const config: SensorElementConfig = {
    minItems: localConfig.value.minItems,
    maxItems: localConfig.value.maxItems,
    sensorMetadataConfig:
      countMetadataFields.value > 0 || localMetadataConfig.value.isRequired
        ? {
            ...localMetadataConfig.value,
            enabled: true,
            fieldOverrides: metadataOverrides,
          }
        : {
            ...localMetadataConfig.value,
            enabled: false,
            fieldOverrides: undefined,
          },
    sensorReportConfig: {
      ...localReportConfig.value,
      fieldOverrides: reportOverrides,
    },
  };
  emit("update:sensorElementConfig", config);
};

// ============================================
// Toggle methods
// ============================================

const toggleMetadataField = (key: keyof SensorMetadataConfig) => {
  (localMetadataConfig.value[key] as boolean) = !localMetadataConfig.value[key];
  emitUpdate();
};

const toggleReportField = (key: keyof SensorReportConfig) => {
  (localReportConfig.value[key] as boolean) = !(localReportConfig.value[
    key
  ] as boolean);
  emitUpdate();
};

// ============================================
// Watch for prop changes (when editing existing config)
// ============================================
watch(
  () => props.sensorElementConfig,
  (newConfig) => {
    localConfig.value = {
      minItems: newConfig.minItems,
      maxItems: newConfig.maxItems,
    };
    localMetadataConfig.value = newConfig.sensorMetadataConfig
      ? { ...newConfig.sensorMetadataConfig }
      : defaultMetadataConfig();
    localMetadataOverrides.value = newConfig.sensorMetadataConfig
      ?.fieldOverrides
      ? JSON.parse(
          JSON.stringify(newConfig.sensorMetadataConfig.fieldOverrides),
        )
      : {};
    localReportConfig.value = newConfig.sensorReportConfig
      ? { ...newConfig.sensorReportConfig }
      : defaultReportConfig();
    localReportOverrides.value = newConfig.sensorReportConfig?.fieldOverrides
      ? JSON.parse(JSON.stringify(newConfig.sensorReportConfig.fieldOverrides))
      : {};
  },
  { deep: true },
);
</script>
