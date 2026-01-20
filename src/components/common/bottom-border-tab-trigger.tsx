import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

function BottomBorderTabTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // 1. 기본 스타일
        "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
        "shadow-none outline-none",
        "disabled:pointer-events-none disabled:opacity-50",

        // 2. 평상시 (비활성) 상태
        "text-muted-foreground hover:text-foreground",

        // 3. 활성화(Active) 상태: 하단 border 표시
        "data-[state=active]:bg-background data-[state=active]:text-foreground",
        "dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white",

        // 4. 하단 border (활성화 시)
        "border-x-0 border-t-0 border-b-2 border-transparent",
        "data-[state=active]:border-b-gray-900",

        // 5. 키보드 포커스
        "focus-visible:ring-0 focus-visible:ring-offset-0",

        // 아이콘 스타일링
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

export { BottomBorderTabTrigger };
