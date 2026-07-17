import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";

import type { AdminViteIconOptions } from "../types";
import { resolveAdminIconOptions } from "./icon-utils";

type AutoImportOptions = NonNullable<Parameters<typeof AutoImport>[0]>;
/** Inline import-map preset shape (`{ [module]: (name | [from, as])[] }`). */
type AutoImportPreset = Record<string, (string | [string, string])[]>;

export type SetupAdminAutoImportOptions = AutoImportOptions & AdminViteIconOptions;

export type ResolvedSetupAdminAutoImportOptions = SetupAdminAutoImportOptions;

const ADMIN_AUTO_IMPORT_OPTION_KEYS = new Set([
  "collectionName",
  "iconPrefix",
  "localIconPath",
  "localIconPrefix",
  "scale",
  "transformSvg",
]);

const TSR_SPLIT_RE = /\.[tj]sx?(\?.*)?$/;

/**
 * Resolve ahooks auto-import preset without relying on unplugin-auto-import's
 * built-in `"ahooks"` preset (local-pkg fails in pnpm monorepo / vite-temp cwd).
 */
function resolveAhooksPreset(): AutoImportPreset | null {
  const packageJsonCandidates = [
    join(process.cwd(), "package.json"),
    join(process.cwd(), "apps/frontend/package.json"),
  ];

  for (const packageJson of packageJsonCandidates) {
    try {
      const require = createRequire(packageJson);
      const metadataPath = require.resolve("ahooks/metadata.json");
      const metadata = JSON.parse(readFileSync(metadataPath, "utf-8")) as {
        functions: Array<{ alias?: string[]; name: string }>;
      };

      return {
        ahooks: metadata.functions.flatMap((item) => [item.name, ...(item.alias ?? [])]),
      };
    } catch {
      // try next candidate
    }
  }

  return null;
}

export function setupAdminAutoImport(options: ResolvedSetupAdminAutoImportOptions = {}) {
  const autoImportOptions = createAutoImportOptions(options);
  const ahooksPreset = resolveAhooksPreset();
  const {
    dirs = ["src/config.ts"],
    dts = "src/types/auto-imports.d.ts",
    imports = [
      "react",
      { from: "react", imports: ["FC"], type: true },
      "react-i18next",
      ...(ahooksPreset ? [ahooksPreset] : []),
    ],
    include = [TSR_SPLIT_RE],
    resolvers = [],
  } = autoImportOptions;

  const iconOptions = resolveAdminIconOptions(options);

  return AutoImport({
    ...autoImportOptions,
    dirs,
    dts,
    imports,
    include,
    resolvers: [
      IconsResolver({
        componentPrefix: iconOptions.iconPrefix,
        customCollections: [iconOptions.collectionName],
        extension: "tsx",
        prefix: iconOptions.iconPrefix,
      }),
      ...normalizeResolvers(resolvers),
    ],
  });
}

function normalizeResolvers(resolvers: AutoImportOptions["resolvers"] = []) {
  if (!Array.isArray(resolvers)) return [resolvers];

  return resolvers.flat();
}

function createAutoImportOptions(options: ResolvedSetupAdminAutoImportOptions): AutoImportOptions {
  return Object.fromEntries(
    Object.entries(options).filter(([key]) => !ADMIN_AUTO_IMPORT_OPTION_KEYS.has(key)),
  ) as AutoImportOptions;
}
