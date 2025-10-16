-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Give new users 2 free credits to test the platform
  insert into public.users (id, email, name, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', null),
    2
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop trigger before creating to make script idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Drop all triggers before creating to make script idempotent
drop trigger if exists update_users_updated_at on public.users;
drop trigger if exists update_transactions_updated_at on public.transactions;
drop trigger if exists update_system_config_updated_at on public.system_config;

-- Triggers for updated_at
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function public.update_updated_at_column();

create trigger update_transactions_updated_at
  before update on public.transactions
  for each row
  execute function public.update_updated_at_column();

create trigger update_system_config_updated_at
  before update on public.system_config
  for each row
  execute function public.update_updated_at_column();
