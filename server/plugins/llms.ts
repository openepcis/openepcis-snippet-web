export default defineNitroPlugin((nitroApp) => {
  // Hook to add detailed content to /llms-full.txt
  nitroApp.hooks.hook(
    "llms:generate:full",
    (event: any, options: any, contents: string[]) => {
      contents.push(`## Overview

EPCIS (Electronic Product Code Information Services) Profile Checker is an open-source web application for GS1 EPCIS supply chain traceability and visibility. It provides three browser-based tools: EPCIS Profile Builder, EPCIS Event/Document Validator, and EPCIS Snippet Search. All processing happens client-side — no data is sent to external servers or stored on external servers.

Built with Nuxt 4.x, Vue.js, and Tailwind CSS. Licensed under Apache 2.0.

## EPCIS Profile Builder

The Profile Builder lets you visually create EPCIS JSON Schema profiles without writing JSON by hand.

### What it does
- Generates valid JSON Schema from a visual field configuration interface
- Supports both document-level and event-level schema targets
- Organizes fields into different dimensions such as What, When, Where, Why, How, Generic, Document, Other, and Error Declaration
- Real-time JSON Schema preview that updates as you configure fields

### Supported field types
- **EPC Lists** — arrays of EPC identifiers (SGTIN, SSCC, GDTI, GRAI, LGTIN, etc.) in URN or GS1 Digital Link format
- **Single EPC** — single EPC identifier for parentID
- **Quantity Lists** — class-level identifiers with quantity and unit of measure
- **Locations** — readPoint and bizLocation with SGLN identifier support
- **Sensor Elements** — sensor metadata and reports with 71 measurement types (temperature, humidity, speed, etc.)
- **Business Transactions** — transaction type and value pairs
- **Source/Destination Lists** — source and destination entries
- **Enums** — standard GS1 CBV values for bizStep, disposition, action
- **URIs and URI Arrays** — eventID, correctiveEventIDs with UUID and event-hash validation
- **Persistent Disposition** — set/unset disposition arrays
- **Extensions** — custom namespace and element definitions
- **Context Lists** — JSON-LD @context URIs
- **String Constraints** — pattern or exact value matching
- **Certification Info** — certification data fields
- **Datetime** — ISO 8601 date-time validation
- **Timezone** — timezone offset validation

### User actions
- Add, edit, and remove fields organized by dimension
- Import existing profiles from JSON files
- Export profiles with custom filenames
- Reset all configurations
- Manual JSON Schema editing with sync detection

## Event Validator

The Event Validator checks EPCIS JSON/JSON-LD events or documents against JSON Schema profiles.

### What it does
- Side-by-side CodeMirror editors: schema on the left, event data on the right
- Real-time validation with detailed error reporting
- Loads pre-built profiles from the openepcis-event-sentry GitHub repository
- Floating validation panel with expandable error details

### JSON Schema draft support
- JSON Schema Draft-06
- JSON Schema Draft-07 (default)
- JSON Schema 2019-09
- JSON Schema 2020-12

Auto-detects the draft version from the \`$schema\` field in the profile.

### Validation features
- Remote schema reference resolution (loads external \`$ref\` URLs)
- Format validation (via ajv-formats)
- Error reporting includes: JSON Pointer path, schema path, error keyword, and human-readable message
- Detects JSON syntax errors separately from schema validation errors
- Debounced validation (1 second delay) for smooth editing
- Color-coded error keywords for quick scanning

## Snippet Search

Snippet Search is a searchable library of reusable JSON Schema components for EPCIS and supply chain applications.

### What it does
- Full-text search across a library of JSON Schema snippets
- Search-as-you-type with 300ms debounce (minimum 3 characters)
- Displays snippet metadata: title, JSON Schema version, creation date, schema URI
- Read-only code viewer for the full schema
- Download snippets as JSON files

### Data source
- Connects to the OpenEPCIS Snippet API (configurable backend)
- Production API: https://api.epcis.cloud
- Search endpoint: \`/snippet?searchText={query}\`

## Technical Details

### Standards supported
- **EPCIS** — GS1 Electronic Product Code Information Services standard for supply chain event data
- **CBV 2.0** — GS1 Core Business Vocabulary for standard business steps, dispositions, and actions
- **JSON Schema** — Drafts 06, 07, 2019-09, and 2020-12
- **JSON-LD** — Linked Data format for EPCIS documents
- **GS1 Digital Link** — URI-based product identification

### EPCIS dimensions
EPCIS events capture supply chain data across these dimensions:
1. **What** — which products/items (EPCs, quantities)
2. **When** — timestamps (eventTime, recordTime)
3. **Where** — locations (readPoint, bizLocation)
4. **Why** — business context (bizStep, disposition)
5. **How** — sensor and IoT data
6. **Generic** — event metadata (eventType, action, eventID)
7. **Document** — document-level fields (@context, schemaVersion)
8. **Other** — extensions and ILMD (Instance/Lot Master Data)
9. **Error Declaration** — error correction information

### EPC identifier formats
Supports both URN and GS1 Digital Link formats:
- SGTIN (Serialized Global Trade Item Number)
- SSCC (Serial Shipping Container Code)
- GRAI (Global Returnable Asset Identifier)
- GDTI (Global Document Type Identifier)
- LGTIN (Lot-level GTIN)
- SGLN (Global Location Number with extension)
- GSIN (Global Shipment Identification Number)
- GINC (Global Identification Number for Consignment)

### Architecture
- **Frontend-only processing** — all validation and schema generation runs in the browser
- **GitHub as data source** — profiles and EPC identifiers loaded from openepcis-event-sentry repository
- **Caching** — sessionStorage + in-memory caching with 30-minute TTL for profiles, 5-minute for identifiers
- **Code editor** — CodeMirror 6 with JSON syntax highlighting, linting, bracket matching, code folding, and search

## Links

- Website: https://profile-checker.openepcis.io
- Source code: https://github.com/openepcis/openepcis-event-sentry
- OpenEPCIS: https://openepcis.io
- Organization: https://www.benelog.com
- GS1 EPCIS Standard: https://www.gs1.org/standards/epcis`);
    },
  );
});
