import { db } from "@/db";
import { workoutLibrary, account } from "@/db/schema";
import { desc, sql, or, ilike, eq } from "drizzle-orm";

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
 * 워크아웃 라이브러리 조회 (페이지네이션)
 */
export async function getWorkoutLibraryQuery({
  page = 1,
  pageSize = 20,
  search,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
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

  // 전체 개수 조회
  const countResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(workoutLibrary)
    .where(searchCondition);

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
    .where(searchCondition)
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
