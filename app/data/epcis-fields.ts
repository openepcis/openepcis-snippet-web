import type { ProfileFieldConfig } from "~/types/profile";

/**
 * EPCIS Field Definitions
 * Contains all available EPCIS fields that can be configured in the Profile Builder
 */

// Event Type field
export const eventTypeField: ProfileFieldConfig = {
  id: "eventType",
  label: "Event Type",
  description: "EPCIS event type (ObjectEvent, AggregationEvent, etc.)",
  schemaKey: "type",
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

// Action field
export const actionField: ProfileFieldConfig = {
  id: "action",
  label: "Action",
  description: "The action associated with the event (ADD, OBSERVE, DELETE)",
  schemaKey: "action",
  options: [
    { label: "ADD", value: "ADD" },
    { label: "OBSERVE", value: "OBSERVE" },
    { label: "DELETE", value: "DELETE" },
  ],
  selectedValues: [],
  isRequired: true,
};

// Business Step (bizStep) field - CBV Standard Values
export const bizStepField: ProfileFieldConfig = {
  id: "bizStep",
  label: "Business Step",
  description: "CBV business step indicating the stage in the business process",
  schemaKey: "bizStep",
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
};

// Disposition field - CBV Standard Values
export const dispositionField: ProfileFieldConfig = {
  id: "disposition",
  label: "Disposition",
  description: "CBV disposition indicating the business state of the objects",
  schemaKey: "disposition",
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
    { label: "Mismatch", value: "mismatch" },
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
};

// EPC List field - Complex field for EPC identifier validation
export const epcListField: ProfileFieldConfig = {
  id: "epcList",
  label: "EPC List",
  description:
    "Configure allowed EPC identifier types (SGTIN, SSCC, GDTI, etc.) for the event",
  schemaKey: "epcList",
  fieldType: "epcList",
  options: [], // Not used for epcList fields
  selectedValues: [], // Not used for epcList fields
  isRequired: false,
  epcConfig: {
    selectedIdentifiers: [],
  },
};

/**
 * All available EPCIS fields for the Profile Builder
 * Add new fields here to make them available in the builder
 */
export const allEpcisFields: ProfileFieldConfig[] = [
  eventTypeField,
  actionField,
  bizStepField,
  dispositionField,
  epcListField,
];

/**
 * Get a fresh copy of all fields (to avoid mutation issues)
 */
export const getEpcisFields = (): ProfileFieldConfig[] => {
  return allEpcisFields.map((field) => ({
    ...field,
    options: [...field.options],
    selectedValues: [],
    // Handle epcConfig for epcList fields
    epcConfig: field.epcConfig
      ? { selectedIdentifiers: [] }
      : undefined,
  }));
};
