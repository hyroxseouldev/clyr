/**
 * Program Image Carousel Component
 * Displays a carousel of program images using mainImageList
 * Uses dot indicators instead of arrow buttons
 */

"use client";

import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update selected index when carousel changes
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  // Show placeholder if no images
  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "w-full aspect-video bg-gray-100 flex items-center justify-center",
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

  // Show carousel for multiple images with dot indicators
  return (
    <div className={cn("w-full relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={index}
              className="shrink-0 grow-0 flex-basis-full w-full aspect-4/3"
            >
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              selectedIndex === index
                ? "bg-gray-900 w-6"
                : "bg-gray-400 hover:bg-gray-600"
            )}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
