import fs from "fs/promises";
import { existsSync, mkdirSync, createWriteStream, createReadStream } from "fs";
import path from "path";
import { db } from "../../db/index.js";
import { sysFiles } from "@forge/shared";
import { eq } from "drizzle-orm";
import { StorageFactory } from "../../utils/storage-provider.js";
import { env } from "../../config.js";

export class StorageService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.resolve(process.cwd(), "public/temp");
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // 1. 预检文件：校验秒传 (Hash 是否存在) 与断点续传 (已上传哪些分片)
  async checkFile(hash: string) {
    // 查库：秒传验证
    const [file] = await db.select().from(sysFiles).where(eq(sysFiles.hash, hash)).limit(1);
    if (file) {
      return {
        exists: true,
        url: file.url,
      };
    }

    // 查本地临时目录：断点续传验证
    const chunkDir = path.join(this.tempDir, hash);
    if (!existsSync(chunkDir)) {
      return {
        exists: false,
        uploadedChunks: [],
      };
    }

    const files = await fs.readdir(chunkDir);
    // 过滤出形如 chunk_0, chunk_1 的文件，提取其索引数字
    const uploadedChunks = files
      .filter((f) => f.startsWith("chunk_"))
      .map((f) => Number(f.replace("chunk_", "")))
      .sort((a, b) => a - b);

    return {
      exists: false,
      uploadedChunks,
    };
  }

  // 2. 保存单个临时分片
  async saveChunk(hash: string, index: number, buffer: Buffer) {
    const chunkDir = path.join(this.tempDir, hash);
    if (!existsSync(chunkDir)) {
      await fs.mkdir(chunkDir, { recursive: true });
    }

    const chunkPath = path.join(chunkDir, `chunk_${index}`);
    await fs.writeFile(chunkPath, buffer);
  }

  // Helper: 用于流式按顺序合并分片
  private async streamMerge(chunkDir: string, mergedPath: string, totalChunks: number) {
    const writeStream = createWriteStream(mergedPath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk_${i}`);
      if (!existsSync(chunkPath)) {
        writeStream.end();
        throw new Error(`分片 ${i} 缺失，合并中断`);
      }

      await new Promise<void>((resolve, reject) => {
        const readStream = createReadStream(chunkPath);
        readStream.pipe(writeStream, { end: false });
        readStream.on("end", () => {
          resolve();
        });
        readStream.on("error", (err) => {
          reject(err);
        });
      });
    }

    writeStream.end();
    // 等待写流关闭
    await new Promise<void>((resolve) => {
      writeStream.on("finish", () => {
        resolve();
      });
    });
  }

  // 3. 合并分片并存储
  async mergeChunks(hash: string, filename: string, totalChunks: number) {
    const chunkDir = path.join(this.tempDir, hash);
    if (!existsSync(chunkDir)) {
      throw new Error("分片临时目录不存在，请先上传分片");
    }

    // 生成唯一物理文件名，防止重名覆盖
    const uniqueFilename = `${Date.now()}_${filename}`;
    const mergedPath = path.join(this.tempDir, `${hash}_merged`);

    try {
      // 1. 流式顺序合并分片，避免占用过多系统内存
      await this.streamMerge(chunkDir, mergedPath, totalChunks);

      // 2. 读取合并后文件的 Buffer 与 Size
      const buffer = await fs.readFile(mergedPath);
      const stat = await fs.stat(mergedPath);
      const size = stat.size;

      // 3. 调用当前配置的通用存储引擎进行上传
      const provider = StorageFactory.getProvider();
      const url = await provider.uploadFile(uniqueFilename, buffer);

      // 4. 将成功上传的文件记录到 PG 数据库，便于下一次“秒传”
      const ext = path.extname(filename).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".mp4": "video/mp4",
        ".pdf": "application/pdf",
        ".zip": "application/zip",
      };
      const mimeType = mimeMap[ext] || "application/octet-stream";

      const [newFile] = await db
        .insert(sysFiles)
        .values({
          hash,
          filename,
          url,
          size,
          mimeType,
          provider: env.UPLOAD_PROVIDER || "local",
        })
        .returning();

      // 5. 异步清理临时分片目录与合并的缓存文件
      try {
        await fs.rm(chunkDir, { recursive: true, force: true });
        await fs.unlink(mergedPath);
      } catch (cleanupError) {
        console.warn("⚠️ 临时分片清理失败，但不影响核心主业务:", cleanupError);
      }

      return newFile;
    } catch (err: any) {
      // 容错：发生失败时清理合并中产生的临时文件
      if (existsSync(mergedPath)) {
        await fs.unlink(mergedPath).catch(() => {});
      }
      throw err;
    }
  }
}

export const storageService = new StorageService();
