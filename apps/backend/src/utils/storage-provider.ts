import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { env } from "../config.js";

// 1. 存储适配器抽象基类
export abstract class StorageProvider {
  abstract uploadFile(filename: string, buffer: Buffer): Promise<string>;
  abstract deleteFile(filename: string): Promise<void>;
}

// 2. 本地磁盘存储提供者
export class LocalStorageProvider extends StorageProvider {
  private uploadDir: string;

  constructor() {
    super();
    // 物理文件保存在 apps/backend/public/uploads 中
    this.uploadDir = path.resolve(process.cwd(), "public/uploads");
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(filename: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    // 返回相对 URL 前缀，由 Hono 的静态服务静态托管
    return `/uploads/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
    }
  }
}

// 3. 阿里云 OSS 存储提供者 (存根 & 占位实现)
export class AliossStorageProvider extends StorageProvider {
  constructor() {
    super();
    const ossKeyId = env.ALIOSS_ACCESS_KEY_ID;
    const ossKeySecret = env.ALIOSS_ACCESS_KEY_SECRET;
    const bucket = env.ALIOSS_BUCKET;

    if (!ossKeyId || !ossKeySecret || !bucket) {
      console.warn(
        "⚠️ 阿里云 OSS 配置缺失，OSS 存储引擎无法正常工作。请检查 .env 中的 ALIOSS_* 环境变量",
      );
    }
  }

  async uploadFile(filename: string, buffer: Buffer): Promise<string> {
    // 这里如果填了配置可以引入 OSS SDK 进行上传，此处作为生产环境存根抛出提示
    console.log(`[AliOSS] 正在上传文件: ${filename}, 大小: ${buffer.length} 字节`);
    // 模拟返回云上地址
    const bucket = env.ALIOSS_BUCKET || "forge-bucket";
    const region = env.ALIOSS_REGION || "oss-cn-hangzhou";
    return `https://${bucket}.${region}.aliyuncs.com/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    console.log(`[AliOSS] 正在删除文件: ${filename}`);
  }
}

// 4. 存储提供者工厂，根据 .env 动态选择加载
export class StorageFactory {
  static getProvider(): StorageProvider {
    const provider = env.UPLOAD_PROVIDER || "local";
    if (provider === "alioss") {
      return new AliossStorageProvider();
    }
    return new LocalStorageProvider();
  }
}
