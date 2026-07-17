import { fileURLToPath } from "node:url";

import { baseCoverageConfig, baseTestConfig } from "@forge/config/vitest";
import { defineConfig, mergeConfig } from "vite";

import viteConfig from "./vite.config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(async (env) => {
  const resolvedViteConfig =
    typeof viteConfig === "function" ? await viteConfig(env) : await viteConfig;
  return mergeConfig(resolvedViteConfig, {
    root: rootDir,
    test: {
      ...baseTestConfig,
      include: ["__tests__/**/*.test.{ts,tsx}", "src/**/__tests__/**/*.test.{ts,tsx}"],
      setupFiles: ["./vitest.setup.ts"],
      coverage: {
        ...baseCoverageConfig,
        exclude: [...(baseCoverageConfig.exclude ?? []), "**/types.ts"],
      },
    },
  } as any);
});
