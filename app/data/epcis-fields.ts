import type { ProfileFieldConfig } from "~/types/profile";

/**
 * EPCIS Field Definitions
 * Based on GS1 EPCIS 2.0 JSON Schema: https://ref.gs1.org/standards/epcis/epcis-json-schema.json
 * Fields are organized by EPCIS dimensions following the GS1 standard.
 */

// ============================================================================
// GENERIC FIELDS - Common to all EPCIS event types
// ============================================================================

// Event Type field - determines which event structure to use
export const eventTypeField: ProfileFieldConfig = {
  id: "eventType",
  label: "Event Type",
  description: "EPCIS event type that determines the event structure and required fields",
  schemaKey: "type",
  dimension: "generic",
  options: [
    { label: "Object Event", value: "ObjectEvent" },
    { label: "Aggregation Event", value: "AggregationEvent" },
    { label: "Transaction Event", value: "TransactionEvent" },
    { label: "Transformation Event", value: "TransformationEvent" },
    { label: "Association Event", value: "AssociationEvent" },
  ],
  selectedValues: [],
  isRequired: true,
};

// Action field - common to ObjectEvent, AggregationEvent, TransactionEvent, AssociationEvent
export const actionField: ProfileFieldConfig = {
  id: "action",
  label: "Action",
  description: "The action associated with the event (ADD, OBSERVE, DELETE)",
  schemaKey: "action",
  dimension: "generic",
  options: [
    { label: "ADD", value: "ADD" },
    { label: "OBSERVE", value: "OBSERVE" },
    { label: "DELETE", value: "DELETE" },
  ],
  selectedValues: [],
  isRequired: true,
};

// Event ID field - unique identifier for the event
export const eventIdField: ProfileFieldConfig = {
  id: "eventID",
  label: "Event ID",
  description:
    "Unique identifier for this event. Must be a valid URI (e.g., urn:uuid:... or ni:///sha-256;...).",
  schemaKey: "eventID",
  dimension: "generic",
  fieldType: "uri",
  options: [],
  selectedValues: [],
  isRequired: false,
  uriConfig: {
    mode: "uri",
  },
};

// Certification Info field - EPCIS 2.0 certification data
export const certificationInfoField: ProfileFieldConfig = {
  id: "certificationInfo",
  label: "Certification Info",
  description:
    "EPCIS 2.0 certification information. Contains certification standard, agency, value, and identification details for product certifications.",
  schemaKey: "certificationInfo",
  dimension: "other",
  fieldType: "certificationInfo",
  options: [],
  selectedValues: [],
  isRequired: false,
};

// Event Time Zone Offset field - timezone offset for the event (When dimension)
export const eventTimeZoneOffsetField: ProfileFieldConfig = {
  id: "eventTimeZoneOffset",
  label: "Event Time Zone Offset",
  description:
    "Timezone offset for the event time in signed format (e.g., +05:30, -08:00, +00:00).",
  schemaKey: "eventTimeZoneOffset",
  dimension: "when",
  fieldType: "timezone",
  options: [],
  selectedValues: [],
  isRequired: true,
};

// ============================================================================
// WHAT DIMENSION FIELDS - Identifies objects/entities involved
// These fields vary by event type but are grouped under "What" dimension
// ============================================================================

// EPC List field - used in ObjectEvent, TransactionEvent
export const epcListField: ProfileFieldConfig = {
  id: "epcList",
  label: "EPC List",
  description:
    "List of EPC identifiers (ObjectEvent, TransactionEvent). Configure allowed EPC formats like SGTIN, SSCC, GDTI.",
  schemaKey: "epcList",
  dimension: "what",
  fieldType: "epcList",
  options: [],
  selectedValues: [],
  isRequired: false,
  epcConfig: {
    mode: "standard",
    selectedIdentifiers: [],
  },
};

// Quantity List field - used in ObjectEvent, TransactionEvent
export const quantityListField: ProfileFieldConfig = {
  id: "quantityList",
  label: "Quantity List",
  description:
    "List of quantity elements with epcClass, quantity, and uom (ObjectEvent, TransactionEvent)",
  schemaKey: "quantityList",
  dimension: "what",
  fieldType: "quantityList",
  options: [],
  selectedValues: [],
  isRequired: false,
  quantityListConfig: {
    epcClassMode: "standard",
    selectedIdentifiers: [],
    quantityRequired: false,
    uomRequired: false,
    uomMode: "any",
  },
};

// Parent ID field - used in AggregationEvent, TransactionEvent, AssociationEvent
// Note: parentID is a SINGLE URI string, NOT an array (unlike epcList, childEPCs, etc.)
export const parentIdField: ProfileFieldConfig = {
  id: "parentID",
  label: "Parent ID",
  description:
    "Parent identifier for container/parent object (AggregationEvent, TransactionEvent, AssociationEvent). This is a single URI, typically an SSCC.",
  schemaKey: "parentID",
  dimension: "what",
  fieldType: "singleEpc",
  options: [],
  selectedValues: [],
  isRequired: false,
  singleEpcConfig: {
    mode: "standard",
    selectedIdentifiers: [],
  },
};

// Child EPCs field - used in AggregationEvent, AssociationEvent
export const childEpcsField: ProfileFieldConfig = {
  id: "childEPCs",
  label: "Child EPCs",
  description:
    "List of child EPC identifiers contained in the parent (AggregationEvent, AssociationEvent)",
  schemaKey: "childEPCs",
  dimension: "what",
  fieldType: "epcList",
  options: [],
  selectedValues: [],
  isRequired: false,
  epcConfig: {
    mode: "standard",
    selectedIdentifiers: [],
  },
};

// Child Quantity List field - used in AggregationEvent, AssociationEvent
export const childQuantityListField: ProfileFieldConfig = {
  id: "childQuantityList",
  label: "Child Quantity List",
  description:
    "List of child quantity elements with epcClass, quantity, and uom (AggregationEvent, AssociationEvent)",
  schemaKey: "childQuantityList",
  dimension: "what",
  fieldType: "quantityList",
  options: [],
  selectedValues: [],
  isRequired: false,
  quantityListConfig: {
    epcClassMode: "standard",
    selectedIdentifiers: [],
    quantityRequired: false,
    uomRequired: false,
    uomMode: "any",
  },
};

// Input EPC List field - used in TransformationEvent
export const inputEpcListField: ProfileFieldConfig = {
  id: "inputEPCList",
  label: "Input EPC List",
  description:
    "List of input EPCs consumed in the transformation (TransformationEvent)",
  schemaKey: "inputEPCList",
  dimension: "what",
  fieldType: "epcList",
  options: [],
  selectedValues: [],
  isRequired: false,
  epcConfig: {
    mode: "standard",
    selectedIdentifiers: [],
  },
};

// Input Quantity List field - used in TransformationEvent
export const inputQuantityListField: ProfileFieldConfig = {
  id: "inputQuantityList",
  label: "Input Quantity List",
  description:
    "List of input quantity elements consumed in the transformation (TransformationEvent)",
  schemaKey: "inputQuantityList",
  dimension: "what",
  fieldType: "quantityList",
  options: [],
  selectedValues: [],
  isRequired: false,
  quantityListConfig: {
    epcClassMode: "standard",
    selectedIdentifiers: [],
    quantityRequired: false,
    uomRequired: false,
    uomMode: "any",
  },
};

// Output EPC List field - used in TransformationEvent
export const outputEpcListField: ProfileFieldConfig = {
  id: "outputEPCList",
  label: "Output EPC List",
  description:
    "List of output EPCs produced by the transformation (TransformationEvent)",
  schemaKey: "outputEPCList",
  dimension: "what",
  fieldType: "epcList",
  options: [],
  selectedValues: [],
  isRequired: false,
  epcConfig: {
    mode: "standard",
    selectedIdentifiers: [],
  },
};

// Output Quantity List field - used in TransformationEvent
export const outputQuantityListField: ProfileFieldConfig = {
  id: "outputQuantityList",
  label: "Output Quantity List",
  description:
    "List of output quantity elements produced by the transformation (TransformationEvent)",
  schemaKey: "outputQuantityList",
  dimension: "what",
  fieldType: "quantityList",
  options: [],
  selectedValues: [],
  isRequired: false,
  quantityListConfig: {
    epcClassMode: "standard",
    selectedIdentifiers: [],
    quantityRequired: false,
    uomRequired: false,
    uomMode: "any",
  },
};

// Transformation ID field - used in TransformationEvent to link related transformations
export const transformationIdField: ProfileFieldConfig = {
  id: "transformationID",
  label: "Transformation ID",
  description:
    "Unique identifier that links multiple TransformationEvents that belong to the same transformation process. Must be a valid URI.",
  schemaKey: "transformationID",
  dimension: "other",
  fieldType: "uri",
  options: [],
  selectedValues: [],
  isRequired: false,
};

// ============================================================================
// WHEN DIMENSION FIELDS - Temporal information
// ============================================================================

// Event Time field - Required by EPCIS standard
export const eventTimeField: ProfileFieldConfig = {
  id: "eventTime",
  label: "Event Time",
  description:
    "The date and time at which the event occurred (ISO 8601 date-time format). Required field.",
  schemaKey: "eventTime",
  dimension: "when",
  fieldType: "datetime",
  options: [],
  selectedValues: [],
  isRequired: true,
};

// Record Time field - Optional
export const recordTimeField: ProfileFieldConfig = {
  id: "recordTime",
  label: "Record Time",
  description:
    "The date and time at which the event was recorded by the capturing application (ISO 8601 date-time format)",
  schemaKey: "recordTime",
  dimension: "when",
  fieldType: "datetime",
  options: [],
  selectedValues: [],
  isRequired: false,
};

// ============================================================================
// WHERE DIMENSION FIELDS - Location information
// ============================================================================

// Read Point field - where the event physically occurred
export const readPointField: ProfileFieldConfig = {
  id: "readPoint",
  label: "Read Point",
  description:
    "The physical location where the event occurred. Uses SGLN (GS1 AI 414 with optional AI 254 extension) or custom URI format.",
  schemaKey: "readPoint",
  dimension: "where",
  fieldType: "location",
  options: [],
  selectedValues: [],
  isRequired: false,
  locationConfig: {
    mode: "sgln",
    selectedIdentifiers: [],
  },
};

// Business Location field - business context location
export const bizLocationField: ProfileFieldConfig = {
  id: "bizLocation",
  label: "Business Location",
  description:
    "The business location associated with the event. Uses SGLN (GS1 AI 414 with optional AI 254 extension) or custom URI format.",
  schemaKey: "bizLocation",
  dimension: "where",
  fieldType: "location",
  options: [],
  selectedValues: [],
  isRequired: false,
  locationConfig: {
    mode: "sgln",
    selectedIdentifiers: [],
  },
};

// ============================================================================
// WHY DIMENSION FIELDS - Business context and reason
// ============================================================================

// Business Step (bizStep) field - CBV Standard Values or Custom URI
export const bizStepField: ProfileFieldConfig = {
  id: "bizStep",
  label: "Business Step",
  description: "CBV business step or custom URI indicating the stage in the business process",
  schemaKey: "bizStep",
  dimension: "why",
  fieldType: "enumWithCustom",
  options: [
    { label: "Accepting", value: "accepting" },
    { label: "Arriving", value: "arriving" },
    { label: "Assembling", value: "assembling" },
    { label: "Collecting", value: "collecting" },
    { label: "Commissioning", value: "commissioning" },
    { label: "Consigning", value: "consigning" },
    { label: "Creating Class Instance", value: "creating_class_instance" },
    { label: "Cycle Counting", value: "cycle_counting" },
    { label: "Decommissioning", value: "decommissioning" },
    { label: "Departing", value: "departing" },
    { label: "Destroying", value: "destroying" },
    { label: "Disassembling", value: "disassembling" },
    { label: "Dispensing", value: "dispensing" },
    { label: "Encoding", value: "encoding" },
    { label: "Entering Exiting", value: "entering_exiting" },
    { label: "Holding", value: "holding" },
    { label: "Inspecting", value: "inspecting" },
    { label: "Installing", value: "installing" },
    { label: "Killing", value: "killing" },
    { label: "Loading", value: "loading" },
    { label: "Other", value: "other" },
    { label: "Packing", value: "packing" },
    { label: "Picking", value: "picking" },
    { label: "Receiving", value: "receiving" },
    { label: "Removing", value: "removing" },
    { label: "Repackaging", value: "repackaging" },
    { label: "Repairing", value: "repairing" },
    { label: "Replacing", value: "replacing" },
    { label: "Reserving", value: "reserving" },
    { label: "Retail Selling", value: "retail_selling" },
    { label: "Returning", value: "returning" },
    { label: "Sampling", value: "sampling" },
    { label: "Sensor Reporting", value: "sensor_reporting" },
    { label: "Shipping", value: "shipping" },
    { label: "Staging Outbound", value: "staging_outbound" },
    { label: "Stock Taking", value: "stock_taking" },
    { label: "Stocking", value: "stocking" },
    { label: "Storing", value: "storing" },
    { label: "Transporting", value: "transporting" },
    { label: "Unloading", value: "unloading" },
    { label: "Unpacking", value: "unpacking" },
    { label: "Void Shipping", value: "void_shipping" },
  ],
  selectedValues: [],
  isRequired: false,
  enumConfig: {
    mode: "standard",
    selectedValues: [],
  },
};

// Disposition field - CBV Standard Values or Custom URI
export const dispositionField: ProfileFieldConfig = {
  id: "disposition",
  label: "Disposition",
  description: "CBV disposition or custom URI indicating the business state of the objects",
  schemaKey: "disposition",
  dimension: "why",
  fieldType: "enumWithCustom",
  options: [
    { label: "Active", value: "active" },
    { label: "Available", value: "available" },
    { label: "Completeness Inferred", value: "completeness_inferred" },
    { label: "Completeness Verified", value: "completeness_verified" },
    { label: "Conformant", value: "conformant" },
    { label: "Container Closed", value: "container_closed" },
    { label: "Container Open", value: "container_open" },
    { label: "Damaged", value: "damaged" },
    { label: "Destroyed", value: "destroyed" },
    { label: "Dispensed", value: "dispensed" },
    { label: "Disposed", value: "disposed" },
    { label: "Encoded", value: "encoded" },
    { label: "Expired", value: "expired" },
    { label: "In Progress", value: "in_progress" },
    { label: "In Transit", value: "in_transit" },
    { label: "Inactive", value: "inactive" },
    { label: "Mismatch (Class)", value: "mismatch_class" },
    { label: "Mismatch (Instance)", value: "mismatch_instance" },
    { label: "Mismatch (Quantity)", value: "mismatch_quantity" },
    { label: "Needs Replacement", value: "needs_replacement" },
    { label: "No Pedigree Match", value: "no_pedigree_match" },
    { label: "Non-Conformant", value: "non_conformant" },
    { label: "Non-Sellable Other", value: "non_sellable_other" },
    { label: "Partially Dispensed", value: "partially_dispensed" },
    { label: "Recalled", value: "recalled" },
    { label: "Reserved", value: "reserved" },
    { label: "Retail Sold", value: "retail_sold" },
    { label: "Returned", value: "returned" },
    { label: "Sellable Accessible", value: "sellable_accessible" },
    { label: "Sellable Not Accessible", value: "sellable_not_accessible" },
    { label: "Stolen", value: "stolen" },
    { label: "Unavailable", value: "unavailable" },
    { label: "Unknown", value: "unknown" },
  ],
  selectedValues: [],
  isRequired: false,
  enumConfig: {
    mode: "standard",
    selectedValues: [],
  },
};

// Business Transaction List field - CBV Business Transaction Types
export const bizTransactionListField: ProfileFieldConfig = {
  id: "bizTransactionList",
  label: "Business Transaction List",
  description:
    "List of business transactions associated with the event. Each transaction has a type (e.g., purchase order, invoice) and a transaction identifier URI.",
  schemaKey: "bizTransactionList",
  dimension: "why",
  fieldType: "bizTransactionList",
  options: [
    { label: "Bill of Lading", value: "bol" },
    { label: "Certificate", value: "cert" },
    { label: "Despatch Advice", value: "desadv" },
    { label: "Invoice", value: "inv" },
    { label: "Pedigree", value: "pedigree" },
    { label: "Purchase Order", value: "po" },
    { label: "Purchase Order Confirmation", value: "poc" },
    { label: "Production Order", value: "prodorder" },
    { label: "Receiving Advice", value: "recadv" },
    { label: "Return Merchandise Authorization", value: "rma" },
    { label: "Test Procedure", value: "testprd" },
    { label: "Test Results", value: "testres" },
    { label: "Upstream EPCIS Event", value: "upevt" },
  ],
  selectedValues: [],
  isRequired: false,
  bizTransactionConfig: {
    typeMode: "standard",
    selectedTypes: [],
    valueMode: "uri",
  },
};

// Source List field - CBV Source/Destination Types
export const sourceListField: ProfileFieldConfig = {
  id: "sourceList",
  label: "Source List",
  description:
    "List of sources indicating where objects came from. Each entry has a type (owning_party, possessing_party, or location) and a source identifier URI.",
  schemaKey: "sourceList",
  dimension: "why",
  fieldType: "sourceDestList",
  options: [
    { label: "Owning Party", value: "owning_party" },
    { label: "Possessing Party", value: "possessing_party" },
    { label: "Location", value: "location" },
  ],
  selectedValues: [],
  isRequired: false,
  sourceDestListConfig: {
    typeMode: "standard",
    selectedTypes: [],
    valueMode: "uri",
  },
};

// Destination List field - CBV Source/Destination Types
export const destinationListField: ProfileFieldConfig = {
  id: "destinationList",
  label: "Destination List",
  description:
    "List of destinations indicating where objects are going. Each entry has a type (owning_party, possessing_party, or location) and a destination identifier URI.",
  schemaKey: "destinationList",
  dimension: "why",
  fieldType: "sourceDestList",
  options: [
    { label: "Owning Party", value: "owning_party" },
    { label: "Possessing Party", value: "possessing_party" },
    { label: "Location", value: "location" },
  ],
  selectedValues: [],
  isRequired: false,
  sourceDestListConfig: {
    typeMode: "standard",
    selectedTypes: [],
    valueMode: "uri",
  },
};

// Persistent Disposition field - EPCIS 2.0 feature
export const persistentDispositionField: ProfileFieldConfig = {
  id: "persistentDisposition",
  label: "Persistent Disposition",
  description:
    "Persistent disposition state changes. Contains 'set' (dispositions to add) and 'unset' (dispositions to remove) arrays. Uses same CBV disposition values or custom URIs.",
  schemaKey: "persistentDisposition",
  dimension: "why",
  fieldType: "persistentDisposition",
  options: [
    { label: "Active", value: "active" },
    { label: "Available", value: "available" },
    { label: "Completeness Inferred", value: "completeness_inferred" },
    { label: "Completeness Verified", value: "completeness_verified" },
    { label: "Conformant", value: "conformant" },
    { label: "Container Closed", value: "container_closed" },
    { label: "Container Open", value: "container_open" },
    { label: "Damaged", value: "damaged" },
    { label: "Destroyed", value: "destroyed" },
    { label: "Dispensed", value: "dispensed" },
    { label: "Disposed", value: "disposed" },
    { label: "Encoded", value: "encoded" },
    { label: "Expired", value: "expired" },
    { label: "In Progress", value: "in_progress" },
    { label: "In Transit", value: "in_transit" },
    { label: "Inactive", value: "inactive" },
    { label: "Mismatch (Class)", value: "mismatch_class" },
    { label: "Mismatch (Instance)", value: "mismatch_instance" },
    { label: "Mismatch (Quantity)", value: "mismatch_quantity" },
    { label: "Needs Replacement", value: "needs_replacement" },
    { label: "No Pedigree Match", value: "no_pedigree_match" },
    { label: "Non-Conformant", value: "non_conformant" },
    { label: "Non-Sellable Other", value: "non_sellable_other" },
    { label: "Partially Dispensed", value: "partially_dispensed" },
    { label: "Recalled", value: "recalled" },
    { label: "Reserved", value: "reserved" },
    { label: "Retail Sold", value: "retail_sold" },
    { label: "Returned", value: "returned" },
    { label: "Sellable Accessible", value: "sellable_accessible" },
    { label: "Sellable Not Accessible", value: "sellable_not_accessible" },
    { label: "Stolen", value: "stolen" },
    { label: "Unavailable", value: "unavailable" },
    { label: "Unknown", value: "unknown" },
  ],
  selectedValues: [],
  isRequired: false,
  persistentDispositionConfig: {
    setMode: "standard",
    setSelectedValues: [],
    unsetMode: "standard",
    unsetSelectedValues: [],
  },
};

// ============================================================================
// HOW DIMENSION FIELDS - Sensor and environmental data (EPCIS 2.0)
// ============================================================================

// Sensor Element List field - for IoT sensor data
export const sensorElementListField: ProfileFieldConfig = {
  id: "sensorElementList",
  label: "Sensor Element List",
  description:
    "EPCIS 2.0 sensor data including metadata and sensor reports (temperature, humidity, etc.)",
  schemaKey: "sensorElementList",
  dimension: "how",
  fieldType: "sensorElement",
  options: [],
  selectedValues: [],
  isRequired: false,
  sensorElementConfig: {
    minItems: undefined,
    maxItems: undefined,
  },
};

// ============================================================================
// OTHER DIMENSION FIELDS - Extensions, ILMD, and other custom fields
// ============================================================================

// User Extensions field - for custom namespace extensions
export const userExtensionsField: ProfileFieldConfig = {
  id: "userExtensions",
  label: "User Extensions",
  description:
    "Custom user-defined extension fields with namespace URIs for extending EPCIS events. Properties are added directly to the event using patternProperties.",
  schemaKey: "userExtensions",
  dimension: "other",
  fieldType: "extension",
  options: [],
  selectedValues: [],
  isRequired: false,
  extensionConfig: {
    mode: "pattern",
    namespaces: [],
    elements: [],
    isIlmd: false,
  },
};

// ILMD field - Instance/Lot Master Data
export const ilmdField: ProfileFieldConfig = {
  id: "ilmd",
  label: "ILMD",
  description:
    "Instance/Lot Master Data - additional data about specific object instances or lots at the time of event capture. Properties are wrapped in the ilmd object.",
  schemaKey: "ilmd",
  dimension: "other",
  fieldType: "extension",
  options: [],
  selectedValues: [],
  isRequired: false,
  extensionConfig: {
    mode: "pattern",
    namespaces: [],
    elements: [],
    isIlmd: true,
  },
};

// ============================================================================
// ERROR DIMENSION FIELDS - Error declaration for correcting events
// ============================================================================

// Declaration Time field - when the error was declared (required)
export const declarationTimeField: ProfileFieldConfig = {
  id: "declarationTime",
  label: "Declaration Time",
  description:
    "The date and time when the error was declared (ISO 8601 date-time format). Required for error declarations.",
  schemaKey: "errorDeclaration.declarationTime",
  dimension: "error",
  fieldType: "datetime",
  options: [],
  selectedValues: [],
  isRequired: true,
};

// Reason field - why the event was erroneous (CBV values or custom URI)
export const reasonField: ProfileFieldConfig = {
  id: "reason",
  label: "Reason",
  description:
    "The reason for the error declaration. CBV values: did_not_occur (event never happened) or incorrect_data (event data was wrong). Or use custom mode for custom URI patterns.",
  schemaKey: "errorDeclaration.reason",
  dimension: "error",
  fieldType: "enumWithCustom",
  options: [
    { label: "Did Not Occur", value: "did_not_occur" },
    { label: "Incorrect Data", value: "incorrect_data" },
  ],
  selectedValues: [],
  isRequired: false,
  enumConfig: {
    mode: "standard",
    selectedValues: [],
  },
};

// Corrective Event IDs field - references to correcting events
export const correctiveEventIDsField: ProfileFieldConfig = {
  id: "correctiveEventIDs",
  label: "Corrective Event IDs",
  description:
    "Array of event IDs that reference events which correct this erroneous event. Use standard URI format or define a custom regex pattern.",
  schemaKey: "errorDeclaration.correctiveEventIDs",
  dimension: "error",
  fieldType: "uriArray",
  options: [],
  selectedValues: [],
  isRequired: false,
  uriArrayConfig: {
    mode: "uri",
  },
};

// Error Extensions field - custom extensions within errorDeclaration
export const errorExtensionsField: ProfileFieldConfig = {
  id: "errorExtensions",
  label: "Error Extensions",
  description:
    "Custom extension properties within the errorDeclaration object. Define namespaces and elements for organization-specific error data.",
  schemaKey: "errorDeclaration",
  dimension: "error",
  fieldType: "extension",
  options: [],
  selectedValues: [],
  isRequired: false,
  extensionConfig: {
    mode: "pattern",
    namespaces: [],
    elements: [],
    isIlmd: false,
  },
};

/**
 * All available EPCIS fields for the Profile Builder
 * Organized by dimension order: Generic, What, When, Where, Why, How, Other, Error
 */
export const allEpcisFields: ProfileFieldConfig[] = [
  // Generic fields
  eventTypeField,
  actionField,
  eventIdField,
  // What dimension fields
  epcListField,
  quantityListField,
  parentIdField,
  childEpcsField,
  childQuantityListField,
  inputEpcListField,
  inputQuantityListField,
  outputEpcListField,
  outputQuantityListField,
  // When dimension fields
  eventTimeField,
  eventTimeZoneOffsetField,
  recordTimeField,
  // Where dimension fields
  readPointField,
  bizLocationField,
  // Why dimension fields
  bizStepField,
  dispositionField,
  bizTransactionListField,
  sourceListField,
  destinationListField,
  persistentDispositionField,
  // How dimension fields
  sensorElementListField,
  // Other dimension fields
  certificationInfoField,
  userExtensionsField,
  ilmdField,
  transformationIdField,
  // Error dimension fields
  declarationTimeField,
  reasonField,
  correctiveEventIDsField,
  errorExtensionsField,
];

/**
 * Get a fresh copy of all fields (to avoid mutation issues)
 */
export const getEpcisFields = (): ProfileFieldConfig[] => {
  return allEpcisFields.map((field) => ({
    ...field,
    options: [...field.options],
    selectedValues: [],
    // Handle epcConfig for epcList fields (with array count reset)
    epcConfig: field.epcConfig
      ? { mode: "standard" as const, selectedIdentifiers: [], minItems: undefined, maxItems: undefined }
      : undefined,
    // Handle singleEpcConfig for singleEpc fields (parentID)
    singleEpcConfig: field.singleEpcConfig
      ? { mode: "standard" as const, selectedIdentifiers: [] }
      : undefined,
    // Handle locationConfig for location fields (readPoint, bizLocation)
    locationConfig: field.locationConfig
      ? { mode: "sgln" as const, selectedIdentifiers: [] }
      : undefined,
    // Handle enumConfig for enumWithCustom fields (bizStep, disposition)
    enumConfig: field.enumConfig
      ? { mode: "standard" as const, selectedValues: [] }
      : undefined,
    // Handle bizTransactionConfig for bizTransactionList fields (with array count reset)
    bizTransactionConfig: field.bizTransactionConfig
      ? { typeMode: "standard" as const, selectedTypes: [], valueMode: "uri" as const, minItems: undefined, maxItems: undefined }
      : undefined,
    // Handle sourceDestListConfig for sourceList/destinationList fields (with array count reset)
    sourceDestListConfig: field.sourceDestListConfig
      ? { typeMode: "standard" as const, selectedTypes: [], valueMode: "uri" as const, minItems: undefined, maxItems: undefined }
      : undefined,
    // Handle persistentDispositionConfig for persistentDisposition fields (with array count reset)
    persistentDispositionConfig: field.persistentDispositionConfig
      ? { setMode: "standard" as const, setSelectedValues: [], unsetMode: "standard" as const, unsetSelectedValues: [], setMinItems: undefined, setMaxItems: undefined, unsetMinItems: undefined, unsetMaxItems: undefined }
      : undefined,
    // Handle uriConfig for URI fields (eventID, etc.)
    uriConfig: field.uriConfig
      ? { mode: "uri" as const }
      : undefined,
    // Handle uriArrayConfig for URI array fields (correctiveEventIDs, etc.) (with array count reset)
    uriArrayConfig: field.uriArrayConfig
      ? { mode: "uri" as const, minItems: undefined, maxItems: undefined }
      : undefined,
    // Handle quantityListConfig for quantityList fields (with array count reset)
    quantityListConfig: field.quantityListConfig
      ? { epcClassMode: "standard" as const, selectedIdentifiers: [], quantityRequired: false, uomRequired: false, uomMode: "any" as const, arrayMinItems: undefined, arrayMaxItems: undefined }
      : undefined,
    // Handle sensorElementConfig for sensorElementList fields
    sensorElementConfig: field.sensorElementConfig
      ? { minItems: undefined, maxItems: undefined }
      : undefined,
    // Handle extensionConfig for extension fields (userExtensions, ilmd)
    extensionConfig: field.extensionConfig
      ? { mode: "pattern" as const, namespaces: [], elements: [], isIlmd: field.extensionConfig.isIlmd }
      : undefined,
  }));
};
