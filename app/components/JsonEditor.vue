<template>
  <div
    class="w-full flex flex-col h-[75vh] md:h-[77vh] lg:h-[79vh] overflow-hidden rounded-xl bg-gray-200/70 dark:bg-zinc-800/60 backdrop-blur-sm shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-colors duration-200"
    aria-label="JSON code editor container"
  >
    <div
      class="flex-shrink-0 flex items-center justify-between gap-2 px-3 md:px-4 py-2 border-b border-gray-500/80 dark:border-zinc-800/80"
    >
      <div class="flex items-center gap-2">
        <UBadge color="neutral" variant="soft" class="hidden sm:inline-flex">
          {{ title || "" }}
        </UBadge>

        <span
          class="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[40ch]"
        >
          {{ placeholder || "" }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 md:gap-2">
        <UTooltip text="Pretty format (⌘/Ctrl + Shift + F)">
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="mdi:code-json"
            @click="formatNow"
          />
        </UTooltip>

        <UTooltip text="Copy to clipboard">
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="mdi:content-copy"
            @click="copyEditor"
          />
        </UTooltip>

        <UTooltip text="Download ">
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="mdi:download"
            @click="downloadEditor"
          />
        </UTooltip>
      </div>
    </div>

    <div class="flex-1 min-h-0 rounded-b-xl">
      <CodeMirror
        v-model="internalValue"
        :extensions="cmExtensions"
        :basic-setup="false"
        :dark="isDark"
        @ready="handleReady"
        @update="emitCodeUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, shallowRef } from "vue";
import { useClipboard } from "@vueuse/core";

// CodeMirror core imports
import CodeMirror from "vue-codemirror6";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  type ViewUpdate,
  lineNumbers,
  highlightActiveLineGutter,
  highlightActiveLine,
  EditorView as CMEditorView,
} from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { minimalSetup } from "codemirror";

// CodeMirror language and linting
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";

// CodeMirror bracket matching and code folding
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
} from "@codemirror/language";

// CodeMirror search
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";

// CodeMirror auto-completion
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";

// CodeMirror Themes
import { oneDark } from "@codemirror/theme-one-dark";
import { githubLight } from "@fsegurai/codemirror-theme-github-light";

// CodeMirror Types
import type { Extension } from "@codemirror/state";

// Lint API: push diagnostics & listen to changes
import {
  setDiagnostics,
  setDiagnosticsEffect,
  type Diagnostic,
} from "@codemirror/lint";
// Decorations to full-line-highlight errors
import { Decoration, type DecorationSet } from "@codemirror/view";
import { StateField, RangeSetBuilder } from "@codemirror/state";
// Map AJV instancePath → character positions
import { parse as parseWithPointers } from "json-source-map";

// Props for the CodeMirror Editor
const props = defineProps<{
  modelValue?: string;
  language?: string;
  isReadOnly?: boolean;
  placeholder?: string;
  title?: string;
  schemaErrors?: Array<any>;
  downloadFileName?: string; // Custom filename for download (default: "document.json")
}>();

// Events emited by component
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (
    e: "editorDidMount",
    instance: { view: EditorView; state: EditorState }
  ): void;
}>();

// local values
const internalValue = ref(props.modelValue ?? "");
const view = shallowRef<EditorView>(); // Store the CodeMirror view instance

// Watch for modelValue changes and update
watch(
  () => props.modelValue,
  (v) => {
    // Avoid recursion if the change came from the editor itself
    if (v != internalValue.value) internalValue.value = v ?? "";
  }
);

// Emit the code update
const emitCodeUpdate = (viewUpdate: ViewUpdate) => {
  if (viewUpdate.docChanged) {
    emit("update:modelValue", viewUpdate.state.doc.toString());
  }
};

// After successful mount emit the editor instance for external control
const handleReady = (payload: { view: EditorView; state: EditorState }) => {
  view.value = payload.view;
  emit("editorDidMount", payload);
};

// Copy the data based on selection
const { copy } = useClipboard();
const copyEditor = () => {
  const text = view.value?.state.doc.toString() ?? internalValue.value ?? "";
  if (text) copy(text);
};

// Download editor content as a file
const downloadEditor = () => {
  const text = view.value?.state.doc.toString() ?? internalValue.value ?? "";
  if (!text.trim()) return; // Don't download empty content

  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = props.downloadFileName || "document.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Format the data based on selected editor
const formatNow = () => {
  if (view.value) {
    // reuse your existing formatter
    formatJSON(view.value);
  }
};

// Format the JSON data in CodeMirror
const formatJSON = (view: EditorView) => {
  const content = view.state.doc.toString();
  try {
    const formatted = JSON.stringify(JSON.parse(content), null, 4);

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: formatted,
      },
      selection: { anchor: 0 },
    });
    return true;
  } catch (e) {
    console.error("JSON formatting failed:", e);
    return false;
  }
};

// Change the themes based on the selected colorMode
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

// Theme extension to control font size, scrollbar behaviour, and enhanced styling
const fontSizeTheme = EditorView.theme({
  "&": {
    fontSize: "14px",
    lineHeight: "1.7",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
  },
  ".cm-scroller": {
    overflow: "auto",
    height: "100%",
  },
  ".cm-gutters": {
    fontSize: "13px",
    lineHeight: "1.7",
    borderRight: "1px solid rgba(128, 128, 128, 0.15)",
    backgroundColor: "transparent",
  },
  // Bracket matching highlight
  "&.cm-focused .cm-matchingBracket": {
    backgroundColor: "rgba(59, 130, 246, 0.25)",
    outline: "1px solid rgba(59, 130, 246, 0.5)",
    borderRadius: "2px",
  },
  ".cm-nonmatchingBracket": {
    backgroundColor: "rgba(239, 68, 68, 0.25)",
    outline: "1px solid rgba(239, 68, 68, 0.5)",
  },
  // Active line highlighting
  ".cm-activeLine": {
    backgroundColor: "rgba(59, 130, 246, 0.06)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  // Fold gutter styling
  ".cm-foldGutter": {
    width: "14px",
  },
  ".cm-foldGutter .cm-gutterElement": {
    cursor: "pointer",
    color: "rgba(128, 128, 128, 0.5)",
    transition: "color 0.15s ease",
    fontFamily: "system-ui, sans-serif",
    fontSize: "10px",
  },
  ".cm-foldGutter .cm-gutterElement:hover": {
    color: "rgba(59, 130, 246, 0.9)",
  },
  // Selection styling
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  // Cursor styling
  ".cm-cursor": {
    borderLeftColor: "rgba(59, 130, 246, 0.9)",
    borderLeftWidth: "2px",
  },
  // Search match highlight
  ".cm-searchMatch": {
    backgroundColor: "rgba(251, 191, 36, 0.3)",
    borderRadius: "2px",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "rgba(251, 191, 36, 0.5)",
  },
  // Selection matches (when selecting text)
  ".cm-selectionMatch": {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: "2px",
  },
});

// Custom JSON linter that skips validation when content is empty
const emptyAwareJsonLinter = () => {
  const baseLinter = jsonParseLinter();
  return (view: EditorView) => {
    const content = view.state.doc.toString().trim();
    // Skip validation if content is empty or only whitespace
    if (!content) {
      return [];
    }
    return baseLinter(view);
  };
};

// Full-line highlight for diagnostics
const lineErrorDeco = Decoration.line({
  class: "cm-fullLineDiagnosticHighlight",
});

const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, tr) {
    let diags: Diagnostic[] | undefined;
    for (const eff of tr.effects) {
      if (eff.is(setDiagnosticsEffect)) diags = eff.value as Diagnostic[];
    }
    if (!diags) return value;

    const b = new RangeSetBuilder<Decoration>();
    const doc = tr.state.doc;

    // Collect one decoration per line and sort by position to satisfy RangeSetBuilder
    const lineFroms = new Set<number>();
    for (const d of diags) {
      if (d?.severity === "error" && typeof d?.from === "number") {
        const line = doc.lineAt(d.from);
        lineFroms.add(line.from);
      }
    }

    const sortedFroms = Array.from(lineFroms).sort((a, b) => a - b);
    for (const from of sortedFroms) {
      b.add(from, from, lineErrorDeco);
    }
    return b.finish();
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Build diagnostics from AJV errors + json-source-map pointers
watch(
  () => [props.schemaErrors, internalValue.value],
  () => {
    // Return if editor is not ready
    if (!view.value) return;

    // empty state: clear any previous markers
    if (!props.schemaErrors || props.schemaErrors.length === 0) {
      view.value.dispatch({ effects: setDiagnosticsEffect.of([]) });
      return;
    }

    // Parse current JSON text safely with pointers
    let pointers: Record<string, any> = {};
    try {
      const { data, pointers: p } = parseWithPointers(
        internalValue.value || ""
      );
      pointers = p || {};
    } catch {
      // If JSON isn't parseable, don't crash; leave diagnostics to jsonParseLinter
      view.value.dispatch({ effects: setDiagnosticsEffect.of([]) });
      return;
    }

    // Helper: take instancePath → full-line range
    const toLineRange = (path: string): { from: number; to: number } => {
      const doc = view.value!.state.doc;

      // Normalize incoming path: AJV root may be "", undefined, or "/"
      const normalizedPath = !path || path === "/" ? "" : path;

      // Helper to extract line number from a pointer entry
      const getLineFromPointer = (pointerKey: string): number | null => {
        const entry = pointers[pointerKey];
        if (!entry) return null;

        // json-source-map structure: entry has .value, .key, .valueEnd
        // Each of these has { line, column, pos }
        // Prefer .value for the actual value position, fallback to .key
        const node = entry.value || entry.key;
        if (!node) return null;

        // Extract line number (0-based in json-source-map)
        const line = typeof node.line === "number" ? node.line : null;
        return line;
      };

      // Try to find the line number using multiple strategies
      let lineNumber: number | null = null;

      // Strategy 1: Try exact path match
      lineNumber = getLineFromPointer(normalizedPath);

      // Strategy 2: If not found and path has segments, try parent paths
      if (lineNumber === null && normalizedPath) {
        const segments = normalizedPath.split("/").filter(Boolean);

        // Try removing last segment (useful for missing properties, array items)
        for (let i = segments.length - 1; i >= 0 && lineNumber === null; i--) {
          const parentPath = "/" + segments.slice(0, i).join("/");
          lineNumber = getLineFromPointer(parentPath);
        }
      }

      // Strategy 3: Try root if we still don't have a match
      if (lineNumber === null) {
        lineNumber = getLineFromPointer("");
      }

      // Strategy 4: Final fallback - use line 1 (but this should rarely happen)
      if (lineNumber === null) {
        console.warn(
          `[JsonEditor] Could not map error path "${path}" to line number. Available pointers:`,
          Object.keys(pointers)
        );
        const l1 = doc.line(1);
        return { from: l1.from, to: l1.to };
      }

      // Convert from 0-based (json-source-map) to 1-based (CodeMirror)
      let cmLineNumber = lineNumber + 1;

      // Clamp to valid range
      if (cmLineNumber < 1) cmLineNumber = 1;
      if (cmLineNumber > doc.lines) cmLineNumber = doc.lines;

      const line = doc.line(cmLineNumber);
      return { from: line.from, to: line.to };
    };

    // Build diagnostics array (filter to valid-ish entries to be safe)
    const rawErrors = Array.isArray(props.schemaErrors)
      ? props.schemaErrors
      : [];

    // Debug: log available pointers for troubleshooting
    console.log("[JsonEditor] Available JSON pointers:", Object.keys(pointers));
    console.log(
      "[JsonEditor] Processing errors:",
      rawErrors.map((e: any) => ({
        path: e?.path,
        instancePath: e?.instancePath,
        keyword: e?.keyword,
      }))
    );

    const diags: Diagnostic[] = rawErrors
      .map((e: any) => {
        // Use 'path' first (from profile-checker normalization), fallback to instancePath
        const errorPath = e?.path ?? e?.instancePath ?? "";
        const range = toLineRange(errorPath);

        // Build a clear error message
        const keyword = e?.keyword ?? "error";
        const message = e?.message ?? "Invalid value";
        const fullMessage = `[${keyword}] ${message}`;

        console.log(
          `[JsonEditor] Mapped error "${fullMessage}" at path "${errorPath}" to line range:`,
          range
        );

        return {
          from: range.from,
          to: range.to,
          severity: "error",
          message: fullMessage,
        } as Diagnostic;
      })
      .filter((d) => d.from !== undefined && d.to !== undefined); // Filter invalid diagnostics

    // Push diagnostics (triggers gutter icons, tooltips, and our errorLineField)
    view.value.dispatch({ effects: setDiagnosticsEffect.of(diags) });
  },
  { immediate: true, deep: true }
);

// Build all the extensions for the CodeMirror
const cmExtensions = computed<Extension[]>(() => {
  const ex: Extension[] = [
    // essential set-up
    minimalSetup,
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),

    // Bracket matching - highlights matching brackets
    bracketMatching(),

    // Code folding for JSON objects/arrays
    foldGutter({
      openText: "▾",
      closedText: "▸",
    }),

    // Auto-close brackets and quotes
    closeBrackets(),

    // Search highlighting - highlights all matches when selecting text
    highlightSelectionMatches(),

    // Auto-indent on input
    indentOnInput(),

    // language support
    json(),

    // linting and basic JSON syntax (skip validation when empty)
    linter(emptyAwareJsonLinter()),
    lintGutter(),

    // Enable for displaying the error highlight
    errorLineField,

    // Keymaps - bracket close, fold, search, indent, and default
    keymap.of([
      ...closeBracketsKeymap,
      ...foldKeymap,
      ...searchKeymap,
      indentWithTab,
      ...defaultKeymap,
    ]),

    // control themes and styles
    fontSizeTheme,

    // Theme based on colorMode
    ...(isDark.value ? [oneDark] : [githubLight]),

    // should be readOnly or not
    ...(props.isReadOnly ? [EditorState.readOnly.of(true)] : []),

    // ensure the line wrapping for appearance
    EditorView.lineWrapping,
  ];

  return ex;
});

// Expose the view instance for external control
defineExpose({
  editorView: view,
  format: () => {
    if (view.value) formatJSON(view.value);
  },
});
</script>

<style scoped>
/* Ensure vue-codemirror wrapper fills container */
:deep(.vue-codemirror) {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

:deep(.cm-editor) {
  height: 100% !important;
  flex: 1 !important;
  outline: none !important;
  border: none !important;
  transition: all 0.2s;
  display: flex !important;
  flex-direction: column !important;
}

:deep(.cm-scroller) {
  flex: 1 !important;
  overflow: auto !important;
  overscroll-behavior: contain;
}

:deep(.cm-lineNumbers .cm-gutterElement) {
  color: var(--color-gray-400);
}

:deep(.cm-scroller::-webkit-scrollbar) {
  width: 10px;
  height: 10px;
}

:deep(.cm-scroller::-webkit-scrollbar-thumb) {
  background-color: rgba(120, 120, 120, 0.35);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}

/* Full-line error highlight: readable in both themes */
:deep(.cm-fullLineDiagnosticHighlight) {
  display: block;
  background: rgba(239, 68, 68, 0.1) !important; /* red-500/10 */
  border-left: 3px solid rgba(239, 68, 68, 0.9) !important;
  padding-left: 6px;
  border-radius: 6px;
}

/* Make the lint tooltip a bit clearer */
:deep(.cm-tooltip.cm-lint-tooltip) {
  max-width: 420px;
  border: 1px solid rgba(239, 68, 68, 0.35) !important;
  border-radius: 10px;
  backdrop-filter: blur(6px);
}

/* Fold placeholder styling - shown when code is folded */
:deep(.cm-foldPlaceholder) {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  padding: 0 6px;
  margin: 0 4px;
  color: rgba(59, 130, 246, 0.8);
  font-size: 0.75em;
  font-family: system-ui, sans-serif;
  cursor: pointer;
}

:deep(.cm-foldPlaceholder:hover) {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

/* Search panel styling */
:deep(.cm-panels) {
  background: rgba(245, 245, 245, 0.95);
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}

.dark :deep(.cm-panels) {
  background: rgba(39, 39, 42, 0.95);
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}

:deep(.cm-panel.cm-search) {
  padding: 8px 12px;
}

:deep(.cm-panel.cm-search input) {
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.3);
  padding: 4px 8px;
  font-size: 13px;
  background: white;
}

.dark :deep(.cm-panel.cm-search input) {
  background: rgba(63, 63, 70, 0.8);
  border-color: rgba(128, 128, 128, 0.3);
  color: white;
}

:deep(.cm-panel.cm-search input:focus) {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

:deep(.cm-panel.cm-search button) {
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid rgba(128, 128, 128, 0.2);
  cursor: pointer;
  transition: all 0.15s ease;
}

:deep(.cm-panel.cm-search button:hover) {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

:deep(.cm-panel.cm-search label) {
  font-size: 12px;
  color: rgba(128, 128, 128, 0.9);
}

/* General tooltip improvements */
:deep(.cm-tooltip) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(128, 128, 128, 0.2);
}

/* Autocomplete styling */
:deep(.cm-tooltip-autocomplete) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.cm-tooltip-autocomplete > ul) {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
}

:deep(.cm-tooltip-autocomplete > ul > li) {
  padding: 4px 12px;
}

:deep(.cm-tooltip-autocomplete > ul > li[aria-selected]) {
  background: rgba(59, 130, 246, 0.15);
  color: inherit;
}

/* Gutter hover effect */
:deep(.cm-gutters) {
  cursor: default;
}

:deep(.cm-gutter-lint .cm-gutterElement) {
  padding: 0 2px;
}
</style>
