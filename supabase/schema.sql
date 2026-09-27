-- Run this in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null,
  description text not null,
  hero_image_url text,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  slug text not null unique,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  description text not null,
  philosophy text not null,
  materials text[] not null default '{}',
  dimensions text not null,
  image_url text,
  gallery text[] default '{}',
  sort_order integer default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.consultancy_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  project_type text,
  timeline text,
  preferred_date date,
  preferred_slot text,
  consultation_format text,
  message text,
  created_at timestamptz not null default now()
);

-- Added after the initial table creation above; kept as idempotent ALTERs
-- (matching the orders table's pattern below) so re-running this file
-- against an existing database backfills the columns instead of failing.
alter table public.consultancy_requests add column if not exists preferred_date date;
alter table public.consultancy_requests add column if not exists preferred_slot text;
alter table public.consultancy_requests add column if not exists consultation_format text;

-- General "get in touch" messages (a real Contact page) are kept separate
-- from consultancy_requests: a quick question is a different intent from a
-- full design-brief booking, and mixing them made the consultancy admin
-- view noisy with one-off questions that don't need a slot/format/timeline.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  notes text,
  status text not null default 'inquiry',
  payment_provider text,
  payment_status text,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  paid_at timestamptz,
  currency text not null default 'USD',
  total_amount numeric(12,2) not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists payment_provider text;
alter table public.orders add column if not exists payment_status text;
alter table public.orders add column if not exists razorpay_order_id text;
alter table public.orders add column if not exists razorpay_payment_id text;
alter table public.orders add column if not exists razorpay_signature text;
alter table public.orders add column if not exists paid_at timestamptz;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  material text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.studio_dispatch_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.user_carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Membership table for real admin access: a signed-in Supabase user (Google
-- OAuth) is treated as an admin only if their auth.users id has a row here.
-- Deliberately no RLS policies below (RLS is enabled, no policy = nobody via
-- anon/authenticated key can read or write it) — only the edge functions,
-- using the service-role key, can check or manage this table. There is no
-- self-service "become an admin" path by design; the first row has to be
-- inserted manually in the SQL Editor (see README for the exact statement).
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create index if not exists idx_collections_slug on public.collections(slug);
create index if not exists idx_products_collection_id on public.products(collection_id);
create index if not exists idx_products_active on public.products(active);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_razorpay_order_id on public.orders(razorpay_order_id);
create index if not exists idx_consultancy_created_at on public.consultancy_requests(created_at desc);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);
create index if not exists idx_studio_dispatch_email on public.studio_dispatch_subscribers(email);
create index if not exists idx_user_carts_updated_at on public.user_carts(updated_at desc);

alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.consultancy_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.studio_dispatch_subscribers enable row level security;
alter table public.user_carts enable row level security;

drop policy if exists "Public read collections" on public.collections;
create policy "Public read collections"
  on public.collections for select
  using (true);

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
  on public.products for select
  using (active = true);

drop policy if exists "Public insert consultancy" on public.consultancy_requests;
create policy "Public insert consultancy"
  on public.consultancy_requests for insert
  with check (true);

drop policy if exists "Public insert contact messages" on public.contact_messages;
create policy "Public insert contact messages"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Public insert order items" on public.order_items;
create policy "Public insert order items"
  on public.order_items for insert
  with check (true);

drop policy if exists "Public insert studio dispatch subscribers" on public.studio_dispatch_subscribers;
create policy "Public insert studio dispatch subscribers"
  on public.studio_dispatch_subscribers for insert
  with check (true);

drop policy if exists "Users read own cart" on public.user_carts;
create policy "Users read own cart"
  on public.user_carts for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own cart" on public.user_carts;
create policy "Users insert own cart"
  on public.user_carts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own cart" on public.user_carts;
create policy "Users update own cart"
  on public.user_carts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket for admin-uploaded catalog images (collection hero images,
-- product images), replacing the old "paste an image URL" admin flow.
-- Public (public = true) because these images are shown on the public site,
-- so anyone needs to be able to GET them without auth.
-- Uploads/updates/deletes are deliberately NOT opened up to authenticated
-- clients here: the only write path is the admin-upload-image edge function,
-- which uses the service-role key (same pattern as admin_users above) and so
-- bypasses storage RLS entirely after checking admin_users itself. That
-- means no permissive INSERT/UPDATE/DELETE policy is needed — or wanted —
-- for this bucket; leaving storage.objects locked down for it is what keeps
-- "only admins, via the edge function" true.
insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read catalog images" on storage.objects;
create policy "Public read catalog images"
  on storage.objects for select
  using (bucket_id = 'catalog-images');

-- ============================================================================
-- Execution suite: projects, notes/remarks, timeline tasks, documents, and
-- the mapping table a future Client Portal will use for per-client access.
-- Added for the "Project & Quotation Platform" build (see the requirements
-- doc) — everything below follows admin_users' pattern: RLS enabled, no
-- policies, so only the service-role key (used inside edge functions, which
-- gate on admin_users themselves) can read or write these tables. Real
-- client-facing RLS policies get added once the Client Portal's own pages
-- are built (client_project_access exists now so that work isn't blocked on
-- a schema change later).
-- ============================================================================

-- A lead's outcome for the Sales — Lead Insights stat boxes. Existing rows
-- backfill to 'open' via the column default.
alter table public.consultancy_requests add column if not exists status text not null default 'open';
alter table public.consultancy_requests drop constraint if exists consultancy_requests_status_check;
alter table public.consultancy_requests add constraint consultancy_requests_status_check
  check (status in ('open', 'converted', 'lost'));

-- Team member directory: reuses admin_users (today, everyone who can sign
-- into the dashboard is an admin — see the "Roles" open question in the
-- requirements doc for the lighter-role option this may need later) rather
-- than a second table, so mention-notifications and the @mention picker
-- have a name/email/phone to work from without a new join.
alter table public.admin_users add column if not exists full_name text;
alter table public.admin_users add column if not exists email text;
alter table public.admin_users add column if not exists phone text;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  consultancy_request_id uuid references public.consultancy_requests(id) on delete set null,
  client_name text not null,
  client_phone text,
  client_email text,
  project_name text not null,
  stage text not null default 'just_started',
  owner_user_id uuid references auth.users(id) on delete set null,
  assigned_mailbox text,
  tentative_start_date date,
  tentative_handover_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects drop constraint if exists projects_stage_check;
alter table public.projects add constraint projects_stage_check
  check (stage in (
    'just_started', 'planning', 'executed', 'production', 'on_hold', 'cancelled',
    'near_completing', 'settlement_pending', 'retention_pending', 'settled_closed', 'jms_pending'
  ));

-- One feed covers both "project notes" and the client-visibility-toggled
-- "remarks" from the requirements doc (see the Open Questions note on that) —
-- client_visible is that toggle, defaulting to hidden.
create table if not exists public.project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  mentioned_user_ids uuid[] not null default '{}',
  client_visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  due_date date not null,
  done boolean not null default false,
  assignee_user_id uuid references auth.users(id) on delete set null,
  client_visible boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  folder text not null default 'General',
  file_name text not null,
  file_url text not null,
  kind text not null default 'file',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.project_documents drop constraint if exists project_documents_kind_check;
alter table public.project_documents add constraint project_documents_kind_check
  check (kind in ('file', 'link'));

-- Not used by anything yet (the Client Portal itself is next up), but
-- created now so that build isn't also a schema migration later.
create table if not exists public.client_project_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, project_id)
);

create index if not exists idx_projects_stage on public.projects(stage);
create index if not exists idx_projects_owner on public.projects(owner_user_id);
create index if not exists idx_project_notes_project_id on public.project_notes(project_id, created_at desc);
create index if not exists idx_project_tasks_project_id on public.project_tasks(project_id, due_date);
create index if not exists idx_project_documents_project_id on public.project_documents(project_id, folder);
create index if not exists idx_client_project_access_user on public.client_project_access(user_id);
create index if not exists idx_consultancy_status on public.consultancy_requests(status);

alter table public.projects enable row level security;
alter table public.project_notes enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_documents enable row level security;
alter table public.client_project_access enable row level security;

-- Private bucket for project documents (PDFs, DWG, images, etc.) — unlike
-- catalog-images this is NOT public: these can be client project files, so
-- access only ever happens through the admin-project-documents edge
-- function (service-role key + a short-lived signed URL per file), never a
-- public URL. No storage.objects policy is added, same reasoning as
-- admin_users: RLS is on with zero policies, so only the service role can
-- touch it.
insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;
