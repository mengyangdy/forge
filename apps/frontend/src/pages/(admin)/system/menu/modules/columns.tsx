import type { SemiTableColumn, TableDataWithIndex } from "@/shared/web-ui-compose";
import { Button, Popconfirm, Space, Tag, Tooltip } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import type {
  PermissionListItem,
  PermissionTreeNode,
  PermissionType,
} from "@/service/api/permission";
import { TYPE_LABEL } from "./constants";

type MenuRecord = TableDataWithIndex<PermissionTreeNode>;
/** 按钮权限列表字段（由 processNode 在运行时添加） */
type MenuRecordWithButtons = MenuRecord & { buttonList?: PermissionListItem[] };
type MenuColumn = SemiTableColumn<MenuRecord>;

interface CreateMenuColumnsOptions {
  onAddChild: (record: MenuRecord) => void;
  onDelete: (record: MenuRecord) => void;
  onEdit: (record: MenuRecord) => void;
  translateType?: (value: string) => string;
  getTypeColor?: (value: string) => string;
  translateStatus?: (value: string) => string;
  getStatusColor?: (value: string) => string;
}

export function createMenuColumns(options: CreateMenuColumnsOptions): MenuColumn[] {
  const {
    onAddChild,
    onDelete,
    onEdit,
    translateType,
    getTypeColor,
    translateStatus,
    getStatusColor,
  } = options;

  return [
    {
      title: "排序",
      dataIndex: "order",
      key: "order",
      width: 120,
      render: (value: number | null) => (
        <Tag color="cyan" className="font-mono">
          {value ?? 0}
        </Tag>
      ),
    },
    {
      title: "权限名称",
      dataIndex: "name",
      key: "name",
      width: 180,
      ellipsis: true,
    },
    {
      title: "权限编码",
      dataIndex: "code",
      key: "code",
      width: 160,
      ellipsis: true,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (value: PermissionType) => {
        const color = getTypeColor ? getTypeColor(value) : "grey";
        const label = translateType ? translateType(value) : (TYPE_LABEL[value] ?? value);
        return <Tag color={color as any}>{label}</Tag>;
      },
    },
    {
      title: "按钮权限",
      key: "buttonList",
      width: 200,
      render: (_: unknown, record: MenuRecord) => {
        const btns = (record as MenuRecordWithButtons).buttonList ?? [];
        if (btns.length === 0) return "-";
        return (
          <Space wrap>
            {btns.map((btn) => (
              <Tag color="green" key={btn.id}>
                {btn.name}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "路由路径",
      dataIndex: "routePath",
      key: "routePath",
      width: 180,
      render: (value: string | null) => value || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (value: string | null) => {
        const statusVal = value || "active";
        const color = getStatusColor
          ? getStatusColor(statusVal)
          : statusVal === "disabled"
            ? "red"
            : "green";
        const label = translateStatus
          ? translateStatus(statusVal)
          : statusVal === "disabled"
            ? "停用"
            : "启用";
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
      render: (_: unknown, record: MenuRecord) => {
        const hasChildren = Boolean(record.children?.length);
        const isMenuType = record.type === "catalogue";

        return (
          <Space>
            {isMenuType ? (
              <Button
                size="small"
                theme="borderless"
                type="primary"
                onClick={() => onAddChild(record)}
              >
                新增下级
              </Button>
            ) : (
              <Tooltip content="仅目录类型可添加下级">
                <Button disabled size="small" theme="borderless" type="primary">
                  新增下级
                </Button>
              </Tooltip>
            )}
            <Button size="small" theme="borderless" type="primary" onClick={() => onEdit(record)}>
              编辑
            </Button>
            {hasChildren ? (
              <Tooltip content="请先删除子菜单">
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
