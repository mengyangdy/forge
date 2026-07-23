import { ContentRenderer } from "@/components/ai-chat/AIChatDialogue";
import type { ContentItem } from "@/components/ai-chat/types";

const demoContents = [
  {
    type: "text",
    text: "你好，我是自定义 AI 助手。下面是各种消息内容的展示效果。",
  },
  {
    type: "reasoning",
    content: "我正在分析你的问题，并根据上下文组织一个更加合理的回答。",
    status: "completed",
  },
  {
    type: "code",
    language: "tsx",
    code: `const hello = "Hello AI Chat";\nconsole.log(hello);`,
  },
  {
    type: "image",
    imageUrl: "https://picsum.photos/800/400",
  },
  {
    type: "file",
    fileName: "AIChat设计方案.pdf",
    fileType: "application/pdf",
    fileSize: "2.4 MB",
    fileUrl: "#",
  },
  {
    type: "tool_call",
    name: "web_search",
    arguments: JSON.stringify(
      {
        query: "Semi Design AIChat",
      },
      null,
      2,
    ),
    result: "搜索完成，共找到 10 条相关结果。",
    status: "completed",
  },
] satisfies ContentItem[];

const CustomPage = () => {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col items-stretch gap-4 overflow-y-auto p-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          AI Chat 内容渲染测试
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          当前用于验证文本、代码、图片、文件、思考过程和工具调用的展示效果。
        </p>
      </div>

      <div className="w-full min-w-0 self-stretch rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white">
            AI
          </div>

          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">AI 助手</div>

            <div className="text-xs text-gray-400">内容渲染测试消息</div>
          </div>
        </div>

        <ContentRenderer
          content={demoContents}
          onImageClick={() => {
            window.alert("点击了图片");
          }}
          onFileClick={() => {
            window.alert("点击了文件");
          }}
        />
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-600 p-5 text-sm leading-relaxed text-white">
        <div className="mb-2 text-xs font-medium text-blue-100">我</div>

        <div className="whitespace-pre-wrap">
          这是用户发送的消息内容。
          {"\n"}
          当前页面正在验证 AI Chat 的基础内容渲染能力。
        </div>
      </div>
    </div>
  );
};

export default CustomPage;
