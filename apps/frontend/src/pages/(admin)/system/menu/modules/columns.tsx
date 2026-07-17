import type { SemiTableColumn, TableDataWithIndex } from "@/shared/web-ui-compose";
import { Button, Popconfirm, Space, Tag, Tooltip } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import type {
  PermissionListItem,
  PermissionTreeNode,
  PermissionType,
} from "@/service/api/permission";
import { TYPE_COLOR, TYPE_LABEL } from "./constants";

type MenuRecord = TableDataWithIndex<PermissionTreeNode>;
/** 按钮权限列表字段（由 processNode 在运行时添加） */
type MenuRecordWithButtons = MenuRecord & { buttonList?: PermissionListItem[] };
type MenuColumn = SemiTableColumn<MenuRecord>;

interface CreateMenuColumnsOptions {
  onAddChild: (record: MenuRecord) => void;
  onDelete: (record: MenuRecord) => void;
  onEdit: (record: MenuRecord) => void;
}

export function createMenuColumns(options: CreateMenuColumnsOptions): MenuColumn[] {
  const { onAddChild, onDelete, onEdit } = options;

  return [
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
      render: (value: PermissionType) => (
        <Tag color={TYPE_COLOR[value] as "blue" | "green"}>{TYPE_LABEL[value]}</Tag>
      ),
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
      title: "排序",
      dataIndex: "order",
      key: "order",
      width: 80,
      render: (value: number | null) => value ?? 0,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (value: string | null) => (
        <Tag color={value === "disabled" ? "red" : "green"}>
          {value === "disabled" ? "停用" : "启用"}
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
