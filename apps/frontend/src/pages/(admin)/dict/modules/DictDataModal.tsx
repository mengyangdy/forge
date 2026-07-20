import { Form, Modal } from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useEffect, useRef } from "react";

import type { TableOperateType } from "@/shared/web-ui-compose";

import { IS_DEFAULT_OPTIONS, LIST_CLASS_OPTIONS, STATUS_OPTIONS } from "./constants";

interface DictDataEditingData {
  cssClass?: string | null;
  description?: string | null;
  dictType: string;
  isDefault: string;
  label: string;
  listClass?: string | null;
  sort: number;
  status: string;
  value: string;
}

interface DictDataModalProps {
  dictType: string;
  editingData: DictDataEditingData | null;
  onClose: () => void;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  operateType: TableOperateType;
  submitting: boolean;
  visible: boolean;
}

const DictDataModal = ({
  dictType,
  editingData,
  onClose,
  onSubmit,
  operateType,
  submitting,
  visible,
}: DictDataModalProps) => {
  const formApiRef = useRef<FormApi | null>(null);

  useEffect(() => {
    if (!visible) return;

    const api = formApiRef.current;
    if (!api) return;

    if (operateType === "edit" && editingData) {
      api.setValues({
        dictType: editingData.dictType,
        label: editingData.label,
        value: editingData.value,
        sort: editingData.sort,
        listClass: editingData.listClass ?? "",
        isDefault: editingData.isDefault,
        cssClass: editingData.cssClass ?? "",
        status: editingData.status,
        description: editingData.description ?? "",
      });
    } else {
      api.reset();
      api.setValue("dictType", dictType);
      api.setValue("sort", 1);
      api.setValue("listClass", "");
      api.setValue("isDefault", "N");
      api.setValue("status", "active");
    }
  }, [visible, operateType, editingData, dictType]);

  async function handleOk() {
    const api = formApiRef.current;
    if (!api) return;

    const values = await api.validate();
    await onSubmit(values);
  }

  return (
    <Modal
      confirmLoading={submitting}
      title={operateType === "add" ? "新增字典数据明细" : "修改字典数据明细"}
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      width={560}
    >
      <Form
        getFormApi={(api) => {
          formApiRef.current = api;
        }}
        labelPosition="top"
      >
        <div className="flex gap-16px">
          <Form.Input field="dictType" label="字典类型编码" disabled style={{ width: "100%" }} />

          <Form.InputNumber
            field="sort"
            label="显示排序"
            placeholder="请输入排序值"
            rules={[{ required: true, message: "请输入排序权重" }]}
            style={{ width: "100%" }}
          />
        </div>

        <div className="flex gap-16px">
          <Form.Input
            field="label"
            label="字典数据标签"
            placeholder="例如：男"
            rules={[
              { required: true, message: "请输入字典标签名称" },
              { max: 100, message: "最长不能超过 100 个字符" },
            ]}
            style={{ width: "100%" }}
          />

          <Form.Input
            field="value"
            label="字典数据键值"
            placeholder="例如：1"
            rules={[
              { required: true, message: "请输入数据键值" },
              { max: 100, message: "最长不能超过 100 个字符" },
            ]}
            style={{ width: "100%" }}
          />
        </div>

        <div className="flex gap-16px">
          <Form.Select
            field="listClass"
            label="样式属性 (Tag配色)"
            optionList={LIST_CLASS_OPTIONS}
            placeholder="请选择标签配色，非必选"
            showClear
            style={{ width: "100%" }}
          />

          <Form.Select
            field="isDefault"
            label="是否默认项"
            optionList={IS_DEFAULT_OPTIONS}
            rules={[{ required: true, message: "请选择是否默认" }]}
            style={{ width: "100%" }}
          />
        </div>

        <div className="flex gap-16px">
          <Form.Select
            field="status"
            label="状态"
            optionList={STATUS_OPTIONS}
            rules={[{ required: true, message: "请选择状态" }]}
            style={{ width: "100%" }}
          />

          <Form.Input
            field="cssClass"
            label="自定义 CSS 类名"
            placeholder="例如：text-primary"
            style={{ width: "100%" }}
            rules={[{ max: 100, message: "最长不能超过 100 个字符" }]}
          />
        </div>

        <Form.TextArea
          field="description"
          label="备注"
          placeholder="请输入备注说明"
          rows={2}
          rules={[{ max: 500, message: "最长不能超过 500 个字符" }]}
        />
      </Form>
    </Modal>
  );
};

export default DictDataModal;
