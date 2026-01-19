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
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import {
  CropModal,
  type AspectRatio,
  type CropShape,
} from "./crop-modal";
import { SortableImage } from "./sortable-image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export type { AspectRatio, CropShape };

interface CropConfig {
  enabled: boolean;
  aspectRatio?: AspectRatio;
  shape?: CropShape;
  minWidth?: number;
  minHeight?: number;
}

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
  crop?: CropConfig;
}

/**
 * 다중 이미지 업로드 폼 필드 컴포넌트
 * React Hook Form과 통합된 다중 이미지 업로드 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * <MultiImageForm
 *   name="mainImageList"
 *   label="갤러리 이미지"
 *   form={form}
 *   bucketName="public-assets"
 *   path="program/gallery"
 *   maxFileSize={5 * 1024 * 1024} // 5MB
 *   maxFiles={5}
 *   crop={{ enabled: true, aspectRatio: 'landscape', shape: 'rect' }}
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
  crop,
}: MultiImageFormProps<TFieldValues, TName>) {
  const t = useTranslations("multiImageForm");
  const currentValue = form.watch(name) as string[] | undefined;
  const inputRef = useRef<HTMLInputElement>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  const currentImageCount = currentValue?.length || 0;
  const canAddMore = currentImageCount < maxFiles;

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
        // Directly upload
        uploadFile(file);
      }

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [crop?.enabled]
  );

  // Upload file to Supabase
  const uploadFile = useCallback(
    async (file: File) => {
      const supabase = createClient();

      // Generate sanitized filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const extension = file.name.split(".").pop();
      const sanitizedName = `${timestamp}-${randomString}.${extension}`;
      const uploadPath = path ? `${path}/${sanitizedName}` : sanitizedName;

      try {
        // Upload to Supabase
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(uploadPath, file);

        if (error) {
          console.error("Upload failed:", error);
          return;
        }

        // Get public URL
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(uploadPath);

        // Update form value
        const existingUrls = (currentValue || []) as string[];
        const newUrls = [...existingUrls, data.publicUrl];
        form.setValue(name, newUrls as any);
      } catch (error) {
        console.error("Upload error:", error);
      }
    },
    [bucketName, currentValue, form, name, path]
  );

  // Crop apply handler
  const handleCropApply = useCallback(
    (blob: Blob) => {
      setCroppedBlob(blob);
      setShowCropModal(false);

      // Create a new File from the cropped blob
      const croppedFile = new File([blob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      // Upload the cropped file
      uploadFile(croppedFile);

      // Clean up pending image
      if (pendingImage) {
        URL.revokeObjectURL(pendingImage);
        setPendingImage(null);
      }
    },
    [pendingImage, uploadFile]
  );

  // Crop cancel handler
  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage);
      setPendingImage(null);
    }
  }, [pendingImage]);

  // Remove image handler
  const handleRemoveImage = useCallback(
    (index: number) => {
      const currentUrls = (currentValue || []) as string[];
      const newUrls = currentUrls.filter((_, i) => i !== index);
      form.setValue(name, newUrls as any);
    },
    [currentValue, form, name]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      // Reorder array
      const currentUrls = (currentValue || []) as string[];
      const newUrls = [...currentUrls];
      const [removed] = newUrls.splice(draggedIndex, 1);
      newUrls.splice(dropIndex, 0, removed);

      form.setValue(name, newUrls as any);
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [currentValue, draggedIndex, form, name]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

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
              {/* Images Grid with drag and drop */}
              {currentValue && currentValue.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentValue.map((url, index) => (
                    <SortableImage
                      key={url}
                      url={url}
                      index={index}
                      isDragging={draggedIndex === index}
                      onRemove={() => handleRemoveImage(index)}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              )}

              {/* Add Image Button (single file input) */}
              {canAddMore && (
                <>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {currentValue && currentValue.length > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => inputRef.current?.click()}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addImage") || "이미지 추가"}
                    </Button>
                  ) : (
                    <div
                      onClick={() => inputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {t("addImage") || "이미지 추가"}
                      </p>
                      {maxFileSize && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {(maxFileSize / 1024 / 1024).toFixed(0)}MB 이하
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Crop Modal */}
              {crop?.enabled && pendingImage && (
                <CropModal
                  isOpen={showCropModal}
                  imageUrl={pendingImage}
                  aspectRatio={crop.aspectRatio || "landscape"}
                  shape={crop.shape || "rect"}
                  minWidth={crop.minWidth || 200}
                  minHeight={crop.minHeight || 200}
                  onApply={handleCropApply}
                  onCancel={handleCropCancel}
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
