import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'
import { eq, inArray, and } from 'drizzle-orm'
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

async function main() {
  console.log('🧹 Starting cleanup...')

  // Read seed data
  const seedDataPath = path.join(process.cwd(), '.seed-data.json')
  const seedDataExists = await fs.access(seedDataPath).then(() => true).catch(() => false)

  if (!seedDataExists) {
    console.log('❌ No seed data found. Run seed script first.')
    process.exit(1)
  }

  const seedData = JSON.parse(await fs.readFile(seedDataPath, 'utf-8'))
  const { userIds, profileIds } = seedData

  console.log(`📋 Found ${userIds.length} users to clean up`)

  // Delete in reverse order: section_records → enrollments → orders → userProfiles → accounts → auth.users

  // 1. Delete section records
  console.log('   🗑️  Deleting section records...')
  await db.delete(schema.sectionRecords).where(
    inArray(schema.sectionRecords.userId, userIds)
  )
  console.log('   ✅ Deleted section records')

  // 2. Delete enrollments
  console.log('   🗑️  Deleting enrollments...')
  await db.delete(schema.enrollments).where(
    inArray(schema.enrollments.userId, userIds)
  )
  console.log('   ✅ Deleted enrollments')

  // 3. Delete orders
  console.log('   🗑️  Deleting orders...')
  await db.delete(schema.orders).where(
    inArray(schema.orders.buyerId, userIds)
  )
  console.log('   ✅ Deleted orders')

  // 4. Delete userProfiles
  console.log('   🗑️  Deleting user profiles...')
  await db.delete(schema.userProfile).where(
    inArray(schema.userProfile.id, profileIds)
  )
  console.log('   ✅ Deleted user profiles')

  // 5. Delete accounts
  console.log('   🗑️  Deleting accounts...')
  await db.delete(schema.account).where(
    inArray(schema.account.id, userIds)
  )
  console.log('   ✅ Deleted accounts')

  // 6. Delete auth users
  console.log('   🗑️  Deleting auth users...')
  for (const userId of userIds) {
    await supabase.auth.admin.deleteUser(userId)
  }
  console.log('   ✅ Deleted auth users')

  // Delete seed data file
  await fs.unlink(seedDataPath)
  console.log('   🗑️  Deleted .seed-data.json')

  console.log('\n✨ Cleanup completed!')
  console.log(`   Removed ${userIds.length} test users`)
}

main().catch((error) => {
  console.error('❌ Cleanup failed:', error)
  process.exit(1)
})
