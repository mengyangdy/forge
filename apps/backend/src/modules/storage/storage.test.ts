import { storageService } from "./storage.service.js";
import { db } from "../../db/index.js";
import { sysFiles } from "@forge/shared";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

async function runTest() {
  console.log("🚀 开始大文件分片上传与通用存储引擎集成测试...");

  const hash = `test_file_hash_${Date.now()}`;
  const filename = "test_chunk_upload.txt";
  const chunks = [Buffer.from("Hello "), Buffer.from("World "), Buffer.from("From Forge!")];
  const expectedContent = "Hello World From Forge!";
  const expectedSize = Buffer.byteLength(expectedContent);

  try {
    // 1. 预检文件 (预期: 不存在)
    console.log("\n1. 预检未上传的文件...");
    const check1 = await storageService.checkFile(hash);
    console.log("预检结果1:", check1);
    if (check1.exists || check1.uploadedChunks?.length !== 0) {
      throw new Error("测试失败: 未上传的文件不应存在分片");
    }

    // 2. 上传前两个分片
    console.log("\n2. 上传分片 0 与分片 1...");
    await storageService.saveChunk(hash, 0, chunks[0]);
    await storageService.saveChunk(hash, 1, chunks[1]);

    // 3. 再次预检文件 (预期: 已有分片 [0, 1])
    console.log("\n3. 预检上传中途的文件...");
    const check2 = await storageService.checkFile(hash);
    console.log("预检结果2:", check2);
    if (
      check2.exists ||
      !check2.uploadedChunks?.includes(0) ||
      !check2.uploadedChunks?.includes(1)
    ) {
      throw new Error("测试失败: 断点续传预检分片列表不正确");
    }

    // 4. 上传最后一个分片
    console.log("\n4. 上传分片 2...");
    await storageService.saveChunk(hash, 2, chunks[2]);

    // 5. 合并分片
    console.log("\n5. 请求合并所有分片...");
    const fileRecord = await storageService.mergeChunks(hash, filename, chunks.length);
    console.log("合并结果:", fileRecord);

    if (fileRecord.filename !== filename || Number(fileRecord.size) !== expectedSize) {
      throw new Error(
        `测试失败: 合并文件属性不符. 预期大小: ${expectedSize}, 实际: ${fileRecord.size}`,
      );
    }

    // 6. 验证物理文件内容
    console.log("\n6. 验证本地磁盘上物理合并后的文件...");
    const uploadDir = path.resolve(process.cwd(), "public/uploads");
    const physicalFilename = path.basename(fileRecord.url);
    const physicalPath = path.join(uploadDir, physicalFilename);

    const mergedContent = await fs.readFile(physicalPath, "utf-8");
    console.log(`物理文件路径: ${physicalPath}`);
    console.log(`物理文件内容: "${mergedContent}"`);
    if (mergedContent !== expectedContent) {
      throw new Error("测试失败: 合并后的文件内容与预期不符");
    }

    // 7. 秒传测试 (预期: exists 变为 true)
    console.log("\n7. 秒传预检测试...");
    const check3 = await storageService.checkFile(hash);
    console.log("预检结果3 (秒传):", check3);
    if (!check3.exists || check3.url !== fileRecord.url) {
      throw new Error("测试失败: 再次预检应当被识别为秒传");
    }

    // 8. 清理测试数据
    console.log("\n8. 清理数据库与磁盘测试残留数据...");
    await db.delete(sysFiles).where(eq(sysFiles.hash, hash));
    await fs.unlink(physicalPath);
    console.log("🎉 所有大文件上传与通用存储引擎集成测试项目已成功通过！");
    process.exit(0);
  } catch (error) {
    console.error("❌ 测试过程中发生错误:", error);
    // 尽力清理可能产生的物理垃圾文件
    try {
      const chunkDir = path.resolve(process.cwd(), "public/temp", hash);
      await fs.rm(chunkDir, { recursive: true, force: true });
    } catch {}
    process.exit(1);
  }
}

void runTest();
