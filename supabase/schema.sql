create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

create table if not exists public.lesson_progress (
  user_id uuid references auth.users (id) on delete cascade,
  lesson_id text not null,
  completed boolean default false,
  quiz_score numeric,
  updated_at timestamptz default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  lesson_id text not null,
  score numeric not null,
  passed boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.sandbox_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance numeric default 10000,
  holdings jsonb default '{"BTC":0,"ETH":0}'::jsonb,
  history jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.sandbox_state enable row level security;
alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are editable by owner" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Profiles updates by owner" on public.profiles
  for update using (auth.uid() = id);

create policy "Progress by owner" on public.lesson_progress
  for select using (auth.uid() = user_id);
create policy "Progress insert" on public.lesson_progress
  for insert with check (auth.uid() = user_id);
create policy "Progress update" on public.lesson_progress
  for update using (auth.uid() = user_id);

create policy "Quiz attempts by owner" on public.quiz_attempts
  for select using (auth.uid() = user_id);
create policy "Quiz attempts insert" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);

create policy "Sandbox view" on public.sandbox_state
  for select using (auth.uid() = user_id);
create policy "Sandbox upsert" on public.sandbox_state
  for insert with check (auth.uid() = user_id);
create policy "Sandbox update" on public.sandbox_state
  for update using (auth.uid() = user_id);
