import { useEffect, useRef, useState } from "react";
import { Card, Form, Table, Toast } from "@douyinfe/semi-ui";
import { Icon } from "@iconify/react";

import {
  SemiSearchForm,
  SemiTableHeaderOperation,
  useSemiTable,
  useSemiTableOperate,
  useSemiTableScroll,
} from "@/shared/web-ui-compose";
import type { PaginatingQueryRecord } from "@/shared/web-ui-compose";

import { dictApi, dictKeys } from "@/service/api/dict/api";
import { useDictDataQuery, useDictTypeQuery } from "@/service/api/dict/hooks";
import type {
  DictDataCreateParams,
  DictDataListItem,
  DictDataSearchParams,
  DictDataUpdateParams,
  DictTypeCreateParams,
  DictTypeListItem,
  DictTypeSearchParams,
  DictTypeUpdateParams,
} from "@/service/api/dict/types";
import { queryClient } from "@/service/queryClient";

import { createDictDataColumns, createDictTypeColumns } from "./columns";
import { DICT_DATA_TABLE_SCROLL_X, DICT_TYPE_TABLE_SCROLL_X } from "./constants";
import DictDataModal from "./DictDataModal";
import DictTypeModal from "./DictTypeModal";

interface SelectedDictType {
  description?: string;
  id: number;
  name: string;
  status: string;
  type: string;
}

const DictPage = () => {
  // 左侧字典类型状态与引用
  const editTypeHandlerRef = useRef<(record: DictTypeListItem) => void>(() => {});
  const deleteTypeHandlerRef = useRef<(record: DictTypeListItem) => void>(() => {});
  const [selectedType, setSelectedType] = useState<SelectedDictType | null>(null);

  // 右侧字典明细状态与引用
  const editDataHandlerRef = useRef<(record: DictDataListItem) => void>(() => {});
  const deleteDataHandlerRef = useRef<(record: DictDataListItem) => void>(() => {});

  // ==========================================
  // 1. 左侧：字典类型表格数据流
  // ==========================================
  const {
    columnChecks: typeColumnChecks,
    data: typeData,
    getData: getTypeData,
    searchProps: typeSearchProps,
    setColumnChecks: setTypeColumnChecks,
    tableProps: typeTableProps,
  } = useSemiTable<DictTypeSearchParams, PaginatingQueryRecord<DictTypeListItem>, DictTypeListItem>(
    {
      apiParams: { current: 1, size: 10 },
      columns: () =>
        createDictTypeColumns({
          onEdit: (record) => editTypeHandlerRef.current(record),
          onDelete: (record) => deleteTypeHandlerRef.current(record),
        }),
      queryHook: useDictTypeQuery,
    },
  );

  const { scrollConfig: typeScrollConfig, tableWrapperRef: typeTableWrapperRef } =
    useSemiTableScroll(DICT_TYPE_TABLE_SCROLL_X);

  const {
    checkedRowKeys: typeCheckedRowKeys,
    editingData: typeEditingData,
    generalPopupOperation: typePopupOperation,
    handleAdd: handleAddType,
    handleEdit: handleEditType,
    setCheckedRowKeys: setTypeCheckedRowKeys,
  } = useSemiTableOperate(typeData, getTypeData, async (formData, operateType) => {
    const payload = {
      name: formData.name,
      type: formData.type,
      status: formData.status,
      description: formData.description ?? "",
    };

    if (operateType === "add") {
      await dictApi.createType(payload as DictTypeCreateParams);
      Toast.success("字典类型创建成功");
    } else if (typeEditingData) {
      await dictApi.updateType(typeEditingData.id, payload as DictTypeUpdateParams);
      Toast.success("字典类型更新成功");
      // 如果更新了选中的字典类型，同步更新 selectedType 状态
      if (selectedType && selectedType.id === typeEditingData.id) {
        setSelectedType({ ...selectedType, ...payload });
      }
    }
    // 强制清理全局字典缓存，触发下拉框等刷新
    await queryClient.invalidateQueries({ queryKey: dictKeys.globalAll() });
  });

  async function handleSingleDeleteType(record: DictTypeListItem) {
    try {
      await dictApi.removeType(record.id);
      Toast.success("字典类型删除成功");
      // 如果删除的是当前选中的类型，清空选中状态
      if (selectedType && selectedType.id === record.id) {
        setSelectedType(null);
      }
      await getTypeData();
      await queryClient.invalidateQueries({ queryKey: dictKeys.globalAll() });
    } catch (error: any) {
      Toast.error(error.message || "删除失败");
    }
  }

  async function handleBatchDeleteTypes() {
    try {
      const selectedIds = typeCheckedRowKeys.map(Number);
      for (const id of selectedIds) {
        await dictApi.removeType(id);
      }
      Toast.success("批量删除字典类型成功");
      setTypeCheckedRowKeys([]);
      // 判断当前选中项是否在批量删除列表中
      if (selectedType && selectedIds.includes(selectedType.id)) {
        setSelectedType(null);
      }
      await getTypeData();
      await queryClient.invalidateQueries({ queryKey: dictKeys.globalAll() });
    } catch (error: any) {
      Toast.error(error.message || "批量删除失败");
    }
  }

  editTypeHandlerRef.current = (record) => handleEditType(record.id);
  deleteTypeHandlerRef.current = handleSingleDeleteType;

  // ==========================================
  // 2. 右侧：字典明细表格数据流
  // ==========================================
  const {
    columnChecks: dataColumnChecks,
    data: dataData,
    getData: getValData,
    searchProps: dataSearchProps,
    setColumnChecks: setDataColumnChecks,
    tableProps: dataTableProps,
    updateSearchParams: updateDataSearchParams,
  } = useSemiTable<DictDataSearchParams, PaginatingQueryRecord<DictDataListItem>, DictDataListItem>(
    {
      apiParams: { current: 1, size: 10, dictType: selectedType?.type ?? "" },
      columns: () =>
        createDictDataColumns({
          onEdit: (record) => editDataHandlerRef.current(record),
          onDelete: (record) => deleteDataHandlerRef.current(record),
        }),
      queryHook: useDictDataQuery,
      enabled: Boolean(selectedType?.type), // 仅在选中字典类型时启用明细查询
      immediate: false, // 初始不立即请求，等选中联动再请求
    },
  );

  const { scrollConfig: dataScrollConfig, tableWrapperRef: dataTableWrapperRef } =
    useSemiTableScroll(DICT_DATA_TABLE_SCROLL_X);

  // 监听选中字典类型的变化，更新明细表的查询参数并重新触发拉取
  useEffect(() => {
    if (selectedType) {
      updateDataSearchParams({ dictType: selectedType.type, current: 1 });
    }
  }, [selectedType]);

  const {
    checkedRowKeys: dataCheckedRowKeys,
    editingData: dataEditingData,
    generalPopupOperation: dataPopupOperation,
    handleAdd: handleAddData,
    handleEdit: handleEditData,
    setCheckedRowKeys: setDataCheckedRowKeys,
  } = useSemiTableOperate(dataData, getValData, async (formData, operateType) => {
    if (!selectedType) return;
    const payload = {
      dictType: selectedType.type,
      label: formData.label,
      value: formData.value,
      sort: Number(formData.sort ?? 0),
      listClass: formData.listClass || null,
      isDefault: formData.isDefault || "N",
      cssClass: formData.cssClass || null,
      status: formData.status,
      description: formData.description ?? "",
    };

    if (operateType === "add") {
      await dictApi.createData(payload as DictDataCreateParams);
      Toast.success("字典明细创建成功");
    } else if (dataEditingData) {
      await dictApi.updateData(dataEditingData.id, payload as DictDataUpdateParams);
      Toast.success("字典明细更新成功");
    }
    // 强制清理全局字典缓存
    await queryClient.invalidateQueries({ queryKey: dictKeys.globalAll() });
  });

  async function handleSingleDeleteData(record: DictDataListItem) {
    try {
      await dictApi.removeData(record.id);
      Toast.success("字典明细项删除成功");
      await getValData();
      await queryClient.invalidateQueries({ queryKey: dictKeys.globalAll() });
    } catch (error: any) {
      Toast.error(error.message || "删除失败");
    }
  }

  async function handleBatchDeleteDatas() {
    try {
      const selectedIds = dataCheckedRowKeys.map(Number);
      for (const id of selectedIds) {
        await dictApi.removeData(id);
      }
      Toast.success("批量删除明细成功");
      setDataCheckedRowKeys([]);
      await getValData();
      await queryClient.invalidateQueries({ queryKey: dictKeys.globalAll() });
    } catch (error: any) {
      Toast.error(error.message || "批量删除失败");
    }
  }

  editDataHandlerRef.current = (record) => handleEditData(record.id);
  deleteDataHandlerRef.current = handleSingleDeleteData;

  return (
    <div className="h-full w-full flex flex-col lg:flex-row gap-16px overflow-hidden lt-lg:(overflow-auto min-h-800px)">
      {/* ======================= 左侧：字典类型管理 ======================= */}
      <div
        className="w-full lg:w-420px xl:w-460px flex-shrink-0 flex flex-col gap-12px"
        ref={typeTableWrapperRef}
      >
        <Card bordered={false} className="card-wrapper shrink-0">
          <SemiSearchForm {...typeSearchProps} colSpan={12}>
            <Form.Input field="name" label="字典名称" placeholder="输入名称搜索" showClear />
            <Form.Input field="type" label="类型编码" placeholder="输入编码搜索" showClear />
          </SemiSearchForm>
        </Card>

        <div className="min-h-0 flex flex-1 flex-col">
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
                add={handleAddType}
                columns={typeColumnChecks}
                deleteCount={typeCheckedRowKeys.length}
                disabledDelete={typeCheckedRowKeys.length === 0}
                loading={typeTableProps.loading}
                onDelete={handleBatchDeleteTypes}
                refresh={getTypeData}
                setColumnChecks={setTypeColumnChecks}
              />
            }
            title="字典类型"
          >
            <Table
              {...(typeTableProps as any)}
              rowSelection={{
                fixed: true,
                selectedRowKeys: typeCheckedRowKeys,
                onChange: (keys) => setTypeCheckedRowKeys(keys ?? []),
                getCheckboxProps: (record: any) => ({
                  disabled: record?.isSystem === "Y",
                }),
              }}
              onRow={(record: any) => ({
                onClick: () => setSelectedType(record as SelectedDictType),
                style: {
                  cursor: "pointer",
                },
              })}
              rowClassName={(record?: any) => {
                const isSelected = selectedType && selectedType.id === record?.id;
                return isSelected
                  ? "bg-primary/8 border-l-3px border-l-primary font-500 transition-colors"
                  : "transition-colors";
              }}
              scroll={typeScrollConfig}
              size="small"
            />
          </Card>
        </div>
      </div>

      {/* ======================= 右侧：字典明细管理 ======================= */}
      <div className="flex-1 min-w-0 flex flex-col gap-12px" ref={dataTableWrapperRef}>
        {selectedType ? (
          <div className="min-h-0 flex flex-1 flex-col gap-12px animate-fade-in animate-duration-300">
            <Card bordered={false} className="card-wrapper shrink-0">
              <SemiSearchForm {...dataSearchProps} colSpan={12}>
                <Form.Input field="label" label="字典标签" placeholder="输入标签名搜索" showClear />
              </SemiSearchForm>
            </Card>

            <div className="min-h-0 flex flex-1 flex-col">
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
                    add={handleAddData}
                    columns={dataColumnChecks}
                    deleteCount={dataCheckedRowKeys.length}
                    disabledDelete={dataCheckedRowKeys.length === 0}
                    loading={dataTableProps.loading}
                    onDelete={handleBatchDeleteDatas}
                    refresh={getValData}
                    setColumnChecks={setDataColumnChecks}
                  />
                }
                title={`字典明细 - ${selectedType.name} (${selectedType.type})`}
              >
                <Table
                  {...(dataTableProps as any)}
                  rowSelection={{
                    fixed: true,
                    selectedRowKeys: dataCheckedRowKeys,
                    onChange: (keys) => setDataCheckedRowKeys(keys ?? []),
                  }}
                  scroll={dataScrollConfig}
                  size="small"
                />
              </Card>
            </div>
          </div>
        ) : (
          <Card bordered={false} className="card-wrapper flex-1 flex flex-col flex-center h-full">
            <div className="flex flex-col flex-center text-center max-w-360px py-64px">
              <div className="w-80px h-80px rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex-center mb-24px border border-zinc-100 dark:border-zinc-800/80 shadow-inner">
                <Icon icon="lucide:book-open" className="text-40px text-zinc-400" />
              </div>
              <h3 className="text-16px font-600 text-zinc-800 dark:text-zinc-200 mb-8px">
                未选择字典类型
              </h3>
              <p className="text-14px text-zinc-500 dark:text-zinc-400 leading-22px">
                请在左侧列表中点击选择一个字典类型，以便在此查看和管理对应的具体数据键值明细。
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* 新增 / 修改字典类型弹窗 */}
      <DictTypeModal {...typePopupOperation} />

      {/* 新增 / 修改字典数据明细弹窗 */}
      <DictDataModal {...dataPopupOperation} dictType={selectedType?.type || ""} />
    </div>
  );
};

export default DictPage;
