import type { EpcisDimension } from "~/types/profile";

/**
 * EPCIS Dimension Configuration
 * Defines the standard EPCIS dimensions (What, When, Why, Where, How) with metadata
 * for display in the Profile Builder UI.
 */

export interface DimensionConfig {
  id: EpcisDimension;
  label: string;
  description: string;
  icon: string;
  color:
    | "primary"
    | "blue"
    | "amber"
    | "emerald"
    | "yellow"
    | "purple"
    | "neutral"
    | "red"
    | "cyan"
    | "indigo";
}

/**
 * EPCIS Dimension definitions following GS1 EPCIS 2.0 Standard
 * Reference: https://tools.openepcis.io/ui/event-data-generator
 */
export const epcisDimensions: DimensionConfig[] = [
  {
    id: "document",
    label: "Document",
    description:
      "EPCISDocument-level fields (@context, schemaVersion, creationDate, SBDH headers)",
    icon: "i-heroicons-document-text",
    color: "neutral",
  },
  {
    id: "generic",
    label: "Generic",
    description: "Common fields shared by all EPCIS event types",
    icon: "i-heroicons-document-text",
    color: "neutral",
  },
  {
    id: "what",
    label: "What",
    description: "Identifies the objects and entities involved in the event",
    icon: "i-heroicons-cube",
    color: "blue",
  },
  {
    id: "when",
    label: "When",
    description: "Temporal information about when the event occurred",
    icon: "i-heroicons-clock",
    color: "purple",
  },
  {
    id: "where",
    label: "Where",
    description: "Location information where the event occurred",
    icon: "i-heroicons-map-pin",
    color: "emerald",
  },
  {
    id: "why",
    label: "Why",
    description: "Business context explaining the reason for the event",
    icon: "i-heroicons-light-bulb",
    color: "yellow",
  },
  {
    id: "how",
    label: "How",
    description: "Sensor and environmental data capture",
    icon: "i-heroicons-cpu-chip",
    color: "cyan",
  },
  {
    id: "other",
    label: "Other",
    description: "Extensions, ILMD, and other custom fields",
    icon: "i-heroicons-squares-plus",
    color: "neutral",
  },
  {
    id: "error",
    label: "Error",
    description: "Error declaration for correcting previously recorded events",
    icon: "i-heroicons-exclamation-triangle",
    color: "red",
  },
];

