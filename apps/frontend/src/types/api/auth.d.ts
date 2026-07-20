/**
 * 命名空间 Api.Auth
 *
 * 由后端 Hono AppType 自动导出与推导
 */
import type { client, InferResponseType } from "@/service/client";

declare global {
  namespace Api.Auth {
    type LoginParams = Parameters<typeof client.api.auth.login.$post>[0]["json"];
    type LoginToken =
      InferResponseType<typeof client.api.auth.login.$post> extends {
        data: infer D;
      }
        ? D
        : { token: string; refreshToken: string };
    type LoginResponse = LoginToken;

    type UserInfo =
      InferResponseType<typeof client.api.auth.getUserInfo.$get> extends {
        data: infer D;
      }
        ? D
        : {
            userId: string;
            username: string;
            nickname: string | null;
            roles: string[];
            buttons: string[];
          };

    type Info = {
      token: string;
      userInfo: UserInfo;
    };

    type RegisterParams = Parameters<typeof client.api.auth.register.$post>[0]["json"];
    type ResetPasswordParams = Parameters<
      (typeof client.api.auth)["reset-password"]["$post"]
    >[0]["json"];
  }
}

export {};
