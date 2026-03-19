// TypeScript interfaces for EPCIS Profile Builder

export interface FieldOption {
  label: string;
  value: string;
}

// Field type discriminator
// - enum: Select from predefined values (bizStep, disposition, etc.)
// - epcList: Array of EPC identifiers (epcList, childEPCs, etc.)
// - singleEpc: Single EPC identifier string (parentID) - NOT an array
// - quantityList: Array of quantityElement objects with epcClass, quantity, uom (quantityList, childQuantityList, etc.)
// - datetime: ISO 8601 date-time fields (eventTime, recordTime)
// - location: Location object with id property (readPoint, bizLocation)
// - sensorElement: Sensor element list (How dimension)
// - uriArray: Array of URI strings (correctiveEventIDs)
// - uri: Single URI string (eventID)
// - timezone: Timezone offset pattern (eventTimeZoneOffset)
// - enumWithCustom is now used for errorDeclaration.reason (previously enumOrUri)
// - bizTransactionList: Array of business transactions with type and bizTransaction properties
// - sourceDestList: Array of source/destination entries with type and source/destination properties
// - persistentDisposition: Object with set and unset disposition arrays
// - certificationInfo: Certification information object (EPCIS)
// - enumWithCustom: Enum with optional custom URI pattern support (bizStep, disposition)
// - extension: User extensions or ILMD with namespace and element definitions
export type FieldType =
  | "enum"
  | "epcList"
  | "singleEpc"
  | "quantityList"
  | "datetime"
  | "location"
  | "sensorElement"
  | "uriArray"
  | "uri"
  | "timezone"
  | "bizTransactionList"
  | "sourceDestList"
  | "persistentDisposition"
  | "certificationInfo"
  | "enumWithCustom"
  | "extension"
  | "contextList"
  | "stringConstraint";

// EPCIS Dimension categories (GS1 Standard)
// "generic" is for fields common to all events (type, action, eventID)
// "other" is for extensions, ILMD, and other custom fields
// "error" is for error declaration fields
export type EpcisDimension =
  | "document"
  | "generic"
  | "what"
  | "when"
  | "why"
  | "where"
  | "how"
  | "other"
  | "error";

// EPC Identifier type definition
export interface EpcIdentifierType {
  id: string;
  label: string;
  description: string;
  category: "epc-uri" | "gs1-dl";
  pattern: string; // Regex pattern for validation
}

// Configuration for epcList fields (arrays of EPCs)
export interface EpcListFieldConfig {
  mode: "standard" | "uri" | "custom"; // standard = predefined identifiers, uri = any URI, custom = regex
  selectedIdentifiers: string[]; // Array of identifier IDs (for standard mode)
  customPattern?: string; // Custom regex pattern (for custom mode)
  // Array count constraints
  minItems?: number; // Minimum number of items in the array
  maxItems?: number; // Maximum number of items in the array
}

// Configuration for single EPC fields (parentID - NOT an array)
export interface SingleEpcFieldConfig {
  mode: "standard" | "uri" | "custom"; // standard = predefined identifiers, uri = any URI, custom = regex
  selectedIdentifiers: string[]; // Array of identifier IDs (for standard mode)
  customPattern?: string; // Custom regex pattern (for custom mode)
}

// Configuration for location fields (readPoint, bizLocation)
export interface LocationConfig {
  mode: "sgln" | "manual";
  // For SGLN mode - multi-select (can select both URN and DL)
  selectedIdentifiers: string[]; // ["sgln", "sgln-dl"]
  // For Manual URI mode - single pattern
  manualUriPattern?: string; // Single custom regex pattern
}

// Configuration for enum fields with custom URI support (bizStep, disposition)
export interface EnumOrCustomConfig {
  mode: "standard" | "custom";
  // Standard mode - multi-select CBV values
  selectedValues: string[];
  // Custom mode - user-defined regex pattern
  customUriPattern?: string;
}

// Configuration for bizTransactionList fields
export interface BizTransactionListConfig {
  // Type configuration (bizTransaction type like "po", "inv", etc.)
  typeMode: "standard" | "custom";
  selectedTypes: string[]; // For standard mode - selected CBV types
  customTypePattern?: string; // For custom mode - regex pattern for type

  // Value configuration (bizTransaction URI value)
  valueMode: "uri" | "custom";
  customValuePattern?: string; // For custom mode - regex pattern for value (default is any URI)

  // Array count constraints
  minItems?: number; // Minimum number of items in the array
  maxItems?: number; // Maximum number of items in the array
}

// Configuration for sourceList/destinationList fields
export interface SourceDestListConfig {
  // Type configuration (source/destination type like "owning_party", "possessing_party", "location")
  typeMode: "standard" | "custom";
  selectedTypes: string[]; // For standard mode - selected CBV types
  customTypePattern?: string; // For custom mode - regex pattern for type

  // Value configuration (source/destination URI value)
  valueMode: "uri" | "custom";
  customValuePattern?: string; // For custom mode - regex pattern for value (default is any URI)

  // Array count constraints
  minItems?: number; // Minimum number of items in the array
  maxItems?: number; // Maximum number of items in the array
}

// Configuration for persistentDisposition fields
export interface PersistentDispositionConfig {
  // Set array configuration (dispositions to add)
  setMode: "standard" | "custom";
  setSelectedValues: string[]; // Standard mode - CBV disposition values
  setCustomPattern?: string; // Custom mode - regex pattern
  setMinItems?: number; // Minimum items in set array
  setMaxItems?: number; // Maximum items in set array

  // Unset array configuration (dispositions to remove)
  unsetMode: "standard" | "custom";
  unsetSelectedValues: string[]; // Standard mode - CBV disposition values
  unsetCustomPattern?: string; // Custom mode - regex pattern
  unsetMinItems?: number; // Minimum items in unset array
  unsetMaxItems?: number; // Maximum items in unset array
}

// Configuration for URI fields (eventID, etc.)
export interface UriFieldConfig {
  mode: "standard" | "custom";
  // For standard mode - select which standard URI types are allowed
  selectedStandardTypes?: ("uuid" | "event-hash")[];
  // For custom mode - select validation approach
  customMode?: "uri" | "url" | "urn" | "pattern";
  customPattern?: string; // Only used when customMode is "pattern"
}

// Configuration for URI array fields (correctiveEventIDs, etc.)
export interface UriArrayConfig {
  mode: "uri" | "custom";
  customPattern?: string; // Custom regex pattern for array items
  // Array count constraints
  minItems?: number; // Minimum number of items in the array
  maxItems?: number; // Maximum number of items in the array
}

// Configuration for quantityList fields (quantityList, childQuantityList, etc.)
export interface QuantityListConfig {
  // epcClass configuration - which identifier types are allowed
  // Class-level identifiers use urn:epc:class: or urn:epc:idpat: prefixes (no serial numbers)
  epcClassMode: "standard" | "uri" | "custom"; // standard = class-level identifiers, uri = any URI, custom = regex
  selectedIdentifiers: string[]; // Array of class-level identifier IDs (lgtin, gtin-no-serial, etc.)
  epcClassCustomPattern?: string; // Custom regex pattern (for custom mode)

  // quantity configuration
  quantityRequired: boolean; // Is quantity field required?
  quantityMin?: number; // Optional minimum value
  quantityMax?: number; // Optional maximum value

  // uom (unit of measure) configuration
  uomRequired: boolean; // Is uom field required?
  uomMode: "any" | "standard" | "custom"; // Validation mode
  uomSelectedValues?: string[]; // For standard mode - selected UN/CEFACT codes
  uomCustomPattern?: string; // For custom mode - regex pattern

  // Array count constraints (for the quantityList array itself)
  arrayMinItems?: number; // Minimum number of quantity elements in the array
  arrayMaxItems?: number; // Maximum number of quantity elements in the array
}

// Per-field override for sensor metadata and report fields
// Supports required toggle, validation modes for each field type
export interface SensorFieldOverride {
  required?: boolean; // Whether this field is required in the schema
  // For URI fields
  validationMode?: "uri" | "pattern"; // "uri" = any valid URI (format: uri), "pattern" = custom regex
  pattern?: string; // Custom regex pattern (only when validationMode is "pattern")
  // For dateTime fields
  dateTimeConstraint?: "any" | "pattern"; // "any" = format: date-time, "pattern" = custom regex
  dateTimePattern?: string; // Custom regex for dateTime (only when dateTimeConstraint is "pattern")
  // For decimal fields (value, minValue, maxValue, etc.)
  decimalMin?: number; // Minimum allowed value (JSON Schema "minimum")
  decimalMax?: number; // Maximum allowed value (JSON Schema "maximum")
  // For string fields (stringValue, uom, hexBinary, etc.)
  stringPattern?: string; // Custom regex pattern for string validation
  // For measurementType - mode selector
  measurementTypeMode?: "any" | "standard" | "custom";
  selectedMeasurementTypes?: string[]; // For standard mode
  customMeasurementTypePattern?: string; // For custom mode
  // For component - mode selector
  componentMode?: "any" | "standard" | "custom";
  selectedComponents?: string[]; // For standard mode
  customComponentPattern?: string; // For custom mode
  // For sensorAlertType (exception)
  selectedExceptions?: string[]; // ALARM_CONDITION, ERROR_CONDITION (empty = any string)
}

// Configuration for sensorMetadata within sensorElementList
// Based on EPCIS JSON Schema: sensorMetadata object
// Fields: time, deviceID, deviceMetadata, rawData, startTime, endTime, dataProcessingMethod, bizRules
export interface SensorMetadataConfig {
  enabled: boolean; // Whether to include sensorMetadata in schema
  isRequired: boolean; // Whether sensorMetadata is required within each sensor element
  includeTime: boolean; // time (dateTimeStamp)
  includeDeviceID: boolean; // deviceID (URI)
  includeDeviceMetadata: boolean; // deviceMetadata (URI)
  includeRawData: boolean; // rawData (URI)
  includeStartTime: boolean; // startTime (dateTimeStamp)
  includeEndTime: boolean; // endTime (dateTimeStamp)
  includeDataProcessingMethod: boolean; // dataProcessingMethod (URI)
  includeBizRules: boolean; // bizRules (URI)
  // Per-field overrides (required, validation) keyed by EPCIS field name
  fieldOverrides?: Record<string, SensorFieldOverride>;
}

// Configuration for sensorReport within sensorElementList
// Based on EPCIS JSON Schema: sensorReport object
// Same flat approach as SensorMetadataConfig - each field has enable boolean + overrides
// Fields listed in EPCIS JSON Schema order:
//   type(measurementType), exception(sensorAlertType), deviceID(uri), deviceMetadata(uri),
//   rawData(uri), dataProcessingMethod(uri), bizRules(uri), time(time),
//   microorganism(uri), chemicalSubstance(uri), coordinateReferenceSystem(uri),
//   value(decimal), component(component), stringValue(string), booleanValue(boolean),
//   hexBinaryValue(hexBinary), uriValue(uri), minValue(decimal), maxValue(decimal),
//   meanValue(decimal), sDev(decimal), percRank(decimal), percValue(decimal), uom(string)
export interface SensorReportConfig {
  // Each field: includeXxx boolean to toggle inclusion in schema
  includeType: boolean;
  includeException: boolean;
  includeDeviceID: boolean;
  includeDeviceMetadata: boolean;
  includeRawData: boolean;
  includeDataProcessingMethod: boolean;
  includeBizRules: boolean;
  includeTime: boolean;
  includeMicroorganism: boolean;
  includeChemicalSubstance: boolean;
  includeCoordinateReferenceSystem: boolean;
  includeValue: boolean;
  includeComponent: boolean;
  includeStringValue: boolean;
  includeBooleanValue: boolean;
  includeHexBinaryValue: boolean;
  includeUriValue: boolean;
  includeMinValue: boolean;
  includeMaxValue: boolean;
  includeMeanValue: boolean;
  includeSDev: boolean;
  includePercRank: boolean;
  includePercValue: boolean;
  includeUom: boolean;

  // Per-field overrides: required, validation modes, patterns, decimal ranges
  // Keyed by EPCIS field name (type, exception, deviceID, value, uom, etc.)
  fieldOverrides?: Record<string, SensorFieldOverride>;

  // Sensor report array constraints
  minItems?: number;
  maxItems?: number;
}

// Configuration for sensorElementList fields
export interface SensorElementConfig {
  // Array count constraints for the sensorElementList array
  minItems?: number; // Minimum number of sensor elements
  maxItems?: number; // Maximum number of sensor elements

  // Detailed sensor metadata configuration
  sensorMetadataConfig?: SensorMetadataConfig;

  // Detailed sensor report configuration
  sensorReportConfig?: SensorReportConfig;
}

// ============================================================================
// Extension Configuration (User Extensions and ILMD)
// ============================================================================

// Extension element value types
export type ExtensionValueType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object";

// Namespace definition for extensions
export interface ExtensionNamespace {
  id: string; // Unique identifier (auto-generated)
  prefix: string; // Namespace prefix (e.g., "ext1", "cbvmda")
  uri: string; // Namespace URI (e.g., "http://example.com/ext1/")
}

// Element definition within a namespace
export interface ExtensionElement {
  id: string; // Unique identifier (auto-generated)
  namespaceId: string; // Reference to parent namespace
  localName: string; // Element local name (without prefix)
  valueType: ExtensionValueType;
  isRequired: boolean;
  description?: string;

  // For "array" type
  arrayItemType?: ExtensionValueType;
  arrayMinItems?: number;
  arrayMaxItems?: number;
  // For arrays of objects - define the object structure
  arrayItemElements?: ExtensionElement[];

  // For "object" type - nested elements
  nestedElements?: ExtensionElement[];

  // For "string" type - optional pattern validation
  stringPattern?: string;

  // For "number" type - optional range validation
  numberMin?: number;
  numberMax?: number;
}

// Configuration mode for extensions
export type ExtensionMode = "specific";

// Main extension configuration
export interface ExtensionConfig {
  mode: ExtensionMode;

  // Namespace definitions
  namespaces: ExtensionNamespace[];

  // Element definitions
  elements: ExtensionElement[];

  // Whether this is for ILMD (wrapped in ilmd object) vs direct user extensions
  isIlmd?: boolean;
}

// Configuration for @context field (document-level)
export interface ContextListConfig {
  requiredContexts: string[]; // URIs that must be present in the context array
  allowAdditional: boolean; // Whether extra context entries are allowed
  minItems?: number;
  maxItems?: number;
}

// Configuration for string constraint fields (schemaVersion, instanceIdentifier, sender, receiver)
export interface StringConstraintConfig {
  mode: "exact" | "enum" | "pattern" | "uri";
  exactValue?: string; // For exact mode → generates { "const": "2.0" }
  enumValues?: string[]; // For enum mode → generates { "enum": ["2.0", "2.1"] }
  pattern?: string; // For pattern mode → generates { "pattern": "^2\\." }
}

export interface ProfileFieldConfig {
  id: string;
  label: string;
  description: string;
  schemaKey: string; // Key in JSON Schema (e.g., "type", "action", "bizStep")
  dimension: EpcisDimension; // EPCIS dimension category (what, when, why, where, how)
  fieldType?: FieldType; // Field type discriminator (defaults to 'enum')
  options: FieldOption[];
  selectedValues: string[];
  isRequired: boolean;
  // For epcList fields (arrays)
  epcConfig?: EpcListFieldConfig;
  // For singleEpc fields (single identifier like parentID)
  singleEpcConfig?: SingleEpcFieldConfig;
  // For location fields (readPoint, bizLocation)
  locationConfig?: LocationConfig;
  // For enumWithCustom fields (bizStep, disposition)
  enumConfig?: EnumOrCustomConfig;
  // For bizTransactionList fields
  bizTransactionConfig?: BizTransactionListConfig;
  // For sourceDestList fields (sourceList, destinationList)
  sourceDestListConfig?: SourceDestListConfig;
  // For persistentDisposition fields
  persistentDispositionConfig?: PersistentDispositionConfig;
  // For URI fields (eventID, etc.)
  uriConfig?: UriFieldConfig;
  // For URI array fields (correctiveEventIDs, etc.)
  uriArrayConfig?: UriArrayConfig;
  // For quantityList fields (quantityList, childQuantityList, etc.)
  quantityListConfig?: QuantityListConfig;
  // For sensorElement fields (sensorElementList)
  sensorElementConfig?: SensorElementConfig;
  // For extension fields (userExtensions, ilmd)
  extensionConfig?: ExtensionConfig;
  // For contextList fields (@context)
  contextListConfig?: ContextListConfig;
  // For stringConstraint fields (schemaVersion, instanceIdentifier, sender, receiver)
  stringConstraintConfig?: StringConstraintConfig;
}

// Generated JSON Schema structure
export interface GeneratedJsonSchema {
  $schema: string;
  $defs?: Record<string, unknown>;
  allOf: Array<{
    $ref?: string;
    type?: string;
    properties?: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  }>;
}

// Profile Export/Import structure
export interface ProfileExport {
  version: string; // Format version for future compatibility
  exportedAt: string; // ISO 8601 timestamp
  profileName?: string; // Optional profile name
  configuredFields: ProfileFieldConfig[]; // All user-configured fields
  importedSchemas?: Array<{
    // Legacy field - kept for backwards compatibility
    id: string;
    name: string;
    filename: string;
    url: string;
    content: Record<string, unknown>;
    mergeMode: "ref" | "inline";
    isRequired: boolean;
  }>;
}
