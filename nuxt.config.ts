// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      snippetApiUrl: process.env.SNIPPET_API_URL || 'http://localhost:8090',
    },
  },
  app: {
    head: {
      title: 'OpenEPCIS Snippet',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
