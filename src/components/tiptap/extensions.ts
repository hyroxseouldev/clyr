import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

/**
 * Tiptap 확장 설정
 * 프로젝트에서 사용하는 모든 Tiptap 확장을 중앙 관리합니다.
 */
export const getTiptapExtensions = () => [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: {
        class: "list-disc list-outside ml-4",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal list-outside ml-4",
      },
    },
    listItem: {
      HTMLAttributes: {
        class: "list-item",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "border-l-4 border-gray-300 pl-4 italic",
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class:
          "bg-gray-100 dark:bg-gray-800 p-4 rounded-md font-mono text-sm",
      },
    },
    code: {
      HTMLAttributes: {
        class:
          "bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono",
      },
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-500 hover:text-blue-700 underline cursor-pointer",
    },
    autolink: true,
  }),
  Image.configure({
    HTMLAttributes: {
      class: "max-w-full h-auto rounded-lg",
    },
  }),
  TextStyle,
  Color,
];
