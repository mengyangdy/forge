/**
 * Env 命名空间
 *
 * 用于声明 import.meta 对象的类型
 */
declare namespace Env {
  /** 路由历史模式 */
  type RouterHistoryMode = "hash" | "history" | "memory";

  interface AppImportMetaEnv {
    /** 应用描述 */
    readonly VITE_APP_DESC: string;
    /** 应用标题 */
    readonly VITE_APP_TITLE: string;
    /**
     * 认证路由模式
     *
     * - Static: 认证路由在前端生成
     * - Dynamic: 认证路由在后端生成
     */
    readonly VITE_AUTH_ROUTE_MODE: "dynamic" | "static";
    /** 配置应用打包后是否自动检测更新 */
    readonly VITE_AUTOMATICALLY_DETECT_UPDATE?: Common.YesOrNo;
    /** 应用基础 URL */
    readonly VITE_BASE_URL: string;

    /**
     * 是否启用 HTTP 代理
     *
     * 仅在开发环境有效
     */
    readonly VITE_HTTP_PROXY?: Common.YesOrNo;
    /**
     * 本地图标前缀
     *
     * 该前缀以图标前缀开头
     */
    readonly VITE_ICON_LOCAL_PREFIX: "icon-local";
    /** Iconify 图标前缀 */
    readonly VITE_ICON_PREFIX: "icon";
    /**
     * Iconify API 提供者 URL
     *
     * 如果项目部署在内网，可以将 API 提供者 URL 设置为本地 Iconify 服务器
     *
     * @link https://docs.iconify.design/api/providers.html
     */
    readonly VITE_ICONIFY_URL?: string;
    /**
     * 默认菜单图标（当菜单图标未设置时使用）
     *
     * Iconify 图标名称
     */
    readonly VITE_MENU_ICON: string;
    /**
     * 其他后端服务基础 URL
     *
     * 值为 JSON 格式
     */
    readonly VITE_OTHER_SERVICE_BASE_URL: string;
    /** 在终端显示代理 URL 日志 */
    readonly VITE_PROXY_LOG?: Common.YesOrNo;
    /**
     * 首页路由键
     *
     * 仅在认证路由模式为 static 时生效，如果路由模式为 dynamic，首页路由键在后端定义
     */
    readonly VITE_ROUTE_HOME: Router.RoutePath;
    /** 路由历史模式 */
    readonly VITE_ROUTER_HISTORY_MODE?: RouterHistoryMode;
    /** 后端服务基础 URL */
    readonly VITE_SERVICE_BASE_URL: string;
    /**
     * 后端服务 Token 过期码
     *
     * 当收到此码时，将刷新 Token 并重新发送请求
     *
     * 使用 "," 分隔多个码
     */
    readonly VITE_SERVICE_EXPIRED_TOKEN_CODES: string;
    /**
     * 后端服务登出码
     *
     * 当收到此码时，用户将被登出并重定向到登录页
     *
     * 使用 "," 分隔多个码
     */
    readonly VITE_SERVICE_LOGOUT_CODES: string;
    /**
     * 后端服务弹窗登出码
     *
     * 当收到此码时，将通过弹窗提示用户登出
     *
     * 使用 "," 分隔多个码
     */
    readonly VITE_SERVICE_MODAL_LOGOUT_CODES: string;
    /**
     * 后端服务成功码
     *
     * 当收到此码时，表示请求成功
     */
    readonly VITE_SERVICE_SUCCESS_CODE: string;
    /** 是否使用 sourcemap 构建 */
    readonly VITE_SOURCE_MAP?: Common.YesOrNo;
    /** 当路由模式为 static 时，定义的超级角色 */
    readonly VITE_STATIC_SUPER_ROLE: string;
    /** 用于区分不同域的存储 */
    readonly VITE_STORAGE_PREFIX?: string;
  }

  type ImportMeta = AppImportMetaEnv;
}

interface ImportMetaEnv extends Env.AppImportMetaEnv {}

declare module "virtual:svg-icons-register";
