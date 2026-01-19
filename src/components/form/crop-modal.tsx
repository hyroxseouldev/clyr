"use client";

import { useState, useCallback, useRef } from "react";
import { ReactCrop } from "react-image-crop";
import type { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { centerAspectCrop } from "./crop-utils";

export type AspectRatio = "free" | "square" | "landscape" | "portrait";
export type CropShape = "rect" | "round";

interface CropModalProps {
  isOpen: boolean;
  imageUrl: string;
  aspectRatio: AspectRatio;
  shape: CropShape;
  minWidth?: number;
  minHeight?: number;
  onApply: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const ASPECT_RATIOS: Record<AspectRatio, number | undefined> = {
  free: undefined,
  square: 1,
  landscape: 16 / 9,
  portrait: 4 / 3,
};

export function CropModal({
  isOpen,
  imageUrl,
  aspectRatio,
  shape,
  minWidth = 100,
  minHeight = 100,
  onApply,
  onCancel,
}: CropModalProps) {
  const t = useTranslations("crop");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const ratio = ASPECT_RATIOS[aspectRatio];

    if (ratio) {
      // Use centerAspectCrop for aspect ratio constrained crops
      const initialCrop = centerAspectCrop(width, height, ratio);
      setCrop(initialCrop);
    } else {
      // Free crop - default center position
      setCrop({
        unit: "%",
        x: 25,
        y: 25,
        width: 50,
        height: 50,
      });
    }
  };

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop | null): Promise<Blob | null> => {
      if (!crop || !image) return Promise.resolve(null);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return Promise.resolve(null);

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );

      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.95);
      });
    },
    []
  );

  const handleApply = async () => {
    if (!imgRef.current || !completedCrop) return;

    const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
    if (croppedBlob) {
      onApply(croppedBlob);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Crop area */}
          <div className="flex justify-center bg-muted rounded-lg p-4">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={ASPECT_RATIOS[aspectRatio]}
              minWidth={minWidth}
              minHeight={minHeight}
              circularCrop={shape === "round"}
              keepSelection
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imageUrl}
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${scale})`,
                  maxWidth: "100%",
                  maxHeight: "60vh",
                }}
              />
            </ReactCrop>
          </div>

          {/* Zoom slider */}
          <div className="space-y-2">
            <Label htmlFor="zoom">{t("zoom")}</Label>
            <Slider
              id="zoom"
              min={0.5}
              max={2}
              step={0.1}
              value={[scale]}
              onValueChange={([value]) => setScale(value)}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button onClick={handleApply} disabled={!completedCrop}>
            {t("apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
