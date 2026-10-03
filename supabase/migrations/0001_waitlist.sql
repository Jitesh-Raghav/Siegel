-- Siegel early-access waitlist.
-- Run in the Supabase SQL editor (EU region project) or via `supabase db push`.

create table if not exists public.waitlist (
  id             bigint generated always as identity primary key,
  email          text        not null,
  company        text,
  invoice_volume text check (invoice_volume in ('<20', '20-100', '100-500', '500+')),
  above_800k     text check (above_800k in ('yes', 'no', 'unsure')),
  locale         text        not null default 'en' check (locale in ('en', 'de')),
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  referrer       text,
  created_at     timestamptz not null default now()
);

-- One entry per address, case-insensitive. The API lowercases emails before insert.
create unique index if not exists waitlist_email_key on public.waitlist (lower(email));

-- Only the service role (used server-side by /api/waitlist) may read or write.
alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;
