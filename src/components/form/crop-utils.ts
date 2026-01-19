import type { Crop } from "react-image-crop";

/**
 * Calculate a centered crop area based on the image dimensions and desired aspect ratio.
 */
export function centerAspectCrop(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number
): Crop {
  const imageAspectRatio = imageWidth / imageHeight;

  if (imageAspectRatio > aspectRatio) {
    // Image is wider than target ratio
    const height = imageHeight;
    const width = height * aspectRatio;
    const x = (imageWidth - width) / 2;
    const y = 0;

    return {
      unit: "px",
      x,
      y,
      width,
      height,
    };
  } else {
    // Image is taller than target ratio
    const width = imageWidth;
    const height = width / aspectRatio;
    const x = 0;
    const y = (imageHeight - height) / 2;

    return {
      unit: "px",
      x,
      y,
      width,
      height,
    };
  }
}
