import { defineConfig } from "./src/shared/admin-vite";

export default defineConfig({
  application: {
    css: {
      additionalData: '@use "@/styles/scss/global.scss" as *;',
    },
    resolve: {
      rootAlias: false,
    },
  },
});
