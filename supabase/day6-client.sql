-- =====================================================================
-- NutriPath Day 6: client cancel / reschedule + weight tracker
-- (run once in Supabase → SQL Editor; safe to run again)
-- =====================================================================

alter table public.bookings add column if not exists reschedule_count integer not null default 0;
alter table public.bookings add column if not exists cancelled_at timestamptz;

-- One weight entry per person per day (logging again the same day updates it)
create unique index if not exists progress_user_day_key on public.progress_logs (user_id, logged_on);
drop policy if exists "progress: update own" on public.progress_logs;
create policy "progress: update own" on public.progress_logs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Client cancels their own confirmed booking (up to 24 hours before)
-- ---------------------------------------------------------------------
create or replace function public.cancel_my_booking(p_booking uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot  uuid;
  v_start timestamptz;
begin
  select b.slot_id, s.starts_at into v_slot, v_start
    from public.bookings b
    join public.slots s on s.id = b.slot_id
   where b.id = p_booking and b.user_id = auth.uid() and b.status = 'confirmed'
   for update of b;
  if not found then
    raise exception 'This booking can''t be cancelled.';
  end if;
  if v_start < now() + interval '24 hours' then
    raise exception 'Bookings can only be cancelled up to 24 hours before the consultation.';
  end if;

  update public.bookings set status = 'cancelled', cancelled_at = now() where id = p_booking;
  update public.slots set is_booked = false where id = v_slot;
end;
$$;

-- ---------------------------------------------------------------------
-- Client moves their booking to another free slot (max 2 times, 24h rule)
-- ---------------------------------------------------------------------
create or replace function public.reschedule_my_booking(p_booking uuid, p_new_slot uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot  uuid;
  v_start timestamptz;
  v_count integer;
begin
  select b.slot_id, s.starts_at, b.reschedule_count into v_slot, v_start, v_count
    from public.bookings b
    join public.slots s on s.id = b.slot_id
   where b.id = p_booking and b.user_id = auth.uid() and b.status = 'confirmed'
   for update of b;
  if not found then
    raise exception 'This booking can''t be rescheduled.';
  end if;
  if v_start < now() + interval '24 hours' then
    raise exception 'Bookings can only be rescheduled up to 24 hours before the consultation.';
  end if;
  if v_count >= 2 then
    raise exception 'You have already rescheduled this booking twice. Please contact us.';
  end if;

  perform public.release_expired_holds();

  update public.slots
     set is_booked = true
   where id = p_new_slot and not is_booked and starts_at > now() + interval '24 hours';
  if not found then
    raise exception 'Sorry, that time slot was just taken. Please choose another one.';
  end if;

  update public.bookings
     set slot_id = p_new_slot, reschedule_count = reschedule_count + 1
   where id = p_booking;
  update public.slots set is_booked = false where id = v_slot;
end;
$$;

revoke all on function public.cancel_my_booking(uuid) from public, anon;
revoke all on function public.reschedule_my_booking(uuid, uuid) from public, anon;
grant execute on function public.cancel_my_booking(uuid) to authenticated;
grant execute on function public.reschedule_my_booking(uuid, uuid) to authenticated;
