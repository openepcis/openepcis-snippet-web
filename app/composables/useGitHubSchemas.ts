import { ref, computed } from "vue";
import type {
  GitHubSchemaFile,
  CategorizedSchemaFile,
  SchemaCategory,
} from "~/types/github-schema";
import {
  schemaCategories,
  getSchemaDisplayName,
  getCategoryForSchema,
} from "~/types/github-schema";

// GitHub repository configuration
const GITHUB_API_URL =
  "https://api.github.com/repos/openepcis/openepcis-event-sentry/contents/json-schema-epcis-snippets";
const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/openepcis/openepcis-event-sentry/main/json-schema-epcis-snippets";

// Cache for directory listing and schema content
const directoryCache = ref<GitHubSchemaFile[] | null>(null);
const directoryCacheTime = ref<number>(0);
const schemaContentCache = new Map<string, Record<string, unknown>>();

// Cache duration: 5 minutes for directory listing
const DIRECTORY_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Composable for fetching and managing GitHub schema files
 */
export function useGitHubSchemas() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const files = ref<GitHubSchemaFile[]>([]);

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
   * Fetch the list of schema files from GitHub
   */
  const fetchSchemaFiles = async (): Promise<GitHubSchemaFile[]> => {
    // Return cached data if valid
    if (isCacheValid() && directoryCache.value) {
      files.value = directoryCache.value;
      return directoryCache.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(GITHUB_API_URL);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later."
          );
        }
        throw new Error(`Failed to fetch schema list: ${response.status}`);
      }

      const data = await response.json();

      // Filter to only JSON files
      const jsonFiles = data.filter(
        (file: GitHubSchemaFile) =>
          file.type === "file" && file.name.endsWith(".json")
      );

      // Update cache
      directoryCache.value = jsonFiles;
      directoryCacheTime.value = Date.now();
      files.value = jsonFiles;

      return jsonFiles;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch schemas";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch the content of a specific schema file
   */
  const fetchSchemaContent = async (
    filename: string
  ): Promise<Record<string, unknown>> => {
    // Check cache first
    if (schemaContentCache.has(filename)) {
      return schemaContentCache.get(filename)!;
    }

    const url = `${GITHUB_RAW_URL}/${filename}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch schema: ${response.status}`);
      }

      const content = await response.json();

      // Cache the content (indefinitely - schemas rarely change)
      schemaContentCache.set(filename, content);

      return content;
    } catch (err) {
      throw new Error(
        `Failed to load ${filename}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  /**
   * Get the raw GitHub URL for a schema file (for use in $ref)
   */
  const getSchemaUrl = (filename: string): string => {
    return `${GITHUB_RAW_URL}/${filename}`;
  };

  /**
   * Categorize schema files into groups
   */
  const categorizedFiles = computed(
    (): Map<string, CategorizedSchemaFile[]> => {
      const categoryMap = new Map<string, CategorizedSchemaFile[]>();

      // Initialize all categories
      schemaCategories.forEach((cat) => {
        categoryMap.set(cat.id, []);
      });

      // Categorize each file
      files.value.forEach((file) => {
        const categoryId = getCategoryForSchema(file.name);
        const categorizedFile: CategorizedSchemaFile = {
          ...file,
          categoryId,
          displayName: getSchemaDisplayName(file.name),
        };

        const categoryFiles = categoryMap.get(categoryId) || [];
        categoryFiles.push(categorizedFile);
        categoryMap.set(categoryId, categoryFiles);
      });

      // Sort files within each category alphabetically
      categoryMap.forEach((categoryFiles) => {
        categoryFiles.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );
      });

      return categoryMap;
    }
  );

  /**
   * Get categories that have files (for display)
   */
  const activeCategories = computed((): SchemaCategory[] => {
    return schemaCategories.filter((cat) => {
      const categoryFiles = categorizedFiles.value.get(cat.id);
      return categoryFiles && categoryFiles.length > 0;
    });
  });

  /**
   * Search/filter files by query
   */
  const searchFiles = (query: string): Map<string, CategorizedSchemaFile[]> => {
    if (!query.trim()) {
      return categorizedFiles.value;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = new Map<string, CategorizedSchemaFile[]>();

    categorizedFiles.value.forEach((categoryFiles, categoryId) => {
      const matchingFiles = categoryFiles.filter(
        (file) =>
          file.displayName.toLowerCase().includes(lowerQuery) ||
          file.name.toLowerCase().includes(lowerQuery)
      );

      if (matchingFiles.length > 0) {
        filtered.set(categoryId, matchingFiles);
      }
    });

    return filtered;
  };

  /**
   * Clear the directory cache (force refresh on next fetch)
   */
  const clearCache = () => {
    directoryCache.value = null;
    directoryCacheTime.value = 0;
  };

  /**
   * Clear a specific schema content from cache
   */
  const clearSchemaContentCache = (filename?: string) => {
    if (filename) {
      schemaContentCache.delete(filename);
    } else {
      schemaContentCache.clear();
    }
  };

  return {
    // State
    isLoading,
    error,
    files,

    // Computed
    categorizedFiles,
    activeCategories,

    // Methods
    fetchSchemaFiles,
    fetchSchemaContent,
    getSchemaUrl,
    searchFiles,
    clearCache,
    clearSchemaContentCache,
  };
}
