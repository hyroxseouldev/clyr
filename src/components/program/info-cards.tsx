/**
 * Info Cards Component
 * Displays 3 cards: 난이도, 진행기간, 주당훈련횟수
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Calendar } from "lucide-react";
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

  const difficultyIcons = {
    BEGINNER: "🌱",
    INTERMEDIATE: "💪",
    ADVANCED: "🔥",
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto",
        className
      )}
    >
      {/* 난이도 Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl">
              {difficultyIcons[difficulty]}
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-2">난이도</div>
          <Badge className={cn("text-sm px-3 py-1", difficultyColors[difficulty])}>
            {difficultyLabel}
          </Badge>
        </CardContent>
      </Card>

      {/* 진행기간 Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-2">{durationLabel}</div>
          <div className="text-2xl font-bold text-gray-900">
            {durationWeeks}
            <span className="text-base font-normal text-gray-600 ml-1">주</span>
          </div>
        </CardContent>
      </Card>

      {/* 주당훈련횟수 Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-2">{weeklyTrainingLabel}</div>
          <div className="text-2xl font-bold text-gray-900">
            {daysPerWeek}
            <span className="text-base font-normal text-gray-600 ml-1">일/주</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
