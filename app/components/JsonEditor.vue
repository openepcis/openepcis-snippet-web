<template>
  <div class="w-full h-full min-h-[250px] overflow-scroll rounded-lg">
    <CodeMirror
      v-model="internalValue"
      :extensions="cmExtensions"
      :placeholder="placeholder"
      :title="title"
      :basic-setup="false"
      :dark="isDark"
      @ready="handleReady"
      @update="emitCodeUpdate"
    />
  </div>
</template>

<script setup lang="ts">
// Basic vue imports
import { ref, watch, computed, shallowRef } from "vue";

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

// Change the themes based on the selected colorMode
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

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

    // dark theme for dark colorMode
    ...(isDark.value ? [oneDark] : []),

    // should be readOnly or not
    ...(props.isReadOnly ? [EditorState.readOnly.of(true)] : []),

    // ensure the line wrapping for appearance
    EditorView.lineWrapping,
  ];

  return ex;
});

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
}

:deep(.cm-scroller) {
  height: 100%;
}

:deep(.cm-lineNumbers .cm-gutterElement) {
  color: var(--color-gray-400);
}
</style>
