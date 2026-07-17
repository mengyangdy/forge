import { Queue, Worker, Job } from "bullmq";
import type { JobState } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../../config.js";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// 独立的 Redis 连接，配置 maxRetriesPerRequest: null 以适配 BullMQ
const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export class JobService {
  private queues: Record<string, Queue> = {};
  private workers: Record<string, Worker> = {};
  private isInitialized = false;

  constructor() {
    // 实例化两个主力队列
    this.queues.emailQueue = new Queue("emailQueue", { connection: connection as any });
    this.queues.systemQueue = new Queue("systemQueue", { connection: connection as any });
  }

  // 初始化拉起 Worker 和注册 Repeatable 任务
  async init() {
    if (this.isInitialized) return;

    console.log("⏰ [JobService] 正在初始化定时任务调度中心与 Workers...");

    // 1. 初始化 emailQueue 的专属工作进程
    this.workers.emailWorker = new Worker(
      "emailQueue",
      async (job: Job) => {
        const { email, username, simulateError } = job.data;
        console.log(
          `[EmailWorker] 正在执行任务 "${job.name}" (ID: ${job.id}) -> 给 ${username} (${email}) 发送邮件...`,
        );

        // 模拟邮件服务发送网络耗时
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (simulateError) {
          throw new Error(`[SMTP Error] 无法连接邮件网关 smtp.forge.com:587。目标邮箱: ${email}`);
        }

        console.log(`[EmailWorker] 邮件已成功送达: ${email}`);
        return { sent: true, channel: "SMTP-Forge", timestamp: Date.now() };
      },
      { connection: connection as any },
    );

    // 2. 初始化 systemQueue 的专属工作进程
    this.workers.systemWorker = new Worker(
      "systemQueue",
      async (job: Job) => {
        if (job.name === "cleanTempFiles") {
          console.log(
            `[SystemWorker] 正在执行任务 "${job.name}" (ID: ${job.id}) -> 清理过期分片临时目录...`,
          );
          const tempDir = path.resolve(process.cwd(), "public/temp");

          if (!existsSync(tempDir)) {
            return { cleanedCount: 0, message: "临时目录不存在，无需清理" };
          }

          const files = await fs.readdir(tempDir);
          let cleanedCount = 0;
          const now = Date.now();

          for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stat = await fs.stat(filePath);

            // 清理修改时间超过 1 小时的临时文件夹/文件
            const hoursElapsed = (now - stat.mtimeMs) / (1000 * 60 * 60);
            if (hoursElapsed > 1) {
              await fs.rm(filePath, { recursive: true, force: true }).catch(() => {});
              cleanedCount++;
            }
          }

          console.log(`[SystemWorker] 清理任务结束。共清理过期分片项: ${cleanedCount} 个`);
          return { cleanedCount, targetDir: tempDir, timestamp: Date.now() };
        }

        throw new Error(`未知的系统工作任务: ${job.name}`);
      },
      { connection: connection as any },
    );

    // 3. 自动挂载系统定时任务 (Repeatable Job)
    // 每天凌晨 2 点执行系统垃圾文件清理
    await this.queues.systemQueue.add(
      "cleanTempFiles",
      {},
      {
        repeat: {
          pattern: "0 2 * * *",
        },
        jobId: "sys_repeat_clean_temp", // 统一指定 ID，避免多次重启重复累加规则
      },
    );

    // 4. 监听全局 Worker 异常
    Object.entries(this.workers).forEach(([name, worker]) => {
      worker.on("failed", (job, err) => {
        console.error(`🚨 [Worker:${name}] 任务失败 -> Job ID: ${job?.id}, 错误原因:`, err.message);
      });
      worker.on("error", (err) => {
        console.error(`🚨 [Worker:${name}] 发生内部异常:`, err);
      });
    });

    this.isInitialized = true;
    console.log("⏰ [JobService] 调度中心服务初始化完成，所有队列与 Workers 已就位。");
  }

  // 1. 获取所有队列的整体概况指标 (含定时任务元数据)
  async getQueues() {
    const result = [];
    for (const [name, queue] of Object.entries(this.queues)) {
      const counts = await queue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
        "paused",
      );

      const isPaused = await queue.isPaused();
      const repeatableJobs = await queue.getRepeatableJobs();

      result.push({
        name,
        counts: {
          waiting: counts.waiting || 0,
          active: counts.active || 0,
          completed: counts.completed || 0,
          failed: counts.failed || 0,
          delayed: counts.delayed || 0,
          paused: counts.paused || 0,
        },
        isPaused,
        repeatableJobs: repeatableJobs.map((r) => ({
          key: r.key,
          name: r.name,
          cron: r.pattern,
          next: r.next ? new Date(r.next).toISOString() : null,
        })),
      });
    }
    return result;
  }

  // 2. 获取某一队列里指定状态的任务列表（支持分页）
  async getJobs(queueName: string, status: string, page: number, limit: number) {
    const queue = this.queues[queueName];
    if (!queue) throw new Error(`队列 ${queueName} 不存在`);

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // 校验状态，BullMQ getJobs 支持传入具体的 JobState 数组
    const state = status as JobState;
    const rawJobs = await queue.getJobs([state], start, end, true);

    const list = rawJobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      returnValue: job.returnvalue,
    }));

    const counts = await queue.getJobCounts(state);
    const total = counts[state] || 0;

    return { list, total };
  }

  // 3. 查询单个任务的具体详情 (包含错误堆栈)
  async getJobDetail(queueName: string, jobId: string) {
    const queue = this.queues[queueName];
    if (!queue) throw new Error(`队列 ${queueName} 不存在`);

    const job = await queue.getJob(jobId);
    if (!job) throw new Error(`任务 ${jobId} 不存在于该队列中`);

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace || [],
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      returnValue: job.returnvalue,
    };
  }

  // 4. 执行对任务的操作 (重试、删除) 或对队列的操作 (暂停、恢复)
  async executeAction(
    queueName: string,
    jobId: string | null,
    action: "retry" | "remove" | "pause" | "resume",
  ) {
    const queue = this.queues[queueName];
    if (!queue) throw new Error(`队列 ${queueName} 不存在`);

    if (jobId) {
      // 针对具体任务的操作
      const job = await queue.getJob(jobId);
      if (!job) throw new Error(`任务 ${jobId} 在队列中未找到`);

      if (action === "retry") {
        await job.retry();
        return { code: 0, message: `任务 ${jobId} 已被重新压入队列` };
      } else if (action === "remove") {
        await job.remove();
        return { code: 0, message: `任务 ${jobId} 已被成功移除` };
      } else {
        throw new Error(`该任务不支持操作 "${action}"`);
      }
    } else {
      // 针对整个队列的操作
      if (action === "pause") {
        await queue.pause();
        return { code: 0, message: `队列 ${queueName} 已成功暂停挂起` };
      } else if (action === "resume") {
        await queue.resume();
        return { code: 0, message: `队列 ${queueName} 已成功恢复运行` };
      } else {
        throw new Error(`该队列不支持操作 "${action}"`);
      }
    }
  }

  // 5. 手动向指定队列压入一个测试任务，供前端测试和实时观测
  async addTestJob(queueName: string, jobName: string, data: any) {
    const queue = this.queues[queueName];
    if (!queue) throw new Error(`队列 ${queueName} 不存在`);

    // 默认提供指数退避重试选项：重试 3 次，每次间隔 2 秒
    const job = await queue.add(jobName, data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });

    return {
      id: job.id,
      name: job.name,
      timestamp: job.timestamp,
    };
  }

  // 优雅停机，释放连接
  async destroy() {
    for (const worker of Object.values(this.workers)) {
      await worker.close();
    }
    for (const queue of Object.values(this.queues)) {
      await queue.close();
    }
    await connection.quit();
    console.log("⏰ [JobService] 调度中心服务已优雅关闭释放。");
  }
}

export const jobService = new JobService();
