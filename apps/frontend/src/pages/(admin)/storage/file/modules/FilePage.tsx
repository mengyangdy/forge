import { Button, Card, Input, Progress, Table, Toast } from "@douyinfe/semi-ui";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";

import { storageApi, storageKeys, useFileListQuery } from "@/service/api/storage";
import type { FileRecordItem } from "@/service/api/storage";
import SvgIcon from "@/shared/ui/compose/components/SvgIcon";
import { getTableScrollX, useSemiTableScroll } from "@/shared/web-ui-compose";

import { createFileColumns } from "./columns";
import { CHUNK_SIZE, formatFileSize } from "./constants";

interface UploadTaskState {
  currentChunk: number;
  filename: string;
  hash: string;
  progress: number;
  status:
    | "hashing"
    | "checking"
    | "instant"
    | "uploading"
    | "merging"
    | "done"
    | "error"
    | "paused";
  totalChunks: number;
  totalSize: number;
}

/** Web Crypto 超高速哈希计算 */
async function calculateFileHash(file: File): Promise<string> {
  const sampleSize = Math.min(file.size, 2 * 1024 * 1024);
  const buffer = await file.slice(0, sampleSize).arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `f_${file.size}_${hashHex.substring(0, 16)}`;
}

import StorageConfigModal from "./StorageConfigModal";

const FilePage = () => {
  const queryClient = useQueryClient();
  const [searchName, setSearchName] = useState<string>("");
  const [inputName, setInputName] = useState<string>("");
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [task, setTask] = useState<UploadTaskState | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);

  const {
    data: fileList = [],
    isFetching,
    refetch,
  } = useFileListQuery({
    filename: searchName || undefined,
  });

  async function handleFileSelect(file: File) {
    if (!file) return;

    isPausedRef.current = false;
    isCancelledRef.current = false;

    // 1. 计算文件哈希
    setTask({
      currentChunk: 0,
      filename: file.name,
      hash: "计算哈希指纹中...",
      progress: 0,
      status: "hashing",
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
      totalSize: file.size,
    });

    const hash = await calculateFileHash(file);
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    setTask((prev) => (prev ? { ...prev, hash, status: "checking" } : null));

    // 2. 预检：秒传及断点续传校验
    try {
      const checkRes = await storageApi.check(hash);
      const { exists, uploadedChunks = [] } = checkRes || {};

      if (exists) {
        setTask((prev) => (prev ? { ...prev, progress: 100, status: "instant" } : null));
        Toast.success(`⚡ 秒传成功！文件 "${file.name}" 0 毫秒瞬间上传完成`);
        await queryClient.invalidateQueries({ queryKey: storageKeys.all });
        return;
      }

      // 3. 分片上传
      setTask((prev) => (prev ? { ...prev, status: "uploading" } : null));
      const uploadedSet = new Set(uploadedChunks);

      for (let i = 0; i < totalChunks; i++) {
        if (isCancelledRef.current) return;

        while (isPausedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (isCancelledRef.current) return;
        }

        // 跳过已上传的分片 (断点续传)
        if (!uploadedSet.has(i)) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(file.size, start + CHUNK_SIZE);
          const chunkBlob = file.slice(start, end);

          await storageApi.uploadChunk(hash, i, chunkBlob);
        }

        const currentProgress = Math.floor(((i + 1) / totalChunks) * 100);
        setTask((prev) =>
          prev ? { ...prev, currentChunk: i + 1, progress: currentProgress } : null,
        );
      }

      // 4. 发送合并请求
      setTask((prev) => (prev ? { ...prev, progress: 99, status: "merging" } : null));
      await storageApi.merge({
        filename: file.name,
        hash,
        totalChunks,
      });

      setTask((prev) => (prev ? { ...prev, progress: 100, status: "done" } : null));
      Toast.success(`文件 "${file.name}" 上传并合并成功！`);
      await queryClient.invalidateQueries({ queryKey: storageKeys.all });
    } catch (error: any) {
      setTask((prev) => (prev ? { ...prev, status: "error" } : null));
      Toast.error(error.message || "上传或分片合并失败");
    }
  }

  function handleCopyUrl(record: FileRecordItem) {
    void navigator.clipboard.writeText(record.url);
    Toast.success("文件访问链接已复制到剪贴板");
  }

  async function handleDeleteFile(record: FileRecordItem) {
    try {
      const res = await storageApi.remove(record.id);
      Toast.success(res.message || "文件记录已删除");
      await queryClient.invalidateQueries({ queryKey: storageKeys.all });
    } catch (err: any) {
      Toast.error(err.message || "删除失败");
    }
  }

  const columns = useMemo(
    () =>
      createFileColumns({
        onCopyUrl: handleCopyUrl,
        onDelete: handleDeleteFile,
      }),
    [],
  );

  const scrollX = getTableScrollX(columns) + 40;
  const { scrollConfig, tableWrapperRef } = useSemiTableScroll(scrollX);

  return (
    <div className="p-16px flex flex-col gap-16px h-full">
      {/* 隐藏的文件 Selector */}
      <input
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            void handleFileSelect(file);
            e.target.value = "";
          }
        }}
      />

      <Card className="shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-12px">
          <div className="flex items-center gap-8px">
            <Input
              placeholder="输入文件名搜索..."
              style={{ width: 220 }}
              value={inputName}
              onChange={(val) => setInputName(val)}
            />
            <Button
              icon={<SvgIcon icon="ph:magnifying-glass" />}
              type="primary"
              onClick={() => setSearchName(inputName.trim())}
            >
              查询
            </Button>
            <Button
              icon={<SvgIcon icon="ph:arrows-counter-clockwise" />}
              type="secondary"
              onClick={() => {
                setInputName("");
                setSearchName("");
              }}
            >
              重置
            </Button>
          </div>

          <div className="flex items-center gap-12px">
            <Button
              icon={<SvgIcon icon="ph:gear-duotone" />}
              type="secondary"
              onClick={() => setConfigModalVisible(true)}
            >
              存储引擎配置
            </Button>

            <Button
              icon={<SvgIcon icon="ph:upload-simple-bold" />}
              theme="solid"
              type="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              大文件分片上传
            </Button>

            <Button
              icon={<SvgIcon icon="ph:arrows-counter-clockwise" />}
              loading={isFetching}
              type="tertiary"
              onClick={() => refetch()}
            >
              刷新
            </Button>
          </div>
        </div>
      </Card>

      {/* 动态存储引擎配置弹窗 */}
      <StorageConfigModal
        visible={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
      />

      {/* 实时上传任务面板 (有任务时显示) */}
      {task && (
        <Card className="shadow-sm border-blue-100 bg-blue-50/20">
          <div className="flex flex-col gap-10px">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8px">
                <SvgIcon className="text-20px text-blue-600" icon="ph:cloud-arrow-up-bold" />
                <span className="font-medium text-14px text-gray-900">{task.filename}</span>
                <span className="text-12px text-gray-500 font-mono">
                  ({formatFileSize(task.totalSize)})
                </span>
              </div>

              <div className="flex items-center gap-8px">
                {task.status === "instant" && (
                  <span className="text-12px text-green-600 font-medium">⚡ 秒传完成</span>
                )}
                {(task.status === "uploading" || task.status === "paused") && (
                  <span className="text-12px text-blue-600 font-medium">
                    切片分发中 ({task.currentChunk} / {task.totalChunks})
                  </span>
                )}
                {task.status === "merging" && (
                  <span className="text-12px text-orange-600 font-medium">正在流式合并文件...</span>
                )}

                {(task.status === "uploading" || task.status === "paused") && (
                  <Button
                    size="small"
                    type="warning"
                    onClick={() => {
                      isPausedRef.current = !isPausedRef.current;
                      setTask((prev) =>
                        prev
                          ? { ...prev, status: isPausedRef.current ? "paused" : "uploading" }
                          : null,
                      );
                    }}
                  >
                    {isPausedRef.current ? "继续上传" : "暂停 (断点续传)"}
                  </Button>
                )}

                <Button
                  size="small"
                  type="tertiary"
                  onClick={() => {
                    isCancelledRef.current = true;
                    setTask(null);
                  }}
                >
                  关闭
                </Button>
              </div>
            </div>

            <Progress percent={task.progress} showInfo stroke="var(--semi-color-primary)" />
          </div>
        </Card>
      )}

      {/* 存储文件列表 */}
      <div ref={tableWrapperRef} className="bg-white p-16px rounded-8px shadow-sm flex-1 min-h-0">
        <Table
          columns={columns}
          dataSource={fileList}
          loading={isFetching}
          pagination={false}
          rowKey="id"
          scroll={scrollConfig}
          size="small"
        />
      </div>
    </div>
  );
};

export default FilePage;
