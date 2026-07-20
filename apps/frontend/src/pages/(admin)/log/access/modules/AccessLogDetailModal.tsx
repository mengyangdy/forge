import { Descriptions, Modal, Tag } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import type { AccessLogItem } from "@/service/api/system-log";

interface AccessLogDetailModalProps {
  data: AccessLogItem | null;
  onClose: () => void;
  visible: boolean;
}

function formatJson(jsonStr: string | null | undefined) {
  if (!jsonStr) return "-";
  try {
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonStr;
  }
}

const AccessLogDetailModal = ({ data, onClose, visible }: AccessLogDetailModalProps) => {
  if (!data) return null;

  const isSuccess = data.status >= 200 && data.status < 300;

  return (
    <Modal footer={null} title="访问日志详情" visible={visible} width={720} onCancel={onClose}>
      <div className="flex flex-col gap-16px max-h-70vh overflow-y-auto pr-6px">
        <Descriptions
          className="mt-8px"
          data={[
            { key: "日志 ID", value: data.id },
            { key: "访问账号", value: data.username || "未登录/游客" },
            {
              key: "IP 地址",
              value: (
                <code className="px-6px py-2px bg-gray-100 rounded text-12px font-mono">
                  {data.ip || "-"}
                </code>
              ),
            },
            {
              key: "请求方式",
              value: <Tag color="blue">{data.method}</Tag>,
            },
            {
              key: "状态码",
              value: <Tag color={isSuccess ? "green" : "red"}>{data.status}</Tag>,
            },
            { key: "响应耗时", value: `${data.duration} ms` },
            { key: "访问时间", value: formatDateTime(data.createdAt) },
            {
              key: "请求 URL",
              value: (
                <div className="break-all font-mono text-12px bg-gray-50 p-6px rounded">
                  {data.url}
                </div>
              ),
            },
            {
              key: "User-Agent",
              value: (
                <div className="break-all font-mono text-12px bg-gray-50 p-6px rounded text-gray-700">
                  {data.userAgent || "-"}
                </div>
              ),
            },
          ]}
          size="small"
        />

        <div>
          <div className="text-13px font-medium mb-6px text-gray-700">
            请求入参 (Request Params)：
          </div>
          <pre
            className="font-mono text-12px p-12px rounded-6px max-h-200px overflow-auto m-0 leading-relaxed border"
            style={{
              backgroundColor: "var(--semi-color-fill-0)",
              color: "var(--semi-color-text-0)",
              borderColor: "var(--semi-color-border)",
            }}
          >
            {formatJson(data.requestParams)}
          </pre>
        </div>

        <div>
          <div className="text-13px font-medium mb-6px text-gray-700">
            响应反参 (Response Data)：
          </div>
          <pre
            className="font-mono text-12px p-12px rounded-6px max-h-250px overflow-auto m-0 leading-relaxed border"
            style={{
              backgroundColor: "var(--semi-color-fill-0)",
              color: "var(--semi-color-text-0)",
              borderColor: "var(--semi-color-border)",
            }}
          >
            {formatJson(data.responseData)}
          </pre>
        </div>
      </div>
    </Modal>
  );
};

export default AccessLogDetailModal;
