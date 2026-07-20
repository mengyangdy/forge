import { Button, Card, Input, Table, Toast } from "@douyinfe/semi-ui";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useUserInfoQuery } from "@/service/api";
import { onlineApi, onlineKeys, useOnlineUserListQuery } from "@/service/api/system-online";
import SvgIcon from "@/shared/ui/compose/components/SvgIcon";
import { getTableScrollX, useSemiTableScroll } from "@/shared/web-ui-compose";

import { createOnlineColumns } from "./columns";

const OnlinePage = () => {
  const { data: userInfo } = useUserInfoQuery();
  const queryClient = useQueryClient();
  const [searchUsername, setSearchUsername] = useState<string>("");
  const [inputUsername, setInputUsername] = useState<string>("");

  const {
    data: onlineList = [],
    isFetching,
    refetch,
  } = useOnlineUserListQuery({
    username: searchUsername || undefined,
  });

  async function handleKickout(record: { userId: number; username: string }) {
    try {
      const res = await onlineApi.kickout(record.userId);
      Toast.success(res.message || `已强退用户 ${record.username}`);
      await queryClient.invalidateQueries({ queryKey: onlineKeys.all });
    } catch (err: any) {
      Toast.error(err.message || "强退执行失败");
    }
  }

  const currentUserId = userInfo?.userId ? Number(userInfo.userId) : undefined;

  const columns = useMemo(
    () =>
      createOnlineColumns({
        currentUserId,
        onKickout: handleKickout,
      }),
    [currentUserId],
  );

  const scrollX = getTableScrollX(columns) + 40;
  const { scrollConfig, tableWrapperRef } = useSemiTableScroll(scrollX);

  function handleSearch() {
    setSearchUsername(inputUsername.trim());
  }

  function handleReset() {
    setInputUsername("");
    setSearchUsername("");
  }

  return (
    <div className="p-16px flex flex-col gap-16px h-full">
      <Card className="shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-12px">
          <div className="flex items-center gap-8px">
            <Input
              placeholder="输入用户账号搜索..."
              style={{ width: 220 }}
              value={inputUsername}
              onChange={(val) => setInputUsername(val)}
            />
            <Button
              icon={<SvgIcon icon="ph:magnifying-glass" />}
              type="primary"
              onClick={handleSearch}
            >
              查询
            </Button>
            <Button
              icon={<SvgIcon icon="ph:arrows-counter-clockwise" />}
              type="secondary"
              onClick={handleReset}
            >
              重置
            </Button>
          </div>

          <div className="flex items-center gap-12px">
            <span className="text-13px text-gray-500 font-mono">
              实时在线人数：
              <strong className="text-16px text-green-600 font-bold">
                {onlineList.length}
              </strong> 人
            </span>
            <Button
              icon={<SvgIcon icon="ph:arrows-counter-clockwise" />}
              loading={isFetching}
              type="tertiary"
              onClick={() => refetch()}
            >
              刷新列表
            </Button>
          </div>
        </div>
      </Card>

      <div ref={tableWrapperRef} className="bg-white p-16px rounded-8px shadow-sm flex-1 min-h-0">
        <Table
          columns={columns}
          dataSource={onlineList}
          loading={isFetching}
          pagination={false}
          rowKey="userId"
          scroll={scrollConfig}
          size="small"
        />
      </div>
    </div>
  );
};

export default OnlinePage;
