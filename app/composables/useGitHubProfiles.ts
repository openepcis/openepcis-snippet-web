import { ref } from "vue";
import type { SelectItem } from "@nuxt/ui";

// GitHub endpoints
const GITHUB_API_URL =
  "https://api.github.com/repos/openepcis/openepcis-event-sentry/contents/examples/epcis-profiles";
const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/openepcis/openepcis-event-sentry/main/examples";

// sessionStorage keys
const PROFILES_DIR_KEY = "epcis-profiles-dir";
const PROFILES_DIR_TS_KEY = "epcis-profiles-dir-ts";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// In-memory caches (survive SPA navigation)
const directoryCacheMem = ref<string[] | null>(null);
const directoryCacheTimeMem = ref<number>(0);
const profileContentCache = new Map<string, string>();
const eventContentCache = new Map<string, string>();

interface GitHubFile {
  name: string;
  type: "file" | "dir";
}

/**
 * Restore in-memory caches from sessionStorage on first access
 */
function hydrateFromSessionStorage() {
  if (directoryCacheMem.value !== null) return;

  try {
    const stored = sessionStorage.getItem(PROFILES_DIR_KEY);
    const ts = sessionStorage.getItem(PROFILES_DIR_TS_KEY);
    if (stored && ts && Date.now() - Number(ts) < CACHE_TTL) {
      directoryCacheMem.value = JSON.parse(stored);
      directoryCacheTimeMem.value = Number(ts);
    }
  } catch {
    // sessionStorage unavailable (SSR or private browsing) — ignore
  }
}

/**
 * Composable for fetching EPCIS profiles and matching events from GitHub
 */
export function useGitHubProfiles() {
  const profileOptions = ref<SelectItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch the profile directory listing (with dual-layer caching)
   */
  const fetchProfileList = async () => {
    hydrateFromSessionStorage();

    // Return from in-memory cache if valid
    if (
      directoryCacheMem.value &&
      Date.now() - directoryCacheTimeMem.value < CACHE_TTL
    ) {
      profileOptions.value = filesToOptions(directoryCacheMem.value);
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(GITHUB_API_URL);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later.",
          );
        }
        throw new Error(`Failed to fetch profile listing: ${response.status}`);
      }

      const data: GitHubFile[] = await response.json();
      const filenames = data
        .filter((f) => f.type === "file" && f.name.endsWith(".json"))
        .map((f) => f.name);

      // Populate in-memory cache
      directoryCacheMem.value = filenames;
      directoryCacheTimeMem.value = Date.now();

      // Persist to sessionStorage
      try {
        sessionStorage.setItem(PROFILES_DIR_KEY, JSON.stringify(filenames));
        sessionStorage.setItem(PROFILES_DIR_TS_KEY, String(Date.now()));
      } catch {
        // sessionStorage full or unavailable — continue without persisting
      }

      profileOptions.value = filesToOptions(filenames);
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to fetch profiles from GitHub";
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Load both the profile schema and matching event for a given filename.
   * Returns the raw JSON strings, or null on failure.
   */
  const loadProfileAndEvent = async (
    filename: string,
  ): Promise<{ schema: string; event: string } | null> => {
    error.value = null;

    try {
      const [schema, event] = await Promise.all([
        fetchFileContent("epcis-profiles", filename, profileContentCache),
        fetchFileContent("epcis-events", filename, eventContentCache),
      ]);
      return { schema, event };
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to load profile or event from GitHub";
      return null;
    }
  };

  /**
   * Force-clear all caches
   */
  const clearCache = () => {
    directoryCacheMem.value = null;
    directoryCacheTimeMem.value = 0;
    profileContentCache.clear();
    eventContentCache.clear();

    try {
      sessionStorage.removeItem(PROFILES_DIR_KEY);
      sessionStorage.removeItem(PROFILES_DIR_TS_KEY);
      // Remove all individual file caches
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (
          key &&
          (key.startsWith("epcis-profile:") || key.startsWith("epcis-event:"))
        ) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // ignore
    }
  };

  return {
    profileOptions,
    isLoading,
    error,
    fetchProfileList,
    loadProfileAndEvent,
    clearCache,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

function filesToOptions(filenames: string[]): SelectItem[] {
  return filenames.map((f) => ({
    label: f.replace(/\.json$/, ""),
    value: f,
  }));
}

/**
 * Fetch a single file's text content with in-memory + sessionStorage caching.
 */
async function fetchFileContent(
  folder: string,
  filename: string,
  memCache: Map<string, string>,
): Promise<string> {
  // 1. In-memory hit
  if (memCache.has(filename)) {
    return memCache.get(filename)!;
  }

  // 2. sessionStorage hit
  const storageKey =
    folder === "epcis-profiles"
      ? `epcis-profile:${filename}`
      : `epcis-event:${filename}`;

  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      memCache.set(filename, stored);
      return stored;
    }
  } catch {
    // ignore
  }

  // 3. Fetch from GitHub
  const url = `${GITHUB_RAW_BASE}/${folder}/${filename}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${folder}/${filename}: ${response.status}`,
    );
  }

  const text = await response.text();

  // Cache the content
  memCache.set(filename, text);
  try {
    sessionStorage.setItem(storageKey, text);
  } catch {
    // ignore
  }

  return text;
}
