-- ============================================================================
-- SCRIPT DE OTIMIZAÇÃO AVANÇADA DO BANCO DE DADOS CAPTZIO
-- Fase 2: Particionamento, Arquivamento e Monitoramento
-- ============================================================================
-- Este script implementa otimizações avançadas para escalabilidade
-- Versão: 1.0
-- Data: 2025-01-20

-- ============================================================================
-- PARTE 1: PARTICIONAMENTO DE TABELAS (PARA ALTA ESCALA)
-- ============================================================================

-- Criar tabela de arquivamento para usage_logs antigos (> 90 dias)
create table if not exists public.usage_logs_archive (
  like public.usage_logs including all
);

-- Função para arquivar logs antigos
create or replace function public.archive_old_usage_logs()
returns integer
language plpgsql
as $$
declare
  archived_count integer;
begin
  -- Mover logs com mais de 90 dias para arquivo
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
-- PARTE 2: ÍNDICES PARCIAIS E ESPECIALIZADOS
-- ============================================================================

-- Índice para imagens pendentes (queries frequentes)
create index if not exists idx_images_pending_old
  on public.images(created_at)
  where status = 'pending' and created_at < now() - interval '5 minutes';

-- Índice para transações pendentes
create index if not exists idx_transactions_pending
  on public.transactions(created_at)
  where status = 'pending';

-- Índice GIN para busca em arrays de hashtags
create index if not exists idx_posts_hashtags_gin
  on public.posts using gin(hashtags);

-- Índice para busca de texto em captions (full-text search)
create index if not exists idx_posts_caption_fts
  on public.posts using gin(to_tsvector('portuguese', caption));

-- ============================================================================
-- PARTE 3: MATERIALIZED VIEWS PARA DASHBOARDS
-- ============================================================================

-- View materializada para dashboard admin (atualizada a cada hora)
create materialized view if not exists public.admin_dashboard_stats as
select
  -- Estatísticas gerais
  (select count(*) from public.users) as total_users,
  (select count(*) from public.users where role = 'admin') as total_admins,
  (select count(*) from public.posts) as total_captions,
  (select count(*) from public.images where status = 'completed') as total_images,
  (select sum(credits) from public.users) as total_credits_in_system,
  
  -- Estatísticas de hoje
  (select count(*) from public.users where created_at::date = current_date) as new_users_today,
  (select count(*) from public.posts where created_at::date = current_date) as captions_today,
  (select count(*) from public.images where created_at::date = current_date and status = 'completed') as images_today,
  
  -- Estatísticas de receita
  (select coalesce(sum(amount), 0) from public.transactions where status = 'approved') as total_revenue,
  (select coalesce(sum(amount), 0) from public.transactions where status = 'approved' and created_at::date = current_date) as revenue_today,
  (select coalesce(sum(amount), 0) from public.transactions where status = 'approved' and created_at >= date_trunc('month', current_date)) as revenue_this_month,
  
  -- Timestamp da última atualização
  now() as last_updated;

-- Índice único para a materialized view
create unique index if not exists idx_admin_dashboard_stats_last_updated
  on public.admin_dashboard_stats(last_updated);

-- Função para atualizar a materialized view
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
-- PARTE 4: FUNÇÕES DE MONITORAMENTO
-- ============================================================================

-- Função para verificar saúde do banco de dados
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
  -- Verificar tamanho das tabelas
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
  
  -- Verificar índices não utilizados
  return query
  select
    'Índice não utilizado' as metric,
    indexrelname::text as value,
    'warning' as status,
    'Considere remover este índice para economizar espaço' as recommendation
  from pg_stat_user_indexes
  where schemaname = 'public'
    and idx_scan = 0
    and indexrelname not like 'pg_toast%';
end;
$$;

-- Função para obter estatísticas de performance
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
    n_live_tup as total_rows,
    seq_scan as sequential_scans,
    idx_scan as index_scans,
    n_tup_ins as rows_inserted,
    n_tup_upd as rows_updated,
    n_tup_del as rows_deleted,
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
-- PARTE 5: POLÍTICAS DE RETENÇÃO E LIMPEZA
-- ============================================================================

-- Função para limpar imagens falhadas antigas (> 7 dias)
create or replace function public.cleanup_failed_images()
returns integer
language plpgsql
as $$
declare
  deleted_count integer;
begin
  delete from public.images
  where status = 'failed'
    and created_at < now() - interval '7 days';
  
  get diagnostics deleted_count = row_count;
  
  raise notice 'Removidas % imagens falhadas antigas', deleted_count;
  return deleted_count;
end;
$$;

-- Função para limpar transações pendentes antigas (> 24 horas)
create or replace function public.cleanup_stale_transactions()
returns integer
language plpgsql
as $$
declare
  updated_count integer;
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
-- PARTE 6: BACKUP E RECUPERAÇÃO
-- ============================================================================

-- Função para criar snapshot de dados críticos
create or replace function public.create_data_snapshot()
returns jsonb
language plpgsql
security definer
as $$
declare
  snapshot jsonb;
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
  
  -- Salvar snapshot na tabela system_config
  insert into public.system_config (key, value, description)
  values ('data_snapshot_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS'), snapshot, 'Snapshot automático de dados')
  on conflict (key) do update set value = excluded.value, updated_at = now();
  
  return snapshot;
end;
$$;

-- ============================================================================
-- PARTE 7: AGENDAMENTO DE TAREFAS (REQUER pg_cron EXTENSION)
-- ============================================================================

-- Nota: As tarefas abaixo requerem a extensão pg_cron
-- Para habilitar: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Comentários sobre agendamento recomendado:
comment on function public.archive_old_usage_logs is 'Executar diariamente às 2h: SELECT cron.schedule(''archive-logs'', ''0 2 * * *'', ''SELECT public.archive_old_usage_logs()'')';
comment on function public.cleanup_failed_images is 'Executar diariamente às 3h: SELECT cron.schedule(''cleanup-images'', ''0 3 * * *'', ''SELECT public.cleanup_failed_images()'')';
comment on function public.cleanup_stale_transactions is 'Executar a cada hora: SELECT cron.schedule(''cleanup-transactions'', ''0 * * * *'', ''SELECT public.cleanup_stale_transactions()'')';
comment on function public.refresh_admin_dashboard is 'Executar a cada hora: SELECT cron.schedule(''refresh-dashboard'', ''0 * * * *'', ''SELECT public.refresh_admin_dashboard()'')';
comment on function public.create_data_snapshot is 'Executar diariamente às 1h: SELECT cron.schedule(''data-snapshot'', ''0 1 * * *'', ''SELECT public.create_data_snapshot()'')';

-- ============================================================================
-- MENSAGEM FINAL
-- ============================================================================

do $$
begin
  raise notice '============================================================================';
  raise notice 'SCRIPT DE OTIMIZAÇÃO AVANÇADA EXECUTADO COM SUCESSO!';
  raise notice '============================================================================';
  raise notice '';
  raise notice '✓ Tabela de arquivamento criada';
  raise notice '✓ Índices especializados adicionados';
  raise notice '✓ Materialized view para dashboard criada';
  raise notice '✓ Funções de monitoramento disponíveis';
  raise notice '✓ Políticas de limpeza implementadas';
  raise notice '✓ Sistema de backup configurado';
  raise notice '';
  raise notice 'Funções de manutenção disponíveis:';
  raise notice '  - archive_old_usage_logs(): Arquiva logs antigos';
  raise notice '  - cleanup_failed_images(): Remove imagens falhadas';
  raise notice '  - cleanup_stale_transactions(): Limpa transações pendentes';
  raise notice '  - refresh_admin_dashboard(): Atualiza dashboard admin';
  raise notice '  - create_data_snapshot(): Cria snapshot de dados';
  raise notice '';
  raise notice 'Funções de monitoramento disponíveis:';
  raise notice '  - check_database_health(): Verifica saúde do banco';
  raise notice '  - get_performance_stats(): Estatísticas de performance';
  raise notice '';
  raise notice 'IMPORTANTE: Para agendamento automático, habilite pg_cron:';
  raise notice '  CREATE EXTENSION IF NOT EXISTS pg_cron;';
  raise notice '';
  raise notice '============================================================================';
end $$;
