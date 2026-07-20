import { Avatar, Button, Popconfirm, Tag, Tooltip } from "@douyinfe/semi-ui";
import type { ColumnProps } from "@douyinfe/semi-ui/lib/es/table";
import { formatDateTime } from "@forge/shared/utils";

import type { OnlineUserItem } from "@/service/api/system-online";

interface CreateOnlineColumnsOptions {
  currentUserId?: number;
  onKickout: (record: OnlineUserItem) => void;
}

export function createOnlineColumns({
  currentUserId,
  onKickout,
}: CreateOnlineColumnsOptions): ColumnProps<OnlineUserItem>[] {
  return [
    {
      dataIndex: "username",
      key: "username",
      render: (_, record) => (
        <div className="flex items-center gap-10px">
          <Avatar color="blue" size="small">
            {record.nickname ? record.nickname.charAt(0) : record.username.charAt(0).toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-14px text-gray-900">
              {record.nickname || record.username}
            </span>
            <span className="text-12px text-gray-400 font-mono">@{record.username}</span>
          </div>
        </div>
      ),
      title: "在线用户",
    },
    {
      dataIndex: "ip",
      key: "ip",
      render: (ip: string | null) => (
        <code className="px-6px py-2px bg-gray-100 rounded text-12px font-mono text-gray-700">
          {ip || "未知 IP"}
        </code>
      ),
      title: "登录 IP",
    },
    {
      dataIndex: "userAgent",
      key: "userAgent",
      render: (ua: string | null) => {
        if (!ua) return "-";
        return (
          <Tooltip content={ua}>
            <div className="max-w-260px truncate text-12px text-gray-600 font-mono bg-gray-50 px-6px py-2px rounded border border-gray-100">
              {ua}
            </div>
          </Tooltip>
        );
      },
      title: "浏览器 / 设备",
    },
    {
      dataIndex: "loginTime",
      key: "loginTime",
      render: (val: string) => (
        <span className="text-12px text-gray-600 font-mono">{formatDateTime(val)}</span>
      ),
      title: "登录时间",
    },
    {
      dataIndex: "lastActiveTime",
      key: "lastActiveTime",
      render: (val: string) => (
        <div className="flex items-center gap-6px">
          <Tag color="green">在线</Tag>
          <span className="text-12px text-gray-500 font-mono">{formatDateTime(val)}</span>
        </div>
      ),
      title: "最后活跃时间",
    },
    {
      dataIndex: "action",
      fixed: "right",
      key: "action",
      render: (_, record) => {
        const isSelf = currentUserId === record.userId;
        if (isSelf) {
          return (
            <Tooltip content="禁止强退当前登录账号本人">
              <Button disabled size="small" type="danger">
                强退
              </Button>
            </Tooltip>
          );
        }

        return (
          <Popconfirm
            content={`确定要强制将用户 "${record.nickname || record.username}" 下线吗？下线后其凭证将立即失效。`}
            title="确认强退下线"
            onConfirm={() => onKickout(record)}
          >
            <Button size="small" type="danger">
              强退
            </Button>
          </Popconfirm>
        );
      },
      title: "操作",
      width: 100,
    },
  ];
}
