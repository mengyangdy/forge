import { useDebounce } from "ahooks";
import { Form, Modal } from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TableOperateType, TreeSelectOption } from "@/shared/web-ui-compose";
import type { DeptListItem } from "@/service/api/department";
import { useUserQuery } from "@/service/api/user/hooks";

import { STATUS_OPTIONS } from "./constants";

export type DeptTreeOption = TreeSelectOption;

interface DeptOperateDrawerProps {
  /** 上级部门树数据。 */
  deptTreeData?: DeptTreeOption[];
  /** 编辑时的当前行数据。 */
  editingData: DeptListItem | null;

  /** 关闭弹窗。 */
  onClose: () => void;
  /** 提交表单（新增/编辑）。 */
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  /** 操作类型。 */
  operateType: TableOperateType;
  /** 新增下级时预设的上级部门 id（新增顶级为 null）。 */
  presetParentId?: number | null;
  /** 提交中（禁用确定按钮 loading）。 */
  submitting: boolean;
  /** 是否可见。 */
  visible: boolean;
}

const statusOptions = STATUS_OPTIONS.map((item) => ({ label: item.label, value: item.value }));

/** 编辑时禁用「自身及其子孙」作为上级，避免形成环。 */
function disableSelfSubtree(nodes: DeptTreeOption[], disabledId: number): DeptTreeOption[] {
  return nodes.map((node) => {
    const isSelf = node.value === disabledId;
    return {
      ...node,
      disabled: isSelf,
      children: node.children
        ? isSelf
          ? node.children.map((child) => markAllDisabled(child))
          : disableSelfSubtree(node.children, disabledId)
        : undefined,
    };
  });
}

function markAllDisabled(node: DeptTreeOption): DeptTreeOption {
  return {
    ...node,
    disabled: true,
    children: node.children?.map((child) => markAllDisabled(child)),
  };
}

const DeptOperateDrawer = ({
  deptTreeData = [],
  editingData,
  onClose,
  onSubmit,
  operateType,
  presetParentId = null,
  submitting,
  visible,
}: DeptOperateDrawerProps) => {
  const formApiRef = useRef<FormApi | null>(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebounce(searchKeyword, { wait: 250 });

  const { data: userData, isLoading: isUserLoading } = useUserQuery({
    current: 1,
    size: 100,
    nickname: debouncedKeyword || undefined,
  });

  const leaderOptions = useMemo(() => {
    const list = (userData?.records ?? []).map((user) => ({
      label: user.nickname || user.username,
      value: user.id,
    }));

    // 回显保证：如果编辑状态下的负责人不在前100个列表里，手动合入以保证名称正常显示
    if (editingData?.leaderUserId && editingData?.leaderName) {
      const hasLeader = list.some((item) => item.value === editingData.leaderUserId);
      if (!hasLeader) {
        list.push({
          label: editingData.leaderName,
          value: editingData.leaderUserId,
        });
      }
    }
    return list;
  }, [userData, editingData]);

  // 当弹窗关闭时，重置搜索词
  useEffect(() => {
    if (!visible) {
      setSearchKeyword("");
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const api = formApiRef.current;
    if (!api) return;

    if (operateType === "edit" && editingData) {
      api.setValues({
        name: editingData.name,
        parentId: editingData.parentId ?? undefined,
        leaderUserId: editingData.leaderUserId ?? undefined,
        status: editingData.status,
      });
    } else {
      api.reset();
      api.setValues({
        status: "active",
        parentId: presetParentId ?? undefined,
      });
    }
  }, [visible, operateType, editingData, presetParentId]);

  const treeData =
    operateType === "edit" && editingData
      ? disableSelfSubtree(deptTreeData, editingData.id)
      : deptTreeData;

  async function handleOk() {
    const api = formApiRef.current;
    if (!api) return;

    const values = await api.validate();
    await onSubmit(values);
  }

  return (
    <Modal
      confirmLoading={submitting}
      title={operateType === "add" ? "新增部门" : "编辑部门"}
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
          field="name"
          label="部门名称"
          placeholder="请输入部门名称"
          rules={[{ required: true, message: "请输入部门名称" }]}
        />

        <Form.TreeSelect
          field="parentId"
          filterTreeNode
          label="上级部门"
          placeholder="不选则为顶级部门"
          showClear
          style={{ width: "100%" }}
          treeData={treeData}
        />

        <Form.Select
          field="leaderUserId"
          filter
          label="负责人"
          loading={isUserLoading}
          optionList={leaderOptions}
          placeholder="请选择负责人"
          remote
          showClear
          style={{ width: "100%" }}
          onSearch={(v) => setSearchKeyword(v)}
        />

        <Form.RadioGroup
          field="status"
          label="状态"
          options={statusOptions}
          rules={[{ required: true, message: "请选择状态" }]}
        />
      </Form>
    </Modal>
  );
};

export default DeptOperateDrawer;
