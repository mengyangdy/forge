import { I18nLabel, SvgIcon } from "@/shared/ui/compose";
import { Breadcrumb as SemiBreadcrumb } from "@douyinfe/semi-ui";
import { Link } from "@tanstack/react-router";

import { getAdminLayoutsOptions } from "../../../setup";
import { useAdminMenus } from "../../../state/menus/use-admin-menus";

const AdminBreadcrumb = () => {
  const { activeMenu, currentMenu, getMenuInfoByPath, openKeys, selectedKey } = useAdminMenus();
  const { defaultIcon } = getAdminLayoutsOptions();

  const allBreadcrumb = [...openKeys, ...selectedKey, activeMenu ? currentMenu?.key : null];

  const breadcrumb = allBreadcrumb
    .map((key) => {
      if (!key) return null;

      const menuInfo = getMenuInfoByPath(key as Router.RoutePath);

      if (!menuInfo) return null;

      return {
        name: menuInfo.path,
        path: menuInfo.path,
        title: (
          <>
            <SvgIcon
              className="text-icon mr-4px"
              icon={menuInfo.menu?.icon || defaultIcon}
              localIcon={menuInfo.menu?.localIcon}
            />
            <span>
              <I18nLabel fallback={menuInfo.title} i18nKey={menuInfo.i18nKey} />
            </span>
          </>
        ),
      };
    })
    .filter(Boolean) as Array<{ name?: string; path?: string; title: React.ReactNode }>;

  return (
    <SemiBreadcrumb className="ml-12px">
      {breadcrumb.map((item, index) => {
        const isLast = index === breadcrumb.length - 1;

        return (
          <SemiBreadcrumb.Item key={`${item.path ?? "crumb"}-${index}`}>
            {isLast || !item.path ? (
              <div className="flex-y-center text-base-text">{item.title}</div>
            ) : (
              <Link
                className="inline-flex! items-center whitespace-nowrap hover:text-base-text!"
                to={item.path}
              >
                {item.title}
              </Link>
            )}
          </SemiBreadcrumb.Item>
        );
      })}
    </SemiBreadcrumb>
  );
};

export default AdminBreadcrumb;
