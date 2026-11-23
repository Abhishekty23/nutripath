-- =====================================================================
-- NutriPath database schema (Supabase / Postgres)
-- Run once in Supabase → SQL Editor.
-- =====================================================================

-- ---------- PROFILES (one row per user, linked to auth.users) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- ---------- PLANS ----------
create table if not exists public.plans (
  id          text primary key,               -- e.g. 'weight-loss'
  title       text not null,
  description text,
  duration    text not null,
  price       integer not null check (price >= 0),  -- in rupees
  features    text[] not null default '{}',
  popular     boolean not null default false,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- SLOTS (consultation time slots set by the nutritionist) ----------
create table if not exists public.slots (
  id          uuid primary key default gen_random_uuid(),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  is_booked   boolean not null default false,
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- ---------- BOOKINGS ----------
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  plan_id     text not null references public.plans (id),
  slot_id     uuid unique references public.slots (id),   -- one booking per slot
  status      text not null default 'pending'
              check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  amount      integer not null default 0,
  payment_id  text,
  created_at  timestamptz not null default now()
);

-- ---------- HEALTH FORMS (filled while booking) ----------
create table if not exists public.health_forms (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null unique references public.bookings (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  age         integer check (age between 1 and 120),
  height_cm   numeric(5,1),
  weight_kg   numeric(5,1),
  goal        text,
  diet_type   text check (diet_type in ('veg', 'non-veg', 'vegan', 'eggetarian')),
  allergies   text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ---------- DIET PLANS (uploaded / written by the nutritionist) ----------
create table if not exists public.diet_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  booking_id  uuid references public.bookings (id) on delete set null,
  title       text not null default 'Your diet plan',
  meal_text   text,
  file_url    text,
  created_at  timestamptz not null default now()
);

-- ---------- PROGRESS LOGS (weekly weight tracking) ----------
create table if not exists public.progress_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  weight_kg   numeric(5,1) not null,
  logged_on   date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists slots_starts_idx on public.slots (starts_at);
create index if not exists diet_plans_user_idx on public.diet_plans (user_id);
create index if not exists progress_user_idx on public.progress_logs (user_id);

-- =====================================================================
-- HELPERS
-- =====================================================================

-- Is the logged-in user an admin? (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Create a profile automatically whenever someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Stop normal users from making themselves admin
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_role on public.profiles;
create trigger protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.plans         enable row level security;
alter table public.slots         enable row level security;
alter table public.bookings      enable row level security;
alter table public.health_forms  enable row level security;
alter table public.diet_plans    enable row level security;
alter table public.progress_logs enable row level security;

-- PROFILES
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles: update own or admin" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- PLANS: everyone can see active plans; only admin can manage
create policy "plans: public read active" on public.plans
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "plans: admin insert" on public.plans
  for insert to authenticated with check (public.is_admin());
create policy "plans: admin update" on public.plans
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "plans: admin delete" on public.plans
  for delete to authenticated using (public.is_admin());

-- SLOTS: everyone can see slots (to show availability); only admin manages
create policy "slots: public read" on public.slots
  for select to anon, authenticated using (true);
create policy "slots: admin insert" on public.slots
  for insert to authenticated with check (public.is_admin());
create policy "slots: admin update" on public.slots
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "slots: admin delete" on public.slots
  for delete to authenticated using (public.is_admin());

-- BOOKINGS: users see/create their own; admin sees and updates all
create policy "bookings: read own or admin" on public.bookings
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "bookings: create own" on public.bookings
  for insert to authenticated with check (user_id = auth.uid());
create policy "bookings: admin update" on public.bookings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- HEALTH FORMS: private to the user and the admin
create policy "health_forms: read own or admin" on public.health_forms
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "health_forms: create own" on public.health_forms
  for insert to authenticated with check (user_id = auth.uid());

-- DIET PLANS: user reads own; admin manages all
create policy "diet_plans: read own or admin" on public.diet_plans
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "diet_plans: admin insert" on public.diet_plans
  for insert to authenticated with check (public.is_admin());
create policy "diet_plans: admin update" on public.diet_plans
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "diet_plans: admin delete" on public.diet_plans
  for delete to authenticated using (public.is_admin());

-- PROGRESS LOGS: user manages own; admin reads
create policy "progress: read own or admin" on public.progress_logs
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "progress: create own" on public.progress_logs
  for insert to authenticated with check (user_id = auth.uid());
create policy "progress: delete own" on public.progress_logs
  for delete to authenticated using (user_id = auth.uid());

-- =====================================================================
-- SEED DATA: the 4 plans shown on the website
-- =====================================================================
insert into public.plans (id, title, description, duration, price, features, popular, sort_order) values
  ('consultation', 'Single Consultation', 'One video call to review your diet and get clear next steps.',
   '30 minutes', 499, array['30-min video call', 'Diet & lifestyle review', 'Quick action plan PDF'], false, 1),
  ('weight-loss', 'Weight Loss Plan', 'A sustainable plan to lose weight without crash diets.',
   '1 month', 1999, array['2 consultations', 'Custom weekly meal plan', 'WhatsApp support', 'Weekly progress check'], true, 2),
  ('muscle-gain', 'Muscle Gain Plan', 'High-protein meals planned around your workouts.',
   '1 month', 2499, array['2 consultations', 'Protein-focused meal plan', 'Supplement guidance', 'Weekly progress check'], false, 3),
  ('wellness', '3-Month Wellness Plan', 'Long-term support for healthy habits that actually stick.',
   '3 months', 4999, array['6 consultations', 'Monthly updated meal plans', 'Priority WhatsApp support', 'Progress tracker access'], false, 4)
on conflict (id) do nothing;
