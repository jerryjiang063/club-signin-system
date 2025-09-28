"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  if (!content) {
    return <p className="text-muted-foreground italic">No content</p>;
  }

  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
