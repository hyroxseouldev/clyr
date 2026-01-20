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
    BEGINNER: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    INTERMEDIATE: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    ADVANCED: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  };

  const cardContextClassName =
    "px-4 py-2 flex justify-between items-center h-3";

  return (
    <div className={cn("grid grid-cols-1 gap-4 max-w-4xl mx-auto", className)}>
      {/* 난이도 Card */}
      <Card>
        <CardContent className={cardContextClassName}>
          <div className="text-sm text-muted-foreground">난이도</div>
          <Badge
            className={cn("text-sm px-3 py-1", difficultyColors[difficulty])}
          >
            {difficultyLabel}
          </Badge>
        </CardContent>
      </Card>

      {/* 진행기간 Card */}
      <Card>
        <CardContent className={cardContextClassName}>
          <div className="text-sm text-muted-foreground">{durationLabel}</div>
          <div className="text-xl font-bold text-foreground">
            {durationWeeks}
            <span className="text-sm font-normal text-muted-foreground ml-1">주</span>
          </div>
        </CardContent>
      </Card>

      {/* 주당훈련횟수 Card */}
      <Card>
        <CardContent className={cardContextClassName}>
          <div className="text-sm text-muted-foreground">{weeklyTrainingLabel}</div>
          <div className="text-xl font-bold text-foreground">
            {daysPerWeek}
            <span className="text-sm font-normal text-muted-foreground ml-1">회</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
