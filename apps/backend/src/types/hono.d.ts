import "hono";

declare module "hono" {
  // 1. 扩展 c.ok 和 c.fail 强类型助手
  interface Context {
    ok<T>(data: T, message?: string): Response;
    fail(message: string, status?: any): Response;
  }

  // 2. 扩展 c.get / c.set 全局变量的类型推导，彻底告别 any
  interface ContextVariableMap {
    reqId: string;
    currentUser: {
      id: number;
      username: string;
      nickname: string | null;
      roles: string[];
      permissions: string[];
    };
  }
}
