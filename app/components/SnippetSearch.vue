<template>
  <div class="relative w-full h-full flex flex-col">
    <div class="flex-1">
      <input
        v-model="searchText"
        type="text"
        placeholder="Search snippets..."
        class="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @input="handleSearch"
      />
      <div 
        v-if="suggestions.length > 0" 
        class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto"
      >
        <div class="divide-y divide-gray-200 dark:divide-gray-600">
          <div 
            v-for="snippet in suggestions" 
            :key="snippet.$id"
            class="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-150"
            @click="selectSnippet(snippet)"
          >
            <h3 class="font-medium text-gray-900 dark:text-white">{{ snippet.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-300 line-clamp-2">{{ snippet.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-auto pt-4">
      <button 
        @click="resetAll"
        class="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-150 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Snippet } from '~/types'

const config = useRuntimeConfig()
const searchText = ref('')
const suggestions = ref<Snippet[]>([])
const debounceTimeout = ref<NodeJS.Timeout>()

const emit = defineEmits<{
  (e: 'select', snippet: Snippet): void
}>()

async function fetchSuggestions() {
  if (searchText.value.length < 3) {
    suggestions.value = []
    return
  }

  try {
    const response = await fetch(`${config.public.snippetApiUrl}/snippet?searchText=${encodeURIComponent(searchText.value)}`)
    if (!response.ok) throw new Error('Failed to fetch suggestions')
    const data = await response.json()
    suggestions.value = data.slice(0, 10)
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    suggestions.value = []
  }
}

function handleSearch() {
  if (debounceTimeout.value) clearTimeout(debounceTimeout.value)
  debounceTimeout.value = setTimeout(fetchSuggestions, 300)
}

function selectSnippet(snippet: Snippet) {
  emit('select', snippet)
  suggestions.value = []
  searchText.value = ''
}

function resetAll() {
  searchText.value = ''
  suggestions.value = []
  emit('select', undefined)
}
</script>