import {
  Button,
  Card,
  Pagination,
  Radio,
  RadioGroup,
  TabPane,
  Table,
  Tabs,
  Tag,
  Toast,
} from "@douyinfe/semi-ui";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { jobApi, jobKeys, useJobListQuery, useQueuesOverviewQuery } from "@/service/api/job";
import type { JobItem } from "@/service/api/job";
import SvgIcon from "@/shared/ui/compose/components/SvgIcon";
import { getTableScrollX, useSemiTableScroll } from "@/shared/web-ui-compose";

import JobDetailModal from "./JobDetailModal";
import TriggerJobModal from "./TriggerJobModal";
import { createJobColumns } from "./columns";

const JobPage = () => {
  const queryClient = useQueryClient();

  const [selectedQueue, setSelectedQueue] = useState<string>("emailQueue");
  const [selectedStatus, setSelectedStatus] = useState<
    "waiting" | "active" | "completed" | "failed" | "delayed" | "paused"
  >("completed");

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [triggerModalVisible, setTriggerModalVisible] = useState<boolean>(false);
  const [detailJobId, setDetailJobId] = useState<string | null>(null);

  const {
    data: queueList = [],
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useQueuesOverviewQuery();

  const {
    data: jobData,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useJobListQuery({
    page,
    pageSize,
    queue: selectedQueue,
    status: selectedStatus,
  });

  const jobList = jobData?.list || [];
  const total = jobData?.total || 0;

  async function handleQueueAction(queueName: string, action: "pause" | "resume") {
    try {
      const res = await jobApi.action({ action, queue: queueName });
      Toast.success(res.message || "队列操作成功");
      await queryClient.invalidateQueries({ queryKey: jobKeys.all });
    } catch (err: any) {
      Toast.error(err.message || "操作失败");
    }
  }

  async function handleJobRetry(record: JobItem) {
    if (!record.id) return;
    try {
      const res = await jobApi.action({ action: "retry", jobId: record.id, queue: selectedQueue });
      Toast.success(res.message || "任务已压入队列重新执行");
      await queryClient.invalidateQueries({ queryKey: jobKeys.all });
    } catch (err: any) {
      Toast.error(err.message || "重试失败");
    }
  }

  async function handleJobRemove(record: JobItem) {
    if (!record.id) return;
    try {
      const res = await jobApi.action({ action: "remove", jobId: record.id, queue: selectedQueue });
      Toast.success(res.message || "任务已从队列中删除");
      await queryClient.invalidateQueries({ queryKey: jobKeys.all });
    } catch (err: any) {
      Toast.error(err.message || "删除失败");
    }
  }

  const columns = useMemo(
    () =>
      createJobColumns({
        onDetail: (rec) => setDetailJobId(rec.id || null),
        onRemove: handleJobRemove,
        onRetry: handleJobRetry,
        status: selectedStatus,
      }),
    [selectedStatus],
  );

  const scrollX = getTableScrollX(columns) + 40;
  const { scrollConfig, tableWrapperRef } = useSemiTableScroll(scrollX);

  return (
    <div className="p-16px flex flex-col gap-16px h-full">
      {/* 顶部按钮与数据盘 Header */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-12px">
          <div className="flex items-center gap-10px">
            <SvgIcon className="text-24px text-blue-600" icon="ph:timer-bold" />
            <div>
              <div className="font-semibold text-15px text-gray-900">定时任务与队列调度中心</div>
              <div className="text-12px text-gray-500">
                基于 Redis + BullMQ 毫秒级异步队列调度引擎，支持 Cron 定时触发与任务重试
              </div>
            </div>
          </div>

          <div className="flex items-center gap-12px">
            <Button
              icon={<SvgIcon icon="ph:flask-duotone" />}
              type="warning"
              onClick={() => setTriggerModalVisible(true)}
            >
              派发测试任务
            </Button>

            <Button
              icon={<SvgIcon icon="ph:arrows-counter-clockwise" />}
              loading={isOverviewFetching || isListFetching}
              type="tertiary"
              onClick={() => {
                void refetchOverview();
                void refetchList();
              }}
            >
              刷新面板
            </Button>
          </div>
        </div>

        {/* 队列大盘概览卡片 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12px mt-16px">
          {queueList.map((q) => (
            <div
              key={q.name}
              className="p-12px rounded-8px border border-gray-200 bg-gray-50/50 flex flex-col gap-8px"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8px">
                  <span className="font-semibold text-14px font-mono text-gray-900">{q.name}</span>
                  {q.isPaused ? (
                    <Tag color="orange">已暂停 (Paused)</Tag>
                  ) : (
                    <Tag color="green">运行中 (Active)</Tag>
                  )}
                </div>

                <Button
                  size="small"
                  type={q.isPaused ? "primary" : "warning"}
                  onClick={() => handleQueueAction(q.name, q.isPaused ? "resume" : "pause")}
                >
                  {q.isPaused ? "恢复队列" : "暂停队列"}
                </Button>
              </div>

              {/* 实时计数 Badge 组合 */}
              <div className="flex items-center gap-12px text-12px flex-wrap">
                <span className="text-gray-600">
                  等待中: <strong className="text-amber-600">{q.counts.waiting}</strong>
                </span>
                <span className="text-gray-600">
                  执行中: <strong className="text-blue-600">{q.counts.active}</strong>
                </span>
                <span className="text-gray-600">
                  成功: <strong className="text-green-600">{q.counts.completed}</strong>
                </span>
                <span className="text-gray-600">
                  失败: <strong className="text-red-600">{q.counts.failed}</strong>
                </span>
                <span className="text-gray-600">
                  定时中: <strong className="text-purple-600">{q.counts.delayed}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 任务明细列表管理 Card */}
      <div className="bg-white p-16px rounded-8px shadow-sm flex-1 min-h-0 flex flex-col gap-12px">
        <div className="flex items-center justify-between flex-wrap gap-12px">
          <div className="flex items-center gap-12px">
            <span className="text-13px font-medium text-gray-700">选择监控队列：</span>
            <RadioGroup
              type="button"
              value={selectedQueue}
              onChange={(e) => {
                setSelectedQueue(e.target.value as string);
                setPage(1);
              }}
            >
              <Radio value="emailQueue">📧 邮件队列 (emailQueue)</Radio>
              <Radio value="systemQueue">⚙️ 系统维护 (systemQueue)</Radio>
            </RadioGroup>
          </div>

          <Tabs
            activeKey={selectedStatus}
            type="line"
            onChange={(key) => {
              setSelectedStatus(key as any);
              setPage(1);
            }}
          >
            <TabPane itemKey="completed" tab="🟢 执行成功" />
            <TabPane itemKey="failed" tab="🔴 执行失败" />
            <TabPane itemKey="active" tab="🔵 正在执行" />
            <TabPane itemKey="waiting" tab="🟡 等待中" />
            <TabPane itemKey="delayed" tab="🟣 定时延时" />
            <TabPane itemKey="paused" tab="🟠 已暂停" />
          </Tabs>
        </div>

        {/* 任务列表 Table */}
        <div ref={tableWrapperRef} className="flex-1 min-h-0">
          <Table
            columns={columns}
            dataSource={jobList as any}
            loading={isListFetching}
            pagination={false}
            rowKey="id"
            scroll={scrollConfig}
            size="small"
          />
        </div>

        {/* 分页栏 */}
        <div className="flex justify-end pt-8px">
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            showSizeChanger
            total={total}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* 弹窗接入 */}
      <JobDetailModal
        jobId={detailJobId}
        queue={selectedQueue}
        visible={Boolean(detailJobId)}
        onClose={() => setDetailJobId(null)}
      />

      <TriggerJobModal
        visible={triggerModalVisible}
        onClose={() => setTriggerModalVisible(false)}
      />
    </div>
  );
};

export default JobPage;
