import type { SemiTableColumn, TableDataWithIndex } from "@/shared/web-ui-compose";
import { Button, Tag, Tooltip } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import type { AccessLogItem } from "@/service/api/system-log";

type AccessLogRecord = TableDataWithIndex<AccessLogItem>;
type AccessLogColumn = SemiTableColumn<AccessLogRecord>;

interface CreateAccessLogColumnsOptions {
  onViewDetail: (record: AccessLogRecord) => void;
}

export function createAccessLogColumns(options: CreateAccessLogColumnsOptions): AccessLogColumn[] {
  const { onViewDetail } = options;

  return [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 130,
      render: (value: string | null) => (
        <span className="font-medium">{value || "未登录/游客"}</span>
      ),
    },
    {
      title: "IP 地址",
      dataIndex: "ip",
      key: "ip",
      width: 140,
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
      width: 100,
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
      width: 220,
      ellipsis: true,
    },
    {
      title: "状态码",
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
      title: "客户端 UA",
      dataIndex: "userAgent",
      key: "userAgent",
      width: 180,
      ellipsis: true,
      render: (value: string | null) =>
        value ? (
          <Tooltip content={value}>
            <span className="text-gray-500 text-12px">{value}</span>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "访问时间",
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
      render: (_: unknown, record: AccessLogRecord) => (
        <Button theme="borderless" type="primary" onClick={() => onViewDetail(record)}>
          详情
        </Button>
      ),
    },
  ];
}
