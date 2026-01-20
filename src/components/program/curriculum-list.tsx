/**
 * Curriculum List Component
 * Displays curriculum items as a list with week badges, titles, and descriptions
 */

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CurriculumItem {
  title: string;
  description: string;
}

interface CurriculumListProps {
  curriculum: CurriculumItem[];
  weekLabel: (n: number) => string;
  className?: string;
}

export function CurriculumList({
  curriculum,
  weekLabel,
  className,
}: CurriculumListProps) {
  if (!curriculum || curriculum.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-0", className)}>
      {curriculum.map((item, index) => (
        <div key={index}>
          <div className="flex flex-col gap-4 py-4">
            {/* Week Badge */}
            <Badge
              variant="outline"
              className="shrink-0 px-3 py-1 h-fit font-medium rounded-sm"
            >
              {weekLabel(index + 1)}
            </Badge>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          {/* Divider - don't show after last item */}
          {index < curriculum.length - 1 && (
            <Separator />
          )}
        </div>
      ))}
    </div>
  );
}
