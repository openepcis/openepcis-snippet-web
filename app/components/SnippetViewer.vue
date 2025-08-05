<template>
  <div v-if="snippet" class="bg-white dark:bg-gray-800 rounded-lg shadow p-2 w-full">
    <div class="space-y-3 w-full">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ snippet.title }}</h2>
        <p class="mt-2 text-gray-600 dark:text-gray-300">{{ snippet.description }}</p>
      </div>

      <div class="border-t dark:border-gray-700 pt-2">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Definitions</h3>
        <div class="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg overflow-auto h-[30%] max-h-[200px] w-full">
          <div class="json-formatter">
            <div v-for="(item, index) in formattedDefinitions" :key="index" class="json-line">
              <span 
                :class="{
                  'json-key': item.type === 'key',
                  'json-string': item.type === 'string',
                  'json-number': item.type === 'number',
                  'json-boolean': item.type === 'boolean',
                  'json-null': item.type === 'null',
                  'json-bracket': item.type === 'bracket'
                }"
                :style="{ paddingLeft: item.indent + 'rem' }"
              >{{ item.content }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t dark:border-gray-700 pt-2">
        <div class="flex justify-between items-center mb-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Source</h3>
          <button
            @click="copySource"
            class="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div class="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg overflow-auto w-full">
          <div class="json-formatter">
            <div v-for="(item, index) in formattedSource" :key="index" class="json-line">
              <span 
                :class="{
                  'json-key': item.type === 'key',
                  'json-string': item.type === 'string',
                  'json-number': item.type === 'number',
                  'json-boolean': item.type === 'boolean',
                  'json-null': item.type === 'null',
                  'json-bracket': item.type === 'bracket'
                }"
                :style="{ paddingLeft: item.indent + 'rem' }"
              >{{ item.content }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-full">
    <p class="text-gray-500 dark:text-gray-400">Select a snippet to view details</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Snippet } from '~/types'

const props = defineProps<{
  snippet?: Snippet
}>()

const copied = ref(false)

interface JsonItem {
  content: string;
  type: 'key' | 'string' | 'number' | 'boolean' | 'null' | 'bracket';
  indent: number;
}

const formattedDefinitions = computed(() => {
  if (!props.snippet?.definitions) return [];
  return formatJson(props.snippet.definitions);
});

const formattedSource = computed(() => {
  if (!props.snippet) return [];
  return formatJson(props.snippet);
});

function formatJson(obj: any): JsonItem[] {
  const result: JsonItem[] = [];
  const jsonString = JSON.stringify(obj, null, 2);
  const lines = jsonString.split('\n');
  
  lines.forEach(line => {
    const trimmedLine = line.trimStart();
    const indent = (line.length - trimmedLine.length) / 2;
    
    if (trimmedLine.startsWith('"') && trimmedLine.includes('": ')) {
      // This is a key-value pair
      const colonIndex = trimmedLine.indexOf('": ');
      const key = trimmedLine.substring(0, colonIndex + 2);
      const value = trimmedLine.substring(colonIndex + 2);
      
      result.push({
        content: key,
        type: 'key',
        indent
      });
      
      if (value) {
        // Determine value type
        let type: 'string' | 'number' | 'boolean' | 'null' | 'bracket' = 'string';
        if (value.startsWith('"')) {
          type = 'string';
        } else if (['true', 'false'].includes(value)) {
          type = 'boolean';
        } else if (value === 'null') {
          type = 'null';
        } else if (!isNaN(Number(value.replace(',', '')))) {
          type = 'number';
        }
        
        result.push({
          content: value,
          type,
          indent: indent + 0.5
        });
      }
    } else {
      // This is a bracket or standalone value
      let type: 'string' | 'number' | 'boolean' | 'null' | 'bracket' = 'bracket';
      if (trimmedLine.startsWith('"')) {
        type = 'string';
      } else if (['true', 'false'].includes(trimmedLine)) {
        type = 'boolean';
      } else if (trimmedLine === 'null') {
        type = 'null';
      } else if (!isNaN(Number(trimmedLine.replace(',', '')))) {
        type = 'number';
      }
      
      result.push({
        content: trimmedLine,
        type,
        indent
      });
    }
  });
  
  return result;
}

async function copySource() {
  if (!props.snippet) return;
  
  try {
    await navigator.clipboard.writeText(JSON.stringify(props.snippet, null, 2));
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}
</script>

<style scoped>
.json-formatter {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.json-line {
  white-space: pre;
}

.json-key {
  color: #f59e0b; /* Amber-500 */
  font-weight: bold;
}

.json-string {
  color: #10b981; /* Emerald-500 */
}

.json-number {
  color: #3b82f6; /* Blue-500 */
}

.json-boolean {
  color: #8b5cf6; /* Violet-500 */
  font-weight: bold;
}

.json-null {
  color: #ef4444; /* Red-500 */
  font-style: italic;
}

.json-bracket {
  color: #6b7280; /* Gray-500 */
}

.dark .json-key {
  color: #fbbf24; /* Amber-400 */
}

.dark .json-string {
  color: #34d399; /* Emerald-400 */
}

.dark .json-number {
  color: #60a5fa; /* Blue-400 */
}

.dark .json-boolean {
  color: #a78bfa; /* Violet-400 */
}

.dark .json-null {
  color: #f87171; /* Red-400 */
}

.dark .json-bracket {
  color: #9ca3af; /* Gray-400 */
}
</style>