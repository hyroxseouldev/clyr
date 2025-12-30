/**
 * Tiptap 에디터 컴포넌트
 *
 * @example
 * ```tsx
 * import { TiptapEditor } from "@/components/tiptap";
 *
 * function MyForm() {
 *   const [content, setContent] = useState("");
 *
 *   return (
 *     <TiptapEditor
 *       content={content}
 *       onChange={setContent}
 *       placeholder="내용을 입력하세요..."
 *     />
 *   );
 * }
 * ```
 */

export { TiptapEditor } from "./tiptap-editor";
export { Toolbar } from "./toolbar";
export { getTiptapExtensions } from "./extensions";
