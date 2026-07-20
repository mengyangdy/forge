/**
 * Storage API 模块
 *
 * 基于 Hono RPC 客户端推导
 */

import { client, unwrap } from "@/service/client";

import type { StorageConfigPayload, StorageSearchParams } from "./types";

export const storageApi = {
  /** 秒传及断点续传预检 */
  check: (hash: string) => unwrap(client.api.storage.check.$get({ query: { hash } })),

  /** 获取存储配置 */
  getConfig: () => unwrap(client.api.storage.config.$get()),

  /** 文件列表 */
  list: (params?: StorageSearchParams) =>
    unwrap(
      client.api.storage.list.$get({
        query: params?.filename ? { filename: params.filename } : {},
      }),
    ),

  /** 合并切片文件 */
  merge: (data: { filename: string; hash: string; totalChunks: number }) =>
    unwrap(client.api.storage.merge.$post({ json: data })),

  /** 删除文件 */
  remove: (id: number) =>
    unwrap(client.api.storage.delete[":id"].$delete({ param: { id: String(id) } })),

  /** 保存存储配置 */
  saveConfig: (data: StorageConfigPayload) =>
    unwrap(client.api.storage.config.save.$post({ json: data as any })),

  /** 上传单个切片 */
  uploadChunk: (hash: string, index: number, chunk: Blob) => {
    const formData = new FormData();
    formData.append("hash", hash);
    formData.append("index", String(index));
    formData.append("file", chunk, `chunk_${index}`);
    return unwrap(
      client.api.storage["upload-chunk"].$post({
        form: {
          hash,
          index: String(index),
          file: chunk as any,
        },
      }),
    );
  },
};

export const storageKeys = {
  all: ["storage"] as const,
  config: ["storage", "config"] as const,
  list: (params?: StorageSearchParams) => [...storageKeys.all, "list", params] as const,
};
