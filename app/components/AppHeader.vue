<template>
  <header
    class="bg-white dark:bg-gray-800 shadow sticky top-0 z-50 w-full backdrop-blur-lg transition-colors"
  >
    <div class="flex items-center justify-between w-full h-16 px-4 md:px-8">
      <!-- Logo (left) -->
      <NuxtLink
        to="/"
        class="flex items-center group"
        title="Home"
        aria-label="Go to homepage"
      >
        <img
          :src="
            colorMode.value == 'dark'
              ? '/openepcis-snippet-logo-white.svg'
              : '/openepcis-snippet-logo-black.svg'
          "
          alt="OpenEPCIS Logo"
          class="h-15 w-15 block transition-transform group-hover:scale-105"
          draggable="false"
        />

        <h2 class="text-openepcis font-extrabold text-xl">
          EPCIS Event Sentry
        </h2>
      </NuxtLink>

      <!-- Center Navigation Menu for Desktop -->
      <nav class="hidden lg:flex flex-1 justify-center">
        <UNavigationMenu
          color="secondary"
          highlight
          highlight-color="secondary"
          :items="navItems"
          :ui="{
            root: 'relative flex flex-row gap-4',
            item: 'min-w-0 py-2',
            link: 'group relative w-full flex items-center gap-2 py-3 px-3 font-medium',
            linkLeadingIcon: 'shrink-0 text-openepcis-primary',
          }"
        />
      </nav>

      <ColorModeButton />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";

const colorMode = useColorMode();

const navItems = ref([
  {
    label: "Snippet Search",
    icon: "heroicons-outline:search",
    to: "/",
  },
  {
    label: "Snippet Generator",
    icon: "mdi:settings",
    to: "/snippet-generator",
  },
]);
</script>
