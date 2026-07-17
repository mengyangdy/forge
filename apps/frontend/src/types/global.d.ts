// oxlint-disable unicorn/require-module-specifiers
export {};

declare global {
  /** 当前运行时是否为开发模式 */
  export const __DEV__: boolean;

  /** 项目构建时间 */
  export const BUILD_TIME: string;
}
