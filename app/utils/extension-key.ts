export function extensionPropertyKey(prefix: string, localName: string): string {
  if (prefix === "gs1" && localName !== "masterDataAvailableFor") {
    return localName;
  }
  return `${prefix}:${localName}`;
}
