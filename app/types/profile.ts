// TypeScript interfaces for EPCIS Profile Builder

export interface FieldOption {
  label: string;
  value: string;
}

// Field type discriminator
// - enum: Select from predefined values (bizStep, disposition, etc.)
// - epcList: Array of EPC identifiers (epcList, childEPCs, etc.)
// - datetime: ISO 8601 date-time fields (eventTime, recordTime)
// - location: Location object with id property (readPoint, bizLocation)
// - sensorElement: Sensor element list (How dimension)
// - uriArray: Array of URI strings (correctiveEventIDs)
// - uri: Single URI string (eventID)
// - timezone: Timezone offset pattern (eventTimeZoneOffset)
// - enumOrUri: Allows either predefined enum values OR a custom URI (errorDeclaration.reason)
// - bizTransactionList: Array of business transactions with type and bizTransaction properties
// - sourceDestList: Array of source/destination entries with type and source/destination properties
// - persistentDisposition: Object with set and unset disposition arrays
// - certificationInfo: Certification information object (EPCIS 2.0)
export type FieldType = "enum" | "epcList" | "datetime" | "location" | "sensorElement" | "uriArray" | "uri" | "timezone" | "enumOrUri" | "bizTransactionList" | "sourceDestList" | "persistentDisposition" | "certificationInfo";

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

// Configuration for epcList fields
export interface EpcListFieldConfig {
  selectedIdentifiers: string[]; // Array of identifier IDs
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
  // For epcList fields
  epcConfig?: EpcListFieldConfig;
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
