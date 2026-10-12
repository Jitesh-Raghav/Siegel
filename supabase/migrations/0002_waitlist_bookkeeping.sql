-- Who does the bookkeeping, and does the tax advisor use DATEV? Tells us whom to call first.
-- Run in the Supabase SQL editor after 0001. The API stores signups without these columns until then.

alter table public.waitlist
  add column if not exists bookkeeping   text check (bookkeeping in ('advisor', 'inhouse', 'both')),
  add column if not exists advisor_datev text check (advisor_datev in ('yes', 'no', 'unsure'));

-- Make PostgREST see the new columns immediately.
notify pgrst, 'reload schema';
