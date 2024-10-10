// vite.config.ts
import path from "node:path";
import Vue from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/@vitejs+plugin-vue@5.1.4_vite@5.4.8_@types+node@22.7.2_sass-embedded@1.79.3_sass@1.79.3__vue@3.5.8_typescript@5.6.2_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/unplugin-auto-import@0.18.3_@vueuse+core@11.1.0_vue@3.5.8_typescript@5.6.2___rollup@4.22.4/node_modules/unplugin-auto-import/dist/vite.js";
import IconsResolver from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/unplugin-icons@0.19.3_@vue+compiler-sfc@3.5.8/node_modules/unplugin-icons/dist/resolver.js";
import Icons from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/unplugin-icons@0.19.3_@vue+compiler-sfc@3.5.8/node_modules/unplugin-icons/dist/vite.js";
import Components from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/unplugin-vue-components@0.27.4_@babel+parser@7.25.6_rollup@4.22.4_vue@3.5.8_typescript@5.6.2_/node_modules/unplugin-vue-components/dist/vite.js";
import VueMacros from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/unplugin-vue-macros@2.12.2_@vueuse+core@11.1.0_vue@3.5.8_typescript@5.6.2___esbuild@0.23.1_ro_4sggsmc3wz64hbf5fjuy6ljsmi/node_modules/unplugin-vue-macros/dist/vite.js";
import { VueRouterAutoImports } from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/unplugin-vue-router@0.10.8_rollup@4.22.4_vue-router@4.4.5_vue@3.5.8_typescript@5.6.2___vue@3.5.8_typescript@5.6.2_/node_modules/unplugin-vue-router/dist/index.js";
import VueRouter from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/unplugin-vue-router@0.10.8_rollup@4.22.4_vue-router@4.4.5_vue@3.5.8_typescript@5.6.2___vue@3.5.8_typescript@5.6.2_/node_modules/unplugin-vue-router/dist/vite.js";
import RadixVueResolver from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/radix-vue@1.9.6_vue@3.5.8_typescript@5.6.2_/node_modules/radix-vue/dist/resolver/index.mjs";
import { defineConfig } from "file:///Users/admin/PROJECTS/aaa2/node_modules/.pnpm/vite@5.4.8_@types+node@22.7.2_sass-embedded@1.79.3_sass@1.79.3/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/Users/admin/PROJECTS/aaa2";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "~/": `${path.resolve(__vite_injected_original_dirname, "src")}/`
    }
  },
  plugins: [
    // vueDevTools(),
    VueMacros({
      defineOptions: false,
      defineModels: false,
      plugins: {
        vue: Vue({
          script: {
            propsDestructure: true,
            defineModel: true
          }
        })
      }
    }),
    // https://github.com/posva/unplugin-vue-router
    VueRouter(),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "@vueuse/core",
        VueRouterAutoImports,
        {
          // add any other imports you were relying on
          "vue-router/auto": ["useLink"]
        }
      ],
      dts: true,
      dirs: [
        "./src*",
        "./src/modules/**/",
        "./src/composables",
        "./src/models"
      ],
      vueTemplate: true
    }),
    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
      dirs: [
        "./src/components",
        "./src/modules/**/*"
      ],
      resolvers: [
        RadixVueResolver(),
        IconsResolver()
      ]
    }),
    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    Icons({
      compiler: "vue3",
      autoInstall: true
    })
    // UnoCSS(),
  ],
  // https://github.com/vitest-dev/vitest
  test: {
    environment: "jsdom"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWRtaW4vUFJPSkVDVFMvYWFhMlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FkbWluL1BST0pFQ1RTL2FhYTIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FkbWluL1BST0pFQ1RTL2FhYTIvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5cbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcbmltcG9ydCBWdWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuLy8gaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSdcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXG5pbXBvcnQgSWNvbnNSZXNvbHZlciBmcm9tICd1bnBsdWdpbi1pY29ucy9yZXNvbHZlcidcbmltcG9ydCBJY29ucyBmcm9tICd1bnBsdWdpbi1pY29ucy92aXRlJ1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcbmltcG9ydCBWdWVNYWNyb3MgZnJvbSAndW5wbHVnaW4tdnVlLW1hY3Jvcy92aXRlJ1xuaW1wb3J0IHsgVnVlUm91dGVyQXV0b0ltcG9ydHMgfSBmcm9tICd1bnBsdWdpbi12dWUtcm91dGVyJ1xuaW1wb3J0IFZ1ZVJvdXRlciBmcm9tICd1bnBsdWdpbi12dWUtcm91dGVyL3ZpdGUnXG5pbXBvcnQgdnVlRGV2VG9vbHMgZnJvbSAndml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzJ1xuaW1wb3J0IFJhZGl4VnVlUmVzb2x2ZXIgZnJvbSAncmFkaXgtdnVlL3Jlc29sdmVyJ1xuXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICd+Lyc6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKX0vYCxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgLy8gdnVlRGV2VG9vbHMoKSxcbiAgICBWdWVNYWNyb3Moe1xuICAgICAgZGVmaW5lT3B0aW9uczogZmFsc2UsXG4gICAgICBkZWZpbmVNb2RlbHM6IGZhbHNlLFxuICAgICAgcGx1Z2luczoge1xuICAgICAgICB2dWU6IFZ1ZSh7XG4gICAgICAgICAgc2NyaXB0OiB7XG4gICAgICAgICAgICBwcm9wc0Rlc3RydWN0dXJlOiB0cnVlLFxuICAgICAgICAgICAgZGVmaW5lTW9kZWw6IHRydWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0pLFxuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Bvc3ZhL3VucGx1Z2luLXZ1ZS1yb3V0ZXJcbiAgICBWdWVSb3V0ZXIoKSxcblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bnBsdWdpbi1hdXRvLWltcG9ydFxuICAgIEF1dG9JbXBvcnQoe1xuICAgICAgaW1wb3J0czogW1xuICAgICAgICAndnVlJyxcbiAgICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgICAgIFZ1ZVJvdXRlckF1dG9JbXBvcnRzLFxuICAgICAgICB7XG4gICAgICAgICAgLy8gYWRkIGFueSBvdGhlciBpbXBvcnRzIHlvdSB3ZXJlIHJlbHlpbmcgb25cbiAgICAgICAgICAndnVlLXJvdXRlci9hdXRvJzogWyd1c2VMaW5rJ10sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZHRzOiB0cnVlLFxuICAgICAgZGlyczogW1xuICAgICAgICAnLi9zcmMqJyxcbiAgICAgICAgJy4vc3JjL21vZHVsZXMvKiovJyxcbiAgICAgICAgJy4vc3JjL2NvbXBvc2FibGVzJywgJy4vc3JjL21vZGVscycsXG4gICAgICBdLFxuICAgICAgdnVlVGVtcGxhdGU6IHRydWUsXG4gICAgfSksXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdml0ZS1wbHVnaW4tY29tcG9uZW50c1xuICAgIENvbXBvbmVudHMoe1xuICAgICAgZHRzOiB0cnVlLFxuICAgICAgZGlyczogW1xuICAgICAgICAnLi9zcmMvY29tcG9uZW50cycsXG4gICAgICAgICcuL3NyYy9tb2R1bGVzLyoqLyonLFxuICAgICAgXSxcbiAgICAgIHJlc29sdmVyczogW1xuICAgICAgICBSYWRpeFZ1ZVJlc29sdmVyKCksXG4gICAgICAgIEljb25zUmVzb2x2ZXIoKSxcbiAgICAgIF0sXG4gICAgfSksXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5vY3NzXG4gICAgLy8gc2VlIHVuby5jb25maWcudHMgZm9yIGNvbmZpZ1xuICAgIEljb25zKHtcbiAgICAgIGNvbXBpbGVyOiAndnVlMycsXG4gICAgICBhdXRvSW5zdGFsbDogdHJ1ZSxcbiAgICB9KSxcbiAgICAvLyBVbm9DU1MoKSxcbiAgXSxcblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdml0ZXN0LWRldi92aXRlc3RcbiAgdGVzdDoge1xuICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxPQUFPLFVBQVU7QUFDakIsT0FBTyxTQUFTO0FBRWhCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sV0FBVztBQUNsQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGVBQWU7QUFDdEIsU0FBUyw0QkFBNEI7QUFDckMsT0FBTyxlQUFlO0FBRXRCLE9BQU8sc0JBQXNCO0FBRTdCLFNBQVMsb0JBQW9CO0FBZjdCLElBQU0sbUNBQW1DO0FBaUJ6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxNQUFNLEdBQUcsS0FBSyxRQUFRLGtDQUFXLEtBQUssQ0FBQztBQUFBLElBQ3pDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBO0FBQUEsSUFFUCxVQUFVO0FBQUEsTUFDUixlQUFlO0FBQUEsTUFDZixjQUFjO0FBQUEsTUFDZCxTQUFTO0FBQUEsUUFDUCxLQUFLLElBQUk7QUFBQSxVQUNQLFFBQVE7QUFBQSxZQUNOLGtCQUFrQjtBQUFBLFlBQ2xCLGFBQWE7QUFBQSxVQUNmO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0YsQ0FBQztBQUFBO0FBQUEsSUFHRCxVQUFVO0FBQUE7QUFBQSxJQUdWLFdBQVc7QUFBQSxNQUNULFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUE7QUFBQSxVQUVFLG1CQUFtQixDQUFDLFNBQVM7QUFBQSxRQUMvQjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMLE1BQU07QUFBQSxRQUNKO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUFxQjtBQUFBLE1BQ3ZCO0FBQUEsTUFDQSxhQUFhO0FBQUEsSUFDZixDQUFDO0FBQUE7QUFBQSxJQUdELFdBQVc7QUFBQSxNQUNULEtBQUs7QUFBQSxNQUNMLE1BQU07QUFBQSxRQUNKO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFdBQVc7QUFBQSxRQUNULGlCQUFpQjtBQUFBLFFBQ2pCLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0YsQ0FBQztBQUFBO0FBQUE7QUFBQSxJQUlELE1BQU07QUFBQSxNQUNKLFVBQVU7QUFBQSxNQUNWLGFBQWE7QUFBQSxJQUNmLENBQUM7QUFBQTtBQUFBLEVBRUg7QUFBQTtBQUFBLEVBR0EsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLEVBQ2Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
