// oxlint-disable unicorn/require-module-specifiers
declare global {
  namespace StorageType {
    interface Local {
      /** 深色模式开关 */
      darkMode: boolean;
      /** 缓存的标签页（JSON 字符串） */
      globalTabs: string;
      /** 管理应用选择的 i18n 语言 */
      lang: I18n.LangType;
      /** 最后登录的用户 ID，用于在账户变更后重置缓存的标签页 */
      lastLoginUserId: string;
      /** 管理认证流程拥有的刷新 Token */
      refreshToken: string;
      /** 主题颜色（十六进制色值，如 #1890ff） */
      themeColor: string;
      /** 管理认证流程拥有的访问 Token */
      token: string;
    }
  }
}

export {};
