<template>
  <footer
    class="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 shadow-inner py-4"
  >
    <div class="container mx-auto px-4 flex items-center justify-center">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        &copy; {{ currentYear }}
        <a
          href="https://benelog.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-gray-700 dark:text-gray-200 hover:underline"
        >
          benelog GmbH &amp; Co. KG
        </a>
        and
        <a
          href="https://openepcis.io/"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-gray-700 dark:text-gray-200 hover:underline"
        >
          OpenEPCIS
        </a>
        | Apache 2.0 | Open Source |

        <a
          :href="`https://github.com/openepcis/openepcis-snippet-web/releases/tag/v${appVersion}`"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-gray-700 dark:text-gray-200 hover:underline"
        >
          v{{ appVersion }}
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { appVersion } = useRuntimeConfig().public;
const currentYear = new Date().getFullYear();
</script>
