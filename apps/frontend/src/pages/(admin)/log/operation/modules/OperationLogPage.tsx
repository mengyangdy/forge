import {
  SemiSearchForm,
  SemiTableHeaderOperation,
  getTableScrollX,
  useSemiTable,
  useSemiTableScroll,
} from "@/shared/web-ui-compose";
import type { PaginatingQueryRecord, TableDataWithIndex } from "@/shared/web-ui-compose";
import { Card, Form, Table } from "@douyinfe/semi-ui";
import { keepPreviousData } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { useOperationLogQuery } from "@/service/api/system-log";
import type { OperationLogItem, OperationLogSearchParams } from "@/service/api/system-log";

import OperationLogDetailModal from "./OperationLogDetailModal";
import { createOperationLogColumns } from "./columns";
import { ACTION_OPTIONS, STATUS_CODE_OPTIONS } from "./constants";

type OperationLogRecord = TableDataWithIndex<OperationLogItem>;

const OperationLogPage = () => {
  const [detailData, setDetailData] = useState<OperationLogItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const detailHandlerRef = useRef<(record: OperationLogRecord) => void>(() => {});
  detailHandlerRef.current = (record) => {
    setDetailData(record);
    setDetailVisible(true);
  };

  const { columnChecks, getData, searchProps, setColumnChecks, tableProps } = useSemiTable<
    OperationLogSearchParams,
    PaginatingQueryRecord<OperationLogItem>,
    OperationLogItem
  >({
    apiParams: { current: 1, size: 10 },
    columns: () =>
      createOperationLogColumns({
        onViewDetail: (record) => detailHandlerRef.current(record),
      }),
    queryHook: useOperationLogQuery,
    queryOptions: { placeholderData: keepPreviousData },
  });

  const { tableWrapperRef } = useSemiTableScroll();

  return (
    <div className="h-full flex flex-col gap-8px overflow-hidden lt-sm:(min-h-500px overflow-auto)">
      <Card bordered={false} className="card-wrapper shrink-0">
        <SemiSearchForm {...searchProps}>
          <Form.Input field="username" label="操作人" placeholder="请输入操作人" showClear />
          <Form.Input field="module" label="操作模块" placeholder="请输入操作模块" showClear />
          <Form.Select
            field="action"
            label="操作动作"
            optionList={ACTION_OPTIONS}
            placeholder="请选择动作"
            showClear
            style={{ width: "100%" }}
          />
          <Form.Select
            field="status"
            label="状态"
            optionList={STATUS_CODE_OPTIONS}
            placeholder="请选择状态码"
            showClear
            style={{ width: "100%" }}
          />
        </SemiSearchForm>
      </Card>

      <div className="min-h-0 flex flex-1 flex-col" ref={tableWrapperRef}>
        <Card
          bodyStyle={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            minHeight: 0,
            padding: "12px",
          }}
          bordered={false}
          className="card-wrapper min-h-0 flex flex-1 flex-col"
          headerExtraContent={
            <SemiTableHeaderOperation
              columns={columnChecks}
              loading={tableProps.loading}
              refresh={getData}
              setColumnChecks={setColumnChecks}
            />
          }
          title="业务操作日志"
        >
          <div className="flex-1 min-h-0">
            <Table
              {...tableProps}
              scroll={{
                x: getTableScrollX(tableProps.columns),
                y: "100%",
              }}
            />
          </div>
        </Card>
      </div>

      <OperationLogDetailModal
        data={detailData}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </div>
  );
};

export default OperationLogPage;
