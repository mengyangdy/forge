import { Button, Popconfirm, Tag, Tooltip } from "@douyinfe/semi-ui";
import type { ColumnProps } from "@douyinfe/semi-ui/lib/es/table";
import { formatDateTime } from "@forge/shared/utils";

import type { JobItem } from "@/service/api/job";

interface CreateJobColumnsOptions {
  onDetail: (record: JobItem) => void;
  onRemove: (record: JobItem) => void;
  onRetry: (record: JobItem) => void;
  status: string;
}

export function createJobColumns({
  onDetail,
  onRemove,
  onRetry,
  status,
}: CreateJobColumnsOptions): ColumnProps<JobItem>[] {
  return [
    {
      dataIndex: "id",
      key: "id",
      render: (val: string) => (
        <span className="font-mono text-12px font-medium text-gray-900">#{val || "-"}</span>
      ),
      title: "任务 ID",
      width: 90,
    },
    {
      dataIndex: "name",
      key: "name",
      render: (val: string) => (
        <Tag color="blue" className="font-mono text-11px">
          {val}
        </Tag>
      ),
      title: "任务类型名称",
      width: 170,
    },
    {
      dataIndex: "data",
      key: "data",
      render: (val: any) => {
        const jsonStr = JSON.stringify(val || {});
        return (
          <Tooltip
            content={
              <pre className="text-11px font-mono m-0 max-w-300px whitespace-pre-wrap">
                {JSON.stringify(val, null, 2)}
              </pre>
            }
          >
            <span className="font-mono text-12px text-gray-600 truncate max-w-220px block cursor-pointer">
              {jsonStr}
            </span>
          </Tooltip>
        );
      },
      title: "数据荷载 (Payload)",
    },
    {
      dataIndex: "status",
      key: "status",
      render: () => {
        const statusMap: Record<string, { color: any; label: string }> = {
          active: { color: "blue", label: "正在执行" },
          completed: { color: "green", label: "完成" },
          delayed: { color: "purple", label: "延时中" },
          failed: { color: "red", label: "失败" },
          paused: { color: "warning", label: "暂停" },
          waiting: { color: "amber", label: "等待中" },
        };
        const config = statusMap[status] || { color: "grey", label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      title: "当前状态",
      width: 100,
    },
    {
      dataIndex: "timestamp",
      key: "timestamp",
      render: (val: number, record) => {
        const createTime = formatDateTime(val);
        const duration =
          record.finishedOn && record.processedOn
            ? `${record.finishedOn - record.processedOn} ms`
            : null;

        return (
          <div className="flex flex-col text-11px font-mono text-gray-500">
            <span>{createTime}</span>
            {duration && <span className="text-gray-400">耗时: {duration}</span>}
          </div>
        );
      },
      title: "创建/耗时",
      width: 170,
    },
    {
      dataIndex: "action",
      fixed: "right",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center gap-6px">
          <Button size="small" theme="borderless" type="primary" onClick={() => onDetail(record)}>
            明细
          </Button>

          {status === "failed" && (
            <Button size="small" theme="borderless" type="warning" onClick={() => onRetry(record)}>
              重试
            </Button>
          )}

          <Popconfirm
            content={`确定要从队列中移除任务 #${record.id} 吗？`}
            title="移除队列任务"
            onConfirm={() => onRemove(record)}
          >
            <Button size="small" theme="borderless" type="danger">
              移除
            </Button>
          </Popconfirm>
        </div>
      ),
      title: "操作",
      width: 160,
    },
  ];
}
