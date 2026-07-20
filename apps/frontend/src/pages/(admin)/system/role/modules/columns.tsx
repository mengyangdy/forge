import type { SemiTableColumn, TableDataWithIndex } from "@/shared/web-ui-compose";
import { Button, Popconfirm, Space, Tag } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import type { RoleDataScope, RoleListItem } from "@/service/api/role";

import { DATA_SCOPE_LABEL } from "./constants";

type RoleRecord = TableDataWithIndex<RoleListItem>;
type RoleColumn = SemiTableColumn<RoleRecord>;

interface CreateRoleColumnsOptions {
  onDelete: (record: RoleRecord) => void;
  onEdit: (record: RoleRecord) => void;
  translateScope?: (value: string) => string;
  getScopeColor?: (value: string) => string;
}

export function createRoleColumns(options: CreateRoleColumnsOptions): RoleColumn[] {
  const { onDelete, onEdit, translateScope, getScopeColor } = options;

  return [
    {
      title: "序号",
      dataIndex: "index",
      key: "index",
      width: 80,
    },
    {
      title: "角色名称",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "角色编码",
      dataIndex: "code",
      key: "code",
      ellipsis: true,
    },
    {
      title: "数据范围",
      dataIndex: "dataScope",
      key: "dataScope",
      width: 140,
      render: (value: string) => {
        const color = getScopeColor ? getScopeColor(value) : "grey";
        const label = translateScope
          ? translateScope(value)
          : (DATA_SCOPE_LABEL[value as RoleDataScope] ?? value);
        return <Tag color={color as any}>{label}</Tag>;
      },
    },
    {
      title: "备注",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (value: string | null) => value || "-",
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
      render: (_: unknown, record: RoleRecord) => (
        <Space>
          <Button size="small" theme="borderless" type="primary" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该角色吗？" onConfirm={() => onDelete(record)}>
            <Button size="small" theme="borderless" type="danger">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
}
