-- ============================================================================
-- SCRIPT DE OTIMIZAÇÃO AVANÇADA DO BANCO DE DADOS CAPTZIO
-- Versão 1.2 - COMPLETO e IDEMPOTENTE
-- Data: 2025-10-21
-- Autor: Sávio / GPT-5
-- ============================================================================
-- Inclui: particionamento, limpeza, dashboard, monitoramento e logs de erro
-- Pode ser executado várias vezes SEM gerar erro de duplicação
-- ============================================================================

-- ===============================
-- PRÉ-REQUISITO
-- ===============================
create extension if not exists pgcrypto;

-- ============================================================================
-- PARTE 1: PARTICIONAMENTO DE TABELAS
-- ============================================================================

create table if not exists public.usage_logs_archive (
  like public.usage_logs including all
);

create or replace function public.archive_old_usage_logs()
returns integer
language plpgsql
as $$
declare
  archived_count integer;
begin
  with moved as (
    delete from public.usage_logs
    where created_at < now() - interval '90 days'
    returning *
  )
  insert into public.usage_logs_archive
  select * from moved;

  get diagnostics archived_count = row_count;
  raise notice 'Arquivados % registros de usage_logs', archived_count;
  return archived_count;
end;
$$;

-- ============================================================================
-- PARTE 2: ÍNDICES OTIMIZADOS
-- ============================================================================

create index if not exists idx_images_pending_status
  on public.images(status, created_at)
  where status = 'pending';

create index if not exists idx_transactions_pending_status
  on public.transactions(status, created_at)
  where status = 'pending';

create index if not exists idx_posts_hashtags_gin
  on public.posts using gin(hashtags);

-- ============================================================================
-- PARTE 3: MATERIALIZED VIEW PARA DASHBOARD ADMIN
-- ============================================================================

drop materialized view if exists public.admin_dashboard_stats;

create materialized view public.admin_dashboard_stats as
select
  (select count(*) from public.users) as total_users,
  (select count(*) from public.users where role = 'admin') as total_admins,
  (select count(*) from public.posts) as total_captions,
  (select count(*) from public.images where status = 'completed') as total_images,
  (select sum(credits) from public.users) as total_credits_in_system,
  (select count(*) from public.users where created_at::date = current_date) as new_users_today,
  (select count(*) from public.posts where created_at::date = current_date) as captions_today,
  (select count(*) from public.images where created_at::date = current_date and status = 'completed') as images_today,
  (select coalesce(sum(amount), 0) from public.transactions where status = 'approved') as total_revenue,
  (select coalesce(sum(amount), 0) from public.transactions where status = 'approved' and created_at::date = current_date) as revenue_today,
  (select coalesce(sum(amount), 0) from public.transactions where status = 'approved' and created_at >= date_trunc('month', current_date)) as revenue_this_month,
  now() as last_updated;

create unique index if not exists idx_admin_dashboard_stats_last_updated
  on public.admin_dashboard_stats(last_updated);

create or replace function public.refresh_admin_dashboard()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently public.admin_dashboard_stats;
  raise notice 'Dashboard admin atualizado com sucesso';
end;
$$;

-- ============================================================================
-- PARTE 4: MONITORAMENTO DE SAÚDE DO BANCO
-- ============================================================================

create or replace function public.check_database_health()
returns table(
  metric text,
  value text,
  status text,
  recommendation text
)
language plpgsql
security definer
as $$
begin
  return query
  select
    'Tamanho da tabela ' || schemaname || '.' || tablename as metric,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as value,
    case
      when pg_total_relation_size(schemaname || '.' || tablename) > 1073741824 then 'warning'
      else 'ok'
    end as status,
    case
      when pg_total_relation_size(schemaname || '.' || tablename) > 1073741824 then 'Considere particionar esta tabela'
      else 'Tamanho adequado'
    end as recommendation
  from pg_tables
  where schemaname = 'public'
  order by pg_total_relation_size(schemaname || '.' || tablename) desc;
end;
$$;

create or replace function public.get_performance_stats()
returns table(
  table_name text,
  total_rows bigint,
  sequential_scans bigint,
  index_scans bigint,
  rows_inserted bigint,
  rows_updated bigint,
  rows_deleted bigint,
  cache_hit_ratio numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select
    schemaname || '.' || relname as table_name,
    n_live_tup,
    seq_scan,
    idx_scan,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    case
      when (heap_blks_hit + heap_blks_read) > 0
      then round(100.0 * heap_blks_hit / (heap_blks_hit + heap_blks_read), 2)
      else 0
    end as cache_hit_ratio
  from pg_stat_user_tables
  where schemaname = 'public'
  order by n_live_tup desc;
end;
$$;

-- ============================================================================
-- PARTE 5: LIMPEZA AUTOMÁTICA
-- ============================================================================

create or replace function public.cleanup_failed_images()
returns integer
language plpgsql
as $$
declare deleted_count integer;
begin
  delete from public.images
  where status = 'failed'
  and created_at < now() - interval '7 days';
  get diagnostics deleted_count = row_count;
  raise notice 'Removidas % imagens falhadas antigas', deleted_count;
  return deleted_count;
end;
$$;

create or replace function public.cleanup_stale_transactions()
returns integer
language plpgsql
as $$
declare updated_count integer;
begin
  update public.transactions
  set status = 'failed'
  where status = 'pending'
  and created_at < now() - interval '24 hours';
  get diagnostics updated_count = row_count;
  raise notice 'Marcadas % transações pendentes como falhadas', updated_count;
  return updated_count;
end;
$$;

-- ============================================================================
-- PARTE 6: SNAPSHOT / BACKUP DE DADOS
-- ============================================================================

create or replace function public.create_data_snapshot()
returns jsonb
language plpgsql
security definer
as $$
declare snapshot jsonb;
begin
  select jsonb_build_object(
    'timestamp', now(),
    'total_users', (select count(*) from public.users),
    'total_credits', (select sum(credits) from public.users),
    'total_posts', (select count(*) from public.posts),
    'total_images', (select count(*) from public.images),
    'total_transactions', (select count(*) from public.transactions),
    'total_revenue', (select coalesce(sum(amount), 0) from public.transactions where status = 'approved')
  ) into snapshot;

  insert into public.system_config (key, value, description)
  values ('data_snapshot_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS'), snapshot, 'Snapshot automático de dados')
  on conflict (key) do update set value = excluded.value, updated_at = now();

  return snapshot;
end;
$$;

-- ============================================================================
-- PARTE 7: LOGS DE ERROS DO SISTEMA (IDEMPOTENTE)
-- ============================================================================

create table if not exists public.system_errors (
  id uuid primary key default gen_random_uuid(),
  error_type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  message text not null,
  stack_trace text,
  user_id uuid references public.users(id) on delete set null,
  endpoint text,
  method text,
  status_code integer,
  metadata jsonb default '{}'::jsonb,
  resolved boolean default false,
  resolved_at timestamptz,
  resolved_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_system_errors_type on public.system_errors(error_type);
create index if not exists idx_system_errors_severity on public.system_errors(severity);
create index if not exists idx_system_errors_resolved on public.system_errors(resolved);
create index if not exists idx_system_errors_created_at on public.system_errors(created_at desc);
create index if not exists idx_system_errors_user_id on public.system_errors(user_id);

alter table public.system_errors enable row level security;

drop policy if exists "Admins podem ver todos os erros" on public.system_errors;
create policy "Admins podem ver todos os erros"
  on public.system_errors for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

drop policy if exists "Admins podem inserir erros" on public.system_errors;
create policy "Admins podem inserir erros"
  on public.system_errors for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

drop policy if exists "Admins podem atualizar erros" on public.system_errors;
create policy "Admins podem atualizar erros"
  on public.system_errors for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );

create or replace function public.update_system_errors_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists system_errors_updated_at on public.system_errors;
create trigger system_errors_updated_at
  before update on public.system_errors
  for each row
  execute function public.update_system_errors_updated_at();

create or replace function public.log_system_error(
  p_error_type text,
  p_severity text,
  p_message text,
  p_stack_trace text default null,
  p_user_id uuid default null,
  p_endpoint text default null,
  p_method text default null,
  p_status_code integer default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare v_error_id uuid;
begin
  insert into public.system_errors (
    error_type, severity, message, stack_trace,
    user_id, endpoint, method, status_code, metadata
  )
  values (
    p_error_type, p_severity, p_message, p_stack_trace,
    p_user_id, p_endpoint, p_method, p_status_code, p_metadata
  )
  returning id into v_error_id;

  return v_error_id;
end;
$$;

-- ============================================================================
-- MENSAGEM FINAL DE EXECUÇÃO
-- ============================================================================
do $$
begin
  raise notice '===========================================================';
  raise notice 'SCRIPT DE OTIMIZAÇÃO AVANÇADA EXECUTADO COM SUCESSO!';
  raise notice '✓ Estruturas idempotentes criadas';
  raise notice '✓ Políticas, índices e triggers atualizadas';
  raise notice '✓ Dashboard, monitoramento e logs de erros prontos';
  raise notice '===========================================================';
end $$;
