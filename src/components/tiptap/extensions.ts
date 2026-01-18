import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

/**
 * 텍스트 사이즈 확장
 * small, normal, large, huge 옵션을 제공합니다
 */
export const TextSizeExtension = Extension.create({
  name: "textSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const fontSize = element.style.fontSize?.replace(/['"]+/g, "");
              const sizeMap: Record<string, "small" | "normal" | "large" | "huge"> = {
                "0.875rem": "small",
                "14px": "small",
                "1rem": "normal",
                "16px": "normal",
                "1.25rem": "large",
                "20px": "large",
                "1.5rem": "huge",
                "24px": "huge",
              };
              return sizeMap[fontSize || ""] || null;
            },
            renderHTML: (attributes: any) => {
              const fontSize = attributes.fontSize;
              if (!fontSize) {
                return {};
              }

              const sizeMap: Record<string, string> = {
                small: "0.875rem",
                normal: "1rem",
                large: "1.25rem",
                huge: "1.5rem",
              };

              return {
                style: `font-size: ${sizeMap[fontSize] || fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextSize:
        (fontSize: "small" | "normal" | "large" | "huge") =>
        ({ commands }: any) => {
          return commands.setMark("textStyle", { fontSize });
        },
      unsetTextSize:
        () =>
        ({ commands }: any) => {
          return commands.setMark("textStyle", { fontSize: null });
        },
    } as any;
  },
});

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
  TextSizeExtension,
];
