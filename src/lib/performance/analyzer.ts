import type { WorkoutLog } from "@/db/schema";

/**
 * ==========================================
 * PERFORMANCE ANALYZER
 * 퍼포먼스 데이터 추출 및 분석 유틸리티
 * ==========================================
 */

export interface PRRecord {
  date: Date;
  weight: number;
  reps: number;
  volume: number;
  logId: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  category: string | null;
  currentPR: number;
  history: PRRecord[];
  growthRate: number; // percentage growth from first to last
  totalWorkouts: number;
}

export interface GrowthChartData {
  date: string;
  weight: number;
  reps?: number;
}

/**
 * 운동 기록에서 PR 데이터 추출
 * workout_logs의 maxWeight, totalVolume, content JSON 분석
 */
export function extractPRFromLogs(
  logs: WorkoutLog[],
  exerciseId?: string
): Map<string, ExerciseProgress> {
  const exerciseMap = new Map<string, ExerciseProgress>();

  // 운동 종목별로 필터링 및 그룹화
  const filteredLogs = exerciseId
    ? logs.filter(log => log.libraryId === exerciseId)
    : logs;

  // libraryId별로 그룹화
  const logsByExercise = new Map<string, WorkoutLog[]>();
  filteredLogs.forEach(log => {
    if (!log.libraryId) return;

    if (!logsByExercise.has(log.libraryId)) {
      logsByExercise.set(log.libraryId, []);
    }
    logsByExercise.get(log.libraryId)!.push(log);
  });

  // 각 종목별 PR 계산
  logsByExercise.forEach((exerciseLogs, libId) => {
    // maxWeight 기준 정렬
    const sortedByWeight = [...exerciseLogs].sort(
      (a, b) => parseFloat(b.maxWeight || "0") - parseFloat(a.maxWeight || "0")
    );

    const currentPR = parseFloat(sortedByWeight[0]?.maxWeight || "0");

    // 날짜순 정렬 (히스토리용)
    const sortedByDate = [...exerciseLogs].sort(
      (a, b) => a.logDate.getTime() - b.logDate.getTime()
    );

    const history: PRRecord[] = sortedByDate.map(log => ({
      date: log.logDate,
      weight: parseFloat(log.maxWeight || "0"),
      reps: parseFloat(log.totalVolume || "0") || 0,
      volume: parseFloat(log.totalVolume || "0") || 0,
      logId: log.id,
    }));

    // 성장률 계산 (첫 기록 vs 마지막 기록)
    const firstWeight = history[0]?.weight || 0;
    const lastWeight = history[history.length - 1]?.weight || 0;
    const growthRate = firstWeight > 0
      ? ((lastWeight - firstWeight) / firstWeight) * 100
      : 0;

    // 운동 이름은 content에서 추출하거나 기본값 사용
    const firstLogContent = sortedByDate[0]?.content as Record<string, unknown> | null;
    const exerciseName = (firstLogContent?.exerciseName as string | undefined) || "Unknown Exercise";

    exerciseMap.set(libId, {
      exerciseId: libId,
      exerciseName,
      category: null, // category는 별도로 필요시 처리
      currentPR,
      history,
      growthRate,
      totalWorkouts: exerciseLogs.length,
    });
  });

  return exerciseMap;
}

/**
 * PR 이력에서 차트 데이터 추출
 */
export function extractChartDataFromPRHistory(
  history: PRRecord[]
): GrowthChartData[] {
  return history.map(record => ({
    date: record.date.toISOString().split('T')[0], // YYYY-MM-DD
    weight: record.weight,
    reps: record.reps,
  }));
}

/**
 * 성장률 계산 (백분율)
 */
export function calculateGrowthRate(history: PRRecord[]): number {
  if (history.length === 0) return 0;

  const first = history[0];
  const last = history[history.length - 1];

  if (first.weight === 0) return 0;

  return ((last.weight - first.weight) / first.weight) * 100;
}

/**
 * 특정 기간 동안의 성장률 계산
 */
export function calculateGrowthRateInPeriod(
  history: PRRecord[],
  startDate: Date,
  endDate: Date
): number {
  const periodHistory = history.filter(
    record => record.date >= startDate && record.date <= endDate
  );

  return calculateGrowthRate(periodHistory);
}

/**
 * 최근 N개월 동안의 PR 향상 추이
 */
export function getRecentGrowthTrend(
  history: PRRecord[],
  months: number = 3
): {
  trend: "UP" | "DOWN" | "STABLE";
  changePercent: number;
  currentWeight: number;
  previousWeight: number;
} {
  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setMonth(now.getMonth() - months);

  const recentHistory = history.filter(
    record => record.date >= cutoffDate
  );

  if (recentHistory.length < 2) {
    return {
      trend: "STABLE",
      changePercent: 0,
      currentWeight: history[history.length - 1]?.weight || 0,
      previousWeight: history[0]?.weight || 0,
    };
  }

  const previousWeight = recentHistory[0].weight;
  const currentWeight = recentHistory[recentHistory.length - 1].weight;
  const changePercent = previousWeight > 0
    ? ((currentWeight - previousWeight) / previousWeight) * 100
    : 0;

  let trend: "UP" | "DOWN" | "STABLE" = "STABLE";
  if (changePercent > 5) trend = "UP";
  else if (changePercent < -5) trend = "DOWN";

  return {
    trend,
    changePercent,
    currentWeight,
    previousWeight,
  };
}

/**
 * 3대 운동(벤치프레스, 데드리프트, 스쿼트) PR 요약
 * 종목 이름으로 필터링
 */
export function getBigThreeLiftsPR(
  exerciseProgress: Map<string, ExerciseProgress>
): {
  bench: ExerciseProgress | null;
  deadlift: ExerciseProgress | null;
  squat: ExerciseProgress | null;
} {
  let bench: ExerciseProgress | null = null;
  let deadlift: ExerciseProgress | null = null;
  let squat: ExerciseProgress | null = null;

  exerciseProgress.forEach(progress => {
    const name = progress.exerciseName.toLowerCase();

    if (name.includes("벤치") || name.includes("bench") || name.includes("press")) {
      if (!bench || progress.currentPR > bench.currentPR) {
        bench = progress;
      }
    }

    if (name.includes("데드") || name.includes("deadlift")) {
      if (!deadlift || progress.currentPR > deadlift.currentPR) {
        deadlift = progress;
      }
    }

    if (name.includes("스쿼트") || name.includes("squat")) {
      if (!squat || progress.currentPR > squat.currentPR) {
        squat = progress;
      }
    }
  });

  return { bench, deadlift, squat };
}

/**
 * 하이록스(Hyrox) 8대 종목별 최고 기록 추출
 * 종목 카테고리로 필터링
 */
export interface HyroxPR {
  run: ExerciseProgress | null;
  skiErg: ExerciseProgress | null;
  sledPush: ExerciseProgress | null;
  sledPull: ExerciseProgress | null;
  burpeeBroadJump: ExerciseProgress | null;
  rowing: ExerciseProgress | null;
  farmersCarry: ExerciseProgress | null;
  sandbagLunges: ExerciseProgress | null;
}

export function getHyroxPRs(
  exerciseProgress: Map<string, ExerciseProgress>
): HyroxPR {
  let run: ExerciseProgress | null = null;
  let skiErg: ExerciseProgress | null = null;
  let sledPush: ExerciseProgress | null = null;
  let sledPull: ExerciseProgress | null = null;
  let burpeeBroadJump: ExerciseProgress | null = null;
  let rowing: ExerciseProgress | null = null;
  let farmersCarry: ExerciseProgress | null = null;
  let sandbagLunges: ExerciseProgress | null = null;

  exerciseProgress.forEach(progress => {
    const name = progress.exerciseName.toLowerCase();
    const category = progress.category?.toLowerCase() || "";

    // Run (러닝)
    if (name.includes("run") || name.includes("러닝") || name.includes("달리기")) {
      if (!run || progress.currentPR < run.currentPR) { // Run은 낮을수록 좋음
        run = progress;
      }
    }

    // SkiErg
    if (name.includes("ski") || name.includes("스키")) {
      if (!skiErg || progress.currentPR < skiErg.currentPR) {
        skiErg = progress;
      }
    }

    // Sled Push (슬리지 푸시)
    if (name.includes("sled push") || name.includes("슬리지 푸시") || name.includes(" sled ")) {
      if (!sledPush || progress.currentPR < sledPush.currentPR) {
        sledPush = progress;
      }
    }

    // Sled Pull (슬리지 풀)
    if (name.includes("sled pull") || name.includes("슬리지 풀")) {
      if (!sledPull || progress.currentPR < sledPull.currentPR) {
        sledPull = progress;
      }
    }

    // Burpee Broad Jump (버피 브로드 점프)
    if (name.includes("burpee") || name.includes("버피")) {
      if (!burpeeBroadJump || progress.currentPR > burpeeBroadJump.currentPR) {
        burpeeBroadJump = progress;
      }
    }

    // Rowing (로잉)
    if (name.includes("row") || name.includes("로잉") || name.includes("에르고")) {
      if (!rowing || progress.currentPR < rowing.currentPR) {
        rowing = progress;
      }
    }

    // Farmers Carry (파머즈 캐리)
    if (name.includes("farmer") || name.includes("파머") || name.includes("캐리")) {
      if (!farmersCarry || progress.currentPR > farmersCarry.currentPR) {
        farmersCarry = progress;
      }
    }

    // Sandbag Lunges (샌드백 런지)
    if (name.includes("sandbag") || name.includes("샌드백") || name.includes("런지")) {
      if (!sandbagLunges || progress.currentPR > sandbagLunges.currentPR) {
        sandbagLunges = progress;
      }
    }
  });

  return {
    run,
    skiErg,
    sledPush,
    sledPull,
    burpeeBroadJump,
    rowing,
    farmersCarry,
    sandbagLunges,
  };
}

/**
 * 운동 강도별 통계
 */
export function getIntensityStats(
  logs: WorkoutLog[]
): {
  low: number;
  medium: number;
  high: number;
  total: number;
} {
  const stats = {
    low: 0,
    medium: 0,
    high: 0,
    total: logs.length,
  };

  logs.forEach(log => {
    if (log.intensity === "LOW") stats.low++;
    else if (log.intensity === "MEDIUM") stats.medium++;
    else if (log.intensity === "HIGH") stats.high++;
  });

  return stats;
}

/**
 * 월별 운동 빈도 계산
 */
export interface MonthlyFrequency {
  month: string; // YYYY-MM
  count: number;
}

export function getMonthlyFrequency(
  logs: WorkoutLog[],
  months: number = 6
): MonthlyFrequency[] {
  const frequencyMap = new Map<string, number>();

  logs.forEach(log => {
    const month = log.logDate.toISOString().slice(0, 7); // YYYY-MM
    frequencyMap.set(month, (frequencyMap.get(month) || 0) + 1);
  });

  const result = Array.from(frequencyMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, months);

  return result;
}
