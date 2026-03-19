<template>
  <div class="min-h-[calc(100vh-8rem)]">
    <!-- Hero Section with subtle gradient background -->
    <div
      class="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20"
    >
      <!-- Decorative background elements -->
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20"
      />
      <div
        class="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full blur-3xl"
      />
      <div
        class="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-sky-200/30 dark:from-blue-900/20 dark:to-sky-900/20 rounded-full blur-3xl"
      />

      <div class="container mx-auto px-4 py-16 md:py-24 max-w-6xl relative">
        <!-- Hero Content -->
        <div class="text-center mb-16">
          <h1
            class="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-400 bg-clip-text text-transparent"
          >
            EPCIS Profile Checker
          </h1>

          <p
            class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-6xl mx-auto leading-relaxed text-justify"
          >
            Speed up traceability and visibility system implementations
            worldwide. Create robust EPCIS profiles and validate event data to
            improve data quality. Build custom EPCIS profiles, validate events
            against them, and search existing snippets. Get started here:
          </p>
        </div>

        <!-- Tool Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NuxtLink
            v-for="tool in tools"
            :key="tool.path"
            :to="tool.path"
            class="block group"
          >
            <UCard
              class="h-full transition-all duration-300 hover:shadow-2xl hover:shadow-current/10 hover:-translate-y-1 cursor-pointer border-0 bg-slate-200/80 dark:bg-gray-800/80 backdrop-blur-sm"
              :ui="{
                root: 'h-full ring-1 ring-gray-200/50 dark:ring-gray-700/50 group-hover:ring-2',
                body: 'flex flex-col h-full p-6',
              }"
              :class="tool.ringColor"
            >
              <!-- SVG Image Card Layout (for cards with svgImageLight/Dark) -->
              <template v-if="tool.svgImageLight && tool.svgImageDark">
                <!-- Title -->
                <h2
                  class="text-2xl font-bold mb-4 text-blue-500 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300 text-center"
                  :class="tool.titleHoverGradient"
                >
                  {{ tool.title }}
                </h2>

                <!-- SVG Images - CSS-based dark/light mode switching -->
                <div class="flex justify-center mb-4">
                  <!-- Light mode SVG -->
                  <img
                    :src="tool.svgImageLight"
                    :alt="tool.title"
                    class="h-32 w-auto transition-transform duration-300 group-hover:scale-105 dark:hidden"
                  />
                  <!-- Dark mode SVG -->
                  <img
                    :src="tool.svgImageDark"
                    :alt="tool.title"
                    class="h-32 w-auto transition-transform duration-300 group-hover:scale-105 hidden dark:block"
                  />
                </div>

                <!-- Description -->
                <p
                  class="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed text-center"
                >
                  {{ tool.description }}
                </p>
              </template>

              <!-- Icon Card Layout (default) -->
              <template v-else>
                <!-- Icon with gradient background -->
                <div class="mb-5">
                  <div
                    class="inline-flex p-4 rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                    :class="tool.gradientBg"
                  >
                    <UIcon :name="tool.icon" class="w-8 h-8 text-white" />
                  </div>
                </div>

                <!-- Title -->
                <h2
                  class="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
                  :class="tool.titleHoverGradient"
                >
                  {{ tool.title }}
                </h2>

                <!-- Description -->
                <p
                  class="text-gray-600 dark:text-gray-400 flex-1 leading-relaxed"
                >
                  {{ tool.description }}
                </p>

                <!-- Footer with animated arrow -->
                <div
                  class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700"
                >
                  <div
                    class="flex items-center font-semibold transition-all duration-300"
                    :class="tool.linkColor"
                  >
                    <span>Explore tool</span>

                    <UIcon
                      name="i-heroicons-arrow-right"
                      class="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-2"
                    />
                  </div>
                </div>
              </template>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "EPCIS Profile Checker — Build, Validate & Search EPCIS Profiles",
  description:
    "Open-source tools for EPCIS profile building, event validation, and JSON Schema snippet search. Speed up GS1 traceability and visibility system implementations.",
  ogImage: "/linkedin-banner.svg",
  ogType: "website",
});

useSchemaOrg([
  defineWebPage({ name: "EPCIS Profile Checker" }),
  defineWebSite({ name: "EPCIS Profile Checker" }),
]);

// Unified blue color scheme for all cards
const blueTheme = {
  gradientBg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30",
  ringColor: "group-hover:ring-blue-500/50 dark:group-hover:ring-blue-400/50",
  titleHoverGradient:
    "group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-700",
  linkColor: "text-blue-600 dark:text-blue-400",
};

const tools = [
  {
    title: "Profile Builder",
    description:
      "Create and edit EPCIS event profiles with precision. Define business step values, specify required identifiers, and set necessary rules – all tailored to your use case.",
    svgImageLight: "/profile-builder-light.svg",
    svgImageDark: "/profile-builder-dark.svg",
    path: "/profile-builder",
    ...blueTheme,
  },
  {
    title: "Event Validator",
    description:
      "Validate EPCIS events or documents against a profile. Select a profile, paste your event data – and instantly see if it conforms to the defined rules.",
    svgImageLight: "/event-validator-light.svg",
    svgImageDark: "/event-validator-dark.svg",
    path: "/event-validator",
    ...blueTheme,
  },
  {
    title: "Snippet Search",
    description:
      "Access reusable JSON Schema components used by the tool. These snippets support a wide range of development tasks – even beyond EPCIS – for your own applications.",
    svgImageLight: "/snippet-search-light.svg",
    svgImageDark: "/snippet-search-dark.svg",
    path: "/snippet-search",
    ...blueTheme,
  },
];
</script>
