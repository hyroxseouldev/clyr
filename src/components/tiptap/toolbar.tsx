"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  editor: Editor;
}

/**
 * 툴바 버튼 스타일
 */
const ToolbarButton = ({
  onClick,
  isActive,
  children,
  tooltip,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  tooltip: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          className={cn(
            "h-8 w-8 p-0",
            isActive && "bg-accent text-accent-foreground"
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/**
 * Tiptap 툴바 컴포넌트
 * 텍스트 서식, 헤딩, 리스트, 링크 등의 기능을 제공합니다.
 */
export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-input p-2 flex flex-wrap gap-1">
      {/* 텍스트 서식 */}
      <div className="flex gap-1 pr-2 border-r border-input">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          tooltip="볼드 (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          tooltip="이탤릭 (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          tooltip="취소선"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          tooltip="인라인 코드"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* 헤딩 */}
      <div className="flex gap-1 pr-2 border-r border-input">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              헤딩
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={cn(
                editor.isActive("heading", { level: 1 }) && "bg-accent"
              )}
            >
              <Heading1 className="h-4 w-4 mr-2" />
              헤딩 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={cn(
                editor.isActive("heading", { level: 2 }) && "bg-accent"
              )}
            >
              <Heading2 className="h-4 w-4 mr-2" />
              헤딩 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={cn(
                editor.isActive("heading", { level: 3 }) && "bg-accent"
              )}
            >
              <Heading3 className="h-4 w-4 mr-2" />
              헤딩 3
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={cn(
                editor.isActive("paragraph") && "bg-accent"
              )}
            >
              문단
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 리스트 */}
      <div className="flex gap-1 pr-2 border-r border-input">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          tooltip="불릿 리스트"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          tooltip="번호 리스트"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* 인용구 */}
      <div className="flex gap-1 pr-2 border-r border-input">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          tooltip="인용구"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* 정렬 - 확장이 필요한 경우 선택적 구현 */}
      {/* <div className="flex gap-1 pr-2 border-r border-input">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          tooltip="왼쪽 정렬"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          tooltip="가운데 정렬"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          tooltip="오른쪽 정렬"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
      </div> */}

      {/* 링크 추가 */}
      <div className="flex gap-1 pr-2 border-r border-input">
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("링크 URL을 입력하세요:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive("link")}
          tooltip="링크 추가"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            tooltip="링크 제거"
          >
            ✕
          </ToolbarButton>
        )}
      </div>

      {/* 실행 취소/다시 실행 */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          tooltip="실행 취소 (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          tooltip="다시 실행 (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}
