import type { EpcIdentifierType } from "~/types/profile";

/**
 * EPC Identifier Type Definitions
 * Contains all available EPC identifier types with their regex patterns
 * Patterns sourced from: https://github.com/openepcis/openepcis-event-sentry/tree/main/json-schema-epcis-snippets
 */

export const epcIdentifiers: EpcIdentifierType[] = [
  // ===== EPC URN Identifiers =====
  {
    id: "sgtin",
    label: "SGTIN",
    description: "Serialized Global Trade Item Number",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:sgtin:((\\d{6}\\.\\d{7})|(\\d{7}\\.\\d{6})|(\\d{8}\\.\\d{5})|(\\d{9}\\.\\d{4})|(\\d{10}\\.\\d{3})|(\\d{11}\\.\\d{2})|(\\d{12}\\.\\d{1}))\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!\\')(*+,.0-9:;=A-Za-z_-]){1,20}$",
  },
  {
    id: "sscc",
    label: "SSCC",
    description: "Serial Shipping Container Code",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:sscc:((\\d{6}\\.\\d{11})|(\\d{7}\\.\\d{10})|(\\d{8}\\.\\d{9})|(\\d{9}\\.\\d{8})|(\\d{10}\\.\\d{7})|(\\d{11}\\.\\d{6})|(\\d{12}\\.\\d{5}))$",
  },
  {
    id: "gdti",
    label: "GDTI",
    description: "Global Document Type Identifier",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:gdti:((\\d{6}\\.\\d{6})|(\\d{7}\\.\\d{5})|(\\d{8}\\.\\d{4})|(\\d{9}\\.\\d{3})|(\\d{10}\\.\\d{2})|(\\d{11}\\.\\d{1})|(\\d{12}\\..))((\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,20})?$",
  },
  {
    id: "cpi",
    label: "CPI",
    description: "Component/Part Identifier",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:cpi:((\\d{6}\\.(\\%2[3dfDF]|\\%3[0-9]|\\%4[1-9A-Fa-f]|\\%5[0-9Aa]|[0-9A-Z-]){1,24})|(\\d{7}\\.(\\%2[3dfDF]|\\%3[0-9]|\\%4[1-9A-Fa-f]|\\%5[0-9Aa]|[0-9A-Z-]){1,23})|(\\d{8}\\.(\\%2[3dfDF]|\\%3[0-9]|\\%4[1-9A-Fa-f]|\\%5[0-9Aa]|[0-9A-Z-]){1,22})|(\\d{9}\\.(\\%2[3dfDF]|\\%3[0-9]|\\%4[1-9A-Fa-f]|\\%5[0-9Aa]|[0-9A-Z-]){1,21})|(\\d{10}\\.(\\%2[3dfDF]|\\%3[0-9]|\\%4[1-9A-Fa-f]|\\%5[0-9Aa]|[0-9A-Z-]){1,20})|(\\d{11}\\.(\\%2[3dfDF]|\\%3[0-9]|\\%4[1-9A-Fa-f]|\\%5[0-9Aa]|[0-9A-Z-]){1,19})|(\\d{12}\\.(\\%2[3dfDF]|\\%3[0-9]|\\%4[1-9A-Fa-f]|\\%5[0-9Aa]|[0-9A-Z-]){1,18}))\\.[\\d]{1,12}$",
  },
  {
    id: "grai",
    label: "GRAI",
    description: "Global Returnable Asset Identifier",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:grai:((\\d{6}\\.\\d{6})|(\\d{7}\\.\\d{5})|(\\d{8}\\.\\d{4})|(\\d{9}\\.\\d{3})|(\\d{10}\\.\\d{2})|(\\d{11}\\.\\d{1})|(\\d{12}\\.))((\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,16})?$",
  },
  {
    id: "giai",
    label: "GIAI",
    description: "Global Individual Asset Identifier",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:giai:(\\d{6}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,24}|\\d{7}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,23}|\\d{8}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,22}|\\d{9}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,21}|\\d{10}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,20}|\\d{11}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,19}|\\d{12}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,18})$",
  },
  {
    id: "sgln",
    label: "SGLN",
    description: "Serialized Global Location Number",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:sgln:((\\d{6}\\.\\d{6})|(\\d{7}\\.\\d{5})|(\\d{8}\\.\\d{4})|(\\d{9}\\.\\d{3})|(\\d{10}\\.\\d{2})|(\\d{11}\\.\\d{1})|(\\d{12}\\.))\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!\\')(*+,.0-9:;=A-Za-z_-]){1,20}$",
  },
  {
    id: "sgcn",
    label: "SGCN",
    description: "Serialized Global Coupon Number",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:sgcn:((\\d{6}\\.\\d{6})|(\\d{7}\\.\\d{5})|(\\d{8}\\.\\d{4})|(\\d{9}\\.\\d{3})|(\\d{10}\\.\\d{2})|(\\d{11}\\.\\d{1})|(\\d{12}\\.)).\\d{1,12}$",
  },
  {
    id: "gsrn",
    label: "GSRN",
    description: "Global Service Relation Number (Recipient)",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:gsrn:((\\d{6}\\.\\d{11})|(\\d{7}\\.\\d{10})|(\\d{8}\\.\\d{9})|(\\d{9}\\.\\d{8})|(\\d{10}\\.\\d{7})|(\\d{11}\\.\\d{6})|(\\d{12}\\.\\d{5}))$",
  },
  {
    id: "gsrnp",
    label: "GSRNP",
    description: "Global Service Relation Number (Provider)",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:gsrnp:((\\d{6}\\.\\d{11})|(\\d{7}\\.\\d{10})|(\\d{8}\\.\\d{9})|(\\d{9}\\.\\d{8})|(\\d{10}\\.\\d{7})|(\\d{11}\\.\\d{6})|(\\d{12}\\.\\d{5}))$",
  },
  {
    id: "gsin",
    label: "GSIN",
    description: "Global Shipment Identification Number",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:gsin:((\\d{6}\\.\\d{10})|(\\d{7}\\.\\d{9})|(\\d{8}\\.\\d{8})|(\\d{9}\\.\\d{7})|(\\d{10}\\.\\d{6})|(\\d{11}\\.\\d{5})|(\\d{12}\\.\\d{4}))$",
  },
  {
    id: "pgln",
    label: "PGLN",
    description: "Party Global Location Number",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:pgln:((\\d{6}\\.\\d{6})|(\\d{7}\\.\\d{5})|(\\d{8}\\.\\d{4})|(\\d{9}\\.\\d{3})|(\\d{10}\\.\\d{2})|(\\d{11}\\.\\d{1})|(\\d{12}\\.))$",
  },
  {
    id: "ginc",
    label: "GINC",
    description: "Global Identification Number for Consignment",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:ginc:(\\d{6}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,24}|\\d{7}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,23}|\\d{8}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,22}|\\d{9}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,21}|\\d{10}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,20}|\\d{11}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,19}|\\d{12}\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,18})$",
  },
  {
    id: "itip",
    label: "ITIP",
    description: "Individual Trade Item Piece",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:itip:((\\d{6}\\.\\d{7})|(\\d{7}\\.\\d{6})|(\\d{8}\\.\\d{5})|(\\d{9}\\.\\d{4})|(\\d{10}\\.\\d{3})|(\\d{11}\\.\\d{2})|(\\d{12}\\.\\d{1}))\\.\\d{2}\\.\\d{2}\\.((\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!')(*+,.0-9:;=A-Za-z_-]){1,20})$",
  },
  {
    id: "upui",
    label: "UPUI",
    description: "Unit Pack Identifier",
    category: "epc-uri",
    pattern:
      "^urn:epc:id:upui:((\\d{6}\\.\\d{7})|(\\d{7}\\.\\d{6})|(\\d{8}\\.\\d{5})|(\\d{9}\\.\\d{4})|(\\d{10}\\.\\d{3})|(\\d{11}\\.\\d{2})|(\\d{12}\\.\\d{1}))\\.(\\%2[125-9A-Fa-f]|\\%3[0-9A-Fa-f]|\\%4[1-9A-Fa-f]|\\%5[0-9AaFf]|\\%6[1-9A-Fa-f]|\\%7[0-9Aa]|[!\\')(*+,.0-9:;=A-Za-z_-]){1,28}$",
  },

  // ===== GS1 Digital Link Identifiers =====
  {
    id: "sgtin-dl",
    label: "SGTIN (Digital Link)",
    description: "Serialized Global Trade Item Number - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/01\\/\\d{14}\\/21\\/([a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,20}$",
  },
  {
    id: "sscc-dl",
    label: "SSCC (Digital Link)",
    description: "Serial Shipping Container Code - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/00\\/\\d{18}$",
  },
  {
    id: "gdti-dl",
    label: "GDTI (Digital Link)",
    description: "Global Document Type Identifier - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/253\\/\\d{13}([a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,17}$",
  },
  {
    id: "grai-dl",
    label: "GRAI (Digital Link)",
    description: "Global Returnable Asset Identifier - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/8003\\/\\d{14}([a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,16}$",
  },
  {
    id: "giai-dl",
    label: "GIAI (Digital Link)",
    description: "Global Individual Asset Identifier - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/8004\\/\\d{4}(?:[a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,26}$",
  },
  {
    id: "sgln-dl",
    label: "SGLN (Digital Link)",
    description: "Serialized Global Location Number - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/414\\/\\d{13}(\\/254\\/([a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,20})?$",
  },
  {
    id: "gsrn-dl",
    label: "GSRN (Digital Link)",
    description: "Global Service Relation Number - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/8018\\/\\d{18}$",
  },
  {
    id: "gsrnp-dl",
    label: "GSRNP (Digital Link)",
    description: "Global Service Relation Number (Provider) - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/8017\\/\\d{18}$",
  },
  {
    id: "gsin-dl",
    label: "GSIN (Digital Link)",
    description: "Global Shipment Identification Number - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/402\\/\\d{17}$",
  },
  {
    id: "ginc-dl",
    label: "GINC (Digital Link)",
    description: "Global Identification Number for Consignment - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/401\\/([a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,30}$",
  },
  {
    id: "pgln-dl",
    label: "PGLN (Digital Link)",
    description: "Party Global Location Number - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/417\\/\\d{13}$",
  },
  {
    id: "cpi-dl",
    label: "CPI (Digital Link)",
    description: "Component/Part Identifier - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/8010\\/\\d{4}(?:[A-Z0-9-]|%2[3fF]){1,26}\\/8011\\/\\d{1,12}$",
  },
  {
    id: "itip-dl",
    label: "ITIP (Digital Link)",
    description: "Individual Trade Item Piece - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/01\\/\\d{14}\\/22\\/([a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,20}\\/10\\/([a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,20}\\/21\\/([a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,20}$",
  },
  {
    id: "upui-dl",
    label: "UPUI (Digital Link)",
    description: "Unit Pack Identifier - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/01\\/\\d{14}\\/235\\/([a-zA-Z0-9_\".-]|%2[a-cA-CfF15-9]|%3[a-fA-F]){1,28}$",
  },
  {
    id: "sgcn-dl",
    label: "SGCN (Digital Link)",
    description: "Serialized Global Coupon Number - GS1 Digital Link format",
    category: "gs1-dl",
    pattern:
      "^https?:\\/\\/([^\\/?#:]+)(:([0-9]*))?(\\/?[^?#]*)*\\/255\\/\\d{13}\\d{1,12}$",
  },
];

/**
 * Get all EPC identifiers
 */
export const getEpcIdentifiers = (): EpcIdentifierType[] => {
  return [...epcIdentifiers];
};

/**
 * Get EPC identifier by ID
 */
export const getEpcIdentifierById = (
  id: string
): EpcIdentifierType | undefined => {
  return epcIdentifiers.find((i) => i.id === id);
};

/**
 * Get EPC identifiers by category
 */
export const getEpcIdentifiersByCategory = (
  category: "epc-uri" | "gs1-dl"
): EpcIdentifierType[] => {
  return epcIdentifiers.filter((i) => i.category === category);
};

/**
 * Get EPC URI identifiers
 */
export const getEpcUriIdentifiers = (): EpcIdentifierType[] => {
  return getEpcIdentifiersByCategory("epc-uri");
};

/**
 * Get GS1 Digital Link identifiers
 */
export const getGs1DlIdentifiers = (): EpcIdentifierType[] => {
  return getEpcIdentifiersByCategory("gs1-dl");
};

/**
 * Location identifier IDs (for readPoint and bizLocation)
 * These are the only identifiers valid for location fields
 */
const locationIdentifierIds = ["sgln", "pgln", "sgln-dl", "pgln-dl"];

/**
 * Get location-specific identifiers (SGLN, PGLN)
 * Used for readPoint and bizLocation fields
 */
export const getLocationIdentifiers = (): EpcIdentifierType[] => {
  return epcIdentifiers.filter((i) => locationIdentifierIds.includes(i.id));
};

/**
 * Check if an identifier is a location identifier
 */
export const isLocationIdentifier = (id: string): boolean => {
  return locationIdentifierIds.includes(id);
};
