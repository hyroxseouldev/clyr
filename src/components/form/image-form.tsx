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
import { useSupabaseUpload, sanitizeFileName } from "@/hooks/use-supabase-upload";
import { Button } from "@/components/ui/button";
import { Upload, X, FileImage } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ImageFormProps<
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
}

/**
 * 이미지 업로드 폼 필드 컴포넌트
 * React Hook Form과 통합된 이미지 업로드 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * <ImageForm
 *   name="thumbnailUrl"
 *   label="썸네일"
 *   form={form}
 *   bucketName="public-assets"
 *   path="program/thumbnails"
 *   maxFileSize={5 * 1024 * 1024} // 5MB
 * />
 * ```
 */
export function ImageForm<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  form,
  bucketName,
  path,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  className,
  required = false,
}: ImageFormProps<TFieldValues, TName>) {
  const currentValue = form.watch(name);

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
    inputRef,
  } = useSupabaseUpload({
    bucketName,
    path,
    allowedMimeTypes: ["image/*"],
    maxFileSize,
    maxFiles: 1,
  });

  // 업로드 후 public URL을 가져와서 폼에 저장
  const handleUploadSuccess = useCallback(async () => {
    // onUpload가 업로드된 경로들을 반환하도록 수정
    const uploadedPaths = await onUpload();

    // 업로드된 경로 중 첫 번째 것 사용
    if (uploadedPaths && uploadedPaths.length > 0) {
      const filePath = uploadedPaths[0];

      try {
        const supabase = createClient();
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        // public URL을 폼에 저장
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
            <div className="space-y-4">
              {/* 성공 메시지 */}
              {isSuccess && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    이미지가 업로드되었습니다.
                  </p>
                  <X className="h-4 w-4 text-green-700 dark:text-green-400" />
                </div>
              )}

              {/* 이미지 프리뷰 (기존 이미지 또는 업로드된 이미지) */}
              {currentValue && (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={currentValue as string}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* 업로드 영역 */}
              {!currentValue && (
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                      "hover:border-primary/50",
                      "cursor-pointer"
                    )}
                  >
                    {files.length === 0 ? (
                      // 빈 상태
                      <div className="flex flex-col items-center gap-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          이미지를 드래그하거나 클릭하여 선택하세요
                        </p>
                        {maxFileSize && (
                          <p className="text-xs text-muted-foreground">
                            최대 파일 크기: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                          </p>
                        )}
                      </div>
                    ) : (
                      // 파일이 선택된 상태
                      <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                        {files[0].type.startsWith("image/") && files[0].preview ? (
                          <div className="h-16 w-16 rounded border overflow-hidden shrink-0 bg-muted">
                            <img
                              src={files[0].preview}
                              alt={files[0].name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded border bg-muted flex items-center justify-center shrink-0">
                            <FileImage className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex flex-col items-start truncate">
                          <p className="text-sm font-medium truncate max-w-xs">
                            {files[0].name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(files[0].size / 1024).toFixed(1)}KB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 업로드 버튼 및 상태 메시지 */}
              {files.length > 0 && !isSuccess && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadSuccess}
                    disabled={loading || files.some((f) => f.errors.length > 0)}
                  >
                    {loading ? (
                      <>업로드 중...</>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        업로드
                      </>
                    )}
                  </Button>
                  {errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {errors[0]?.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
