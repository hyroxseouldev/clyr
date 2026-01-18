# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clyr is a fitness program platform where coaches create and manage exercise programs for clients. Supports one-time purchases and subscription-based programs with leaderboards and competition features.

## Development Commands

```bash
# Development
npm run dev           # Start dev server

# Build & Production
npm run build         # Build for production
npm run start         # Start production server

# Code Quality
npm run lint          # Run ESLint

# Database (Drizzle ORM)
npm run db:generate   # Generate migrations from schema changes
npm run db:migrate    # Apply migrations to database
npm run db:push       # Push schema changes directly (dev only)
npm run db:pull       # Pull schema from database
npm run db:studio     # Open Drizzle Studio for database GUI
```

## Technology Stack

- **Next.js 16.1.1** with App Router (React Server Components)
- **PostgreSQL** + **Drizzle ORM** (Supabase hosting)
- **Supabase Auth** for authentication
- **Tailwind CSS 4** + **Shadcn/ui** (New York style)
- **TypeScript 5**
- **React Hook Form 7** + **Zod 4** for forms
- **next-intl** for i18n (Korean/English)
- **TipTap** for rich text editing
- **Toss Payments** for payment processing

## Architecture

### Database Schema

The database follows a hierarchical program structure with reusable components:

```
Account → [Programs, WorkoutLibrary]
Program → [ProgramBlueprints, BlueprintSections, Orders]
Order → Enrollment (Access Control)
WorkoutLog → [ProgramBlueprint, WorkoutLibrary]
ProgramBlueprint → BlueprintSections → BlueprintSectionItems
```

**Core tables:**
- `account` - User accounts with roles (ADMIN, COACH, USER)
- `coach_profile` - Coach-specific metadata (1:1 with account)
- `user_profile` - User-specific metadata (1:1 with account)
- `programs` - Fitness programs (type: SINGLE/SUBSCRIPTION)
- `program_blueprints` - Daily workout plans with phase/day structure
- `blueprint_sections` - Reusable sections for blueprints (many-to-many)
- `blueprint_section_items` - Join table for blueprints and sections
- `workout_library` - Reusable exercise library for coaches
- `orders` - Purchase records with Toss integration (cascade delete on program)
- `enrollments` - Access control and subscription management
- `workout_logs` - User exercise tracking and leaderboard data

**Key relationships:**
- Coach creates programs (one-to-many)
- Users enroll via orders
- Blueprints can reference multiple sections (many-to-many with order)
- Sections are reusable across blueprints
- Workout logs link user attempts to program blueprints or library items for leaderboards
- Cascade deletions maintain data integrity

All schema defined in `src/db/schema.ts` with Drizzle ORM.

### Route Groups

Next.js App Router uses route groups for role-based separation with locale prefixes:

- `(public)` - Landing page, authentication (`/signin`, `/signup`)
- `(coach)` - Coach dashboard and management (`/coach/dashboard`)
- `(commerce)` - Program browsing and payment flow

All routes include locale prefix (`/ko`, `/en`). Route groups are not part of the URL but organize code by access level.

### Internationalization

- **next-intl** with Korean as default locale, English as secondary
- Locale routing with mandatory `/ko` and `/en` prefixes
- Translation files in `src/messages/ko.json` and `src/messages/en.json`
- Use `useTranslations` hook in components for translated strings
- Zod validation schemas support i18n error messages

### Authentication & Authorization

1. Supabase Auth handles user authentication
2. Server actions check user role from `account` table
3. Middleware (`src/middleware.ts`) enforces role-based redirects:
   - COACH → `/coach/dashboard`
   - USER → `/user/program`
   - Protected routes redirect to `/signin?message=denied`

### Server Actions Pattern

All mutations use Server Actions (`"use server"`):
- Located in domain-specific files under `src/actions/`
- Clean separation between UI and business logic
- React Hook Form integration for automatic form handling
- Error handling with structured responses

### Database Queries

- Organized by domain in `src/db/queries/`
- Use Drizzle ORM for type-safe queries
- Database transactions for complex operations
- Keep queries pure (database only) - handle cache invalidation in Server Actions

### Database Connection Management & Query Optimization

**Connection Pool Configuration** (`src/db/index.ts`):
```typescript
const client = postgres(process.env.DATABASE_URL!, {
  max: 20,              // Max concurrent connections
  idle_timeout: 20,     // Close idle connections after 20s
  connect_timeout: 10,  // Connection timeout
  prepare: false,       // Disable prepared statements (serverless-friendly)
});
```

**Critical: Avoid N+1 Query Problems**

❌ **BAD** - N+1 queries exhaust connection pool:
```typescript
const blueprints = await getBlueprints(); // 1 query
const results = await Promise.all(
  blueprints.map(async (bp) => {
    const sections = await getSections(bp.id); // N queries
    return { ...bp, sections };
  })
);
// Total: 1 + N queries → Connection pool exhaustion!
```

✅ **GOOD** - Single query with LEFT JOIN:
```typescript
const results = await db
  .select({ /* blueprint + section fields */ })
  .from(programBlueprints)
  .leftJoin(blueprintSectionItems, /* ... */)
  .leftJoin(blueprintSections, /* ... */);
// Then group in memory using Map
// Total: 1 query → Efficient connection usage
```

**Best Practices:**
1. Use LEFT JOINs for related data instead of separate queries
2. Avoid `Promise.all` with multiple database queries inside
3. Group results in memory using Map/Set after single query
4. Cascade deletes configured in schema (e.g., `onDelete: "cascade"`)
5. Restart dev server after changing connection pool config

### Form Handling

- React Hook Form for form state
- Zod schemas in `src/lib/validations.ts` for validation
- Both i18n-aware and legacy validation schemas available
- `@hookform/resolvers` for integration

### Navigation & Routing

- Import navigation helpers from `@/i18n/routing` not `next-intl/navigation`
- `usePathname` from `@/i18n/routing` returns pathname without locale prefix
- `Link` component automatically handles locale prefixes
- `useRouter` for programmatic navigation

## Environment

- Supabase for auth and database
- `.env.local` for local development
- Required: `DATABASE_URL`, Supabase URL/Anon Key

## UI Components

- Shadcn/ui base components in `src/components/ui/`
- Custom components built on top
- Use `sonner` for toast notifications
- Show spinners for async operations
- TipTap editor for rich text content
- Toss Payments components for checkout
- Prioritize existing Shadcn/ui components before creating custom ones

## Database Workflow

1. Modify `src/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply changes
4. For development only: `npm run db:push` bypasses migration generation
