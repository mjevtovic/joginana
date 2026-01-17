-- Yoga Studio PWA Database Schema

-- Users (extended from auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  subscription_status text default 'free' check (subscription_status in ('free', 'active', 'canceled', 'past_due')),
  subscription_id text,
  stripe_customer_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Yoga Classes
create table if not exists public.classes (
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

-- Classes are public for reading
alter table public.classes enable row level security;

create policy "Classes are viewable by everyone"
  on public.classes for select
  using (true);

-- Favorites
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, class_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- User Quiz Responses
create table if not exists public.quiz_responses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  experience_level text,
  goals text[],
  available_days text[],
  preferred_duration integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.quiz_responses enable row level security;

create policy "Users can view their own quiz responses"
  on public.quiz_responses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quiz responses"
  on public.quiz_responses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own quiz responses"
  on public.quiz_responses for update
  using (auth.uid() = user_id);

-- Weekly Plans
create table if not exists public.weekly_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  week_start date,
  created_at timestamp with time zone default now()
);

alter table public.weekly_plans enable row level security;

create policy "Users can view their own weekly plans"
  on public.weekly_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weekly plans"
  on public.weekly_plans for insert
  with check (auth.uid() = user_id);

-- Planned Sessions
create table if not exists public.planned_sessions (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.weekly_plans(id) on delete cascade,
  class_id uuid references public.classes(id),
  day_of_week integer check (day_of_week >= 0 and day_of_week <= 6),
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.planned_sessions enable row level security;

create policy "Users can view their own planned sessions"
  on public.planned_sessions for select
  using (
    exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = planned_sessions.plan_id
      and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can insert their own planned sessions"
  on public.planned_sessions for insert
  with check (
    exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = planned_sessions.plan_id
      and weekly_plans.user_id = auth.uid()
    )
  );

create policy "Users can update their own planned sessions"
  on public.planned_sessions for update
  using (
    exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = planned_sessions.plan_id
      and weekly_plans.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_quiz_responses_updated_at
  before update on public.quiz_responses
  for each row
  execute function public.handle_updated_at();
