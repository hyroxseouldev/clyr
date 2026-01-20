/**
 * Info Cards Component
 * Displays 3 cards: 난이도, 진행기간, 주당훈련횟수
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InfoCardsProps {
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  difficultyLabel: string;
  durationWeeks: number;
  daysPerWeek: number;
  durationLabel: string;
  weeklyTrainingLabel: string;
  className?: string;
}

export function InfoCards({
  difficulty,
  difficultyLabel,
  durationWeeks,
  daysPerWeek,
  durationLabel,
  weeklyTrainingLabel,
  className,
}: InfoCardsProps) {
  const difficultyColors = {
    BEGINNER: "bg-green-100 text-green-800 border-green-200",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ADVANCED: "bg-red-100 text-red-800 border-red-200",
  };

  const cardContextClassName =
    "px-4 py-2 flex justify-between items-center h-3";

  return (
    <div className={cn("grid grid-cols-1 gap-4 max-w-4xl mx-auto", className)}>
      {/* 난이도 Card */}
      <Card className="border-gray-200">
        <CardContent className={cardContextClassName}>
          <div className="text-sm text-gray-600">난이도</div>
          <Badge
            className={cn("text-sm px-3 py-1", difficultyColors[difficulty])}
          >
            {difficultyLabel}
          </Badge>
        </CardContent>
      </Card>

      {/* 진행기간 Card */}
      <Card className="border-gray-200">
        <CardContent className={cardContextClassName}>
          <div className="text-sm text-gray-600">{durationLabel}</div>
          <div className="text-xl font-bold text-gray-900">
            {durationWeeks}
            <span className="text-sm font-normal text-gray-600 ml-1">주</span>
          </div>
        </CardContent>
      </Card>

      {/* 주당훈련횟수 Card */}
      <Card className="border-gray-200">
        <CardContent className={cardContextClassName}>
          <div className="text-sm text-gray-600">{weeklyTrainingLabel}</div>
          <div className="text-xl font-bold text-gray-900">
            {daysPerWeek}
            <span className="text-sm font-normal text-gray-600 ml-1">회</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
