<template>
  <div
    class="w-full h-full min-h-[260px] md:min-h-[320px] lg:min-h-[380px] overflow-hidden rounded-xl bg-gray-200/70 dark:bg-zinc-800/60 backdrop-blur-sm shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-colors duration-200"
    aria-label="JSON code editor container"
  >
    <div
      class="flex items-center justify-between gap-2 px-3 md:px-4 py-2 border-b border-gray-500/80 dark:border-zinc-800/80"
    >
      <div class="flex items-center gap-2">
        <UBadge color="gray" variant="soft" class="hidden sm:inline-flex">
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
            color="gray"
            variant="soft"
            icon="i-mdi-code-braces"
            @click="formatNow"
          />
        </UTooltip>

        <UTooltip text="Copy to clipboard">
          <UButton
            size="xs"
            color="gray"
            variant="soft"
            icon="i-mdi-content-copy"
            @click="copyEditor"
          />
        </UTooltip>
      </div>
    </div>

    <div
      class="w-full h-full min-h-[70vh] max-h-[70vh] md:max-h-[72vh] lg:max-h-[74vh] overflow-auto rounded-b-xl"
    >
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
  EditorView as CMEditorView,
} from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { minimalSetup } from "codemirror";

// CodeMirror language and linting
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";

// CodeMirror Theme
import { oneDark } from "@codemirror/theme-one-dark";

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

// Theme extension to control font size and scrollbar behaviour
const fontSizeTheme = EditorView.theme({
  "&": {
    fontSize: "15px",
    lineHeight: "2",
  },
  ".cm-scroller": {
    overflow: "auto",
    height: "100%",
  },
  ".cm-gutters": {
    fontSize: "15px",
    lineHeight: "2",
  },
});

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
    for (const d of diags) {
      if (d.severity === "error" && typeof d.from === "number") {
        const line = doc.lineAt(d.from);
        b.add(line.from, line.from, lineErrorDeco);
      }
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

      // Helper to get the node for a given pointer key (value or key position)
      const pickNode = (k: string) => {
        const entry = k in pointers ? pointers[k] : undefined;
        return entry?.value ?? entry?.key; // we only want the object that has .pos
      };

      // Normalize incoming path: AJV root may be "", undefined, or "/"
      const key = path && path !== "/" ? path : "";

      // Try exact path first, then its parent (useful for array indices like "/items/0")
      let node = pickNode(key);
      if (!node) {
        const parent = key.split("/").slice(0, -1).join("/");
        node = pickNode(parent || "");
      }

      // If we still don't have a valid node/pos, fall back to first line safely
      const rawLine = Number(node?.pos?.line);
      if (!Number.isFinite(rawLine)) {
        const l1 = doc.line(1);
        return { from: l1.from, to: l1.to };
      }

      // json-source-map is 0-based; CodeMirror's doc.line is 1-based
      let lineNo = rawLine + 1;

      // Clamp between 1 and the number of lines to avoid range errors
      if (lineNo < 1) lineNo = 1;
      if (lineNo > doc.lines) lineNo = doc.lines;

      const ln = doc.line(lineNo);
      return { from: ln.from, to: ln.to };
    };

    // Build diagnostics array (filter to valid-ish entries to be safe)
    const rawErrors = Array.isArray(props.schemaErrors)
      ? props.schemaErrors
      : [];
    const diags: Diagnostic[] = rawErrors.map((e: any) => {
      const range = toLineRange(e?.path ?? e?.instancePath ?? "");
      return {
        from: range.from,
        to: range.to,
        severity: "error",
        message: `[${e?.keyword ?? "error"}] ${e?.message ?? "Invalid value"}`,
      } as Diagnostic;
    });

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

    // language support
    json(),

    //linting and basic JSON syntax
    linter(jsonParseLinter()),
    lintGutter(),

    // Enable for displaying the error highlight
    errorLineField,

    // indentation
    keymap.of([indentWithTab, ...defaultKeymap]),

    // control themes and styles
    fontSizeTheme,

    // dark theme for dark colorMode
    ...(isDark.value ? [oneDark] : []),

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
.w-full.h-full {
  height: 100%;
  width: 100%;
  display: block;
}

:deep(.cm-editor) {
  height: 100%;
  outline: none !important;
  border: none !important;
  transition: all 0.2s;
  min-height: 100%;
}

:deep(.cm-scroller) {
  height: 100%;
  overflow: auto;
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
</style>
