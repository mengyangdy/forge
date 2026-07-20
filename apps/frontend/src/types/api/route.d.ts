/**
 * 命名空间 Api.Route
 *
 * 由后端 Hono AppType 自动导出与推导
 */

import type { client, InferResponseType } from "@/service/client";

declare global {
  namespace Api.Route {
    type BackendRouteResponse =
      InferResponseType<typeof client.api.route.getReactUserRoutes.$get> extends { data: infer D }
        ? D
        : {
            home?: string | null;
            routes: any[];
          };

    interface BackendRouteQuery {
      key: string;
      value: string;
    }

    interface BackendRouteHandle {
      activeMenu?: string | null;
      badge?: Router.MenuBadge | null;
      constant?: boolean | null;
      extra?: Router.Extra | null;
      fixedIndexInTab?: number | null;
      hideInMenu?: boolean | null;
      href?: string | null;
      i18nKey?: I18n.I18nKey | null;
      icon?: string | null;
      keepAlive?: boolean | null;
      localIcon?: string | null;
      multiTab?: boolean | null;
      order?: number | null;
      query?: BackendRouteQuery[] | null;
      roles?: string[] | null;
      title?: string | null;
      type?: Router.MenuType | null;
      url?: string | null;
    }

    interface BackendRoutePayload {
      children?: BackendRoutePayload[] | null;
      handle?: BackendRouteHandle | null;
      id?: number | string | null;
      layout?: Router.MenuCategoryKey | null;
      meta?: BackendRouteHandle | null;
      name?: string | null;
      parentId?: number | string | null;
      path: string;
      redirect?: string | null;
    }

    interface BackendRoute extends Router.Meta {
      children?: BackendRoute[] | null;
      id: string;
      layout?: Router.MenuCategoryKey | null;
      parentId?: string | null;
      path: Router.RoutePath;
      query?: BackendRouteQuery[] | null;
    }
  }
}

export {};
