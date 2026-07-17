import { Badge as SemiBadge } from "@douyinfe/semi-ui";

import { useAdminMenuBadges } from "../../state/menus/use-admin-menu-badges";

interface MenuBadgeProps {
  /** Standard badge configuration from the route menu metadata. */
  badge: Router.MenuBadge;
}

function getBadgeValue(
  badge: Router.MenuBadge,
  badgeValues: Record<string, Router.MenuBadgeValue | undefined>,
) {
  if (!badge.valueKey) {
    return badge.value;
  }

  if (Object.hasOwn(badgeValues, badge.valueKey)) {
    return badgeValues[badge.valueKey];
  }

  return badge.value;
}

function shouldRenderValue(value: Router.MenuBadgeValue | undefined, showZero?: boolean) {
  if (value === 0) return Boolean(showZero);

  return value !== undefined && value !== null && value !== "";
}

function getBadgeType(
  variant: Router.MenuBadgeVariant,
): "danger" | "primary" | "success" | "warning" | undefined {
  switch (variant) {
    case "error":
      return "danger";
    case "info":
    case "primary":
      return "primary";
    case "success":
      return "success";
    case "warning":
      return "warning";
    default:
      return undefined;
  }
}

const MenuBadge = (props: MenuBadgeProps) => {
  const { badge } = props;

  const { badgeValues } = useAdminMenuBadges();
  const { showZero = false, type = "normal", variant = "default" } = badge;
  const badgeType = getBadgeType(variant);

  if (type === "dot") {
    return <SemiBadge data-menu-badge="dot" dot type={badgeType} />;
  }

  const value = getBadgeValue(badge, badgeValues);

  if (!shouldRenderValue(value, showZero)) return null;

  return <SemiBadge count={value} data-menu-badge="normal" overflowCount={999} type={badgeType} />;
};

export default MenuBadge;
