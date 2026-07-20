import { Banner, Descriptions, Modal } from "@douyinfe/semi-ui";
import { formatDateTime } from "@forge/shared/utils";

import { useJobDetailQuery } from "@/service/api/job";

interface JobDetailModalProps {
  jobId: string | null;
  onClose: () => void;
  queue: string;
  visible: boolean;
}

function formatJson(data: any) {
  if (!data) return "-";
  try {
    if (typeof data === "string") return JSON.stringify(JSON.parse(data), null, 2);
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

const JobDetailModal = ({ jobId, onClose, queue, visible }: JobDetailModalProps) => {
  const { data: jobDetail } = useJobDetailQuery(queue, jobId || "");

  if (!visible || !jobId) return null;

  return (
    <Modal
      footer={null}
      title={`任务明细 #${jobId}`}
      visible={visible}
      width={720}
      onCancel={onClose}
    >
      <div className="flex flex-col gap-16px max-h-70vh overflow-y-auto pr-6px">
        <Descriptions
          data={[
            { key: "任务 ID", value: jobDetail?.id || jobId },
            { key: "所属队列", value: queue },
            { key: "任务类型名称", value: jobDetail?.name || "-" },
            {
              key: "创建时间",
              value: jobDetail?.timestamp ? formatDateTime(jobDetail.timestamp) : "-",
            },
            {
              key: "开始执行时间",
              value: jobDetail?.processedOn ? formatDateTime(jobDetail.processedOn) : "-",
            },
            {
              key: "完成时间",
              value: jobDetail?.finishedOn ? formatDateTime(jobDetail.finishedOn) : "-",
            },
          ]}
          size="small"
        />

        {jobDetail?.failedReason && (
          <div>
            <div className="text-13px font-medium mb-6px text-red-600">错误日志原因：</div>
            <Banner
              description={
                <div className="font-mono text-12px whitespace-pre-wrap break-all">
                  {jobDetail.failedReason}
                </div>
              }
              type="danger"
            />
          </div>
        )}

        {Boolean(jobDetail?.stacktrace?.length) && (
          <div>
            <div className="text-13px font-medium mb-6px text-red-600">
              错误堆栈跟踪 (Stacktrace)：
            </div>
            <pre
              className="font-mono text-12px p-12px rounded-6px max-h-200px overflow-auto m-0 leading-relaxed border"
              style={{
                backgroundColor: "var(--semi-color-fill-0)",
                borderColor: "var(--semi-color-border)",
                color: "var(--semi-color-danger)",
              }}
            >
              {jobDetail?.stacktrace?.join("\n")}
            </pre>
          </div>
        )}

        <div>
          <div className="text-13px font-medium mb-6px text-gray-700">
            任务荷载数据 (Data Payload)：
          </div>
          <pre
            className="font-mono text-12px p-12px rounded-6px max-h-200px overflow-auto m-0 leading-relaxed border"
            style={{
              backgroundColor: "var(--semi-color-fill-0)",
              borderColor: "var(--semi-color-border)",
              color: "var(--semi-color-text-0)",
            }}
          >
            {formatJson(jobDetail?.data)}
          </pre>
        </div>

        {jobDetail?.returnValue !== undefined && (
          <div>
            <div className="text-13px font-medium mb-6px text-gray-700">
              任务返回值 (Return Value)：
            </div>
            <pre
              className="font-mono text-12px p-12px rounded-6px max-h-180px overflow-auto m-0 leading-relaxed border"
              style={{
                backgroundColor: "var(--semi-color-fill-0)",
                borderColor: "var(--semi-color-border)",
                color: "var(--semi-color-text-0)",
              }}
            >
              {formatJson(jobDetail?.returnValue)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default JobDetailModal;
