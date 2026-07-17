// oxlint-disable import/no-unassigned-import
import ButtonIcon from "@/shared/ui/semi/components/ButtonIcon";
import { Badge, Dropdown } from "@douyinfe/semi-ui";
import { clsx } from "clsx";
import { Suspense, lazy, memo, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import "./notification.css";
import { useNotificationContext } from "./useNotificationContext";

const NotificationPanel = lazy(() => import("./NotificationPanel"));

export interface NotificationButtonProps {
  /** Extra class name applied to the icon button. */
  className?: string;
  /** Inline style forwarded to the icon button. */
  style?: CSSProperties;
}

const NotificationButtonBase = (props: NotificationButtonProps) => {
  const { className, style } = props;

  const { t } = useTranslation();
  const {
    clearAllNotifications,
    markAllAsRead,
    markAsRead,
    notifications,
    removeNotification,
    unreadCount,
  } = useNotificationContext();
  const [open, setOpen] = useState(false);

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? "99+" : unreadCount;
  const hoverAnimation = hasUnread ? "swing" : "scale";

  function handleNotificationClick(id: string) {
    markAsRead(id);
  }

  function handleDelete(id: string) {
    removeNotification(id);
  }

  function handleMarkAllRead() {
    markAllAsRead();
  }

  function handleClearAll() {
    clearAllNotifications();
    setOpen(false);
  }

  return (
    <Dropdown
      position="bottomRight"
      render={
        open ? (
          <Suspense fallback={null}>
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onClearAll={handleClearAll}
              onDelete={handleDelete}
              onItemClick={handleNotificationClick}
              onMarkAllRead={handleMarkAllRead}
            />
          </Suspense>
        ) : null
      }
      trigger="click"
      visible={open}
      onVisibleChange={setOpen}
    >
      <Badge
        count={hasUnread ? displayCount : undefined}
        countStyle={hasUnread ? { boxShadow: "0 0 0 1px var(--semi-color-bg-0)" } : undefined}
        overflowCount={99}
        position="rightTop"
        type="danger"
      >
        <ButtonIcon
          className={clsx(hasUnread ? "admin-notification-button-unread" : "", className)}
          hoverAnimation={hoverAnimation}
          icon="carbon:notification"
          style={style}
          tooltipContent={t("notification.title")}
        />
      </Badge>
    </Dropdown>
  );
};

const NotificationButton = memo(NotificationButtonBase);

export default NotificationButton;
