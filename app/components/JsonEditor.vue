<template>
  <div
    class="w-full h-full min-h-[260px] md:min-h-[320px] lg:min-h-[380px] overflow-hidden rounded-xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-colors duration-200"
    aria-label="JSON code editor container"
  >
    <div
      class="flex items-center justify-between gap-2 px-3 md:px-4 py-2 border-b border-zinc-200/80 dark:border-zinc-800/80"
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

    <!-- Editor area -->
    <div
      class="w-full h-full min-h-[60vh] max-h-[70vh] md:max-h-[72vh] lg:max-h-[74vh] overflow-auto rounded-b-xl"
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
// Basic vue imports
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
import { json as jsonLang, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";

// CodeMirror Theme
import { oneDark } from "@codemirror/theme-one-dark";

// CodeMirror Types
import type { Extension } from "@codemirror/state";

// Props for the CodeMirror Editor
const props = defineProps<{
  modelValue?: string;
  language?: string;
  isReadOnly?: boolean;
  placeholder?: string;
  title?: string;
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

// Build all the extensions for the CodeMirror
const cmExtensions = computed<Extension[]>(() => {
  const ex: Extension[] = [
    // essential set-up
    minimalSetup,
    lineNumbers(),
    highlightActiveLineGutter(),

    // language support
    jsonLang(),

    //linting and basic JSON syntax
    linter(jsonParseLinter()),
    lintGutter(),

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
</style>
