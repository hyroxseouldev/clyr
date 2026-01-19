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
import {
  useSupabaseUpload,
  sanitizeFileName,
} from "@/hooks/use-supabase-upload";
import { Button } from "@/components/ui/button";
import { Upload, X, FileImage, Plus } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

interface MultiImageFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  label?: string;
  form: UseFormReturn<TFieldValues>;
  bucketName: string;
  path?: string;
  maxFileSize?: number;
  maxFiles?: number;
  className?: string;
  required?: boolean;
}

/**
 * 다중 이미지 업로드 폼 필드 컴포넌트
 * React Hook Form과 통합된 다중 이미지 업로드 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * <MultiImageForm
 *   name="galleryUrls"
 *   label="갤러리 이미지"
 *   form={form}
 *   bucketName="public-assets"
 *   path="program/gallery"
 *   maxFileSize={5 * 1024 * 1024} // 5MB
 *   maxFiles={5}
 * />
 * ```
 */
export function MultiImageForm<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  form,
  bucketName,
  path,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  className,
  required = false,
}: MultiImageFormProps<TFieldValues, TName>) {
  const t = useTranslations("multiImageForm");
  const currentValue = form.watch(name) as string[] | undefined;

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
    maxFiles,
  });

  // 업로드 후 public URL들을 가져와서 폼에 저장
  const handleUploadSuccess = useCallback(async () => {
    const uploadedPaths = await onUpload();

    if (uploadedPaths && uploadedPaths.length > 0) {
      const supabase = createClient();

      // 모든 업로드된 경로에 대해 public URL 생성
      const publicUrls = await Promise.all(
        uploadedPaths.map(async (filePath) => {
          const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
          return data.publicUrl;
        })
      );

      // 기존 값에 새 URL들을 추가
      const existingUrls = (currentValue || []) as string[];
      const newUrls = [...existingUrls, ...publicUrls];
      form.setValue(name, newUrls as any);

      // 파일 상태 초기화
      setFiles([]);
    }
  }, [onUpload, bucketName, form, name, currentValue, setFiles]);

  // 단일 이미지 삭제 핸들러
  const handleRemoveImage = useCallback(
    (index: number) => {
      const currentUrls = (currentValue || []) as string[];
      const newUrls = currentUrls.filter((_, i) => i !== index);
      form.setValue(name, newUrls as any);
    },
    [form, name, currentValue]
  );

  // 선택된 파일 취소 핸들러
  const handleClearFiles = useCallback(() => {
    setFiles([]);
  }, [setFiles]);

  const currentImageCount = currentValue?.length || 0;
  const canAddMore = currentImageCount < maxFiles;

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
              <span className="text-muted-foreground ml-2">
                ({currentImageCount}/{maxFiles})
              </span>
            </FormLabel>
          )}
          <FormControl>
            <div className="space-y-4">
              {/* 성공 메시지 */}
              {isSuccess && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {t("uploadSuccess")}
                  </p>
                  <X
                    className="h-4 w-4 text-green-700 dark:text-green-400 cursor-pointer"
                    onClick={() => setFiles([])}
                  />
                </div>
              )}

              {/* 업로드된 이미지 그리드 */}
              {currentValue && currentValue.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentValue.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square border rounded-lg overflow-hidden bg-muted group"
                    >
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* 업로드 영역 (더 추가 가능할 때만 표시) */}
              {canAddMore && (
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
                          {t("dragDropHint", { maxFiles })}
                        </p>
                        {maxFileSize && (
                          <p className="text-xs text-muted-foreground">
                            {t("maxFileSize", {
                              size: (maxFileSize / 1024 / 1024).toFixed(0),
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      // 파일들이 선택된 상태
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50"
                            >
                              {file.type.startsWith("image/") && file.preview ? (
                                <div className="h-12 w-12 rounded border overflow-hidden shrink-0 bg-muted">
                                  <img
                                    src={file.preview}
                                    alt={file.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center shrink-0">
                                  <FileImage className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex flex-col items-start truncate">
                                <p className="text-xs font-medium truncate max-w-[100px]">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)}KB
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearFiles();
                          }}
                        >
                          {t("remove")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 업로드 버튼 및 상태 메시지 */}
              {files.length > 0 && !isSuccess && (
                <div className="space-y-3">
                  {/* 파일 에러 표시 */}
                  {files.some((f) => f.errors.length > 0) && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm font-medium text-destructive mb-2">
                        {t("uploadErrors") || "파일 업로드 에러"}
                      </p>
                      <ul className="text-xs text-destructive space-y-1">
                        {files
                          .filter((f) => f.errors.length > 0)
                          .map((file, idx) => (
                            <li key={idx}>
                              • {file.name}:{" "}
                              {file.errors.map((e) => e.message).join(", ")}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadSuccess}
                      disabled={loading || files.some((f) => f.errors.length > 0)}
                    >
                      {loading ? (
                        <>{t("uploading")}</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {t("upload")}
                        </>
                      )}
                    </Button>
                    {loading && (
                      <p className="text-sm text-muted-foreground">
                        {t("uploadingWait") || "업로드 중..."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 더 추가 버튼 (이미지가 있고 더 추가 가능할 때) */}
              {currentImageCount > 0 && canAddMore && files.length === 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addMore")}
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
