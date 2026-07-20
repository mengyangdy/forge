import {
  SemiSearchForm,
  SemiTableHeaderOperation,
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
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { userApi } from "@/service/api/user";
import { useUserQuery } from "@/service/api/user/hooks";
import type {
  UserCreateParams,
  UserListItem,
  UserSearchParams,
  UserUpdateParams,
} from "@/service/api/user";
import { useRoleListQuery } from "@/service/api/role";
import { useDeptTreeQuery } from "@/service/api/department";
import type { DeptTreeNode } from "@/service/api/department";

import { createUserColumns } from "./columns";
import { USER_TABLE_SCROLL_X } from "./constants";
import UserOperateDrawer from "./UserOperateDrawer";
import { useDict } from "@/service/api/dict/hooks";

type UserRecord = TableDataWithIndex<UserListItem>;

/** 部门树 → Semi TreeSelect 数据结构。 */
function toDeptTreeData(nodes: DeptTreeNode[]): TreeSelectOption[] {
  return nodes.map((node) => ({
    key: String(node.id),
    label: node.name,
    value: node.id,
    children: node.children?.length ? toDeptTreeData(node.children) : undefined,
  }));
}

const UserPage = () => {
  const {
    options: statusOptions,
    translate: translateStatus,
    getTagColor: getStatusColor,
  } = useDict("sys_status");

  // 用 ref 承接行内操作回调，避免 columns 工厂在 useSemiTable 内被调用时出现 TDZ。
  const editHandlerRef = useRef<(record: UserRecord) => void>(() => {});
  const deleteHandlerRef = useRef<(record: UserRecord) => void>(() => {});

  const { t } = useTranslation();
  const { columnChecks, data, getData, searchProps, setColumnChecks, tableProps } = useSemiTable<
    UserSearchParams,
    PaginatingQueryRecord<UserListItem>,
    UserListItem
  >({
    apiParams: { current: 1, size: 10 },
    columns: () =>
      createUserColumns({
        onDelete: (record) => deleteHandlerRef.current(record),
        onEdit: (record) => editHandlerRef.current(record),
        translateStatus,
        getStatusColor,
      }),
    queryHook: useUserQuery,
  });

  const { scrollConfig, tableWrapperRef } = useSemiTableScroll(USER_TABLE_SCROLL_X);

  const { data: roleData } = useRoleListQuery();
  const { data: deptTree } = useDeptTreeQuery();

  const roleOptions = (roleData ?? []).map((role) => ({
    label: role.name,
    value: role.id,
  }));
  const deptTreeData = toDeptTreeData(deptTree ?? []);

  const {
    checkedRowKeys,
    editingData,
    generalPopupOperation,
    handleAdd,
    handleEdit,
    setCheckedRowKeys,
  } = useSemiTableOperate(data, getData, async (formData, operateType) => {
    if (operateType === "add") {
      await userApi.create(formData as UserCreateParams);
      Toast.success(t("common.addSuccess"));
    } else if (editingData) {
      await userApi.update(editingData.id, formData as UserUpdateParams);
      Toast.success(t("common.modifySuccess"));
    }
  });

  async function handleSingleDelete(record: UserRecord) {
    await userApi.remove(record.id);
    Toast.success(t("common.deleteSuccess"));
    await getData();
  }

  async function handleBatchDelete() {
    try {
      await userApi.batchRemove(checkedRowKeys.map(Number));
      Toast.success("用户批量删除成功");
      setCheckedRowKeys([]);
      await getData();
    } catch (error) {
      Toast.error(error instanceof Error ? error.message : "删除失败");
    }
  }

  editHandlerRef.current = (record) => handleEdit(record.id);
  deleteHandlerRef.current = handleSingleDelete;

  return (
    <div className="h-full flex flex-col gap-8px overflow-hidden lt-sm:(min-h-500px overflow-auto)">
      <Card bordered={false} className="card-wrapper shrink-0">
        <SemiSearchForm {...searchProps}>
          <Form.Input field="username" label="用户名" placeholder="请输入用户名" showClear />
          <Form.Input field="nickname" label="昵称" placeholder="请输入昵称" showClear />
          <Form.Input field="phone" label="手机号" placeholder="请输入手机号" showClear />
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
              add={handleAdd}
              columns={columnChecks}
              disabledDelete={checkedRowKeys.length === 0}
              loading={tableProps.loading}
              onDelete={handleBatchDelete}
              refresh={getData}
              setColumnChecks={setColumnChecks}
            />
          }
          title="用户管理"
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

      <UserOperateDrawer
        {...generalPopupOperation}
        deptTreeData={deptTreeData}
        roleOptions={roleOptions}
      />
    </div>
  );
};

export default UserPage;
