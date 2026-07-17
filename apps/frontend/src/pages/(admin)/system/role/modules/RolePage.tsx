import {
  SemiSearchForm,
  SemiTableHeaderOperation,
  useSemiTable,
  useSemiTableOperate,
  useSemiTableScroll,
} from "@/shared/web-ui-compose";
import type { PaginatingQueryRecord, TableDataWithIndex } from "@/shared/web-ui-compose";
import { Card, Form, Table, Toast } from "@douyinfe/semi-ui";
import { useRef } from "react";

import { useRoleQuery } from "@/service/api/role/hooks";
import { roleApi } from "@/service/api/role/api";
import type {
  RoleCreateParams,
  RoleListItem,
  RoleSearchParams,
  RoleUpdateParams,
} from "@/service/api/role";

import { createRoleColumns } from "./columns";
import { DATA_SCOPE_OPTIONS, ROLE_TABLE_SCROLL_X } from "./constants";
import RoleOperateDrawer from "./RoleOperateDrawer";

type RoleRecord = TableDataWithIndex<RoleListItem>;

const RolePage = () => {
  const editHandlerRef = useRef<(record: RoleRecord) => void>(() => {});
  const deleteHandlerRef = useRef<(record: RoleRecord) => void>(() => {});

  const { columnChecks, data, getData, searchProps, setColumnChecks, tableProps } = useSemiTable<
    RoleSearchParams,
    PaginatingQueryRecord<RoleListItem>,
    RoleListItem
  >({
    apiParams: { current: 1, size: 10 },
    columns: () =>
      createRoleColumns({
        onDelete: (record) => deleteHandlerRef.current(record),
        onEdit: (record) => editHandlerRef.current(record),
      }),
    queryHook: useRoleQuery,
  });

  const { scrollConfig, tableWrapperRef } = useSemiTableScroll(ROLE_TABLE_SCROLL_X);

  const {
    checkedRowKeys,
    editingData,
    generalPopupOperation,
    handleAdd,
    handleEdit,
    setCheckedRowKeys,
  } = useSemiTableOperate(data, getData, async (formData, operateType) => {
    if (operateType === "add") {
      await roleApi.create(formData as RoleCreateParams);
      Toast.success("角色创建成功");
    } else if (editingData) {
      await roleApi.update(editingData.id, formData as RoleUpdateParams);
      Toast.success("角色更新成功");
    }
  });

  async function handleSingleDelete(record: RoleRecord) {
    await roleApi.remove(record.id);
    Toast.success("角色删除成功");
    await getData();
  }

  async function handleBatchDelete() {
    try {
      await roleApi.batchRemove(checkedRowKeys.map(Number));
      Toast.success("角色批量删除成功");
      setCheckedRowKeys([]);
      await getData();
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : "删除失败");
    }
  }

  editHandlerRef.current = (record) => handleEdit(record.id);
  deleteHandlerRef.current = handleSingleDelete;

  return (
    <div className="h-full flex flex-col gap-16px overflow-hidden lt-sm:(min-h-500px overflow-auto)">
      <Card bordered={false} className="card-wrapper shrink-0">
        <SemiSearchForm {...searchProps}>
          <Form.Input field="name" label="角色名称" placeholder="请输入角色名称" showClear />
          <Form.Input field="code" label="角色编码" placeholder="请输入角色编码" showClear />
          <Form.Select
            field="dataScope"
            label="数据范围"
            optionList={DATA_SCOPE_OPTIONS}
            placeholder="请选择数据范围"
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
              add={handleAdd}
              columns={columnChecks}
              disabledDelete={checkedRowKeys.length === 0}
              loading={tableProps.loading}
              onDelete={handleBatchDelete}
              refresh={getData}
              setColumnChecks={setColumnChecks}
            />
          }
          title="角色管理"
        >
          <Table
            {...tableProps}
            rowSelection={{
              fixed: true,
              selectedRowKeys: checkedRowKeys,
              onChange: (keys) => setCheckedRowKeys(keys ?? []),
            }}
            scroll={scrollConfig}
            size="small"
          />
        </Card>
      </div>

      <RoleOperateDrawer {...generalPopupOperation} />
    </div>
  );
};

export default RolePage;
