/**
 * Program Image Carousel Component
 * Displays a carousel of program images using mainImageList
 */

"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ProgramImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

export function ProgramImageCarousel({
  images,
  alt = "Program image",
  className,
}: ProgramImageCarouselProps) {
  // Show placeholder if no images
  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center",
          className
        )}
      >
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  // If only one image, show it without carousel
  if (images.length === 1) {
    return (
      <div className={cn("w-full", className)}>
        <img
          src={images[0]}
          alt={alt}
          className="w-full aspect-4/3 object-cover"
        />
      </div>
    );
  }

  // Show carousel for multiple images
  return (
    <Carousel
      className={cn("w-full max-w-4xl mx-auto", className)}
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-4/3">
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
}
