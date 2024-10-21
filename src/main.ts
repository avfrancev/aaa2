import { createApp } from "vue"
// import { createRouter, createWebHistory } from 'vue-router'
// import { routes } from 'vue-router/auto-routes'
import { GesturePlugin } from "@vueuse/gesture"
import App from "./App.vue"
// import { createPinia } from "pinia"

// import '@unocss/reset/tailwind.css'
// import 'uno.css'
import "./styles/main.css"

const app = createApp(App)
// const router = createRouter({
//   routes,
//   history: createWebHistory(import.meta.env.BASE_URL),
// })
// app.use(createPinia())
// app.use(router)
app.use(GesturePlugin)
app.mount("#app")
