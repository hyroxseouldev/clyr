import { db } from "@/db";
import { routineBlocks, routineItems, workoutLibrary } from "@/db/schema";
import { desc, eq, sql, ilike, or, and, asc } from "drizzle-orm";

/**
 * ==========================================
 * ROUTINE BLOCK QUERIES
 * ==========================================
 */

export interface RoutineBlockItem {
  id: string;
  blockId: string;
  libraryId: string | null;
  libraryTitle: string | null;
  orderIndex: number;
  recommendation: Record<string, unknown> | null;
}

export interface RoutineBlockWithItems {
  id: string;
  coachId: string;
  name: string;
  workoutFormat: string;
  targetValue: string | null;
  isLeaderboardEnabled: boolean | null;
  description: string | null;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
  items: RoutineBlockItem[];
}

export interface PaginatedRoutineBlocks {
  items: RoutineBlockWithItems[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * 루틴 블록 목록 조회 (페이지네이션)
 */
export async function getRoutineBlocksQuery({
  coachId,
  page = 1,
  pageSize = 20,
  search,
  format,
}: {
  coachId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  format?: string;
}): Promise<PaginatedRoutineBlocks> {
  const offset = (page - 1) * pageSize;

  // 검색 및 필터 조건
  const conditions = [];

  if (search && search.trim()) {
    conditions.push(ilike(routineBlocks.name, `%${search}%`));
  }

  if (format) {
    conditions.push(eq(routineBlocks.workoutFormat, format));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // 전체 개수 조회
  const countResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(routineBlocks)
    .where(whereCondition ? and(eq(routineBlocks.coachId, coachId), whereCondition) : eq(routineBlocks.coachId, coachId));

  const totalCount = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  // 데이터 조회
  const blocks = await db
    .select({
      id: routineBlocks.id,
      coachId: routineBlocks.coachId,
      name: routineBlocks.name,
      workoutFormat: routineBlocks.workoutFormat,
      targetValue: routineBlocks.targetValue,
      isLeaderboardEnabled: routineBlocks.isLeaderboardEnabled,
      description: routineBlocks.description,
      createdAt: routineBlocks.createdAt,
      updatedAt: routineBlocks.updatedAt,
    })
    .from(routineBlocks)
    .where(whereCondition ? and(eq(routineBlocks.coachId, coachId), whereCondition) : eq(routineBlocks.coachId, coachId))
    .orderBy(desc(routineBlocks.updatedAt))
    .limit(pageSize)
    .offset(offset);

  // 각 블록의 itemCount 계산
  const itemsWithCounts = await Promise.all(
    blocks.map(async (block) => {
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(routineItems)
        .where(eq(routineItems.blockId, block.id));

      return {
        ...block,
        itemCount: Number(countResult[0]?.count || 0),
      };
    })
  );

  // 각 블록의 아이템 조회
  const itemsWithItems = await Promise.all(
    itemsWithCounts.map(async (block) => {
      const items = await db
        .select({
          id: routineItems.id,
          blockId: routineItems.blockId,
          libraryId: routineItems.libraryId,
          libraryTitle: workoutLibrary.title,
          orderIndex: routineItems.orderIndex,
          recommendation: routineItems.recommendation,
        })
        .from(routineItems)
        .leftJoin(workoutLibrary, eq(routineItems.libraryId, workoutLibrary.id))
        .where(eq(routineItems.blockId, block.id))
        .orderBy(asc(routineItems.orderIndex));

      return {
        ...block,
        items: items as RoutineBlockItem[],
      };
    })
  );

  return {
    items: itemsWithItems,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  };
}

/**
 * ID로 루틴 블록 상세 조회
 */
export async function getRoutineBlockByIdQuery(id: string) {
  const block = await db.query.routineBlocks.findFirst({
    where: eq(routineBlocks.id, id),
    with: {
      items: {
        with: {
          library: true,
        },
        orderBy: asc(routineItems.orderIndex),
      },
    },
  });

  return block;
}

/**
 * 루틴 블록 생성
 */
export async function createRoutineBlockQuery(data: {
  coachId: string;
  name: string;
  workoutFormat: string;
  targetValue?: string | null;
  isLeaderboardEnabled?: boolean;
  description?: string | null;
}) {
  const [block] = await db.insert(routineBlocks).values(data).returning();
  return block;
}

/**
 * 루틴 블록 수정
 */
export async function updateRoutineBlockQuery(
  id: string,
  data: {
    name?: string;
    workoutFormat?: string;
    targetValue?: string | null;
    isLeaderboardEnabled?: boolean;
    description?: string | null;
  }
) {
  const [updated] = await db
    .update(routineBlocks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(routineBlocks.id, id))
    .returning();
  return updated;
}

/**
 * 루틴 블록 삭제
 */
export async function deleteRoutineBlockQuery(id: string) {
  await db.delete(routineBlocks).where(eq(routineBlocks.id, id));
}

/**
 * 루틴 아이템 추가
 */
export async function addRoutineItemQuery(data: {
  blockId: string;
  libraryId: string;
  recommendation?: Record<string, unknown> | null;
}) {
  // orderIndex 자동 계산 (마지막 순서)
  const lastItem = await db.query.routineItems.findFirst({
    where: eq(routineItems.blockId, data.blockId),
    orderBy: desc(routineItems.orderIndex),
  });

  const nextOrderIndex = lastItem ? lastItem.orderIndex + 1 : 0;

  const [item] = await db
    .insert(routineItems)
    .values({ ...data, orderIndex: nextOrderIndex })
    .returning();
  return item;
}

/**
 * 루틴 아이템 순서 업데이트
 */
export async function updateRoutineItemOrderQuery(
  blockId: string,
  updates: Array<{ id: string; orderIndex: number }>
) {
  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .update(routineItems)
        .set({ orderIndex: update.orderIndex })
        .where(eq(routineItems.id, update.id));
    }
  });
}

/**
 * 루틴 아이템 업데이트
 */
export async function updateRoutineItemQuery(
  id: string,
  data: {
    recommendation?: Record<string, unknown> | null;
  }
) {
  const [updated] = await db
    .update(routineItems)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(routineItems.id, id))
    .returning();
  return updated;
}

/**
 * 루틴 아이템 삭제
 */
export async function deleteRoutineItemQuery(id: string) {
  await db.delete(routineItems).where(eq(routineItems.id, id));
}
