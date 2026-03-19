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

// Cache for class-level identifiers (quantityList epcClass)
const classIdentifierContentCache = new Map<string, EpcIdentifierType>();
const parsedClassIdentifiersCache = ref<EpcIdentifierType[] | null>(null);

// Cache duration: 5 minutes for directory listing
const DIRECTORY_CACHE_DURATION = 5 * 60 * 1000;

// Hardcoded location identifier types - only SGLN is allowed for readPoint/bizLocation
// PGLN (Party GLN) is NOT valid for readPoint/bizLocation per EPCIS standard
const LOCATION_IDENTIFIER_TYPES = ["sgln"];

// Fallback class-level identifiers for EPC URN formats not available in GitHub repo
// These are standard GS1 EPCIS class-level identifiers (urn:epc:class: or urn:epc:idpat:)
// Used when GitHub repo doesn't have the schema file
const FALLBACK_CLASS_LEVEL_IDENTIFIERS: EpcIdentifierType[] = [
  {
    id: "lgtin",
    label: "LGTIN (AI 01 + batch/lot)",
    description:
      "Lot-level GTIN - GTIN with batch/lot number for class-level identification",
    category: "epc-uri",
    pattern:
      "^urn:epc:class:lgtin:[0-9]{6,12}\\.[0-9]{1,7}\\.[!%-?A-Z_a-z\\x22]+$",
  },
  {
    id: "gtin-no-serial",
    label: "GTIN, no serial (AI 01)",
    description:
      "GTIN without serial number - class-level product identification",
    category: "epc-uri",
    pattern: "^urn:epc:idpat:sgtin:[0-9]{6,12}\\.[0-9]{1,7}\\.\\*$",
  },
  {
    id: "grai-no-serial",
    label: "GRAI, no serial (AI 8003)",
    description:
      "GRAI without serial number - class-level returnable asset identification",
    category: "epc-uri",
    pattern: "^urn:epc:idpat:grai:[0-9]{6,12}\\.[0-9]{1,5}\\.\\*$",
  },
  {
    id: "gdti-no-serial",
    label: "GDTI, no serial (AI 253)",
    description:
      "GDTI without serial number - class-level document identification",
    category: "epc-uri",
    pattern: "^urn:epc:idpat:gdti:[0-9]{6,12}\\.[0-9]{1,5}\\.\\*$",
  },
  {
    id: "gcn-no-serial",
    label: "GCN, no serial (AI 255)",
    description:
      "GCN without serial number - class-level coupon identification",
    category: "epc-uri",
    pattern: "^urn:epc:idpat:sgcn:[0-9]{6,12}\\.[0-9]{1,5}\\.\\*$",
  },
  {
    id: "cpi-no-serial",
    label: "CPI, no serial (AI 8010)",
    description:
      "CPI without serial number - class-level component/part identification",
    category: "epc-uri",
    pattern: "^urn:epc:idpat:cpi:[0-9]{6,12}\\.[!%-?A-Z_a-z\\x22]{1,30}\\.\\*$",
  },
  {
    id: "itip-no-serial",
    label: "ITIP, no serial (AI 8006)",
    description:
      "ITIP without serial number - class-level individual trade item piece identification",
    category: "epc-uri",
    pattern:
      "^urn:epc:idpat:itip:[0-9]{6,12}\\.[0-9]{1,7}\\.[0-9]{2}\\.[0-9]{2}\\.\\*$",
  },
  {
    id: "upui-no-tpx",
    label: "UPUI, no TPX (AI 01)",
    description:
      "UPUI without TPX - class-level unit pack identifier for regulated healthcare",
    category: "epc-uri",
    pattern: "^urn:epc:idpat:upui:[0-9]{6,12}\\.[0-9]{1,7}\\.\\*$",
  },
];

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
 * Check if a filename is an EPC identifier schema file (instance-level)
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
 * Check if a filename is a class-level EPC identifier schema file
 * Matches: epc-class-uri-{type}-0.1.0.json, gs1dl-class-uri-{type}-0.1.0.json
 * Used for quantityList epcClass field (identifiers without serial numbers)
 */
const isClassLevelIdentifierFile = (filename: string): boolean => {
  return (
    (filename.startsWith("epc-class-uri-") ||
      filename.startsWith("gs1dl-class-uri-")) &&
    filename.endsWith(".json")
  );
};

/**
 * Get category from filename (instance-level)
 */
const getCategory = (filename: string): "epc-uri" | "gs1-dl" => {
  return filename.startsWith("gs1dl-uri-") ? "gs1-dl" : "epc-uri";
};

/**
 * Get category from class-level filename
 */
const getClassCategory = (filename: string): "epc-class" | "gs1-dl-class" => {
  return filename.startsWith("gs1dl-class-uri-") ? "gs1-dl-class" : "epc-class";
};

/**
 * Generate ID from filename (instance-level)
 * epc-uri-sgtin-0.1.0.json -> "sgtin"
 * gs1dl-uri-sgtin-0.1.0.json -> "sgtin-dl"
 */
const generateId = (
  filename: string,
  category: "epc-uri" | "gs1-dl",
): string => {
  const baseName = filename
    .replace(/^epc-uri-/, "")
    .replace(/^gs1dl-uri-/, "")
    .replace(/-\d+\.\d+\.\d+\.json$/, "")
    .replace(/\.json$/, "");

  return category === "gs1-dl" ? `${baseName}-dl` : baseName;
};

/**
 * Generate ID from class-level filename
 * epc-class-uri-lgtin-0.1.0.json -> "lgtin"
 * gs1dl-class-uri-gtin-0.1.0.json -> "gtin-dl"
 */
const generateClassId = (
  filename: string,
  category: "epc-class" | "gs1-dl-class",
): string => {
  const baseName = filename
    .replace(/^epc-class-uri-/, "")
    .replace(/^gs1dl-class-uri-/, "")
    .replace(/-\d+\.\d+\.\d+\.json$/, "")
    .replace(/\.json$/, "");

  return category === "gs1-dl-class" ? `${baseName}-dl` : baseName;
};

/**
 * Parse label from schema title (instance-level)
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
 * Parse label from class-level schema title
 * "LGTIN EPC Class URI" -> "LGTIN"
 * "GTIN GS1 Digital Link URI" -> "GTIN (Digital Link)"
 */
const parseClassLabel = (
  title: string,
  category: "epc-class" | "gs1-dl-class",
): string => {
  let label = title
    .replace(" EPC Class URI", "")
    .replace(" GS1 Digital Link URI", "")
    .trim();

  if (category === "gs1-dl-class") {
    label = `${label} (Digital Link)`;
  }

  return label;
};

/**
 * Extract regex pattern from schema $defs
 */
const extractPattern = (content: Record<string, unknown>): string | null => {
  const defs = content.$defs as
    | Record<string, { type?: string; pattern?: string }>
    | undefined;
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
  const isClassLoading = ref(false);
  const error = ref<string | null>(null);
  const identifiers = ref<EpcIdentifierType[]>([]);
  const classIdentifiers = ref<EpcIdentifierType[]>([]);

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
   * Fetch the directory listing from GitHub (shared between instance and class-level)
   */
  const fetchDirectoryListing = async (): Promise<GitHubFile[]> => {
    // Return cached data if valid
    if (isCacheValid() && directoryCache.value) {
      return directoryCache.value;
    }

    const response = await fetch(GITHUB_API_URL);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "GitHub API rate limit exceeded. Please try again later.",
        );
      }
      throw new Error(`Failed to fetch directory listing: ${response.status}`);
    }

    const data = await response.json();

    // Cache ALL files from directory
    directoryCache.value = data.filter(
      (file: GitHubFile) => file.type === "file" && file.name.endsWith(".json"),
    );
    directoryCacheTime.value = Date.now();

    return directoryCache.value;
  };

  /**
   * Fetch the list of instance-level EPC identifier files from GitHub
   */
  const fetchEpcIdentifierFiles = async (): Promise<GitHubFile[]> => {
    const allFiles = await fetchDirectoryListing();
    return allFiles.filter((file) => isEpcIdentifierFile(file.name));
  };

  /**
   * Fetch the list of class-level EPC identifier files from GitHub
   */
  const fetchClassLevelIdentifierFiles = async (): Promise<GitHubFile[]> => {
    const allFiles = await fetchDirectoryListing();
    return allFiles.filter((file) => isClassLevelIdentifierFile(file.name));
  };

  /**
   * Fetch and parse a single schema file into EpcIdentifierType
   */
  const fetchAndParseSchema = async (
    file: GitHubFile,
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
        `Failed to load ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`,
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
        files.map((file) => fetchAndParseSchema(file)),
      );

      // Filter out nulls (failed parses)
      const validIdentifiers = parsed.filter(
        (id): id is EpcIdentifierType => id !== null,
      );

      // Sort by category (gs1-dl first to encourage Digital Link) then by label
      validIdentifiers.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category === "gs1-dl" ? -1 : 1;
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
   * Fetch and parse a single class-level schema file into EpcIdentifierType
   */
  const fetchAndParseClassSchema = async (
    file: GitHubFile,
  ): Promise<EpcIdentifierType | null> => {
    // Check content cache first
    if (classIdentifierContentCache.has(file.name)) {
      return classIdentifierContentCache.get(file.name)!;
    }

    const url = `${GITHUB_RAW_URL}/${file.name}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Failed to fetch ${file.name}: ${response.status}`);
        return null;
      }

      const content = await response.json();
      const category = getClassCategory(file.name);
      const pattern = extractPattern(content);

      if (!pattern) {
        console.warn(`No pattern found in ${file.name}`);
        return null;
      }

      // Map class categories to the EpcIdentifierType category format
      const mappedCategory: "epc-uri" | "gs1-dl" =
        category === "gs1-dl-class" ? "gs1-dl" : "epc-uri";

      const identifier: EpcIdentifierType = {
        id: generateClassId(file.name, category),
        label: parseClassLabel(content.title || file.name, category),
        description: content.description || "",
        category: mappedCategory,
        pattern,
      };

      // Cache the parsed identifier
      classIdentifierContentCache.set(file.name, identifier);

      return identifier;
    } catch (err) {
      console.warn(
        `Failed to load ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      return null;
    }
  };

  /**
   * Fetch all class-level EPC identifiers from GitHub
   * Used for quantityList epcClass field (identifiers without serial numbers)
   * Merges GitHub-fetched identifiers with fallback identifiers to ensure all 8 standard types are available
   */
  const fetchClassLevelIdentifiers = async (): Promise<EpcIdentifierType[]> => {
    // Return cached identifiers if still valid
    if (parsedClassIdentifiersCache.value && isCacheValid()) {
      classIdentifiers.value = parsedClassIdentifiersCache.value;
      return parsedClassIdentifiersCache.value;
    }

    isClassLoading.value = true;
    error.value = null;

    try {
      // Fetch directory listing and filter for class-level files
      const files = await fetchClassLevelIdentifierFiles();

      // Fetch and parse each schema in parallel
      const parsed = await Promise.all(
        files.map((file) => fetchAndParseClassSchema(file)),
      );

      // Filter out nulls (failed parses)
      const githubIdentifiers = parsed.filter(
        (id): id is EpcIdentifierType => id !== null,
      );

      // Merge with fallback identifiers
      // Start with fallback identifiers, then override with GitHub versions if available
      const identifierMap = new Map<string, EpcIdentifierType>();

      // Add fallback identifiers first
      for (const fallback of FALLBACK_CLASS_LEVEL_IDENTIFIERS) {
        identifierMap.set(fallback.id, fallback);
      }

      // Override with GitHub-fetched identifiers (they have more accurate patterns)
      for (const github of githubIdentifiers) {
        identifierMap.set(github.id, github);
      }

      const mergedIdentifiers = Array.from(identifierMap.values());

      // Sort by category (gs1-dl first to encourage Digital Link) then by label
      mergedIdentifiers.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category === "gs1-dl" ? -1 : 1;
        }
        return a.label.localeCompare(b.label);
      });

      parsedClassIdentifiersCache.value = mergedIdentifiers;
      classIdentifiers.value = mergedIdentifiers;

      return mergedIdentifiers;
    } catch (err) {
      // On error, return fallback identifiers so the UI still works
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch class-level EPC identifiers";
      classIdentifiers.value = [...FALLBACK_CLASS_LEVEL_IDENTIFIERS];
      return FALLBACK_CLASS_LEVEL_IDENTIFIERS;
    } finally {
      isClassLoading.value = false;
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
    category: "epc-uri" | "gs1-dl",
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
   * Get class-level identifiers for quantityList epcClass field
   * These are different from instance-level identifiers (no serial numbers)
   * Returns fetched data from GitHub (call fetchClassLevelIdentifiers first)
   */
  const getClassLevelIdentifiers = (): EpcIdentifierType[] => {
    return [...classIdentifiers.value];
  };

  /**
   * Get class-level identifier by ID
   */
  const getClassLevelIdentifierById = (
    id: string,
  ): EpcIdentifierType | undefined => {
    return classIdentifiers.value.find((i) => i.id === id);
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
    // Instance-level caches
    parsedIdentifiersCache.value = null;
    identifierContentCache.clear();
    // Class-level caches
    parsedClassIdentifiersCache.value = null;
    classIdentifierContentCache.clear();
  };

  return {
    // State
    isLoading,
    isClassLoading,
    error,
    identifiers,
    classIdentifiers,

    // Methods - Instance-level
    fetchIdentifiers,
    getEpcIdentifiers,
    getEpcIdentifierById,
    getEpcIdentifiersByCategory,
    getEpcUriIdentifiers,
    getGs1DlIdentifiers,
    getLocationIdentifiers,
    isLocationIdentifier,

    // Methods - Class-level
    fetchClassLevelIdentifiers,
    getClassLevelIdentifiers,
    getClassLevelIdentifierById,

    // Utility
    clearCache,
  };
}
