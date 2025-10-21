-- ============================================================================
-- SCRIPT PARA CRIAR TABELA DE ERROS DO SISTEMA - VERSÃO IDEMPOTENTE
-- Para o Dashboard Administrativo
-- ============================================================================
-- Versão: 2.0
-- Data: 2025-01-21
-- Totalmente idempotente - pode ser executado múltiplas vezes sem erros

-- Usando DO block para tornar o script completamente idempotente
do $$
begin
  -- Criar tabela de erros do sistema se não existir
  create table if not exists public.system_errors (
    id uuid primary key default gen_random_uuid(),
    error_type text not null check (error_type in ('api', 'sql', 'caption', 'image', 'auth', 'payment')),
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
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
  );

  raise notice '✓ Tabela system_errors verificada/criada';
end $$;

-- Índices para performance (IF NOT EXISTS)
create index if not exists idx_system_errors_type on public.system_errors(error_type);
create index if not exists idx_system_errors_severity on public.system_errors(severity);
create index if not exists idx_system_errors_resolved on public.system_errors(resolved);
create index if not exists idx_system_errors_created_at on public.system_errors(created_at desc);
create index if not exists idx_system_errors_user_id on public.system_errors(user_id) where user_id is not null;

-- Habilitar RLS de forma segura
do $$
begin
  if not exists (
    select 1 from pg_tables 
    where schemaname = 'public' 
    and tablename = 'system_errors' 
    and rowsecurity = true
  ) then
    alter table public.system_errors enable row level security;
    raise notice '✓ RLS habilitado na tabela system_errors';
  else
    raise notice '✓ RLS já estava habilitado';
  end if;
end $$;

-- Remover policies existentes de forma segura
do $$
begin
  -- Remover policy de SELECT se existir
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'system_errors' 
    and policyname = 'Admins podem ver todos os erros'
  ) then
    drop policy "Admins podem ver todos os erros" on public.system_errors;
    raise notice '✓ Policy SELECT removida para recriação';
  end if;

  -- Remover policy de INSERT se existir
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'system_errors' 
    and policyname = 'Sistema pode inserir erros'
  ) then
    drop policy "Sistema pode inserir erros" on public.system_errors;
    raise notice '✓ Policy INSERT removida para recriação';
  end if;

  -- Remover policy de UPDATE se existir
  if exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'system_errors' 
    and policyname = 'Admins podem atualizar erros'
  ) then
    drop policy "Admins podem atualizar erros" on public.system_errors;
    raise notice '✓ Policy UPDATE removida para recriação';
  end if;
end $$;

-- Criar policies de forma segura
do $$
begin
  -- Policy de SELECT
  create policy "Admins podem ver todos os erros"
    on public.system_errors
    for select
    using (
      exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
      )
    );
  raise notice '✓ Policy SELECT criada';

  -- Policy de INSERT
  create policy "Sistema pode inserir erros"
    on public.system_errors
    for insert
    with check (true);
  raise notice '✓ Policy INSERT criada';

  -- Policy de UPDATE
  create policy "Admins podem atualizar erros"
    on public.system_errors
    for update
    using (
      exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
      )
    );
  raise notice '✓ Policy UPDATE criada';
end $$;

-- Função para obter estatísticas de erros
create or replace function public.get_error_stats()
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total', count(*),
    'unresolved', count(*) filter (where not resolved),
    'critical', count(*) filter (where severity = 'critical' and not resolved),
    'today', count(*) filter (where created_at >= current_date),
    'by_type', (
      select jsonb_object_agg(error_type, count)
      from (
        select error_type, count(*)::int as count
        from public.system_errors
        group by error_type
      ) t
    ),
    'by_severity', (
      select jsonb_object_agg(severity, count)
      from (
        select severity, count(*)::int as count
        from public.system_errors
        group by severity
      ) t
    )
  ) into result
  from public.system_errors;
  
  return coalesce(result, '{"total":0,"unresolved":0,"critical":0,"today":0}'::jsonb);
end;
$$;

-- Trigger para atualizar updated_at
drop trigger if exists update_system_errors_updated_at on public.system_errors;
create trigger update_system_errors_updated_at
  before update on public.system_errors
  for each row
  execute function public.update_updated_at_column();

-- Comentários
comment on table public.system_errors is 'Registro de erros do sistema para monitoramento administrativo';
comment on column public.system_errors.error_type is 'Tipo de erro: api, sql, caption, image, auth, payment';
comment on column public.system_errors.severity is 'Severidade: low, medium, high, critical';
comment on column public.system_errors.resolved is 'Se o erro foi resolvido por um administrador';

-- Mensagem de sucesso
do $$
begin
  raise notice '========================================';
  raise notice '✓ Script executado com sucesso!';
  raise notice '✓ Tabela system_errors pronta';
  raise notice '✓ Índices configurados';
  raise notice '✓ Policies RLS ativas';
  raise notice '✓ Função get_error_stats() disponível';
  raise notice '========================================';
end $$;
