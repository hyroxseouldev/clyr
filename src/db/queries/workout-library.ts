import { db } from "@/db";
import { workoutLibrary, account } from "@/db/schema";
import { desc, sql, or, ilike, eq, and, inArray, isNotNull, ne } from "drizzle-orm";

/**
 * ==========================================
 * WORKOUT LIBRARY QUERIES
 * ==========================================
 */

export interface WorkoutLibraryItem {
  id: string;
  coachId: string | null;
  coachName: string | null;
  title: string;
  category: string | null;
  workoutType: string;
  videoUrl: string | null;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedWorkoutLibrary {
  items: WorkoutLibraryItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * 워크아웃 라이브러리 조회 (페이지네이션 + 필터)
 */
export async function getWorkoutLibraryQuery({
  page = 1,
  pageSize = 20,
  search,
  categories,
  workoutTypes,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  categories?: string[];
  workoutTypes?: string[];
} = {}): Promise<PaginatedWorkoutLibrary> {
  const offset = (page - 1) * pageSize;

  // 검색 조건
  const searchCondition = search
    ? or(
        ilike(workoutLibrary.title, `%${search}%`),
        ilike(workoutLibrary.category, `%${search}%`),
        ilike(workoutLibrary.description, `%${search}%`)
      )
    : undefined;

  // 필터 조건
  const filterConditions = [];

  if (categories && categories.length > 0) {
    filterConditions.push(inArray(workoutLibrary.category, categories));
  }

  if (workoutTypes && workoutTypes.length > 0) {
    filterConditions.push(inArray(workoutLibrary.workoutType, workoutTypes));
  }

  // 모든 조건 결합
  const whereCondition = searchCondition || filterConditions.length > 0
    ? and(
        searchCondition || undefined,
        filterConditions.length > 0
          ? filterConditions.length === 1
            ? filterConditions[0]
            : and(...filterConditions)
          : undefined
      )
    : undefined;

  // 전체 개수 조회
  const countResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(workoutLibrary)
    .where(whereCondition);

  const totalCount = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  // 데이터 조회
  const items = await db
    .select({
      id: workoutLibrary.id,
      coachId: workoutLibrary.coachId,
      coachName: account.fullName,
      title: workoutLibrary.title,
      category: workoutLibrary.category,
      workoutType: workoutLibrary.workoutType,
      videoUrl: workoutLibrary.videoUrl,
      description: workoutLibrary.description,
      isSystem: workoutLibrary.isSystem,
      createdAt: workoutLibrary.createdAt,
      updatedAt: workoutLibrary.updatedAt,
    })
    .from(workoutLibrary)
    .leftJoin(account, eq(workoutLibrary.coachId, account.id))
    .where(whereCondition)
    .orderBy(desc(workoutLibrary.createdAt), desc(workoutLibrary.updatedAt))
    .limit(pageSize)
    .offset(offset);

  return {
    items: items as WorkoutLibraryItem[],
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  };
}

/**
 * ID로 워크아웃 라이브러리 상세 조회
 */
export async function getWorkoutLibraryByIdQuery(id: string) {
  const result = await db
    .select({
      id: workoutLibrary.id,
      coachId: workoutLibrary.coachId,
      coachName: account.fullName,
      title: workoutLibrary.title,
      category: workoutLibrary.category,
      workoutType: workoutLibrary.workoutType,
      videoUrl: workoutLibrary.videoUrl,
      description: workoutLibrary.description,
      isSystem: workoutLibrary.isSystem,
      createdAt: workoutLibrary.createdAt,
      updatedAt: workoutLibrary.updatedAt,
    })
    .from(workoutLibrary)
    .leftJoin(account, eq(workoutLibrary.coachId, account.id))
    .where(eq(workoutLibrary.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * 워크아웃 라이브러리 필터 옵션 조회
 * 등록된 모든 카테고리와 워크아웃 타입을 중복 제거하여 반환
 */
export async function getWorkoutLibraryFiltersQuery() {
  // 카테고리 목록 조회 (중복 제거, null 제외)
  const categoriesResult = await db
    .selectDistinct({
      category: workoutLibrary.category,
    })
    .from(workoutLibrary)
    .where(isNotNull(workoutLibrary.category))
    .orderBy(workoutLibrary.category);

  const categories = categoriesResult
    .map((r) => r.category)
    .filter(Boolean) as string[];

  // 워크아웃 타입 목록 조회 (중복 제거)
  const workoutTypesResult = await db
    .selectDistinct({
      workoutType: workoutLibrary.workoutType,
    })
    .from(workoutLibrary)
    .orderBy(workoutLibrary.workoutType);

  const workoutTypes = workoutTypesResult.map((r) => r.workoutType);

  return {
    categories,
    workoutTypes,
  };
}
