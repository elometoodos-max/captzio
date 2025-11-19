-- ============================================================================
-- SCRIPT DE MELHORIAS ABRANGENTES DO BANCO DE DADOS CAPTZIO
-- Versão: 1.3 (Robustez Aumentada)
-- Data: 2025-01-21
-- ============================================================================

-- Definir search_path para garantir que estamos operando no schema public
SET search_path TO public;

-- 1. Adicionar colunas úteis na tabela users se não existirem
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'last_login') then
    alter table public.users add column last_login timestamp with time zone;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'metadata') then
    alter table public.users add column metadata jsonb default '{}'::jsonb;
  end if;
end $$;

-- 2. Garantir índices em todas as chaves estrangeiras para performance
create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_images_user_id on public.images(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_usage_logs_user_id on public.usage_logs(user_id);

-- 3. Tabela de verificação de sistema (para o dashboard de admin)
create table if not exists public.system_health_checks (
  id uuid primary key default gen_random_uuid(),
  check_name text not null,
  status text not null check (status in ('healthy', 'degraded', 'unhealthy')),
  latency_ms integer,
  details jsonb,
  checked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para system_health_checks (apenas admin)
alter table public.system_health_checks enable row level security;

-- Usando DO block para evitar erro se a policy já existir e garantir segurança
do $$
begin
  -- Remove policies antigas se existirem para recriar corretamente
  drop policy if exists "Admins can view health checks" on public.system_health_checks;
  drop policy if exists "Admins can insert health checks" on public.system_health_checks;
  
  -- Cria novas policies apenas se o schema auth existir (evita erro em ambientes sem auth configurado)
  if exists (select 1 from information_schema.schemata where schema_name = 'auth') then
      create policy "Admins can view health checks"
        on public.system_health_checks for select
        using (
          (select role from public.users where id = auth.uid()) = 'admin'
        );

      create policy "Admins can insert health checks"
        on public.system_health_checks for insert
        with check (
          (select role from public.users where id = auth.uid()) = 'admin'
        );
  end if;
end $$;

-- 4. Função para limpar logs antigos (manutenção)
create or replace function public.cleanup_old_logs()
returns void
language plpgsql
as $$
begin
  -- Manter logs de uso por 90 dias
  delete from public.usage_logs where created_at < now() - interval '90 days';
  -- Manter health checks por 7 dias
  delete from public.system_health_checks where checked_at < now() - interval '7 days';
end;
$$;

comment on table public.system_health_checks is 'Histórico de verificações de saúde do sistema';
