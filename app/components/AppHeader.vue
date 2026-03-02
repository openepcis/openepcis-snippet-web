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
              ? '/logo-white-circle.svg'
              : '/logo-black-circle.svg'
          "
          alt="EPCIS Profile Builder Logo"
          class="h-12 w-12 block transition-transform group-hover:scale-105"
          draggable="false"
        />

        <h2
          class="hidden md:block pt-2 font-extrabold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-400 bg-clip-text text-transparent"
        >
          EPCIS Profile Checker
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

      <!-- Right side actions -->
      <div class="flex items-center gap-2">
        <!-- GitHub repo link -->
        <UButton
          to="https://github.com/openepcis/openepcis-event-sentry"
          target="_blank"
          rel="noopener noreferrer"
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          size="lg"
          aria-label="View source on GitHub"
          title="View source on GitHub"
        />

        <!-- Color mode switcher -->
        <UColorModeButton>
          <template #fallback>
            <USkeleton class="h-9 w-9 rounded-full text-openepcis-primary" />
          </template>
        </UColorModeButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";

const colorMode = useColorMode();

const navItems = ref([
  {
    label: "Home",
    icon: "mdi:home-outline",
    to: "/",
  },
  {
    label: "Profile Builder",
    icon: "mdi:file-cog-outline",
    to: "/profile-builder",
  },
  {
    label: "Event Validator",
    icon: "mdi:file-check-outline",
    to: "/event-validator",
  },
  {
    label: "Snippet Search",
    icon: "mdi:text-box-search-outline",
    to: "/snippet-search",
  },
]);
</script>
