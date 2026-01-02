// TypeScript interfaces for GitHub Schema Import feature

/**
 * Represents a file from GitHub API directory listing
 */
export interface GitHubSchemaFile {
  name: string; // e.g., "biz-step-0.1.0.json"
  path: string; // Full path in repo
  download_url: string; // Raw content URL
  sha: string; // For cache invalidation
  size: number; // File size in bytes
  type: "file" | "dir";
}

/**
 * Represents an imported schema that has been selected by the user
 */
export interface ImportedSchema {
  id: string; // Unique identifier (filename without extension)
  name: string; // Display name (e.g., "Business Step")
  filename: string; // Original filename
  url: string; // Raw GitHub URL for $ref
  content: Record<string, unknown>; // Parsed JSON schema content
  mergeMode: "ref" | "inline"; // How to include in final schema
  isRequired: boolean; // Mark all properties as required in generated schema
}

/**
 * Schema category for grouping schemas in the UI
 */
export interface SchemaCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: "primary" | "blue" | "amber" | "emerald" | "purple" | "neutral" | "red";
  patterns: string[]; // Filename patterns to match (e.g., ["object-event", "aggregation-event"])
}

/**
 * Schema file with category assignment
 */
export interface CategorizedSchemaFile extends GitHubSchemaFile {
  categoryId: string;
  displayName: string; // Human-readable name derived from filename
}

/**
 * State for the schema selector
 */
export interface SchemaSelectorState {
  isLoading: boolean;
  error: string | null;
  files: GitHubSchemaFile[];
  selectedIds: Set<string>;
  searchQuery: string;
  previewSchema: GitHubSchemaFile | null;
}

/**
 * Schema categories configuration
 * Defines how schemas are grouped in the selector UI
 */
export const schemaCategories: SchemaCategory[] = [
  {
    id: "events",
    label: "Event Types",
    description: "EPCIS event type schemas",
    icon: "i-heroicons-document-text",
    color: "primary",
    patterns: ["object-event", "aggregation-event", "transaction-event", "transformation-event", "association-event"],
  },
  {
    id: "epc-uri",
    label: "EPC URI Formats",
    description: "EPC URN identifier patterns",
    icon: "i-heroicons-link",
    color: "purple",
    patterns: ["epc-uri-"],
  },
  {
    id: "gs1dl",
    label: "GS1 Digital Link",
    description: "GS1 Digital Link URI patterns",
    icon: "i-heroicons-globe-alt",
    color: "blue",
    patterns: ["gs1dl-uri-"],
  },
  {
    id: "business",
    label: "Business Context",
    description: "Business step, disposition, action schemas",
    icon: "i-heroicons-briefcase",
    color: "amber",
    patterns: ["biz-step", "biz-location", "biz-transaction", "disposition", "action"],
  },
  {
    id: "quantity",
    label: "Quantities & Measurements",
    description: "Quantity and unit of measure schemas",
    icon: "i-heroicons-scale",
    color: "emerald",
    patterns: ["quantity"],
  },
  {
    id: "location",
    label: "Location",
    description: "Read point and business location schemas",
    icon: "i-heroicons-map-pin",
    color: "emerald",
    patterns: ["read-point", "source", "destination"],
  },
  {
    id: "metadata",
    label: "Event Metadata",
    description: "Event time, ID, and other metadata schemas",
    icon: "i-heroicons-clock",
    color: "blue",
    patterns: ["event-time", "record-time", "event-id", "event-type", "error-declaration"],
  },
  {
    id: "sensor",
    label: "Sensor Data",
    description: "EPCIS 2.0 sensor element schemas",
    icon: "i-heroicons-cpu-chip",
    color: "purple",
    patterns: ["sensor"],
  },
  {
    id: "other",
    label: "Other Schemas",
    description: "Additional validation schemas",
    icon: "i-heroicons-squares-plus",
    color: "neutral",
    patterns: [], // Catch-all for uncategorized
  },
];

/**
 * Helper function to get display name from filename
 * e.g., "biz-step-0.1.0.json" -> "Business Step"
 */
export function getSchemaDisplayName(filename: string): string {
  // Remove version and extension
  const baseName = filename.replace(/-\d+\.\d+\.\d+\.json$/, "").replace(/\.json$/, "");

  // Convert kebab-case to Title Case
  return baseName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Helper function to find category for a schema file
 */
export function getCategoryForSchema(filename: string): string {
  const lowerName = filename.toLowerCase();

  for (const category of schemaCategories) {
    if (category.patterns.length === 0) continue; // Skip "other" category in first pass

    for (const pattern of category.patterns) {
      if (lowerName.includes(pattern.toLowerCase())) {
        return category.id;
      }
    }
  }

  return "other"; // Default to "other" category
}
