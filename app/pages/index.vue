<template>
  <div class="flex h-[calc(100vh-17vh)]">
    <div class="w-1/4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <SnippetSearch @select="selectedSnippet = $event" />
    </div>

    <div class="w-px mx-4 bg-gray-200 dark:bg-gray-700 self-stretch"></div>

    <div
      class="w-3/4 flex-1 dark:bg-gray-900 overflow-auto h-full"
      :class="{
        'overflow-visible': !selectedSnippet,
        'overflow-auto': selectedSnippet,
      }"
    >
      <SnippetViewer :snippet="selectedSnippet" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Snippet } from "~/types/snippet";

const selectedSnippet = ref<Snippet>();
</script>
