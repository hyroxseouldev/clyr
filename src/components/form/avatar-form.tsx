"use client";

import { useCallback, useState, useRef } from "react";
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
import { useTranslations } from "next-intl";
import {
  CropModal,
  type AspectRatio,
  type CropShape,
} from "./crop-modal";

export type { AspectRatio, CropShape };

interface CropConfig {
  enabled: boolean; // Enable/disable cropping
  aspectRatio?: AspectRatio; // Aspect ratio preset
  shape?: CropShape; // Crop shape (rect or round)
  minWidth?: number; // Minimum crop width in pixels (default: 100)
  minHeight?: number; // Minimum crop height in pixels (default: 100)
}

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
  crop?: CropConfig; // Crop configuration
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
 *
 * @example
 * ```tsx
 * // With crop enabled (square, round for avatar)
 * <AvatarForm
 *   name="profileImageUrl"
 *   label={t("profileImage")}
 *   form={form}
 *   bucketName="public-assets"
 *   path="coach/profile"
 *   crop={{ enabled: true, aspectRatio: 'square', shape: 'round' }}
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
  crop,
}: AvatarFormProps<TFieldValues, TName>) {
  const t = useTranslations("imageForm");
  const currentValue = form.watch(name);

  // Crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

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
  } = useSupabaseUpload({
    bucketName,
    path,
    allowedMimeTypes: ["image/*"],
    maxFileSize,
    maxFiles: 1,
  });

  // Handle file input change - show crop modal if enabled
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles || selectedFiles.length === 0) return;

      const file = selectedFiles[0];

      if (crop?.enabled) {
        // Show crop modal
        const preview = URL.createObjectURL(file);
        setPendingImage(preview);
        setShowCropModal(true);
      } else {
        // Directly add file
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
          errors: [],
        }) as File & { preview: string; errors: [] };
        setFiles([fileWithPreview]);
      }
    },
    [crop?.enabled, setFiles]
  );

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

    // Clean up pending image and cropped blob
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage);
      setPendingImage(null);
    }
    setCroppedBlob(null);
  }, [form, name, setFiles, pendingImage]);

  // Crop apply handler
  const handleCropApply = useCallback(
    (blob: Blob) => {
      setCroppedBlob(blob);
      setShowCropModal(false);

      // Create a new File from the cropped blob
      const croppedFile = new File([blob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      // Create preview for the cropped image
      const preview = URL.createObjectURL(blob);

      // Create FileWithPreview by casting - FileWithPreview extends File
      const fileWithPreview = Object.assign(croppedFile, {
        preview,
        errors: [],
      }) as File & { preview: string; errors: [] };

      // Update files with cropped image
      setFiles([fileWithPreview]);

      // Clean up pending image
      if (pendingImage) {
        URL.revokeObjectURL(pendingImage);
        setPendingImage(null);
      }
    },
    [setFiles, pendingImage]
  );

  // Crop cancel handler
  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);

    // Clean up pending image and cropped blob
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage);
      setPendingImage(null);
    }
    setCroppedBlob(null);
    setFiles([]);
  }, [pendingImage, setFiles]);

  return (
    <>
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
                    "relative rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted transition-colors",
                    sizeClasses[size],
                    "hover:border-primary/50 cursor-pointer"
                  )}
                  onClick={() => document.getElementById(`file-input-${name}`)?.click()}
                >
                  <input
                    id={`file-input-${name}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* 기존 이미지 또는 업로드된 이미지 */}
                  {currentValue ? (
                    <>
                      <div className="relative rounded-full overflow-hidden w-full h-full">
                        <Image
                          src={currentValue as string}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 rounded-full z-10 shadow-lg"
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
                    <div className="relative rounded-full overflow-hidden w-full h-full">
                      <img
                        src={files[0].preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    // 빈 상태
                    <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center rounded-full overflow-hidden">
                      <User className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {size === "sm" ? "" : t("clickToSelect")}
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
                      {loading ? t("uploading") : t("upload")}
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
                    {t("recommendation", { size: (maxFileSize / 1024 / 1024).toFixed(0) })}
                  </p>
                )}

                {/* 성공 메시지 */}
                {isSuccess && currentValue && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ {t("uploadSuccess")}
                  </p>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Crop Modal */}
      {crop?.enabled && pendingImage && (
        <CropModal
          isOpen={showCropModal}
          imageUrl={pendingImage}
          aspectRatio={crop.aspectRatio || "square"}
          shape={crop.shape || "round"}
          minWidth={crop.minWidth || 200}
          minHeight={crop.minHeight || 200}
          onApply={handleCropApply}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
