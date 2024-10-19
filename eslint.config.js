import antfu from "@antfu/eslint-config"
// import { FlatCompat } from '@eslint/eslintrc'
import vuePug from "eslint-plugin-vue-pug"

// const compat = new FlatCompat()

export default antfu(
  {
    typescript: true,
    vue: true,
    // ...compat.config({
    //   extends: ['plugin:vue-pug/recommended'],
    // }),
    rules: {
      "style/quotes": ["error", "double"],
      "antfu/consistent-chaining": "error",
      "unicorn/no-array-for-each": "warn",
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // extends: ['plugin:vue-pug/vue3-recommended'],
    name: "vue-pug",
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        templateTokenizer: { pug: "vue-eslint-parser-template-tokenizer-pug" },
      },
    },
    plugins: {
      "vue-pug": vuePug,
    },
    rules: {
    // base
      "vue/component-name-in-template-casing": "off",
      "vue/html-self-closing": "off",
      "vue/html-end-tags": "off",
      "vue/html-indent": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/singleline-html-element-content-newline": "off",
      // vue3-essential
      "vue-pug/no-parsing-error": "error",
      // vue3-strongly-recommended
      "vue-pug/no-pug-control-flow": "warn",
    },
  },
)
