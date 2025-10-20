-- Patch para corrigir schema da tabela images e adicionar policies faltantes
-- Este script é idempotente e pode ser executado múltiplas vezes

-- 1. Permitir image_url NULL (necessário para status pending)
alter table public.images
  alter column image_url drop not null;

-- 2. Adicionar colunas faltantes se não existirem
alter table public.images
  add column if not exists style text not null default 'natural',
  add column if not exists quality text not null default 'low',
  add column if not exists revised_prompt text;

-- 3. Ajustar defaults
alter table public.images
  alter column credits_used set default 0,
  alter column status set default 'pending';

-- 4. Adicionar policy de UPDATE para images (permite atualizar status e image_url)
drop policy if exists "Users can update their own images" on public.images;
create policy "Users can update their own images"
  on public.images
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Adicionar policy de INSERT para usage_logs
drop policy if exists "Users can insert their own usage logs" on public.usage_logs;
create policy "Users can insert their own usage logs"
  on public.usage_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 6. Adicionar policy de UPDATE para posts (permite editar legendas salvas)
drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts"
  on public.posts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. Garantir que a função handle_new_user existe e está correta
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, credits)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', null), 2)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 8. Recriar trigger se necessário
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
