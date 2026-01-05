import { ref, computed } from "vue";
import type { EpcIdentifierType } from "~/types/profile";

// GitHub repository configuration
const GITHUB_API_URL =
  "https://api.github.com/repos/openepcis/openepcis-event-sentry/contents/json-schema-epcis-snippets";
const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/openepcis/openepcis-event-sentry/main/json-schema-epcis-snippets";

// Cache for directory listing and identifier content
const directoryCache = ref<GitHubFile[] | null>(null);
const directoryCacheTime = ref<number>(0);
const identifierContentCache = new Map<string, EpcIdentifierType>();
const parsedIdentifiersCache = ref<EpcIdentifierType[] | null>(null);

// Cache duration: 5 minutes for directory listing
const DIRECTORY_CACHE_DURATION = 5 * 60 * 1000;

// Hardcoded location identifier types (sgln, pgln)
const LOCATION_IDENTIFIER_TYPES = ["sgln", "pgln"];

// Interface for GitHub API response
interface GitHubFile {
  name: string;
  path: string;
  download_url: string;
  sha: string;
  size: number;
  type: "file" | "dir";
}

/**
 * Check if a filename is an EPC identifier schema file
 * Matches: epc-uri-{type}-0.1.0.json, gs1dl-uri-{type}-0.1.0.json
 * Excludes combination files like epc-uri-sgtin-or-sscc-0.1.0.json
 */
const isEpcIdentifierFile = (filename: string): boolean => {
  return (
    (filename.startsWith("epc-uri-") || filename.startsWith("gs1dl-uri-")) &&
    filename.endsWith(".json") &&
    !filename.includes("-or-") // Exclude combination files
  );
};

/**
 * Get category from filename
 */
const getCategory = (filename: string): "epc-uri" | "gs1-dl" => {
  return filename.startsWith("gs1dl-uri-") ? "gs1-dl" : "epc-uri";
};

/**
 * Generate ID from filename
 * epc-uri-sgtin-0.1.0.json -> "sgtin"
 * gs1dl-uri-sgtin-0.1.0.json -> "sgtin-dl"
 */
const generateId = (filename: string, category: "epc-uri" | "gs1-dl"): string => {
  const baseName = filename
    .replace(/^epc-uri-/, "")
    .replace(/^gs1dl-uri-/, "")
    .replace(/-\d+\.\d+\.\d+\.json$/, "")
    .replace(/\.json$/, "");

  return category === "gs1-dl" ? `${baseName}-dl` : baseName;
};

/**
 * Parse label from schema title
 * "SGTIN EPC URI" -> "SGTIN"
 * "SGTIN GS1 Digital Link URI" -> "SGTIN (Digital Link)"
 */
const parseLabel = (title: string, category: "epc-uri" | "gs1-dl"): string => {
  let label = title
    .replace(" EPC URI", "")
    .replace(" GS1 Digital Link URI", "")
    .trim();

  if (category === "gs1-dl") {
    label = `${label} (Digital Link)`;
  }

  return label;
};

/**
 * Extract regex pattern from schema $defs
 */
const extractPattern = (content: Record<string, unknown>): string | null => {
  const defs = content.$defs as Record<string, { type?: string; pattern?: string }> | undefined;
  if (!defs) return null;

  // Get the first definition's pattern
  const firstDef = Object.values(defs)[0];
  return firstDef?.pattern || null;
};

/**
 * Composable for fetching and managing EPC identifier types from GitHub
 */
export function useGitHubEpcIdentifiers() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const identifiers = ref<EpcIdentifierType[]>([]);

  /**
   * Check if directory cache is still valid
   */
  const isCacheValid = (): boolean => {
    return (
      directoryCache.value !== null &&
      Date.now() - directoryCacheTime.value < DIRECTORY_CACHE_DURATION
    );
  };

  /**
   * Fetch the list of EPC identifier files from GitHub
   */
  const fetchEpcIdentifierFiles = async (): Promise<GitHubFile[]> => {
    // Return cached data if valid
    if (isCacheValid() && directoryCache.value) {
      return directoryCache.value;
    }

    const response = await fetch(GITHUB_API_URL);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "GitHub API rate limit exceeded. Please try again later."
        );
      }
      throw new Error(`Failed to fetch EPC identifier list: ${response.status}`);
    }

    const data = await response.json();

    // Filter to only EPC identifier JSON files
    const epcFiles = data.filter(
      (file: GitHubFile) =>
        file.type === "file" && isEpcIdentifierFile(file.name)
    );

    // Update cache
    directoryCache.value = epcFiles;
    directoryCacheTime.value = Date.now();

    return epcFiles;
  };

  /**
   * Fetch and parse a single schema file into EpcIdentifierType
   */
  const fetchAndParseSchema = async (
    file: GitHubFile
  ): Promise<EpcIdentifierType | null> => {
    // Check content cache first
    if (identifierContentCache.has(file.name)) {
      return identifierContentCache.get(file.name)!;
    }

    const url = `${GITHUB_RAW_URL}/${file.name}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch ${file.name}: ${response.status}`);
        return null;
      }

      const content = await response.json();
      const category = getCategory(file.name);
      const pattern = extractPattern(content);

      if (!pattern) {
        console.warn(`No pattern found in ${file.name}`);
        return null;
      }

      const identifier: EpcIdentifierType = {
        id: generateId(file.name, category),
        label: parseLabel(content.title || file.name, category),
        description: content.description || "",
        category,
        pattern,
      };

      // Cache the parsed identifier
      identifierContentCache.set(file.name, identifier);

      return identifier;
    } catch (err) {
      console.warn(
        `Failed to load ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      return null;
    }
  };

  /**
   * Fetch all EPC identifiers from GitHub
   */
  const fetchIdentifiers = async (): Promise<EpcIdentifierType[]> => {
    // Return cached identifiers if still valid
    if (parsedIdentifiersCache.value && isCacheValid()) {
      identifiers.value = parsedIdentifiersCache.value;
      return parsedIdentifiersCache.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Fetch directory listing
      const files = await fetchEpcIdentifierFiles();

      // Fetch and parse each schema in parallel
      const parsed = await Promise.all(
        files.map((file) => fetchAndParseSchema(file))
      );

      // Filter out nulls (failed parses)
      const validIdentifiers = parsed.filter(
        (id): id is EpcIdentifierType => id !== null
      );

      // Sort by category (epc-uri first) then by label
      validIdentifiers.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category === "epc-uri" ? -1 : 1;
        }
        return a.label.localeCompare(b.label);
      });

      parsedIdentifiersCache.value = validIdentifiers;
      identifiers.value = validIdentifiers;

      return validIdentifiers;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch EPC identifiers";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get all EPC identifiers (synchronous - uses cached data)
   */
  const getEpcIdentifiers = (): EpcIdentifierType[] => {
    return [...identifiers.value];
  };

  /**
   * Get EPC identifier by ID
   */
  const getEpcIdentifierById = (id: string): EpcIdentifierType | undefined => {
    return identifiers.value.find((i) => i.id === id);
  };

  /**
   * Get EPC identifiers by category
   */
  const getEpcIdentifiersByCategory = (
    category: "epc-uri" | "gs1-dl"
  ): EpcIdentifierType[] => {
    return identifiers.value.filter((i) => i.category === category);
  };

  /**
   * Get EPC URI identifiers
   */
  const getEpcUriIdentifiers = (): EpcIdentifierType[] => {
    return getEpcIdentifiersByCategory("epc-uri");
  };

  /**
   * Get GS1 Digital Link identifiers
   */
  const getGs1DlIdentifiers = (): EpcIdentifierType[] => {
    return getEpcIdentifiersByCategory("gs1-dl");
  };

  /**
   * Get location-specific identifiers (SGLN, PGLN variants)
   * Used for readPoint and bizLocation fields
   */
  const getLocationIdentifiers = (): EpcIdentifierType[] => {
    return identifiers.value.filter((i) => {
      const baseType = i.id.replace("-dl", "");
      return LOCATION_IDENTIFIER_TYPES.includes(baseType);
    });
  };

  /**
   * Check if an identifier is a location identifier
   */
  const isLocationIdentifier = (id: string): boolean => {
    const baseType = id.replace("-dl", "");
    return LOCATION_IDENTIFIER_TYPES.includes(baseType);
  };

  /**
   * Clear all caches (force refresh on next fetch)
   */
  const clearCache = () => {
    directoryCache.value = null;
    directoryCacheTime.value = 0;
    parsedIdentifiersCache.value = null;
    identifierContentCache.clear();
  };

  return {
    // State
    isLoading,
    error,
    identifiers,

    // Methods
    fetchIdentifiers,
    getEpcIdentifiers,
    getEpcIdentifierById,
    getEpcIdentifiersByCategory,
    getEpcUriIdentifiers,
    getGs1DlIdentifiers,
    getLocationIdentifiers,
    isLocationIdentifier,
    clearCache,
  };
}
