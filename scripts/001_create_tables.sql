-- Create users table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  credits integer not null default 0,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create posts table (generated captions)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text,
  caption text not null,
  hashtags text[] default array[]::text[],
  cta text,
  tone text,
  platform text,
  credits_used integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create images table (generated images)
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  prompt text not null,
  image_url text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  credits_used integer not null default 5,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Create transactions table (payment history)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount decimal(10, 2) not null,
  credits integer not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'failed', 'refunded')),
  payment_id text unique,
  payment_method text default 'mercado_pago',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create system_config table (admin settings)
create table if not exists public.system_config (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create usage_logs table (API usage tracking)
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  action text not null,
  credits_used integer not null default 0,
  cost_usd decimal(10, 6),
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.images enable row level security;
alter table public.transactions enable row level security;
alter table public.system_config enable row level security;
alter table public.usage_logs enable row level security;

-- Drop existing policies before creating to make script idempotent
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can view their own posts" on public.posts;
drop policy if exists "Users can insert their own posts" on public.posts;
drop policy if exists "Users can delete their own posts" on public.posts;
drop policy if exists "Users can view their own images" on public.images;
drop policy if exists "Users can insert their own images" on public.images;
drop policy if exists "Users can delete their own images" on public.images;
drop policy if exists "Users can view their own transactions" on public.transactions;
drop policy if exists "Admins can view system config" on public.system_config;
drop policy if exists "Admins can update system config" on public.system_config;
drop policy if exists "Admins can view all usage logs" on public.usage_logs;
drop policy if exists "Users can view their own usage logs" on public.usage_logs;

-- RLS Policies for users table
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- RLS Policies for posts table
create policy "Users can view their own posts"
  on public.posts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- RLS Policies for images table
create policy "Users can view their own images"
  on public.images for select
  using (auth.uid() = user_id);

create policy "Users can insert their own images"
  on public.images for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own images"
  on public.images for delete
  using (auth.uid() = user_id);

-- RLS Policies for transactions table
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- RLS Policies for system_config (admin only)
create policy "Admins can view system config"
  on public.system_config for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "Admins can update system config"
  on public.system_config for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- RLS Policies for usage_logs (admin only)
create policy "Admins can view all usage logs"
  on public.usage_logs for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "Users can view their own usage logs"
  on public.usage_logs for select
  using (auth.uid() = user_id);
