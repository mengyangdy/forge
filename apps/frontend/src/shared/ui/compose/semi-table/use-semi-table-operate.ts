import { Toast } from "@douyinfe/semi-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/** 行主键类型（与 Semi Table rowSelection 对齐）。 */
export type TableRowKey = string | number;

/** 操作类型：新增 / 编辑。 */
export type TableOperateType = "add" | "edit";

/** 弹窗提交回调：由页面按 operateType 分别调用新增 / 编辑接口。 */
export interface TableOperateSubmit {
  (data: Record<string, any>, operateType: TableOperateType): Promise<void> | void;
}

/** 传给「新增/编辑弹窗」组件的一组属性。 */
export interface GeneralPopupOperation<T> {
  editingData: T | null;
  onClose: () => void;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  operateType: TableOperateType;
  submitting: boolean;
  visible: boolean;
}

/**
 * Semi 版表格增删改交互 hook（对齐 soybean-admin 的 useTableOperate）。
 *
 * 负责：行选择、新增/编辑弹窗开关与数据、删除后的提示与刷新。
 * 真正的接口调用交给：
 * - 新增/编辑：第三个参数 `onSubmit(data, type)`；
 * - 删除：页面自行发请求，成功后调用 `onDeleted` / `onBatchDeleted`。
 *
 * @param data 当前表格数据（用于编辑时按 id 回填）。
 * @param refresh 刷新列表（一般传 useSemiTable 的 getData / run）。
 * @param onSubmit 弹窗提交时的接口调用回调。
 */
export function useSemiTableOperate<T extends Record<string, any>>(
  data: T[],
  refresh: () => Promise<void> | void,
  onSubmit?: TableOperateSubmit,
) {
  const { t } = useTranslation();

  const [checkedRowKeys, setCheckedRowKeys] = useState<TableRowKey[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [operateType, setOperateType] = useState<TableOperateType>("add");
  const [editingData, setEditingData] = useState<T | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function openDrawer() {
    setDrawerVisible(true);
  }

  function closeDrawer() {
    setDrawerVisible(false);
  }

  function handleAdd() {
    setOperateType("add");
    setEditingData(null);
    openDrawer();
  }

  function handleEdit(id: TableRowKey) {
    setOperateType("edit");
    setEditingData(data.find((item) => item.id === id) ?? null);
    openDrawer();
  }

  async function handleSubmit(formData: Record<string, any>) {
    setSubmitting(true);
    try {
      await onSubmit?.(formData, operateType);
      closeDrawer();
      await refresh();
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  }

  /** 单条删除成功后：提示 + 刷新。 */
  async function onDeleted() {
    Toast.success(t("common.deleteSuccess"));
    await refresh();
  }

  /** 批量删除成功后：提示 + 清空选择 + 刷新。 */
  async function onBatchDeleted() {
    Toast.success(t("common.deleteSuccess"));
    setCheckedRowKeys([]);
    await refresh();
  }

  const rowSelection = {
    fixed: true,
    selectedRowKeys: checkedRowKeys,
    onChange: (selectedRowKeys?: TableRowKey[]) => setCheckedRowKeys(selectedRowKeys ?? []),
  };

  const generalPopupOperation: GeneralPopupOperation<T> = {
    editingData,
    onClose: closeDrawer,
    onSubmit: handleSubmit,
    operateType,
    submitting,
    visible: drawerVisible,
  };

  return {
    checkedRowKeys,
    closeDrawer,
    drawerVisible,
    editingData,
    generalPopupOperation,
    handleAdd,
    handleEdit,
    onBatchDeleted,
    onDeleted,
    openDrawer,
    operateType,
    rowSelection,
    setCheckedRowKeys,
  };
}
