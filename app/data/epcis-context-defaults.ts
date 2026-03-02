export const DEFAULT_EPCIS_CONTEXT_URIS: string[] = [
  "https://ref.gs1.org/epcis/",
  "https://ref.gs1.org/cbv/",
  "urn:epcglobal:cbv:mda:",
  "https://ref.gs1.org/voc/",
  "http://www.w3.org/2000/01/rdf-schema#",
  "http://www.w3.org/2002/07/owl#",
  "http://www.w3.org/2001/XMLSchema#",
  "http://purl.org/dc/terms/",
];

// Fiter out the default namespaces to avoid appearning in the @context when extracting all context url
export function isDefaultEpcisContextUri(uri: string): boolean {
  return DEFAULT_EPCIS_CONTEXT_URIS.some(
    (defaultUri) =>
      defaultUri === uri ||
      defaultUri.startsWith(uri) ||
      uri.startsWith(defaultUri),
  );
}
