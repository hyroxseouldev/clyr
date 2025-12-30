"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { getTiptapExtensions } from "./extensions";
import { Toolbar } from "./toolbar";

interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
}

/**
 * Tiptap 에디터 공용 컴포넌트
 *
 * @example
 * ```tsx
 * <TiptapEditor
 *   content="초기 내용"
 *   onChange={(html) => console.log(html)}
 *   placeholder="내용을 입력하세요..."
 * />
 * ```
 */
export function TiptapEditor({
  content = "",
  onChange,
  editable = true,
  placeholder = "내용을 입력하세요...",
  className,
  showToolbar = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: getTiptapExtensions(),
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3",
          "prose-headings:font-bold prose-headings:text-foreground",
          "prose-p:text-foreground prose-p:leading-relaxed",
          "prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline",
          "prose-strong:font-semibold prose-strong:text-foreground",
          "prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
          "prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-md",
          "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic",
          // Placeholder 스타일 (비어있을 때만 표시)
          "is-editor-empty:before:content-[attr(data-placeholder)] is-editor-empty:before:text-gray-400 is-editor-empty:before:pointer-events-none is-editor-empty:before:float-left is-editor-empty:before:h-0"
        ),
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  // 에디터가 비어있는지 확인하여 클래스 추가
  const isEmpty = editor.getText().trim().length === 0;

  return (
    <div className={cn("border border-input rounded-md", className)}>
      {showToolbar && editable && <Toolbar editor={editor} />}
      <div
        className={cn(
          "ProseMirror",
          "focus:outline-none",
          isEmpty && "is-editor-empty"
        )}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
