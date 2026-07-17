import babel from "@rolldown/plugin-babel";
import { reactCompilerPreset } from "@vitejs/plugin-react";

type BabelPluginOptions = NonNullable<Parameters<typeof babel>[0]>;
type ReactCompilerPresetOptions = NonNullable<Parameters<typeof reactCompilerPreset>[0]>;

export interface SetupAdminBabelPluginOptions extends Omit<BabelPluginOptions, "presets"> {
  /** Additional Babel presets executed after the React Compiler preset. */
  presets?: BabelPluginOptions["presets"];

  /** React Compiler preset options, or false to disable the built-in compiler preset. */
  reactCompiler?: false | ReactCompilerPresetOptions;
}

export function setupAdminBabelPlugin(options: SetupAdminBabelPluginOptions = {}) {
  const { presets = [], reactCompiler, ...restOptions } = options;

  return babel({
    ...restOptions,
    presets: [...presets, ...(reactCompiler === false ? [] : [reactCompilerPreset(reactCompiler)])],
  });
}
