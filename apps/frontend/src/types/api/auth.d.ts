// oxlint-disable unicorn/require-module-specifiers
/**
 * 命名空间 Api.Auth
 *
 * 后端 API 模块：认证模块
 * 这是整个项目 Auth 类型的唯一真相源，service 层和 UI 层统一引用此处。
 */
declare global {
  namespace Api.Auth {
    // =========================================================================
    // 登录参数
    // =========================================================================

    /** 账号密码登录参数 */
    interface PasswordLoginParams {
      type?: "password";
      /** 密码 */
      password: string;
      /** 用户名 */
      username: string;
    }

    /** 手机验证码登录参数 */
    interface CodeLoginParams {
      type: "code";
      /** 手机号 */
      phone: string;
      /** 验证码 */
      code: string;
    }

    /**
     * 登录请求参数（统一入口）
     *
     * 默认使用账号密码登录，后端通过 type 字段区分登录方式。
     * 若后端不区分 type，可直接传 PasswordLoginParams。
     */
    type LoginParams = PasswordLoginParams | CodeLoginParams;

    // =========================================================================
    // 登录响应
    // =========================================================================

    /** 登录响应数据 */
    type LoginResponse = LoginToken;

    /** 登录令牌 */
    interface LoginToken {
      /** 刷新令牌 */
      refreshToken: string;
      /** 访问令牌 */
      token: string;
    }

    // =========================================================================
    // 用户信息
    // =========================================================================

    /** 用户信息 */
    interface UserInfo {
      /** 用户按钮权限列表（按钮 code） */
      buttons: string[];
      /** 用户角色列表（角色 code） */
      roles: string[];
      /** 用户 ID（字符串类型） */
      userId: string;
      /** 用户名 */
      username: string;
    }

    /** 用户认证信息（token + userInfo 聚合） */
    type Info = {
      /** 访问令牌 */
      token: LoginToken["token"];
      /** 用户信息 */
      userInfo: UserInfo;
    };

    // =========================================================================
    // 注册 / 重置密码
    // =========================================================================

    /** 注册参数 */
    interface RegisterParams {
      /** 手机号 */
      phone: string;
      /** 验证码 */
      code: string;
      /** 密码 */
      password: string;
      /** 确认密码 */
      confirmPassword?: string;
    }

    /** 重置密码参数 */
    interface ResetPasswordParams {
      /** 手机号 */
      phone: string;
      /** 验证码 */
      code: string;
      /** 新密码 */
      password: string;
      /** 确认新密码 */
      confirmPassword?: string;
    }
  }
}

export {};
