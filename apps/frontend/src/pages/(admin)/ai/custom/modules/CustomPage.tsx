import { AIChatDialogue, AIChatInput } from "@/components/custom-ai-chat";

const CustomPage = () => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-16px p-16px">
      <AIChatDialogue chats={[]} />
      <AIChatInput />
    </div>
  );
};

export default CustomPage;
