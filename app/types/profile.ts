// TypeScript interfaces for EPCIS Profile Builder

export interface FieldOption {
  label: string;
  value: string;
}

// Field type discriminator
export type FieldType = "enum" | "epcList";

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
  allOf: Array<{
    $ref?: string;
    type?: string;
    properties?: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  }>;
}
