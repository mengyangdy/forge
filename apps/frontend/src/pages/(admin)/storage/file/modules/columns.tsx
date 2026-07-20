import { Button, Popconfirm, Tag, Tooltip } from "@douyinfe/semi-ui";
import type { ColumnProps } from "@douyinfe/semi-ui/lib/es/table";
import { formatDateTime } from "@forge/shared/utils";

import type { FileRecordItem } from "@/service/api/storage";
import SvgIcon from "@/shared/ui/compose/components/SvgIcon";

import { formatFileSize, getFileIcon } from "./constants";

interface CreateFileColumnsOptions {
  onCopyUrl: (record: FileRecordItem) => void;
  onDelete: (record: FileRecordItem) => void;
}

export function createFileColumns({
  onCopyUrl,
  onDelete,
}: CreateFileColumnsOptions): ColumnProps<FileRecordItem>[] {
  return [
    {
      dataIndex: "filename",
      key: "filename",
      render: (_, record) => {
        const iconName = getFileIcon(record.filename);
        return (
          <div className="flex items-center gap-10px">
            <SvgIcon className="text-22px text-blue-600 shrink-0" icon={iconName} />
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-14px text-gray-900 truncate max-w-220px">
                {record.filename}
              </span>
              <Tooltip content={`MD5: ${record.hash}`}>
                <span className="text-11px text-gray-400 font-mono truncate max-w-180px">
                  {record.hash}
                </span>
              </Tooltip>
            </div>
          </div>
        );
      },
      title: "文件名",
    },
    {
      dataIndex: "size",
      key: "size",
      render: (val: number) => (
        <span className="text-12px font-mono text-gray-700 font-medium">{formatFileSize(val)}</span>
      ),
      title: "文件大小",
      width: 110,
    },
    {
      dataIndex: "mimeType",
      key: "mimeType",
      render: (val: string | null) => (
        <Tag color="cyan" className="font-mono text-11px">
          {val || "octet-stream"}
        </Tag>
      ),
      title: "MIME 类型",
      width: 140,
    },
    {
      dataIndex: "provider",
      key: "provider",
      render: (val: string) => (
        <Tag color={val === "local" ? "green" : "blue"} className="font-mono text-11px">
          {val.toUpperCase()}
        </Tag>
      ),
      title: "存储介质",
      width: 100,
    },
    {
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) => (
        <span className="text-12px text-gray-500 font-mono">{formatDateTime(val)}</span>
      ),
      title: "上传时间",
      width: 170,
    },
    {
      dataIndex: "action",
      fixed: "right",
      key: "action",
      render: (_, record) => (
        <div className="flex items-center gap-6px">
          <Button size="small" theme="borderless" type="primary" onClick={() => onCopyUrl(record)}>
            复制链接
          </Button>

          <a href={record.url} rel="noreferrer" target="_blank">
            <Button size="small" theme="borderless" type="tertiary">
              访问
            </Button>
          </a>

          <Popconfirm
            content={`确定要删除存储文件 "${record.filename}" 吗？`}
            title="确认删除文件"
            onConfirm={() => onDelete(record)}
          >
            <Button size="small" theme="borderless" type="danger">
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
      title: "操作",
      width: 200,
    },
  ];
}
