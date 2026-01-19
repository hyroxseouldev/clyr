import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

function NonBorderTapTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // 1. 기본 스타일: 테두리와 그림자 완전 제거 (border-none, shadow-none)
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
        "border-none shadow-none outline-none",
        "disabled:pointer-events-none disabled:opacity-50",

        // 2. 평상시 (비활성) 상태
        "text-muted-foreground hover:text-foreground",

        // 3. 활성화(Active) 상태: 테두리 없이 배경색만 부드럽게 변경
        "data-[state=active]:bg-background data-[state=active]:text-foreground",
        "dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white",

        // 4. 키보드 포커스 시에도 테두리 대신 미세한 불투명도만 조절 (선택 사항)
        "focus-visible:ring-0 focus-visible:ring-offset-0",

        // 아이콘 스타일링
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

export { NonBorderTapTrigger };
