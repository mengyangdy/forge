import type { SemiTableColumn, TableDataWithIndex } from "@/shared/web-ui-compose";
import { Button, Popconfirm, Space, Tag, Tooltip } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import type { DeptStatus, DeptTreeNode } from "@/service/api/department";

type DeptRecord = TableDataWithIndex<DeptTreeNode>;
type DeptColumn = SemiTableColumn<DeptRecord>;

interface CreateDeptColumnsOptions {
  onAddChild: (record: DeptRecord) => void;
  onDelete: (record: DeptRecord) => void;
  onEdit: (record: DeptRecord) => void;
  translateStatus?: (value: string) => string;
  getStatusColor?: (value: string) => string;
}

export function createDeptColumns(options: CreateDeptColumnsOptions): DeptColumn[] {
  const { onAddChild, onDelete, onEdit, translateStatus, getStatusColor } = options;

  return [
    {
      title: "部门名称",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
    },
    {
      title: "负责人",
      dataIndex: "leaderName",
      key: "leaderName",
      width: 140,
      render: (value: string | null) => value || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value: DeptStatus) => {
        const color = getStatusColor ? getStatusColor(value) : value === "active" ? "green" : "red";
        const label = translateStatus
          ? translateStatus(value)
          : value === "active"
            ? "启用"
            : "停用";
        return <Tag color={color as any}>{label}</Tag>;
      },
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
      width: 220,
      render: (_: unknown, record: DeptRecord) => {
        const hasChildren = Boolean(record.children?.length);

        return (
          <Space>
            <Button
              size="small"
              theme="borderless"
              type="primary"
              onClick={() => onAddChild(record)}
            >
              新增下级
            </Button>
            <Button size="small" theme="borderless" type="primary" onClick={() => onEdit(record)}>
              编辑
            </Button>
            {hasChildren ? (
              <Tooltip content="请先删除子部门">
                <Button disabled size="small" theme="borderless" type="danger">
                  删除
                </Button>
              </Tooltip>
            ) : (
              <Popconfirm title="确认删除吗？" onConfirm={() => onDelete(record)}>
                <Button size="small" theme="borderless" type="danger">
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];
}
