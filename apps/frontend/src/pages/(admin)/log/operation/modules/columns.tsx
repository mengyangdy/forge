import type { SemiTableColumn, TableDataWithIndex } from "@/shared/web-ui-compose";
import { Button, Tag } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import type { OperationLogItem } from "@/service/api/system-log";

type OperationLogRecord = TableDataWithIndex<OperationLogItem>;
type OperationLogColumn = SemiTableColumn<OperationLogRecord>;

interface CreateOperationLogColumnsOptions {
  onViewDetail: (record: OperationLogRecord) => void;
}

export function createOperationLogColumns(
  options: CreateOperationLogColumnsOptions,
): OperationLogColumn[] {
  const { onViewDetail } = options;

  return [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "操作模块",
      dataIndex: "module",
      key: "module",
      width: 130,
      render: (value: string | null) => <Tag color="cyan">{value || "通用模块"}</Tag>,
    },
    {
      title: "操作动作",
      dataIndex: "action",
      key: "action",
      width: 110,
      render: (value: string | null) => {
        const action = (value || "UNKNOWN").toUpperCase();
        let color: "green" | "blue" | "red" | "purple" | "grey" = "grey";
        if (action.includes("ADD") || action.includes("CREATE")) color = "green";
        else if (action.includes("UPDATE") || action.includes("EDIT")) color = "blue";
        else if (action.includes("DELETE") || action.includes("REMOVE")) color = "red";
        else if (action.includes("EXPORT") || action.includes("IMPORT")) color = "purple";

        return <Tag color={color}>{action}</Tag>;
      },
    },
    {
      title: "操作人",
      key: "operator",
      width: 140,
      render: (_: unknown, record: OperationLogRecord) => {
        const name = record.nickname
          ? `${record.nickname} (${record.username})`
          : record.username || "系统服务";
        return <span className="font-medium">{name}</span>;
      },
    },
    {
      title: "IP 地址",
      dataIndex: "ip",
      key: "ip",
      width: 130,
      render: (value: string | null) =>
        value ? (
          <code className="px-6px py-2px bg-gray-100 rounded text-12px font-mono text-gray-700">
            {value}
          </code>
        ) : (
          "-"
        ),
    },
    {
      title: "请求方式",
      dataIndex: "method",
      key: "method",
      width: 90,
      render: (value: string) => {
        const method = (value || "GET").toUpperCase();
        let color: "blue" | "green" | "orange" | "red" | "grey" = "grey";
        if (method === "GET") color = "blue";
        else if (method === "POST") color = "green";
        else if (method === "PUT") color = "orange";
        else if (method === "DELETE") color = "red";

        return <Tag color={color}>{method}</Tag>;
      },
    },
    {
      title: "请求 URL",
      dataIndex: "url",
      key: "url",
      width: 200,
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (value: number) => {
        const isSuccess = value >= 200 && value < 300;
        return <Tag color={isSuccess ? "green" : "red"}>{value}</Tag>;
      },
    },
    {
      title: "耗时",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (value: number) => {
        let colorClass = "text-gray-600";
        if (value > 500) colorClass = "text-red-500 font-bold";
        else if (value > 200) colorClass = "text-orange-500 font-medium";

        return <span className={colorClass}>{value} ms</span>;
      },
    },
    {
      title: "操作时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "操作",
      key: "operate",
      width: 90,
      fixed: "right",
      render: (_: unknown, record: OperationLogRecord) => (
        <Button theme="borderless" type="primary" onClick={() => onViewDetail(record)}>
          详情
        </Button>
      ),
    },
  ];
}
