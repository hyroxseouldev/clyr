"use client";

import { useCallback } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  type UseFormReturn,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { Button } from "@/components/ui/button";
import { Upload, X, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AvatarFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  label?: string;
  form: UseFormReturn<TFieldValues>;
  bucketName: string;
  path?: string;
  maxFileSize?: number;
  className?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * 프로필 아바타 업로드 폼 필드 컴포넌트
 * React Hook Form과 통합된 원형 아바타 업로드 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * <AvatarForm
 *   name="avatarUrl"
 *   label="프로필 이미지"
 *   form={form}
 *   bucketName="avatars"
 *   path="coach"
 *   size="lg"
 * />
 * ```
 */
export function AvatarForm<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  form,
  bucketName,
  path,
  maxFileSize = 2 * 1024 * 1024, // 2MB default
  className,
  required = false,
  size = "lg",
}: AvatarFormProps<TFieldValues, TName>) {
  const currentValue = form.watch(name);

  // 사이즈별 크기 설정
  const sizeClasses = {
    sm: "h-20 w-20",
    md: "h-32 w-32",
    lg: "h-40 w-40",
  };

  // Supabase 업로드 훅
  const {
    files,
    setFiles,
    onUpload,
    loading,
    isSuccess,
    errors,
    getRootProps,
    getInputProps,
  } = useSupabaseUpload({
    bucketName,
    path,
    allowedMimeTypes: ["image/*"],
    maxFileSize,
    maxFiles: 1,
  });

  // 업로드 후 public URL을 가져와서 폼에 저장
  const handleUploadSuccess = useCallback(async () => {
    const uploadedPaths = await onUpload();

    if (uploadedPaths && uploadedPaths.length > 0) {
      const filePath = uploadedPaths[0];

      try {
        const supabase = createClient();
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        form.setValue(name, data.publicUrl as any);
      } catch (error) {
        console.error("Failed to get public URL:", error);
      }
    }
  }, [onUpload, bucketName, form, name]);

  // 이미지 삭제 핸들러
  const handleRemoveImage = useCallback(() => {
    form.setValue(name, "" as any);
    setFiles([]);
  }, [form, name, setFiles]);

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
            <div className="flex flex-col items-center gap-4">
              {/* 아바타 프리뷰 영역 */}
              <div
                className={cn(
                  "relative rounded-full border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted transition-colors",
                  sizeClasses[size],
                  "hover:border-primary/50 cursor-pointer"
                )}
                {...getRootProps()}
              >
                <input {...getInputProps()} />

                {/* 기존 이미지 또는 업로드된 이미지 */}
                {currentValue ? (
                  <>
                    <Image
                      src={currentValue as string}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : files.length > 0 && files[0].preview ? (
                  // 선택된 파일 프리뷰
                  <img
                    src={files[0].preview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // 빈 상태
                  <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
                    <User className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {size === "sm" ? "" : "클릭하여 이미지 선택"}
                    </p>
                  </div>
                )}
              </div>

              {/* 파일 선택 안내 및 업로드 버튼 */}
              {files.length > 0 && !isSuccess && !currentValue && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {files[0].name}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadSuccess}
                    disabled={loading || files.some((f) => f.errors.length > 0)}
                  >
                    {loading ? "업로드 중..." : "업로드"}
                  </Button>
                  {errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {errors[0]?.message}
                    </p>
                  )}
                </div>
              )}

              {/* 크기 가이드 */}
              {!currentValue && files.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  권장: 정방형 1:1 비율, 최대 {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                </p>
              )}

              {/* 성공 메시지 */}
              {isSuccess && currentValue && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ 이미지가 업로드되었습니다
                </p>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
