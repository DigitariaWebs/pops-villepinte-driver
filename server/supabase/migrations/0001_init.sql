-- =============================================================================
-- POP'S Villepinte — initial schema
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- =============================================================================
-- Enums
-- =============================================================================

create type public.order_status as enum (
  'received', 'preparing', 'ready', 'picked_up', 'cancelled'
);

create type public.product_tag as enum (
  'NOUVEAU', 'PROMO', 'TOP', 'SPICY'
);

create type public.app_role as enum ('customer', 'admin');

-- =============================================================================
-- profiles  (1-1 with auth.users)
-- =============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text unique,
  order_count integer not null default 0,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_phone_idx on public.profiles(phone);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Menu: categories, supplements, products, variants, junction
-- =============================================================================

create table public.categories (
  id text primary key,
  name text not null,
  icon text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index categories_order_idx on public.categories(display_order);

create table public.supplements (
  id text primary key,
  name text not null,
  price_eur numeric(6,2) not null check (price_eur >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  category_id text not null references public.categories(id) on delete restrict,
  name text not null,
  description text not null default '',
  price_eur numeric(6,2) not null check (price_eur >= 0),
  image_path text,
  tags public.product_tag[] not null default '{}',
  prep_time_minutes integer not null default 5 check (prep_time_minutes > 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_tags_idx on public.products using gin(tags);
create index products_name_trgm_idx on public.products using gin(name gin_trgm_ops);
create index products_available_idx on public.products(is_available) where is_available;

create table public.product_variants (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  label text not null,
  price_eur numeric(6,2) not null check (price_eur >= 0),
  sort integer not null default 0
);

create index product_variants_product_idx on public.product_variants(product_id);

create table public.product_supplements (
  product_id text not null references public.products(id) on delete cascade,
  supplement_id text not null references public.supplements(id) on delete cascade,
  primary key (product_id, supplement_id)
);

-- =============================================================================
-- Orders + items
-- =============================================================================

-- Per-day counter for order id generation
create table public.order_id_counters (
  day date primary key,
  next_seq integer not null default 1
);

create or replace function public.generate_order_id(d date default current_date)
returns text
language plpgsql
as $$
declare
  seq integer;
  ymd text := to_char(d, 'YYYYMMDD');
begin
  insert into public.order_id_counters (day, next_seq)
  values (d, 2)
  on conflict (day) do update
    set next_seq = public.order_id_counters.next_seq + 1
  returning next_seq - 1 into seq;
  return 'POP-' || ymd || '-' || lpad(seq::text, 4, '0');
end;
$$;

create table public.orders (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete restrict,
  customer_name text not null,
  customer_phone text,
  total_eur numeric(7,2) not null check (total_eur >= 0),
  status public.order_status not null default 'received',
  created_at timestamptz not null default now(),
  estimated_ready_at timestamptz not null,
  picked_up_at timestamptz,
  cancelled_at timestamptz,
  notes text
);

create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index orders_active_idx
  on public.orders(created_at)
  where status in ('received','preparing','ready');

create or replace function public.set_order_id_default()
returns trigger
language plpgsql
as $$
begin
  if new.id is null or new.id = '' then
    new.id := public.generate_order_id(current_date);
  end if;
  return new;
end;
$$;

create trigger orders_set_id_before_insert
  before insert on public.orders
  for each row execute function public.set_order_id_default();

create or replace function public.bump_profile_order_count()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'picked_up' and (old.status is distinct from 'picked_up') then
    update public.profiles
       set order_count = order_count + 1,
           updated_at  = now()
     where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger orders_bump_count
  after update on public.orders
  for each row execute function public.bump_profile_order_count();

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  variant_id text references public.product_variants(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price_eur numeric(7,2) not null check (unit_price_eur >= 0),
  supplements jsonb not null default '[]'::jsonb,
  notes text,
  line_total_eur numeric(7,2) not null check (line_total_eur >= 0)
);

create index order_items_order_idx on public.order_items(order_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.supplements enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_supplements enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Helper: is current user admin?
create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- profiles
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id or public.current_user_is_admin());

create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- public catalog: anyone (anon + authenticated) reads active rows
create policy categories_public_read on public.categories
  for select using (is_active);

create policy supplements_public_read on public.supplements
  for select using (is_active);

create policy products_public_read on public.products
  for select using (is_available);

create policy product_variants_public_read on public.product_variants
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_available)
  );

create policy product_supplements_public_read on public.product_supplements
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.is_available)
    and exists (select 1 from public.supplements s where s.id = supplement_id and s.is_active)
  );

-- orders: customers see/insert own; cancel own when received; admin full
create policy orders_owner_select on public.orders
  for select using (auth.uid() = user_id or public.current_user_is_admin());

create policy orders_owner_insert on public.orders
  for insert with check (auth.uid() = user_id);

create policy orders_owner_cancel on public.orders
  for update
  using (auth.uid() = user_id and status = 'received')
  with check (auth.uid() = user_id and status = 'cancelled');

create policy orders_admin_update on public.orders
  for update using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

-- order_items mirror parent
create policy order_items_owner_select on public.order_items
  for select using (
    exists (select 1 from public.orders o
            where o.id = order_id
              and (o.user_id = auth.uid() or public.current_user_is_admin()))
  );

create policy order_items_owner_insert on public.order_items
  for insert with check (
    exists (select 1 from public.orders o
            where o.id = order_id and o.user_id = auth.uid())
  );

-- =============================================================================
-- Storage bucket for product images (public read)
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product-images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- writes performed via service role from the API; no INSERT/UPDATE/DELETE policies
