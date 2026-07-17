import type { SemiTableColumn, TableDataWithIndex } from "@/shared/web-ui-compose";
import { Button, Popconfirm, Space, Tag } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import type { UserListItem, UserStatus } from "@/service/api/user";

type UserRecord = TableDataWithIndex<UserListItem>;
type UserColumn = SemiTableColumn<UserRecord>;

interface CreateUserColumnsOptions {
  onDelete: (record: UserRecord) => void;
  onEdit: (record: UserRecord) => void;
}

export function createUserColumns(options: CreateUserColumnsOptions): UserColumn[] {
  const { onDelete, onEdit } = options;

  return [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      width: 80,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      ellipsis: true,
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      ellipsis: true,
      render: (value: string | null) => value || "-",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: (value: string | null) => value || "-",
    },
    {
      title: "角色",
      dataIndex: "roles",
      key: "roles",
      ellipsis: true,
      render: (roles: UserListItem["roles"]) => roles.map((r) => r.name).join("、") || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value: UserStatus) => (
        <Tag color={value === "active" ? "green" : "red"}>
          {value === "active" ? "启用" : "停用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "操作",
      key: "operate",
      dataIndex: "operate",
      fixed: "right",
      width: 140,
      render: (_: unknown, record: UserRecord) => (
        <Space>
          <Button size="small" theme="borderless" type="primary" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该用户吗？" onConfirm={() => onDelete(record)}>
            <Button size="small" theme="borderless" type="danger">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
