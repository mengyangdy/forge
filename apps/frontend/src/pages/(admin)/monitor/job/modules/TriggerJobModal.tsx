import { Button, Input, Modal, Radio, RadioGroup, TextArea, Toast } from "@douyinfe/semi-ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { jobApi, jobKeys } from "@/service/api/job";

interface TriggerJobModalProps {
  onClose: () => void;
  visible: boolean;
}

const TriggerJobModal = ({ onClose, visible }: TriggerJobModalProps) => {
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<"emailQueue" | "systemQueue">("emailQueue");
  const [jobName, setJobName] = useState<string>("sendWelcomeEmail");
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify({ email: "user@example.com", subject: "系统任务调度的测试通知" }, null, 2),
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    let dataObj = {};
    try {
      dataObj = JSON.parse(payloadText);
    } catch {
      Toast.error("JSON 数据格式解析错误，请检查规范");
      return;
    }

    setSubmitting(true);
    try {
      await jobApi.trigger({
        data: dataObj,
        jobName: jobName.trim() || "testTask",
        queue,
      });
      Toast.success("测试任务成功压入调度队列！");
      await queryClient.invalidateQueries({ queryKey: jobKeys.all });
      onClose();
    } catch (err: any) {
      Toast.error(err.message || "派发失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      footer={
        <div className="flex items-center justify-end gap-12px">
          <Button type="secondary" onClick={onClose}>
            取消
          </Button>
          <Button loading={submitting} type="primary" onClick={handleSubmit}>
            派发任务
          </Button>
        </div>
      }
      title="🧪 手动派发测试队列任务"
      visible={visible}
      width={560}
      onCancel={onClose}
    >
      <div className="flex flex-col gap-14px my-8px">
        <div>
          <div className="text-12px font-medium text-gray-700 mb-6px">目标队列：</div>
          <RadioGroup type="button" value={queue} onChange={(e) => setQueue(e.target.value as any)}>
            <Radio value="emailQueue">📧 邮件队列 (emailQueue)</Radio>
            <Radio value="systemQueue">⚙️ 系统维护 (systemQueue)</Radio>
          </RadioGroup>
        </div>

        <div>
          <div className="text-12px font-medium text-gray-700 mb-6px">任务类型名称：</div>
          <Input
            placeholder="如 sendWelcomeEmail, cleanTempFile"
            value={jobName}
            onChange={(val) => setJobName(val)}
          />
        </div>

        <div>
          <div className="text-12px font-medium text-gray-700 mb-6px">
            数据荷载 Payload (JSON 格式)：
          </div>
          <TextArea
            autosize={{ minRows: 4, maxRows: 8 }}
            placeholder="输入 JSON 数据对象"
            value={payloadText}
            onChange={(val) => setPayloadText(val)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default TriggerJobModal;
