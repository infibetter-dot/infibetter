-- INFIBETTER Support Center
-- Run this migration in the INFIBETTER Supabase project only.

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null
    check (char_length(customer_email) between 5 and 254),
  issue_type text not null
    check (issue_type in (
      'Product Information',
      'Order & Payment',
      'Shipping & Delivery',
      'Returns & Refunds',
      'Warranty',
      'Other Questions'
    )),
  message text not null
    check (char_length(trim(message)) between 10 and 4000),
  page_url text,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'resolved')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_requests_status_created_idx
  on public.support_requests (status, created_at desc);

create index if not exists support_requests_email_idx
  on public.support_requests (customer_email);

create or replace function public.set_support_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_support_requests_updated_at
  on public.support_requests;

create trigger trg_support_requests_updated_at
before update on public.support_requests
for each row execute function public.set_support_requests_updated_at();

alter table public.support_requests enable row level security;

-- Visitors can submit requests, but cannot read or update any request.
drop policy if exists "Anyone can submit support request"
  on public.support_requests;

create policy "Anyone can submit support request"
on public.support_requests
for insert
to anon, authenticated
with check (
  status = 'new'
  and admin_reply is null
  and char_length(trim(customer_email)) between 5 and 254
  and char_length(trim(message)) between 10 and 4000
);

-- Only users whose Supabase Auth app_metadata.role is exactly "admin"
-- can read and manage support requests.
drop policy if exists "Admins can read support requests"
  on public.support_requests;

create policy "Admins can read support requests"
on public.support_requests
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update support requests"
  on public.support_requests;

create policy "Admins can update support requests"
on public.support_requests
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant insert on public.support_requests to anon, authenticated;
grant select, update on public.support_requests to authenticated;
