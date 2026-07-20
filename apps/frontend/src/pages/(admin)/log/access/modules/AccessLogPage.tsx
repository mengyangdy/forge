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

import { useAccessLogQuery } from "@/service/api/system-log";
import type { AccessLogItem, AccessLogSearchParams } from "@/service/api/system-log";

import AccessLogDetailModal from "./AccessLogDetailModal";
import { createAccessLogColumns } from "./columns";
import { HTTP_METHOD_OPTIONS, STATUS_CODE_OPTIONS } from "./constants";

type AccessLogRecord = TableDataWithIndex<AccessLogItem>;

const AccessLogPage = () => {
  const [detailData, setDetailData] = useState<AccessLogItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const detailHandlerRef = useRef<(record: AccessLogRecord) => void>(() => {});
  detailHandlerRef.current = (record) => {
    setDetailData(record);
    setDetailVisible(true);
  };

  const { columnChecks, getData, searchProps, setColumnChecks, tableProps } = useSemiTable<
    AccessLogSearchParams,
    PaginatingQueryRecord<AccessLogItem>,
    AccessLogItem
  >({
    apiParams: { current: 1, size: 10 },
    columns: () =>
      createAccessLogColumns({
        onViewDetail: (record) => detailHandlerRef.current(record),
      }),
    queryHook: useAccessLogQuery,
    queryOptions: { placeholderData: keepPreviousData },
  });

  const { tableWrapperRef } = useSemiTableScroll();

  return (
    <div className="h-full flex flex-col gap-8px overflow-hidden lt-sm:(min-h-500px overflow-auto)">
      <Card bordered={false} className="card-wrapper shrink-0">
        <SemiSearchForm {...searchProps}>
          <Form.Input field="username" label="用户名" placeholder="请输入用户名" showClear />
          <Form.Select
            field="method"
            label="请求方式"
            optionList={HTTP_METHOD_OPTIONS}
            placeholder="请选择请求方式"
            showClear
            style={{ width: "100%" }}
          />
          <Form.Select
            field="status"
            label="状态码"
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
          title="系统访问日志"
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

      <AccessLogDetailModal
        data={detailData}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </div>
  );
};

export default AccessLogPage;
