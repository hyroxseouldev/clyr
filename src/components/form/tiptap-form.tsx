"use client";

import dynamic from "next/dynamic";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  type UseFormReturn,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils";

// Dynamic import to avoid SSR issues
const TiptapEditor = dynamic(
  () => import("@/components/tiptap").then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border border-input rounded-md p-4 min-h-[150px] bg-muted animate-pulse" />
    ),
  }
);

interface TiptapFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  label?: string;
  form: UseFormReturn<TFieldValues>;
  placeholder?: string;
  description?: string;
  className?: string;
  required?: boolean;
  editable?: boolean;
  showToolbar?: boolean;
  minHeight?: string;
}

/**
 * Tiptap 에디터 폼 필드 컴포넌트
 * React Hook Form과 통합된 위지윅 에디터 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * <TiptapForm
 *   name="description"
 *   label="상세 설명"
 *   form={form}
 *   placeholder="프로그램에 대한 상세 설명을 입력하세요..."
 *   description="마크다운 형식을 지원합니다"
 *   minHeight="200px"
 * />
 * ```
 */
export function TiptapForm<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  form,
  placeholder = "내용을 입력하세요...",
  description,
  className,
  required = false,
  editable = true,
  showToolbar = true,
  minHeight = "150px",
}: TiptapFormProps<TFieldValues, TName>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <TiptapEditor
              content={field.value || ""}
              onChange={field.onChange}
              editable={editable}
              placeholder={placeholder}
              showToolbar={showToolbar}
              className={cn(minHeight && "min-h-[" + minHeight + "]")}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
