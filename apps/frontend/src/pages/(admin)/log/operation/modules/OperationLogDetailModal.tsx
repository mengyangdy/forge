import { Banner, Descriptions, Modal, Tag } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import type { OperationLogItem } from "@/service/api/system-log";

interface OperationLogDetailModalProps {
  data: OperationLogItem | null;
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

const OperationLogDetailModal = ({ data, onClose, visible }: OperationLogDetailModalProps) => {
  if (!data) return null;

  const isSuccess = data.status >= 200 && data.status < 300;
  const operatorName = data.nickname
    ? `${data.nickname} (${data.username})`
    : data.username || "系统服务";

  return (
    <Modal footer={null} title="业务操作日志详情" visible={visible} width={720} onCancel={onClose}>
      <div className="flex flex-col gap-16px max-h-70vh overflow-y-auto pr-6px">
        <Descriptions
          data={[
            { key: "日志 ID", value: data.id },
            { key: "操作用户", value: operatorName },
            {
              key: "操作模块",
              value: <Tag color="cyan">{data.module || "通用模块"}</Tag>,
            },
            {
              key: "操作动作",
              value: <Tag color="blue">{data.action || "通用操作"}</Tag>,
            },
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
              key: "状态",
              value: <Tag color={isSuccess ? "green" : "red"}>{data.status}</Tag>,
            },
            { key: "耗时", value: `${data.duration} ms` },
            { key: "操作时间", value: formatDateTime(data.createdAt) },
            {
              key: "请求 URL",
              value: (
                <div className="break-all font-mono text-12px bg-gray-50 p-6px rounded">
                  {data.url}
                </div>
              ),
            },
          ]}
          size="small"
        />

        {data.errorMessage && (
          <div>
            <div className="text-13px font-medium mb-6px text-red-600">错误异常信息：</div>
            <Banner
              description={
                <pre className="font-mono text-12px whitespace-pre-wrap break-all m-0 max-h-200px overflow-auto">
                  {data.errorMessage}
                </pre>
              }
              type="danger"
            />
          </div>
        )}

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

export default OperationLogDetailModal;
