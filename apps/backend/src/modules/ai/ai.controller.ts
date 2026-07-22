import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const aiApp = new Hono();

// 配置 DeepSeek 或 OpenAI 客户端
const deepseek = createOpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "",
});

aiApp.post("/chat", async (c) => {
  // 1. 获取前端传过来的历史消息数组
  const { messages } = await c.req.json();

  // 2. 调用大模型获取文本流
  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: "你是一个集成在后台管理系统中的 AI 助手，负责解答用户操作和技术问题。",
    messages,
  });

  // 3. 使用 Hono 的 streamSSE 实时输出给前端
  return streamSSE(c, async (stream) => {
    // 监听前端取消请求/关闭页面
    stream.onAbort(() => {
      console.log("前端取消了 AI 请求");
    });

    // 循环将 LLM 的 chunk 写入 SSE 流
    for await (const textChunk of result.textStream) {
      await stream.writeSSE({
        data: JSON.stringify({ content: textChunk }),
        event: "message",
      });
    }

    // 发送完成标记
    await stream.writeSSE({
      data: "[DONE]",
      event: "message",
    });
  });
});

export default aiApp;
