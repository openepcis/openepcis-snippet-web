import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  // Dynamically import only the themes we want to keep bundle lean
  const loadThemes = Promise.all([
    import('monaco-themes/themes/GitHub Dark.json'),
    import('monaco-themes/themes/GitHub Light.json'),
    import('monaco-themes/themes/Solarized Dark.json'),
    import('monaco-themes/themes/Solarized Light.json'),
    // you can add more here as needed
  ])

  // Wait until Monaco (from nuxt-monaco-editor) is available on window
  const waitForMonaco = () =>
    new Promise<any>((resolve) => {
      const w = window as any
      if (w?.monaco?.editor) return resolve(w.monaco)
      const t = setInterval(() => {
        if (w?.monaco?.editor) {
          clearInterval(t)
          resolve(w.monaco)
        }
      }, 50)
    })

  ;(async () => {
    const [monaco, [ghDark, ghLight, solDark, solLight]] = await Promise.all([
      waitForMonaco(),
      loadThemes,
    ])

    // Support both ESM default and named exports
    const asObj = (m: any) => (m && 'default' in m ? m.default : m)

    monaco.editor.defineTheme('github-dark', asObj(ghDark))
    monaco.editor.defineTheme('github-light', asObj(ghLight))
    monaco.editor.defineTheme('solarized-dark', asObj(solDark))
    monaco.editor.defineTheme('solarized-light', asObj(solLight))

    // Apply an initial theme immediately based on current document mode
    const isDark = document.documentElement.classList.contains('dark')
    // default to Solarized variants; override per-page via editor options
    monaco.editor.setTheme(isDark ? 'solarized-dark' : 'solarized-light')
  })()
})
