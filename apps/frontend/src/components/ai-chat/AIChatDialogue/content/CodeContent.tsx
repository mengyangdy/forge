import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeContentProps {
  code?: string;
  language?: string;
}

export const CodeContent = ({ code = "", language = "text" }: CodeContentProps) => {
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-gray-700">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus as Record<string, React.CSSProperties>}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "12px",
          fontSize: "12px",
          background: "transparent",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
