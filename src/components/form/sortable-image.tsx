/**
 * Sortable Image Component
 * Individual image item with drag handle and delete button
 * Uses HTML5 drag and drop API for reordering
 */

"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, GripVertical } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SortableImageProps {
  url: string;
  index: number;
  isDragging: boolean;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

export function SortableImage({
  url,
  index,
  isDragging,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SortableImageProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      onDragStart(index);
    },
    [index, onDragStart]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault(); // Allow drop
      onDragOver(e, index);
    },
    [index, onDragOver]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDrop(e, index);
    },
    [index, onDrop]
  );

  const handleDragEnd = useCallback(() => {
    onDragEnd();
  }, [onDragEnd]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      className={cn(
        "relative aspect-square border rounded-lg overflow-hidden bg-muted group transition-opacity",
        isDragging && "opacity-50"
      )}
    >
      {/* Image */}
      <Image
        src={url}
        alt={`Preview ${index + 1}`}
        fill
        className="object-cover pointer-events-none"
      />

      {/* Drag Handle - visible on hover */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1 cursor-move">
        <GripVertical className="h-4 w-4 text-white" />
      </div>

      {/* Remove Button - visible on hover */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Order Badge */}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
        {index + 1}
      </div>
    </div>
  );
}
