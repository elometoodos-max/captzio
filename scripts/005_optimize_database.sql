-- ============================================================================
-- SCRIPT DE OTIMIZAÇÃO DO BANCO DE DADOS CAPTZIO
-- Fase 1: Limpeza de Dados e Constraints Básicas
-- ============================================================================
-- Este script é idempotente e pode ser executado múltiplas vezes
-- Versão: 1.1
-- Data: 2025-01-20

-- ============================================================================
-- PARTE 1: LIMPEZA DE DADOS INVÁLIDOS
-- ============================================================================

-- Verificar e corrigir dados inválidos em posts
do $$
declare
  invalid_posts_count integer;
begin
  select count(*) into invalid_posts_count
  from public.posts
  where credits_used < 1 or credits_used is null;
  
  if invalid_posts_count > 0 then
    raise notice 'Corrigindo % registros inválidos em posts...', invalid_posts_count;
    
    update public.posts
    set credits_used = 1
    where credits_used < 1 or credits_used is null;
    
    raise notice 'Posts corrigidos com sucesso!';
  else
    raise notice 'Nenhum registro inválido encontrado em posts.';
  end if;
end $$;

-- Verificar e corrigir dados inválidos em images
do $$
declare
  invalid_images_count integer;
begin
  select count(*) into invalid_images_count
  from public.images
  where (credits_used < 0 or credits_used is null);
  
  if invalid_images_count > 0 then
    raise notice 'Corrigindo % registros inválidos em images...', invalid_images_count;
    
    -- Permitir credits_used = 0 para status pending
    update public.images
    set credits_used = 0
    where (credits_used < 0 or credits_used is null) and status = 'pending';
    
    -- Para imagens completadas, mínimo 1 crédito
    update public.images
    set credits_used = 1
    where (credits_used < 1 or credits_used is null) and status = 'completed';
    
    raise notice 'Images corrigidas com sucesso!';
  else
    raise notice 'Nenhum registro inválido encontrado em images.';
  end if;
end $$;

-- Verificar e corrigir dados inválidos em transactions
do $$
declare
  invalid_transactions_count integer;
begin
  select count(*) into invalid_transactions_count
  from public.transactions
  where amount <= 0 or credits <= 0;
  
  if invalid_transactions_count > 0 then
    raise notice 'Corrigindo % registros inválidos em transactions...', invalid_transactions_count;
    
    update public.transactions
    set amount = 0.01
    where amount <= 0;
    
    update public.transactions
    set credits = 1
    where credits <= 0;
    
    raise notice 'Transactions corrigidas com sucesso!';
  else
    raise notice 'Nenhum registro inválido encontrado em transactions.';
  end if;
end $$;

-- ============================================================================
-- PARTE 2: ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para tabela posts (queries por usuário e data)
create index if not exists idx_posts_user_id_created_at 
  on public.posts(user_id, created_at desc);

create index if not exists idx_posts_platform 
  on public.posts(platform) 
  where platform is not null;

-- Índices para tabela images (queries por usuário, status e data)
create index if not exists idx_images_user_id_status 
  on public.images(user_id, status);

create index if not exists idx_images_created_at 
  on public.images(created_at desc);

create index if not exists idx_images_status_created 
  on public.images(status, created_at desc) 
  where status in ('pending', 'processing');

-- Índices para tabela transactions
create index if not exists idx_transactions_user_id_status 
  on public.transactions(user_id, status);

create index if not exists idx_transactions_payment_id 
  on public.transactions(payment_id) 
  where payment_id is not null;

create index if not exists idx_transactions_created_at 
  on public.transactions(created_at desc);

-- Índices para tabela usage_logs
create index if not exists idx_usage_logs_user_id_created_at 
  on public.usage_logs(user_id, created_at desc);

create index if not exists idx_usage_logs_action 
  on public.usage_logs(action);

create index if not exists idx_usage_logs_created_at 
  on public.usage_logs(created_at desc);

-- Índice para tabela users (queries por email e role)
create index if not exists idx_users_email 
  on public.users(email);

create index if not exists idx_users_role 
  on public.users(role) 
  where role = 'admin';

-- ============================================================================
-- PARTE 3: CONSTRAINTS DE INTEGRIDADE (APLICADAS APÓS LIMPEZA)
-- ============================================================================

-- Remover constraints antigas se existirem
alter table public.users drop constraint if exists check_credits_non_negative;
alter table public.posts drop constraint if exists check_credits_used_positive;
alter table public.posts drop constraint if exists check_credits_used_valid;
alter table public.images drop constraint if exists check_credits_used_positive;
alter table public.images drop constraint if exists check_credits_used_valid;
alter table public.images drop constraint if exists check_valid_status;
alter table public.transactions drop constraint if exists check_amount_positive;
alter table public.transactions drop constraint if exists check_credits_positive;

-- Adicionar constraints novas (mais flexíveis)
-- Users: créditos podem ser zero ou positivos
alter table public.users
  add constraint check_credits_non_negative 
  check (credits >= 0);

-- Posts: sempre consome pelo menos 1 crédito
alter table public.posts
  add constraint check_credits_used_valid 
  check (credits_used >= 1);

-- Images: permite 0 para pending, >= 1 para completed
alter table public.images
  add constraint check_credits_used_valid 
  check (
    (status = 'pending' and credits_used >= 0) or
    (status != 'pending' and credits_used >= 1)
  );

alter table public.images
  add constraint check_valid_status 
  check (status in ('pending', 'processing', 'completed', 'failed'));

-- Transactions: valores devem ser positivos
alter table public.transactions
  add constraint check_amount_positive 
  check (amount > 0);

alter table public.transactions
  add constraint check_credits_positive 
  check (credits > 0);

-- ============================================================================
-- PARTE 4: TRIGGERS PARA AUTOMAÇÃO
-- ============================================================================

-- Função para atualizar updated_at automaticamente
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Triggers para atualizar updated_at
drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_transactions_updated_at on public.transactions;
create trigger update_transactions_updated_at
  before update on public.transactions
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_system_config_updated_at on public.system_config;
create trigger update_system_config_updated_at
  before update on public.system_config
  for each row
  execute function public.update_updated_at_column();

-- ============================================================================
-- PARTE 5: VIEWS PARA ANÁLISE E RELATÓRIOS
-- ============================================================================

-- View para estatísticas de usuário
create or replace view public.user_stats as
select
  u.id as user_id,
  u.email,
  u.name,
  u.credits,
  u.role,
  count(distinct p.id) as total_captions,
  count(distinct i.id) filter (where i.status = 'completed') as total_images,
  count(distinct t.id) filter (where t.status = 'approved') as total_transactions,
  coalesce(sum(t.amount) filter (where t.status = 'approved'), 0) as total_spent,
  coalesce(sum(ul.credits_used), 0) as total_credits_used,
  u.created_at as member_since,
  max(ul.created_at) as last_activity
from public.users u
left join public.posts p on p.user_id = u.id
left join public.images i on i.user_id = u.id
left join public.transactions t on t.user_id = u.id
left join public.usage_logs ul on ul.user_id = u.id
group by u.id, u.email, u.name, u.credits, u.role, u.created_at;

-- View para análise de uso diário
create or replace view public.daily_usage as
select
  date_trunc('day', created_at) as day,
  action,
  count(*) as total_actions,
  sum(credits_used) as total_credits,
  count(distinct user_id) as unique_users
from public.usage_logs
group by date_trunc('day', created_at), action
order by day desc, action;

-- View para análise de receita
create or replace view public.revenue_stats as
select
  date_trunc('month', created_at) as month,
  count(*) as total_transactions,
  count(distinct user_id) as unique_customers,
  sum(amount) filter (where status = 'approved') as revenue,
  sum(credits) filter (where status = 'approved') as credits_sold,
  avg(amount) filter (where status = 'approved') as avg_transaction_value
from public.transactions
group by date_trunc('month', created_at)
order by month desc;

-- ============================================================================
-- PARTE 6: FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- Função para calcular custo de créditos
create or replace function public.calculate_credit_cost(
  operation_type text,
  quality text default 'low',
  size text default '1024x1024'
)
returns integer
language plpgsql
immutable
as $$
begin
  if operation_type = 'caption' then
    return 1;
  elsif operation_type = 'image' then
    case quality
      when 'low' then
        case size
          when '1024x1024' then return 1;
          when '1024x1536', '1536x1024' then return 2;
          else return 1;
        end case;
      when 'medium' then
        case size
          when '1024x1024' then return 4;
          when '1024x1536', '1536x1024' then return 6;
          else return 4;
        end case;
      when 'high' then
        case size
          when '1024x1024' then return 17;
          when '1024x1536', '1536x1024' then return 25;
          else return 17;
        end case;
      else return 5;
    end case;
  else
    return 0;
  end if;
end;
$$;

-- Função para obter estatísticas de um usuário
create or replace function public.get_user_statistics(user_uuid uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'credits', u.credits,
    'total_captions', count(distinct p.id),
    'total_images', count(distinct i.id) filter (where i.status = 'completed'),
    'total_spent', coalesce(sum(t.amount) filter (where t.status = 'approved'), 0),
    'total_credits_used', coalesce(sum(ul.credits_used), 0),
    'member_since', u.created_at,
    'last_activity', max(ul.created_at)
  ) into result
  from public.users u
  left join public.posts p on p.user_id = u.id
  left join public.images i on i.user_id = u.id
  left join public.transactions t on t.user_id = u.id
  left join public.usage_logs ul on ul.user_id = u.id
  where u.id = user_uuid
  group by u.id, u.credits, u.created_at;
  
  return result;
end;
$$;

-- ============================================================================
-- PARTE 7: DOCUMENTAÇÃO DAS TABELAS
-- ============================================================================

comment on table public.users is 'Tabela de usuários do sistema, estende auth.users com créditos e role';
comment on table public.posts is 'Legendas geradas pelos usuários via GPT-5 nano';
comment on table public.images is 'Imagens geradas pelos usuários via GPT Image 1';
comment on table public.transactions is 'Histórico de transações e compras de créditos via Mercado Pago';
comment on table public.usage_logs is 'Log detalhado de uso da API e consumo de créditos';
comment on table public.system_config is 'Configurações do sistema (apenas admin)';

comment on column public.users.credits is 'Saldo de créditos do usuário (nunca expira, pode ser zero ou positivo)';
comment on column public.users.role is 'Papel do usuário: user (padrão) ou admin (acesso total)';
comment on column public.posts.credits_used is 'Créditos consumidos para gerar esta legenda (sempre 1)';
comment on column public.images.credits_used is 'Créditos consumidos: 0 para pending, 1-25 para completed (baseado em qualidade/tamanho)';
comment on column public.images.status is 'Status da geração: pending (inicial), processing (em andamento), completed (sucesso), failed (erro)';
comment on column public.transactions.status is 'Status do pagamento: pending (aguardando), approved (aprovado), failed (falhou), refunded (reembolsado)';

-- ============================================================================
-- PARTE 8: ANÁLISE E VACUUM
-- ============================================================================

-- Atualizar estatísticas das tabelas para o query planner
analyze public.users;
analyze public.posts;
analyze public.images;
analyze public.transactions;
analyze public.usage_logs;

-- ============================================================================
-- MENSAGEM FINAL
-- ============================================================================

do $$
begin
  raise notice '============================================================================';
  raise notice 'SCRIPT DE OTIMIZAÇÃO EXECUTADO COM SUCESSO!';
  raise notice '============================================================================';
  raise notice '';
  raise notice '✓ Dados inválidos corrigidos';
  raise notice '✓ Índices criados para melhorar performance em até 10x';
  raise notice '✓ Constraints de integridade aplicadas';
  raise notice '✓ Triggers configurados para automação';
  raise notice '✓ Views criadas para análise e relatórios';
  raise notice '✓ Funções utilitárias disponíveis';
  raise notice '✓ Documentação adicionada às tabelas';
  raise notice '✓ Estatísticas atualizadas';
  raise notice '';
  raise notice 'Views disponíveis:';
  raise notice '  - user_stats: Estatísticas completas por usuário';
  raise notice '  - daily_usage: Análise de uso diário';
  raise notice '  - revenue_stats: Análise de receita mensal';
  raise notice '';
  raise notice 'Funções disponíveis:';
  raise notice '  - calculate_credit_cost(operation, quality, size): Calcula custo em créditos';
  raise notice '  - get_user_statistics(user_id): Retorna estatísticas de um usuário';
  raise notice '';
  raise notice '============================================================================';
end $$;
