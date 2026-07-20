import { Badge, Button, Popconfirm, Space, Tag, Tooltip } from "@douyinfe/semi-ui";
import type { ColumnProps } from "@douyinfe/semi-ui/lib/es/table";
import { Icon } from "@iconify/react";

import type { DictDataListItem, DictTypeListItem } from "@/service/api/dict/types";

interface DictTypeColumnsOptions {
  onEdit: (record: DictTypeListItem) => void;
  onDelete: (record: DictTypeListItem) => void;
}

/**
 * 字典类型表列项定义
 */
export function createDictTypeColumns({
  onDelete,
  onEdit,
}: DictTypeColumnsOptions): ColumnProps<DictTypeListItem>[] {
  return [
    {
      title: "字典名称",
      dataIndex: "name",
      width: 140,
      render: (text) => <span className="font-500">{text}</span>,
    },
    {
      title: "字典类型",
      dataIndex: "type",
      width: 160,
      render: (text) => (
        <code className="bg-zinc-100 dark:bg-zinc-800 px-6px py-2px rounded text-12px">{text}</code>
      ),
    },
    {
      title: "系统内置",
      dataIndex: "isSystem",
      width: 90,
      align: "center",
      render: (value) => {
        const isSys = value === "Y";
        return (
          <Tag color={isSys ? "amber" : "grey"} type="light" size="small">
            {isSys ? "内置" : "业务"}
          </Tag>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      align: "center",
      render: (value) => {
        const active = value === "active";
        return <Badge type={active ? "success" : "warning"}>{active ? "正常" : "禁用"}</Badge>;
      },
    },
    {
      title: "备注",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "操作",
      width: 110,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        const isSys = record.isSystem === "Y";
        return (
          <Space spacing="medium">
            <Button
              icon={<Icon icon="lucide:edit" />}
              onClick={() => onEdit(record)}
              size="small"
              theme="borderless"
              type="primary"
            />
            {isSys ? (
              <Tooltip content="系统内置配置，禁止删除">
                <span>
                  <Button
                    disabled
                    icon={<Icon icon="lucide:trash-2" />}
                    size="small"
                    theme="borderless"
                    type="danger"
                  />
                </span>
              </Tooltip>
            ) : (
              <Popconfirm
                title="警告"
                content="删除该字典类型会连带物理删除名下所有明细数据，是否确定删除？"
                onConfirm={() => onDelete(record)}
                okType="danger"
              >
                <Button
                  icon={<Icon icon="lucide:trash-2" />}
                  size="small"
                  theme="borderless"
                  type="danger"
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];
}

interface DictDataColumnsOptions {
  onEdit: (record: DictDataListItem) => void;
  onDelete: (record: DictDataListItem) => void;
}

/**
 * 字典数据明细表列项定义
 */
export function createDictDataColumns({
  onDelete,
  onEdit,
}: DictDataColumnsOptions): ColumnProps<DictDataListItem>[] {
  const classMap: Record<string, any> = {
    primary: "blue",
    success: "green",
    warning: "amber",
    danger: "red",
    info: "grey",
  };

  return [
    {
      title: "字典标签",
      dataIndex: "label",
      width: 140,
      render: (text, record) => {
        const listClass = record.listClass;
        if (listClass && classMap[listClass]) {
          return (
            <Tag color={classMap[listClass]} size="large" style={{ fontWeight: 500 }}>
              {text}
            </Tag>
          );
        }
        return <span className="font-500">{text}</span>;
      },
    },
    {
      title: "字典键值",
      dataIndex: "value",
      width: 100,
      render: (text) => (
        <code className="bg-zinc-100 dark:bg-zinc-800 px-6px py-2px rounded text-12px">{text}</code>
      ),
    },
    {
      title: "排序",
      dataIndex: "sort",
      width: 70,
      align: "center",
    },
    {
      title: "默认",
      dataIndex: "isDefault",
      width: 80,
      align: "center",
      render: (value) => {
        const isDef = value === "Y";
        return isDef ? (
          <Tag color="violet" size="small" type="solid">
            默认
          </Tag>
        ) : (
          <span className="text-zinc-400">-</span>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      align: "center",
      render: (value) => {
        const active = value === "active";
        return <Badge type={active ? "success" : "warning"}>{active ? "正常" : "禁用"}</Badge>;
      },
    },
    {
      title: "CSS类名",
      dataIndex: "cssClass",
      width: 120,
      render: (text) => text || <span className="text-zinc-400">-</span>,
    },
    {
      title: "备注",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "操作",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_, record) => {
        return (
          <Space spacing="medium">
            <Button
              icon={<Icon icon="lucide:edit" />}
              onClick={() => onEdit(record)}
              size="small"
              theme="borderless"
              type="primary"
            />
            <Popconfirm
              title="确定要删除该字典数据明细项吗？"
              onConfirm={() => onDelete(record)}
              okType="danger"
            >
              <Button
                icon={<Icon icon="lucide:trash-2" />}
                size="small"
                theme="borderless"
                type="danger"
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
}
