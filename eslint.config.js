import antfu from '@antfu/eslint-config'
// import pluginVue from '@antfu/eslint-plugin-vue'
// import { FlatCompat } from '@eslint/eslintrc'

// const compat = new FlatCompat()

export default antfu({
  unocss: true,
  formatters: true,
  vite: true,
  vue: true,
  typescript: true,
  // rules: {
  //   ...pluginVue.configs['flat/recommended'],
  // },
})
