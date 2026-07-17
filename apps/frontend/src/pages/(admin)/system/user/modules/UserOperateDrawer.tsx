import { Form, Modal } from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useEffect, useRef } from "react";

import type { SelectOption, TableOperateType, TreeSelectOption } from "@/shared/web-ui-compose";
import type { UserListItem } from "@/service/api/user";

import { STATUS_OPTIONS } from "./constants";

export type DeptTreeOption = TreeSelectOption;

interface UserOperateDrawerProps {
  /** 部门树数据。 */
  deptTreeData?: DeptTreeOption[];
  /** 编辑时的当前行数据。 */
  editingData: UserListItem | null;
  /** 关闭弹窗。 */
  onClose: () => void;
  /** 提交表单（新增/编辑）。 */
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  /** 操作类型。 */
  operateType: TableOperateType;
  /** 角色下拉选项。 */
  roleOptions?: SelectOption[];
  /** 提交中（禁用确定按钮 loading）。 */
  submitting: boolean;
  /** 是否可见。 */
  visible: boolean;
}

const statusOptions = STATUS_OPTIONS.map((item) => ({ label: item.label, value: item.value }));

const UserOperateDrawer = ({
  deptTreeData = [],
  editingData,
  onClose,
  onSubmit,
  operateType,
  roleOptions = [],
  submitting,
  visible,
}: UserOperateDrawerProps) => {
  const formApiRef = useRef<FormApi | null>(null);

  useEffect(() => {
    if (!visible) return;

    const api = formApiRef.current;
    if (!api) return;

    if (operateType === "edit" && editingData) {
      api.setValues({
        username: editingData.username,
        nickname: editingData.nickname ?? "",
        phone: editingData.phone ?? "",
        status: editingData.status,
        departmentId: editingData.departmentId,
        roleIds: editingData.roles?.map((role) => role.id) ?? [],
      });
    } else {
      api.reset();
      api.setValue("status", "active");
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
      title={operateType === "add" ? "新增用户" : "编辑用户"}
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
    >
      <Form
        getFormApi={(api) => {
          formApiRef.current = api;
        }}
        labelPosition="top"
      >
        <Form.Input
          field="username"
          label="用户名"
          placeholder="请输入用户名"
          rules={[{ required: true, message: "请输入用户名" }]}
        />

        {operateType === "add" && (
          <Form.Input
            field="password"
            label="密码"
            mode="password"
            placeholder="请输入密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码长度不能少于 6 位" },
            ]}
          />
        )}

        <Form.Input field="nickname" label="昵称" placeholder="请输入昵称" />

        <Form.Input field="phone" label="手机号" placeholder="请输入手机号" />

        <Form.TreeSelect
          field="departmentId"
          filterTreeNode
          label="所属部门"
          placeholder="请选择部门"
          rules={[{ required: true, message: "请选择部门" }]}
          style={{ width: "100%" }}
          treeData={deptTreeData}
        />

        <Form.RadioGroup
          field="status"
          label="状态"
          options={statusOptions}
          rules={[{ required: true, message: "请选择状态" }]}
        />

        <Form.Select
          field="roleIds"
          label="角色"
          multiple
          optionList={roleOptions}
          placeholder="请选择角色"
          rules={[{ required: true, message: "请选择角色" }]}
          style={{ width: "100%" }}
        />
      </Form>
    </Modal>
  );
};

export default UserOperateDrawer;
