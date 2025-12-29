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
  color: "primary" | "blue" | "amber" | "emerald" | "purple" | "neutral";
}

/**
 * EPCIS Dimension definitions following GS1 EPCIS 2.0 Standard
 * Reference: https://tools.openepcis.io/ui/event-data-generator
 */
export const epcisDimensions: DimensionConfig[] = [
  {
    id: "generic",
    label: "Generic",
    description: "Common fields shared by all EPCIS event types",
    icon: "i-heroicons-document-text",
    color: "primary",
  },
  {
    id: "what",
    label: "What",
    description: "Identifies the objects and entities involved in the event",
    icon: "i-heroicons-cube",
    color: "purple",
  },
  {
    id: "when",
    label: "When",
    description: "Temporal information about when the event occurred",
    icon: "i-heroicons-clock",
    color: "blue",
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
    color: "amber",
  },
  {
    id: "how",
    label: "How",
    description: "Sensor and environmental data capture (EPCIS 2.0)",
    icon: "i-heroicons-cpu-chip",
    color: "blue",
  },
];

/**
 * Get dimension configuration by ID
 */
export const getDimensionById = (id: EpcisDimension): DimensionConfig | undefined => {
  return epcisDimensions.find((d) => d.id === id);
};

/**
 * Get all active dimensions (dimensions that have at least one field defined)
 */
export const getActiveDimensions = (): DimensionConfig[] => {
  return epcisDimensions;
};
