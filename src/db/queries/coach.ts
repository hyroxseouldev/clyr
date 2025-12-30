import { eq } from "drizzle-orm";
import { coachProfile } from "@/db/schema";
import { db } from "@/db";

/**
 * ==========================================
 * COACH PROFILE QUERIES
 * ==========================================
 */

/**
 * 코치 프로필 생성
 */
export const createCoachProfileQuery = async (
  data: typeof coachProfile.$inferInsert
) => {
  const [profile] = await db.insert(coachProfile).values(data).returning();
  return profile;
};

/**
 * accountId로 코치 프로필 조회
 */
export const getCoachProfileByAccountIdQuery = async (accountId: string) => {
  return await db.query.coachProfile.findFirst({
    where: eq(coachProfile.accountId, accountId),
    with: {
      // account 정보 포함 가능
    },
  });
};

/**
 * 코치 프로필 ID로 조회
 */
export const getCoachProfileByIdQuery = async (profileId: string) => {
  return await db.query.coachProfile.findFirst({
    where: eq(coachProfile.id, profileId),
    with: {
      // account 정보 포함 가능
    },
  });
};

/**
 * 코치 프로필 수정
 */
export const updateCoachProfileQuery = async (
  accountId: string,
  data: Partial<typeof coachProfile.$inferInsert>
) => {
  const [updatedProfile] = await db
    .update(coachProfile)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(coachProfile.accountId, accountId))
    .returning();
  return updatedProfile;
};

/**
 * 코치 프로필 삭제
 */
export const deleteCoachProfileQuery = async (accountId: string) => {
  await db
    .delete(coachProfile)
    .where(eq(coachProfile.accountId, accountId));
};

