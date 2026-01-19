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
          <div className="flex gap-4 py-4">
            {/* Week Badge */}
            <Badge
              variant="outline"
              className="flex-shrink-0 px-3 py-1 h-fit bg-blue-50 text-blue-700 border-blue-200 font-medium"
            >
              {weekLabel(index + 1)}
            </Badge>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-1">
                {item.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>

          {/* Divider - don't show after last item */}
          {index < curriculum.length - 1 && (
            <Separator className="bg-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
}
