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
// - certificationInfo: Certification information object (EPCIS 2.0)
// - enumWithCustom: Enum with optional custom URI pattern support (bizStep, disposition)
export type FieldType = "enum" | "epcList" | "singleEpc" | "quantityList" | "datetime" | "location" | "sensorElement" | "uriArray" | "uri" | "timezone" | "bizTransactionList" | "sourceDestList" | "persistentDisposition" | "certificationInfo" | "enumWithCustom";

// EPCIS Dimension categories (GS1 Standard)
// "generic" is for fields common to all events (type, action, eventID)
// "other" is for extensions, ILMD, and other custom fields
// "error" is for error declaration fields
export type EpcisDimension = "generic" | "what" | "when" | "why" | "where" | "how" | "other" | "error";

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
  selectedTypes: string[];       // For standard mode - selected CBV types
  customTypePattern?: string;    // For custom mode - regex pattern for type

  // Value configuration (bizTransaction URI value)
  valueMode: "uri" | "custom";
  customValuePattern?: string;   // For custom mode - regex pattern for value (default is any URI)

  // Array count constraints
  minItems?: number; // Minimum number of items in the array
  maxItems?: number; // Maximum number of items in the array
}

// Configuration for sourceList/destinationList fields
export interface SourceDestListConfig {
  // Type configuration (source/destination type like "owning_party", "possessing_party", "location")
  typeMode: "standard" | "custom";
  selectedTypes: string[];       // For standard mode - selected CBV types
  customTypePattern?: string;    // For custom mode - regex pattern for type

  // Value configuration (source/destination URI value)
  valueMode: "uri" | "custom";
  customValuePattern?: string;   // For custom mode - regex pattern for value (default is any URI)

  // Array count constraints
  minItems?: number; // Minimum number of items in the array
  maxItems?: number; // Maximum number of items in the array
}

// Configuration for persistentDisposition fields
export interface PersistentDispositionConfig {
  // Set array configuration (dispositions to add)
  setMode: "standard" | "custom";
  setSelectedValues: string[];       // Standard mode - CBV disposition values
  setCustomPattern?: string;         // Custom mode - regex pattern
  setMinItems?: number;              // Minimum items in set array
  setMaxItems?: number;              // Maximum items in set array

  // Unset array configuration (dispositions to remove)
  unsetMode: "standard" | "custom";
  unsetSelectedValues: string[];     // Standard mode - CBV disposition values
  unsetCustomPattern?: string;       // Custom mode - regex pattern
  unsetMinItems?: number;            // Minimum items in unset array
  unsetMaxItems?: number;            // Maximum items in unset array
}

// Configuration for URI fields (eventID, etc.)
export interface UriFieldConfig {
  mode: "uri" | "custom";
  customPattern?: string;
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
  quantityRequired: boolean;       // Is quantity field required?
  quantityMin?: number;            // Optional minimum value
  quantityMax?: number;            // Optional maximum value

  // uom (unit of measure) configuration
  uomRequired: boolean;            // Is uom field required?
  uomMode: "any" | "standard" | "custom"; // Validation mode
  uomSelectedValues?: string[];    // For standard mode - selected UN/CEFACT codes
  uomCustomPattern?: string;       // For custom mode - regex pattern

  // Array count constraints (for the quantityList array itself)
  arrayMinItems?: number; // Minimum number of quantity elements in the array
  arrayMaxItems?: number; // Maximum number of quantity elements in the array
}

// Configuration for sensorElementList fields
export interface SensorElementConfig {
  // Array count constraints for the sensorElementList array
  minItems?: number; // Minimum number of sensor elements
  maxItems?: number; // Maximum number of sensor elements
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
  version: string;                      // Format version for future compatibility
  exportedAt: string;                   // ISO 8601 timestamp
  profileName?: string;                 // Optional profile name
  configuredFields: ProfileFieldConfig[];  // All user-configured fields
  importedSchemas: Array<{              // GitHub-sourced schemas
    id: string;
    name: string;
    filename: string;
    url: string;
    content: Record<string, unknown>;
    mergeMode: "ref" | "inline";
    isRequired: boolean;
  }>;
}
