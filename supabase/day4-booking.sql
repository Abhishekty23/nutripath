-- =====================================================================
-- NutriPath Day 4: booking flow (run once in Supabase → SQL Editor)
-- =====================================================================

-- A cancelled booking should free its slot, so only active bookings must be unique per slot
alter table public.bookings drop constraint if exists bookings_slot_id_key;
create unique index if not exists bookings_active_slot_idx
  on public.bookings (slot_id) where status in ('pending', 'confirmed', 'completed');

-- Razorpay order id for each booking
alter table public.bookings add column if not exists order_id text;

-- No two slots at the same time
create unique index if not exists slots_starts_at_key on public.slots (starts_at);

-- Bookings and health forms may only be created through create_booking() below,
-- so users can't insert a "confirmed" booking without paying.
drop policy if exists "bookings: create own" on public.bookings;
drop policy if exists "health_forms: create own" on public.health_forms;

-- ---------------------------------------------------------------------
-- Unpaid bookings hold their slot for 15 minutes, then the slot is freed
-- ---------------------------------------------------------------------
create or replace function public.release_expired_holds()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  with expired as (
    update public.bookings
       set status = 'cancelled'
     where status = 'pending'
       and created_at < now() - interval '15 minutes'
    returning slot_id
  )
  update public.slots s
     set is_booked = false
   where s.id in (select slot_id from expired where slot_id is not null);
end;
$$;

-- ---------------------------------------------------------------------
-- Book a slot (atomic: two people can never get the same slot)
-- ---------------------------------------------------------------------
create or replace function public.create_booking(
  p_plan_id   text,
  p_slot_id   uuid,
  p_age       integer,
  p_height_cm numeric,
  p_weight_kg numeric,
  p_goal      text,
  p_diet_type text,
  p_allergies text,
  p_notes     text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user    uuid := auth.uid();
  v_price   integer;
  v_booking uuid;
begin
  if v_user is null then
    raise exception 'Please log in to book a consultation.';
  end if;

  perform public.release_expired_holds();

  select price into v_price from public.plans where id = p_plan_id and is_active;
  if v_price is null then
    raise exception 'This plan is not available right now.';
  end if;

  -- Claim the slot only if it is still free and at least 1 hour away
  update public.slots
     set is_booked = true
   where id = p_slot_id
     and not is_booked
     and starts_at > now() + interval '1 hour';
  if not found then
    raise exception 'Sorry, that time slot was just taken. Please choose another one.';
  end if;

  insert into public.bookings (user_id, plan_id, slot_id, status, amount)
  values (v_user, p_plan_id, p_slot_id, 'pending', v_price)
  returning id into v_booking;

  insert into public.health_forms (booking_id, user_id, age, height_cm, weight_kg, goal, diet_type, allergies, notes)
  values (v_booking, v_user, p_age, p_height_cm, p_weight_kg, p_goal, p_diet_type,
          nullif(trim(p_allergies), ''), nullif(trim(p_notes), ''));

  return v_booking;
end;
$$;

-- ---------------------------------------------------------------------
-- Create consultation slots for the coming days (admin only)
-- Mon–Sat, 10:00–13:00 and 16:00–19:00 India time, every 30 minutes
-- ---------------------------------------------------------------------
create or replace function public.generate_slots(p_days integer default 14)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  d       date;
  t       time;
  ts      timestamptz;
  created integer := 0;
begin
  -- auth.uid() is null when run from the SQL editor (allowed); otherwise must be admin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can create slots.';
  end if;

  for d in select generate_series(current_date + 1, current_date + p_days, interval '1 day')::date loop
    continue when extract(isodow from d) = 7; -- closed on Sundays
    foreach t in array array['10:00','10:30','11:00','11:30','12:00','12:30',
                             '16:00','16:30','17:00','17:30','18:00','18:30']::time[] loop
      ts := (d + t) at time zone 'Asia/Kolkata';
      insert into public.slots (starts_at, ends_at)
      values (ts, ts + interval '30 minutes')
      on conflict (starts_at) do nothing;
      if found then created := created + 1; end if;
    end loop;
  end loop;
  return created;
end;
$$;

-- Who may call what
revoke execute on function public.release_expired_holds() from public, anon, authenticated;
revoke execute on function public.create_booking(text, uuid, integer, numeric, numeric, text, text, text, text) from public, anon;
grant  execute on function public.create_booking(text, uuid, integer, numeric, numeric, text, text, text, text) to authenticated;
revoke execute on function public.generate_slots(integer) from public, anon;
grant  execute on function public.generate_slots(integer) to authenticated;

-- Create the first two weeks of slots
select public.generate_slots(14) as slots_created;
