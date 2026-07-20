import {
  SemiSearchForm,
  SemiTableHeaderOperation,
  getTableScrollX,
  useSemiTable,
  useSemiTableOperate,
  useSemiTableScroll,
} from "@/shared/web-ui-compose";
import type {
  PaginatingQueryRecord,
  TableDataWithIndex,
  TreeSelectOption,
} from "@/shared/web-ui-compose";
import { Card, Form, Table, Toast } from "@douyinfe/semi-ui";
import { keepPreviousData } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  deptApi,
  deptKeys,
  useDeptTreeQuery,
  useDeptTreeTableQuery,
} from "@/service/api/department";
import { queryClient } from "@/service/queryClient";
import type {
  DeptCreateParams,
  DeptSearchParams,
  DeptTreeNode,
  DeptUpdateParams,
} from "@/service/api/department";

import { createDeptColumns } from "./columns";
import DeptOperateDrawer from "./DeptOperateDrawer";
import { useDict } from "@/service/api/dict/hooks";

type DeptRecord = TableDataWithIndex<DeptTreeNode>;

/** 部门树 → Semi TreeSelect 数据结构。仅保留启用状态 of 部门作为上级部门选项。 */
function toDeptTreeData(nodes: DeptTreeNode[]): TreeSelectOption[] {
  return nodes
    .filter((node) => node.status !== "disabled")
    .map((node) => ({
      key: String(node.id),
      label: node.name,
      value: node.id,
      children: node.children?.length ? toDeptTreeData(node.children) : undefined,
    }));
}

/** 拍平树，供按 id 查找编辑数据。 */
function flattenDeptTree(nodes: DeptRecord[]): DeptRecord[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? flattenDeptTree(node.children as DeptRecord[]) : []),
  ]);
}

const DeptPage = () => {
  const {
    options: statusOptions,
    translate: translateStatus,
    getTagColor: getStatusColor,
  } = useDict("sys_status");

  // 用 ref 承接行内操作回调，避免 columns 工厂在 useSemiTable 内被调用时出现 TDZ。
  const addChildHandlerRef = useRef<(record: DeptRecord) => void>(() => {});
  const editHandlerRef = useRef<(record: DeptRecord) => void>(() => {});
  const deleteHandlerRef = useRef<(record: DeptRecord) => void>(() => {});

  const { columnChecks, data, getData, searchProps, setColumnChecks, tableProps } = useSemiTable<
    DeptSearchParams,
    PaginatingQueryRecord<DeptTreeNode>,
    DeptTreeNode
  >({
    apiParams: { current: 1, size: 10 },
    columns: () =>
      createDeptColumns({
        onAddChild: (record) => addChildHandlerRef.current(record),
        onDelete: (record) => deleteHandlerRef.current(record),
        onEdit: (record) => editHandlerRef.current(record),
        translateStatus,
        getStatusColor,
      }),
    queryHook: useDeptTreeTableQuery,
    queryOptions: { placeholderData: keepPreviousData },
  });

  /** 选择框列宽度（Semi Table 默认 48px）。 */
  const SELECTION_COL_WIDTH = 48;
  const scrollX = getTableScrollX(tableProps.columns ?? []) + SELECTION_COL_WIDTH;

  const { scrollConfig, tableWrapperRef } = useSemiTableScroll(scrollX, false);

  const { data: deptTree } = useDeptTreeQuery();
  const deptTreeData = useMemo(() => toDeptTreeData(deptTree ?? []), [deptTree]);

  // 新增下级时预设的上级部门 id（新增顶级为 null）。
  const [presetParentId, setPresetParentId] = useState<number | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!hasLoadedOnce && tableProps.dataSource?.length) {
      setHasLoadedOnce(true);
    }
  }, [hasLoadedOnce, tableProps.dataSource]);

  const flatData = useMemo(() => flattenDeptTree(data), [data]);

  const {
    editingData,
    generalPopupOperation,
    handleAdd,
    handleEdit,
    checkedRowKeys,
    setCheckedRowKeys,
  } = useSemiTableOperate(flatData, getData, async (formData, operateType) => {
    const payload = {
      name: formData.name,
      parentId: formData.parentId ?? null,
      leaderUserId: formData.leaderUserId ?? null,
      status: formData.status,
    };

    if (operateType === "add") {
      await deptApi.create(payload as DeptCreateParams);
      Toast.success("部门创建成功");
    } else if (editingData) {
      await deptApi.update(editingData.id, payload as DeptUpdateParams);
      Toast.success("部门更新成功");
    }
    // useSemiTableOperate 内部会调用 refresh()，这里仅额外刷新 TreeSelect 用的树查询。
    await queryClient.invalidateQueries({ queryKey: deptKeys.tree() });
  });

  function handleAddRoot() {
    setPresetParentId(null);
    handleAdd();
  }

  async function handleSingleDelete(record: DeptRecord) {
    try {
      await deptApi.remove(record.id);
      Toast.success("部门删除成功");
      await queryClient.invalidateQueries({ queryKey: deptKeys.all });
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : "删除失败");
    }
  }

  async function handleBatchDelete() {
    try {
      await deptApi.batchRemove(checkedRowKeys.map(Number));
      Toast.success("部门批量删除成功");
      setCheckedRowKeys([]);
      await queryClient.invalidateQueries({ queryKey: deptKeys.all });
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : "删除失败");
    }
  }

  addChildHandlerRef.current = (record) => {
    setPresetParentId(record.id);
    handleAdd();
  };
  editHandlerRef.current = (record) => handleEdit(record.id);
  deleteHandlerRef.current = handleSingleDelete;

  return (
    <div className="h-full flex flex-col gap-8px overflow-hidden lt-sm:(min-h-500px overflow-auto)">
      <Card bordered={false} className="card-wrapper shrink-0">
        <SemiSearchForm {...searchProps}>
          <Form.Input field="name" label="部门名称" placeholder="请输入部门名称" showClear />
          <Form.Input field="leaderName" label="负责人" placeholder="请输入负责人" showClear />
          <Form.Select
            field="status"
            label="状态"
            optionList={statusOptions}
            placeholder="请选择状态"
            showClear
            style={{ width: "100%" }}
          />
        </SemiSearchForm>
      </Card>

      <div className="min-h-0 flex flex-1 flex-col" ref={tableWrapperRef}>
        <Card
          bodyStyle={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
          bordered={false}
          className="card-wrapper min-h-0 flex flex-1 flex-col"
          headerExtraContent={
            <SemiTableHeaderOperation
              add={handleAddRoot}
              columns={columnChecks}
              deleteCount={checkedRowKeys.length}
              disabledDelete={checkedRowKeys.length === 0}
              loading={tableProps.loading}
              onDelete={handleBatchDelete}
              refresh={getData}
              setColumnChecks={setColumnChecks}
            />
          }
          title="部门管理"
        >
          <Table
            {...tableProps}
            key={hasLoadedOnce ? "loaded" : "loading"}
            rowSelection={{
              fixed: true,
              selectedRowKeys: checkedRowKeys,
              onChange: (keys) => setCheckedRowKeys(keys ?? []),
              getCheckboxProps: (record) => ({
                disabled: Boolean(record.children?.length),
              }),
            }}
            defaultExpandAllRows
            pagination={false}
            scroll={scrollConfig}
            size="small"
          />
        </Card>
      </div>

      <DeptOperateDrawer
        {...generalPopupOperation}
        deptTreeData={deptTreeData}
        presetParentId={presetParentId}
      />
    </div>
  );
};

export default DeptPage;
