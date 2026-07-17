import {
  SemiSearchForm,
  SemiTableHeaderOperation,
  getTableScrollX,
  useSemiTable,
  useSemiTableOperate,
  useSemiTableScroll,
} from "@/shared/web-ui-compose";
import type { PaginatingQueryRecord, TreeSelectOption } from "@/shared/web-ui-compose";
import { Card, Form, Table, Toast } from "@douyinfe/semi-ui";
import { keepPreviousData } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  permissionApi,
  permissionKeys,
  usePermissionTreeQuery,
  usePermissionTreeTableQuery,
} from "@/service/api/permission";
import type {
  PermissionCreateParams,
  PermissionListItem,
  PermissionSearchParams,
  PermissionTreeNode,
  PermissionUpdateParams,
} from "@/service/api/permission";
import { queryClient } from "@/service/queryClient";

import MenuItemEdit from "./AddMenu";
import { createMenuColumns } from "./columns";
import { TYPE_OPTIONS } from "./constants";

type MenuRecord = PermissionTreeNode;

/** PermissionTreeNode 带上从子节点提取的按钮列表，供表格渲染使用。 */
export type MenuTableRecord = PermissionTreeNode & {
  buttonList?: PermissionListItem[];
};

/** 将权限树转换为 Semi TreeSelect 可用的结构。仅菜单类型可作为上级。 */
function toMenuTreeData(nodes: PermissionTreeNode[]): TreeSelectOption[] {
  return nodes
    .filter(
      (node) => node.status !== "disabled" && (node.type === "menu" || node.type === "catalogue"),
    )
    .map((node) => ({
      key: String(node.id),
      label: node.name,
      value: node.id,
      children: node.children?.length ? toMenuTreeData(node.children) : undefined,
    }));
}

/** 拍平树，供双向查找。 */
function flattenPermissionTree(nodes: PermissionTreeNode[]): PermissionListItem[] {
  return nodes.flatMap((node) => {
    const { children, ...rest } = node;
    return [rest, ...(children ? flattenPermissionTree(children) : [])];
  });
}

const MenuPage = () => {
  const addChildHandlerRef = useRef<(record: MenuRecord) => void>(() => {});
  const editHandlerRef = useRef<(record: MenuRecord) => void>(() => {});
  const deleteHandlerRef = useRef<(record: MenuRecord) => void>(() => {});

  const { columnChecks, data, getData, searchProps, setColumnChecks, tableProps } = useSemiTable<
    PermissionSearchParams,
    PaginatingQueryRecord<PermissionTreeNode>,
    PermissionTreeNode
  >({
    apiParams: { current: 1, size: 10 },
    columns: () =>
      createMenuColumns({
        onAddChild: (record) => addChildHandlerRef.current(record),
        onDelete: (record) => deleteHandlerRef.current(record),
        onEdit: (record) => editHandlerRef.current(record),
      }),
    queryHook: usePermissionTreeTableQuery,
    queryOptions: { placeholderData: keepPreviousData },
  });

  const scrollX = getTableScrollX(tableProps.columns ?? []) + 60;
  const { scrollConfig, tableWrapperRef } = useSemiTableScroll(scrollX);

  const { data: permissionTree } = usePermissionTreeQuery();
  const menuTreeData = useMemo(() => toMenuTreeData(permissionTree ?? []), [permissionTree]);
  const tableTreeData = useMemo(() => {
    function processNode(node: PermissionTreeNode): MenuTableRecord {
      const children = node.children || [];
      const buttons = children.filter((child) => child.type === "button");
      const subMenus = children.filter((child) => child.type !== "button");
      return {
        ...node,
        buttonList: buttons,
        children: subMenus.length > 0 ? subMenus.map(processNode) : undefined,
      };
    }
    return (data ?? []).map(processNode);
  }, [data]);
  const flatTreeData = useMemo(() => flattenPermissionTree(permissionTree ?? []), [permissionTree]);

  // 新增下级时预设的上级菜单 id。
  const [presetParentId, setPresetParentId] = useState<number | null>(null);

  // 如果平铺的主表列表不够用（由于分页），编辑时可以使用全量扁平树数据寻找对应记录
  const tableAndTreeData = useMemo(() => {
    const map = new Map<number, PermissionListItem>();
    flatTreeData.forEach((item) => map.set(item.id, item));
    data.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [data, flatTreeData]);

  const {
    checkedRowKeys,
    editingData,
    generalPopupOperation,
    handleAdd,
    handleEdit,
    setCheckedRowKeys,
  } = useSemiTableOperate(tableAndTreeData, getData, async (formData, operateType) => {
    const payload = {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      parentId: formData.parentId ?? null,
      routeName: formData.routeName || null,
      routePath: formData.routePath || null,
      component: formData.component || null,
      pathParam: formData.pathParam || null,
      i18nKey: formData.i18nKey || null,
      order: Number(formData.order ?? 0),
      iconType: formData.iconType || "iconify",
      icon: formData.icon || null,
      status: formData.status || "active",
      buttons: formData.buttons,
    };

    if (operateType === "add") {
      const result = await permissionApi.create(payload as PermissionCreateParams);
      Toast.success(result.message);
    } else if (editingData) {
      const result = await permissionApi.update(editingData.id, payload as PermissionUpdateParams);
      Toast.success(result.message);
    }
    await queryClient.invalidateQueries({ queryKey: permissionKeys.all });
  });

  function handleAddRoot() {
    setPresetParentId(null);
    handleAdd();
  }

  // oxlint-disable-next-line unicorn/consistent-function-scoping
  async function handleSingleDelete(record: MenuRecord) {
    try {
      const result = await permissionApi.remove(record.id);
      Toast.success(result.message);
      await queryClient.invalidateQueries({ queryKey: permissionKeys.all });
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : "删除失败");
    }
  }

  async function handleBatchDelete() {
    try {
      await permissionApi.batchRemove(checkedRowKeys.map(Number));
      Toast.success("菜单权限批量删除成功");
      setCheckedRowKeys([]);
      await queryClient.invalidateQueries({ queryKey: permissionKeys.all });
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

  // 仅在首次加载数据成功时切 key，触发初始默认展开，后续过滤搜索防抖防闪烁
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!hasLoadedOnce && tableProps.dataSource?.length) {
      setHasLoadedOnce(true);
    }
  }, [hasLoadedOnce, tableProps.dataSource]);

  return (
    <div className="h-full flex flex-col gap-8px overflow-hidden lt-sm:(min-h-500px overflow-auto)">
      <Card bordered={false} className="card-wrapper shrink-0">
        <SemiSearchForm {...searchProps}>
          <Form.Input field="name" label="权限名称" placeholder="请输入权限名称" showClear />
          <Form.Input field="code" label="权限编码" placeholder="请输入权限编码" showClear />
          <Form.Select
            field="type"
            label="类型"
            optionList={TYPE_OPTIONS}
            placeholder="请选择类型"
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
          title="菜单管理"
        >
          <Table
            {...tableProps}
            dataSource={tableTreeData as unknown as typeof tableProps.dataSource}
            pagination={false}
            key={hasLoadedOnce ? "loaded" : "loading"}
            rowSelection={{
              selectedRowKeys: checkedRowKeys,
              onChange: (keys) => setCheckedRowKeys(keys ?? []),
              getCheckboxProps: (record) => ({
                disabled: Boolean(record.children?.length),
              }),
            }}
            defaultExpandAllRows
            scroll={scrollConfig}
            size="small"
          />
        </Card>
      </div>

      <MenuItemEdit
        {...generalPopupOperation}
        menuTreeData={menuTreeData}
        presetParentId={presetParentId}
      />
    </div>
  );
};

export default MenuPage;
