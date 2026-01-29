import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import fs from 'fs/promises'
import path from 'path'

// Load environment variables
config({ path: '.env.local' })

// Database connection
const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client, { schema })

// Supabase Admin Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Constants
const PROGRAM_ID = '1b4b6b99-ecbc-4f38-a543-400cac3d448f'
const SECTION_ID = 'dfb2f747-d599-472b-aff4-ce5c6469fbbe'
const SECTION_ITEM_ID = '21e42839-5e0f-415b-a8e3-ac286b6be875'

// Test users data
const testUsers = Array.from({ length: 10 }, (_, i) => ({
  email: `test${i + 1}@example.com`,
  password: 'Test1234!',
  fullName: `테스트유저${i + 1}`,
}))

// Random helpers
const randomItem = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const randomBool = () => Math.random() > 0.5

const FITNESS_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const
const FITNESS_GOALS = ['체중감량', '근력증가', '체력증진', '건강유지'] as const
const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const
const WORKOUT_TYPES = ['GYM', 'CROSSFIT', 'RUNNING', 'OTHER'] as const

// Track created user IDs for cleanup
const seedData = {
  userIds: [] as string[],
  accountIds: [] as string[],
  profileIds: [] as string[],
}

async function main() {
  console.log('🌱 Starting seed...')

  // Fetch program info
  const program = await db.query.programs.findFirst({
    where: eq(schema.programs.id, PROGRAM_ID),
  })

  if (!program) {
    console.error(`❌ Program not found: ${PROGRAM_ID}`)
    process.exit(1)
  }

  console.log(`📦 Found program: ${program.title}`)
  console.log(`   Price: ${program.price}, Access: ${program.accessPeriodDays || 'Lifetime'}`)

  // Create users
  for (const user of testUsers) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.fullName },
      })

      if (authError) {
        console.error(`❌ Failed to create auth user ${user.email}:`, authError.message)
        continue
      }

      const userId = authData.user.id
      seedData.userIds.push(userId)

      console.log(`✅ Created auth user: ${user.email}`)

      // 트리거로 Account 자동 생성 대기
      await new Promise(resolve => setTimeout(resolve, 500))

      // 자동 생성된 Account 조회
      const account = await db.query.account.findFirst({
        where: eq(schema.account.id, userId),
      })

      if (!account) {
        console.error(`   ❌ Account not found for ${user.email} (trigger may have failed)`)
        continue
      }

      seedData.accountIds.push(account.id)
      console.log(`   ✅ Found auto-created account`)

      // Use transaction for related data
      await db.transaction(async (tx) => {
        // 3. Create userProfile
        const fitnessGoals = Array.from(
          { length: Math.floor(Math.random() * 3) + 1 },
          () => randomItem(FITNESS_GOALS)
        )

        const [userProfile] = await tx.insert(schema.userProfile).values({
          accountId: account.id,
          nickname: user.fullName,
          fitnessLevel: randomItem(FITNESS_LEVELS),
          fitnessGoals,
          onboardingCompleted: true,
          onboardingData: {
            gender: randomItem(GENDERS),
            currentWorkoutType: randomItem(WORKOUT_TYPES),
          },
        }).returning()

        seedData.profileIds.push(userProfile.id)

        // 4. Create order
        const [order] = await tx.insert(schema.orders).values({
          buyerId: userId,
          programId: PROGRAM_ID,
          coachId: program.coachId,
          amount: program.price,
          status: 'COMPLETED',
          paymentKey: `test_payment_${userId}`,
        }).returning()

        // 5. Create enrollment
        const startDate = new Date()
        const endDate = program.accessPeriodDays
          ? new Date(startDate.getTime() + program.accessPeriodDays * 24 * 60 * 60 * 1000)
          : null

        await tx.insert(schema.enrollments).values({
          userId,
          programId: PROGRAM_ID,
          orderId: order.id,
          status: 'ACTIVE',
          startDate,
          endDate,
        })

        // 6. Create section record
        await tx.insert(schema.sectionRecords).values({
          userId,
          userProfileId: userProfile.id,
          sectionId: SECTION_ID,
          sectionItemId: SECTION_ITEM_ID,
          content: {
            recordType: 'TIME_BASED',
            record: '12:30',
          },
        })

        console.log(`   ✅ Created profile, order, enrollment, and section record`)
      })

    } catch (error) {
      console.error(`❌ Failed to process user ${user.email}:`, error)
    }
  }

  // Save seed data for cleanup
  await fs.writeFile(
    path.join(process.cwd(), '.seed-data.json'),
    JSON.stringify(seedData, null, 2)
  )

  console.log('\n✨ Seed completed!')
  console.log(`   Created ${seedData.userIds.length} test users`)
  console.log(`   📁 Saved IDs to .seed-data.json for cleanup`)
}

main().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
