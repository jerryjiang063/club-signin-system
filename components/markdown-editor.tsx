"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { FiEye, FiEdit, FiHelpCircle } from "react-icons/fi";
import { motion } from "framer-motion";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  minHeight = "200px",
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 text-sm rounded-md ${
              !isPreview
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <FiEdit className="inline-block mr-1 h-3 w-3" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 text-sm rounded-md ${
              isPreview
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <FiEye className="inline-block mr-1 h-3 w-3" /> Preview
          </button>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          <FiHelpCircle className="inline-block mr-1 h-3 w-3" /> Markdown Help
        </motion.button>
      </div>

      {showHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs p-3 bg-secondary/30 rounded-md overflow-hidden"
        >
          <h4 className="font-bold mb-1">Markdown Syntax:</h4>
          <ul className="space-y-1 list-disc pl-4">
            <li><code># Heading 1</code>, <code>## Heading 2</code>, etc.</li>
            <li><code>**Bold**</code>, <code>*Italic*</code></li>
            <li><code>[Link](https://example.com)</code></li>
            <li><code>![Image](image-url.jpg)</code></li>
            <li><code>- List item</code>, <code>1. Numbered item</code></li>
            <li><code>```code block```</code></li>
            <li><code>&gt; Blockquote</code></li>
            <li><code>---</code> for horizontal rule</li>
          </ul>
        </motion.div>
      )}

      <div className="rounded-md border overflow-hidden">
        {isPreview ? (
          <div
            className="prose dark:prose-invert max-w-none p-4 overflow-auto"
            style={{ minHeight }}
          >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">No content to preview</p>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 bg-background focus:outline-none focus:ring-0 border-0"
            style={{ minHeight }}
          />
        )}
      </div>
    </div>
  );
}
