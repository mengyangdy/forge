import { jobService } from "./job.service.js";
import { Queue } from "bullmq";

// 辅助方法：轮询等待 Job 执行完毕
async function waitForJob(queue: Queue, jobId: string, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const job = await queue.getJob(jobId);
    if (job) {
      const state = await job.getState();
      if (state === "completed" || state === "failed") {
        return job;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`等待任务 ${jobId} 执行超时`);
}

async function runTest() {
  console.log("🚀 开始定时任务调度中心 (BullMQ) 单元集成测试...");

  try {
    // 1. 初始化服务
    await jobService.init();

    // @ts-ignore
    const emailQueue = jobService.queues.emailQueue as Queue;

    // 2. 压入并验证一个成功任务
    console.log("\n1. 压入一个正常执行的异步测试任务...");
    const successJobMeta = await jobService.addTestJob("emailQueue", "sendWelcome", {
      email: "success@forge.com",
      username: "Dylan",
      simulateError: false,
    });
    console.log(`成功任务 ID: ${successJobMeta.id}，等待执行...`);

    const completedJob = await waitForJob(emailQueue, successJobMeta.id!);
    const successState = await completedJob.getState();
    console.log(`任务状态: ${successState}`);
    console.log(`执行返回值:`, completedJob.returnvalue);

    if (successState !== "completed" || completedJob.returnvalue?.sent !== true) {
      throw new Error("测试失败: 预期任务应该执行成功并返回 sent: true");
    }

    // 3. 压入并验证一个失败任务 (仅尝试 1 次，快速失败)
    console.log("\n2. 压入一个故意报错的失败任务，测试堆栈采集能力...");
    const failJob = await emailQueue.add(
      "sendWelcome",
      {
        email: "failed_user@forge.com",
        username: "ErrorTester",
        simulateError: true,
      },
      {
        attempts: 1, // 只试一次，防止等待重试时间过长
      },
    );
    console.log(`失败任务 ID: ${failJob.id}，等待报错...`);

    const failedJobResult = await waitForJob(emailQueue, failJob.id!);
    const failState = await failedJobResult.getState();
    console.log(`任务状态: ${failState}`);
    console.log(`报错原因: "${failedJobResult.failedReason}"`);
    console.log(`采集到的错误调用栈长度: ${failedJobResult.stacktrace?.length} 行`);

    if (failState !== "failed" || !failedJobResult.failedReason?.includes("SMTP Error")) {
      throw new Error("测试失败: 预期任务应该失败且包含 SMTP 报错原因");
    }
    if (!failedJobResult.stacktrace || failedJobResult.stacktrace.length === 0) {
      throw new Error("测试失败: 未能采集到错误代码的 Stack Trace");
    }

    // 4. 获取队列统计列表
    console.log("\n3. 验证队列概况统计接口获取...");
    const queuesStats = await jobService.getQueues();
    console.log("队列数据:", JSON.stringify(queuesStats, null, 2));

    const emailStats = queuesStats.find((q) => q.name === "emailQueue");
    if (!emailStats || emailStats.counts.completed === 0 || emailStats.counts.failed === 0) {
      throw new Error("测试失败: 队列的 completed / failed 统计数值应当累加");
    }

    // 5. 测试分页查询接口
    console.log("\n4. 验证分页查询任务列表接口...");
    const failedList = await jobService.getJobs("emailQueue", "failed", 1, 5);
    console.log(
      `已失败任务数: ${failedList.total}，获取的当前页列表长度: ${failedList.list.length}`,
    );
    if (failedList.total === 0 || failedList.list.length === 0) {
      throw new Error("测试失败: 应当能够分页检索到刚才失败的任务");
    }

    // 清理刚才产生的测试 Job 痕迹以还原干净的 Redis 库
    console.log("\n5. 清理 Redis 中的临时测试任务...");
    await completedJob.remove();
    await failedJobResult.remove();

    console.log("\n🎉 定时任务调度中心所有后端核心逻辑与状态检测测试 100% 成功通过！");

    // 优雅关闭服务
    await jobService.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ 测试过程中发生错误:", error);
    await jobService.destroy().catch(() => {});
    process.exit(1);
  }
}

void runTest();
