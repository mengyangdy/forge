import type {
  TanStackDevtoolsReactInit,
  TanStackDevtoolsReactPlugin,
} from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";

import { Suspense, lazy, useMemo } from "react";

type TanStackDevtoolsConfig = NonNullable<TanStackDevtoolsReactInit["config"]>;
type AdminDevtoolsTheme = any;

export interface AdminDevtoolsConfig {
  /** Whether any admin devtools should be rendered. */
  enabled?: boolean;

  /** TanStack devtools trigger position. */
  position?: TanStackDevtoolsConfig["position"];

  /** Whether to enable the TanStack Query panel. */
  query?: boolean;

  /** Whether to enable the TanStack Router panel. */
  router?: boolean;

  /** Shared theme for all devtools panels. */
  theme?: AdminDevtoolsTheme;
}

export interface AdminDevtoolsProps {
  /** Devtools feature switches and shell options. */
  config?: AdminDevtoolsConfig;

  /** QueryClient instance used by the application. */
  queryClient?: QueryClient;

  /** TanStack Router instance used by the application. */
  router?: AnyRouter;
}

const TanStackDevtools = lazy(() =>
  import("@tanstack/react-devtools").then((mod) => ({ default: mod.TanStackDevtools })),
);

const ReactQueryDevtoolsPanel = lazy(() =>
  import("@tanstack/react-query-devtools").then((mod) => ({
    default: mod.ReactQueryDevtoolsPanel,
  })),
);

const TanStackRouterDevtoolsPanel = lazy(() =>
  import("@tanstack/react-router-devtools").then((mod) => ({
    default: mod.TanStackRouterDevtoolsPanel,
  })),
);

function isEnabled(value: boolean | undefined) {
  return value !== false;
}

const AdminDevtools = (props: AdminDevtoolsProps) => {
  const { config = {}, queryClient, router } = props;

  const plugins = useMemo<TanStackDevtoolsReactPlugin[]>(() => {
    const items: TanStackDevtoolsReactPlugin[] = [];

    if (router && isEnabled(config.router)) {
      items.push({
        id: "tanstack-router",
        name: "TanStack Router",
        render: (
          <Suspense fallback={null}>
            <TanStackRouterDevtoolsPanel router={router} />
          </Suspense>
        ),
      });
    }

    if (queryClient && isEnabled(config.query)) {
      items.push({
        id: "tanstack-query",
        name: "TanStack Query",
        render: (
          <Suspense fallback={null}>
            <ReactQueryDevtoolsPanel client={queryClient} />
          </Suspense>
        ),
      });
    }

    return items;
  }, [config.query, config.router, queryClient, router]);

  const tanStackConfig = useMemo<TanStackDevtoolsConfig>(() => {
    return {
      position: config.position ?? "bottom-right",
      theme: config.theme,
    };
  }, [config.position, config.theme]);

  if (config.enabled === false) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      {plugins.length > 0 ? <TanStackDevtools config={tanStackConfig} plugins={plugins} /> : null}
    </Suspense>
  );
};

export default AdminDevtools;
