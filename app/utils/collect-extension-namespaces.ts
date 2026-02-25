import type { ProfileFieldConfig } from "~/types/profile";
import { isDefaultEpcisContextUri } from "~/data/epcis-context-defaults";

export interface ContextNamespaceEntry {
  prefix: string;
  uri: string;
}

export function collectExtensionNamespaces(
  configuredFields: ProfileFieldConfig[],
): ContextNamespaceEntry[] {
  const seenKeys = new Set<string>();
  const result: ContextNamespaceEntry[] = [];

  for (const field of configuredFields) {
    // if not extension type field then return
    if (field.fieldType !== "extension" || !field.extensionConfig) continue;

    for (const ns of field.extensionConfig.namespaces) {
      // if default namespace or already part of context url return
      if (isDefaultEpcisContextUri(ns.uri)) continue;

      // avoid adding the same uri and prefix
      const dedupeKey = `${ns.prefix}|${ns.uri}`;
      if (seenKeys.has(dedupeKey)) continue;

      // if not already present then add
      seenKeys.add(dedupeKey);
      result.push({ prefix: ns.prefix, uri: ns.uri });
    }
  }
  return result;
}
