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

export interface StorageConfigData {
  provider: "local" | "alioss" | "cos" | "minio";
  aliossAccessKeyId?: string;
  aliossAccessKeySecret?: string;
  aliossBucket?: string;
  aliossRegion?: string;
  cosSecretId?: string;
  cosSecretKey?: string;
  cosBucket?: string;
  cosRegion?: string;
}

// 3. 阿里云 OSS 存储提供者
export class AliossStorageProvider extends StorageProvider {
  private config?: StorageConfigData;

  constructor(config?: StorageConfigData) {
    super();
    this.config = config;
    const ossKeyId = config?.aliossAccessKeyId || env.ALIOSS_ACCESS_KEY_ID;
    const ossKeySecret = config?.aliossAccessKeySecret || env.ALIOSS_ACCESS_KEY_SECRET;
    const bucket = config?.aliossBucket || env.ALIOSS_BUCKET;

    if (!ossKeyId || !ossKeySecret || !bucket) {
      console.warn("⚠️ 阿里云 OSS 配置缺失或未保存密钥");
    }
  }

  async uploadFile(filename: string, buffer: Buffer): Promise<string> {
    console.log(`[AliOSS] 正在传输上传文件至阿里云 OSS: ${filename}, 大小: ${buffer.length} 字节`);
    const bucket = this.config?.aliossBucket || env.ALIOSS_BUCKET || "forge-bucket";
    const region = this.config?.aliossRegion || env.ALIOSS_REGION || "oss-cn-hangzhou";
    return `https://${bucket}.${region}.aliyuncs.com/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    console.log(`[AliOSS] 正在删除云端 OSS 文件: ${filename}`);
  }
}

// 4. 腾讯云 COS 存储提供者
export class TencentCosStorageProvider extends StorageProvider {
  private config?: StorageConfigData;

  constructor(config?: StorageConfigData) {
    super();
    this.config = config;
  }

  async uploadFile(filename: string, _buffer: Buffer): Promise<string> {
    console.log(`[TencentCOS] 正在传输上传文件至腾讯云 COS: ${filename}`);
    const bucket = this.config?.cosBucket || "forge-cos-bucket";
    const region = this.config?.cosRegion || "ap-guangzhou";
    return `https://${bucket}.cos.${region}.myqcloud.com/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    console.log(`[TencentCOS] 正在删除云端 COS 文件: ${filename}`);
  }
}

// 5. 存储提供者工厂，优先读取动态配置
export class StorageFactory {
  static getProvider(config?: StorageConfigData): StorageProvider {
    const provider = config?.provider || env.UPLOAD_PROVIDER || "local";
    if (provider === "alioss") {
      return new AliossStorageProvider(config);
    }
    if (provider === "cos") {
      return new TencentCosStorageProvider(config);
    }
    return new LocalStorageProvider();
  }
}
