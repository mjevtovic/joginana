# Yoga Studio PWA - Claude Code Agent Instructions

You are a Senior Full-Stack Engineer building a production-ready PWA.

## STACK (MANDATORY)
- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth + Postgres + Storage)
- **Stripe** (subscriptions via Stripe Checkout + webhooks)
- Deployed on **Vercel**

## PRODUCT
Yoga Studio + Simple Weekly Planner PWA.

## MVP FEATURES

### Public
- Landing page with hero, features, testimonials
- Pricing page with subscription tiers

### Authentication
- Supabase magic link authentication
- Google OAuth integration
- Protected routes for authenticated users

### Classes
- List all yoga classes with filtering (difficulty, duration, style)
- Class detail pages with video playback
- Favorites system (heart icon, saved to user profile)

### Planner
- Onboarding quiz (experience level, goals, available days)
- AI-generated weekly plan based on quiz answers
- Mark classes as complete
- Progress tracking

### Paywall & Subscription
- 2 free preview classes for unauthenticated/free users
- Planner completely locked for free users
- Stripe Checkout for subscription flow
- Webhook handling for subscription status updates
- Server-side gating for premium content

## DEVELOPMENT RULES

### 1. Incremental Development
- Each step must compile and run before moving to the next
- Test functionality after each implementation
- Commit working states frequently

### 2. File Output Standards
- Always output full file contents with complete file paths
- Never use partial snippets or "..." placeholders
- Include all imports and exports

### 3. Security Requirements
- **NEVER** expose Supabase service-role key to client
- All sensitive operations happen server-side
- Use environment variables for all secrets
- Validate user authentication on every protected route

### 4. Subscription Checks
- Implement subscription verification server-side only
- Use Route Handlers or Server Actions for gating
- Never trust client-side subscription status

### 5. UI Standards
- Add minimal but real, functional UI
- No placeholder "TODO UI" components
- Use Tailwind CSS for all styling
- Mobile-first responsive design
- Follow accessibility best practices

### 6. Code Quality
- Prefer simple, maintainable code
- Avoid overengineering and premature optimization
- Use TypeScript strictly (no `any` types)
- Extract reusable components when patterns emerge

### 7. Decision Making
- When uncertain, make reasonable assumptions and continue
- Document assumptions in code comments
- Prefer convention over configuration

### 8. Testing Checklist
After each stage, provide:
- Commands to run the application
- Manual testing steps
- Expected behavior
- Common issues and solutions

## PROJECT STRUCTURE

```
/app
  /api
    /webhooks/stripe/route.ts
    /checkout/route.ts
    /subscription/route.ts
  /(public)
    /page.tsx (landing)
    /pricing/page.tsx
  /(auth)
    /login/page.tsx
    /callback/route.ts
  /(protected)
    /classes/page.tsx
    /classes/[id]/page.tsx
    /favorites/page.tsx
    /planner/page.tsx
    /planner/onboarding/page.tsx
  /layout.tsx
/components
  /ui (buttons, cards, modals)
  /classes (ClassCard, ClassList, VideoPlayer)
  /planner (WeeklyPlan, QuizForm)
  /layout (Header, Footer, Navigation)
/lib
  /supabase
    /client.ts
    /server.ts
    /middleware.ts
  /stripe
    /client.ts
    /server.ts
  /utils.ts
/types
  /database.ts
  /stripe.ts
/hooks
  /useSubscription.ts
  /useFavorites.ts
```

## DATABASE SCHEMA (Supabase)

```sql
-- Users (extended from auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  subscription_status text default 'free',
  subscription_id text,
  stripe_customer_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Yoga Classes
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  instructor text,
  duration_minutes integer,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  style text,
  video_url text,
  thumbnail_url text,
  is_premium boolean default true,
  created_at timestamp with time zone default now()
);

-- Favorites
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, class_id)
);

-- User Quiz Responses
create table public.quiz_responses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  experience_level text,
  goals text[],
  available_days text[],
  preferred_duration integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Weekly Plans
create table public.weekly_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  week_start date,
  created_at timestamp with time zone default now()
);

-- Planned Sessions
create table public.planned_sessions (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.weekly_plans(id) on delete cascade,
  class_id uuid references public.classes(id),
  day_of_week integer, -- 0-6
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

## ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## IMPLEMENTATION ORDER

1. **Project Setup** - Next.js, Tailwind, TypeScript config
2. **Supabase Integration** - Client, server, auth setup
3. **Authentication Flow** - Login, callback, protected routes
4. **Database Schema** - Run migrations, seed data
5. **Public Pages** - Landing, pricing
6. **Classes Feature** - List, filter, detail, video
7. **Favorites Feature** - Add/remove, list
8. **Stripe Integration** - Checkout, webhooks, portal
9. **Subscription Gating** - Server-side checks
10. **Planner Onboarding** - Quiz flow
11. **Weekly Planner** - Generate plan, mark complete
12. **PWA Setup** - Manifest, service worker
13. **Polish & Deploy** - Error handling, loading states, Vercel

## COMMON COMMANDS

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Supabase
npx supabase start
npx supabase db push
npx supabase gen types typescript --local > types/database.ts

# Stripe CLI (for webhook testing)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
