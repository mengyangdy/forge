import { Form, Modal } from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useEffect, useRef } from "react";

import type { TableOperateType } from "@/shared/web-ui-compose";

import { IS_SYSTEM_OPTIONS, STATUS_OPTIONS } from "./constants";

interface DictTypeEditingData {
  description?: string | null;
  isSystem: string;
  name: string;
  status: string;
  type: string;
}

interface DictTypeModalProps {
  editingData: DictTypeEditingData | null;
  onClose: () => void;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  operateType: TableOperateType;
  submitting: boolean;
  visible: boolean;
}

const DictTypeModal = ({
  editingData,
  onClose,
  onSubmit,
  operateType,
  submitting,
  visible,
}: DictTypeModalProps) => {
  const formApiRef = useRef<FormApi | null>(null);

  useEffect(() => {
    if (!visible) return;

    const api = formApiRef.current;
    if (!api) return;

    if (operateType === "edit" && editingData) {
      api.setValues({
        name: editingData.name,
        type: editingData.type,
        status: editingData.status,
        isSystem: editingData.isSystem,
        description: editingData.description ?? "",
      });
    } else {
      api.reset();
      api.setValue("status", "active");
      api.setValue("isSystem", "N");
    }
  }, [visible, operateType, editingData]);

  async function handleOk() {
    const api = formApiRef.current;
    if (!api) return;

    const values = await api.validate();
    await onSubmit(values);
  }

  return (
    <Modal
      confirmLoading={submitting}
      title={operateType === "add" ? "新增字典类型" : "修改字典类型"}
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      width={520}
    >
      <Form
        getFormApi={(api) => {
          formApiRef.current = api;
        }}
        labelPosition="top"
      >
        <Form.Input
          field="name"
          label="字典名称"
          placeholder="请输入字典名称，例如：用户性别"
          rules={[
            { required: true, message: "请输入字典名称" },
            { max: 100, message: "最长不能超过 100 个字符" },
          ]}
        />

        <Form.Input
          field="type"
          label="字典类型编码"
          placeholder="请输入字典类型编码，例如：sys_user_sex"
          disabled={operateType === "edit"} // 建议编辑时禁用字典编码，防止级联修改导致潜在风险
          rules={[
            { required: true, message: "请输入字典类型编码" },
            {
              pattern: /^[a-z0-9_]+$/,
              message: "只能输入小写字母、数字和下划线",
            },
            { max: 100, message: "最长不能超过 100 个字符" },
          ]}
        />

        <div className="flex gap-16px">
          <Form.Select
            field="status"
            label="状态"
            optionList={STATUS_OPTIONS}
            rules={[{ required: true, message: "请选择状态" }]}
            style={{ width: "100%" }}
          />

          <Form.Select
            field="isSystem"
            label="系统内置"
            optionList={IS_SYSTEM_OPTIONS}
            rules={[{ required: true, message: "请选择是否内置" }]}
            style={{ width: "100%" }}
          />
        </div>

        <Form.TextArea
          field="description"
          label="备注"
          placeholder="请输入备注说明"
          rows={3}
          rules={[{ max: 500, message: "最长不能超过 500 个字符" }]}
        />
      </Form>
    </Modal>
  );
};

export default DictTypeModal;
