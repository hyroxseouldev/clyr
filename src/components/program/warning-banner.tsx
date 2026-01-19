/**
 * Warning Banner Component
 * Displays a red warning banner when the program is not for sale
 */

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WarningBannerProps {
  message: string;
  className?: string;
}

export function WarningBanner({ message, className }: WarningBannerProps) {
  return (
    <div
      className={cn(
        "w-full bg-red-50 border-b border-red-200 py-3 px-4",
        className
      )}
    >
      <div className="container max-w-4xl mx-auto flex items-center justify-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <span className="text-red-700 font-medium text-sm">{message}</span>
      </div>
    </div>
  );
}
