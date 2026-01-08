/**
 * 워크아웃 관련 상수 및 유틸리티
 */

/**
 * workoutType (운동 유형) 관련 상수
 */
export const WORKOUT_TYPES = {
  WEIGHT_REPS: "WEIGHT_REPS",
  TIME: "TIME",
  DURATION: "DURATION",
  DISTANCE: "DISTANCE",
} as const;

export type WorkoutType = (typeof WORKOUT_TYPES)[keyof typeof WORKOUT_TYPES];

/**
 * workoutType 한글 라벨 매핑
 */
export const WORKOUT_TYPE_LABELS: Record<string, string> = {
  WEIGHT_REPS: "무게/횟수",
  TIME: "시간",
  DURATION: "시간", // TIME와 동일
  DISTANCE: "거리",
};

/**
 * workoutType 라벨 조회
 */
export function getWorkoutTypeLabel(type: string): string {
  return WORKOUT_TYPE_LABELS[type] || type;
}

/**
 * recommendation (코치 가이드) 데이터 구조
 *
 * workoutType별 가이드 필드:
 *
 * WEIGHT_REPS (무게/횟수):
 * - sets: 세트 수 (예: 3)
 * - reps: 반복 횟수 (예: "10-12")
 * - weight: 무게 (예: "60kg")
 * - rest: 휴식 시간 (예: "90초")
 *
 * DURATION/TIME (시간):
 * - duration: 수행 시간 (예: "5분")
 * - rounds: 라운드 수 (예: 3)
 * - rest: 휴식 시간 (예: "1분")
 *
 * DISTANCE (거리):
 * - distance: 거리 (예: "5km")
 * - time: 목표 시간 (예: "25분")
 * - rest: 휴식 시간 (예: "2분")
 */
export interface RecommendationData {
  sets?: string; // 세트 수
  reps?: string; // 반복 횟수
  weight?: string; // 무게
  duration?: string; // 수행 시간
  rounds?: string; // 라운드 수
  distance?: string; // 거리
  time?: string; // 목표 시간
  rest?: string; // 휴식 시간
  note?: string; // 추가 메모
}

/**
 * 필드 라벨 매핑
 */
export const RECOMMENDATION_FIELD_LABELS: Record<keyof RecommendationData, string> = {
  sets: "세트 수",
  reps: "반복 횟수",
  weight: "무게",
  duration: "수행 시간",
  rounds: "라운드 수",
  distance: "거리",
  time: "목표 시간",
  rest: "휴식 시간",
  note: "추가 메모",
};

/**
 * 필드 플레이스홀더 매핑
 */
export const RECOMMENDATION_FIELD_PLACEHOLDERS: Record<keyof RecommendationData, string> = {
  sets: "예: 3",
  reps: "예: 10-12",
  weight: "예: 60kg",
  duration: "예: 5분",
  rounds: "예: 3",
  distance: "예: 5km",
  time: "예: 25분",
  rest: "예: 90초",
  note: "자유롭게 입력",
};

/**
 * workoutType별 recommendation 기본 형식 (템플릿)
 */
export const RECOMMENDATION_TEMPLATES = {
  WEIGHT_REPS: {
    sets: "",
    reps: "",
    weight: "",
    rest: "",
    note: "",
  },
  DURATION: {
    duration: "",
    rounds: "",
    rest: "",
    note: "",
  },
  DISTANCE: {
    distance: "",
    time: "",
    rest: "",
    note: "",
  },
} as const;
