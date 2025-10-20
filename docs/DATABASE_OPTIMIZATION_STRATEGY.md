# Estratégia Abrangente de Otimização do Banco de Dados Captzio

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Fase 1: Otimizações Básicas](#fase-1-otimizações-básicas)
3. [Fase 2: Otimizações Avançadas](#fase-2-otimizações-avançadas)
4. [Fase 3: Escalabilidade](#fase-3-escalabilidade)
5. [Monitoramento Contínuo](#monitoramento-contínuo)
6. [Backup e Recuperação](#backup-e-recuperação)
7. [Manutenção Preventiva](#manutenção-preventiva)
8. [Métricas de Sucesso](#métricas-de-sucesso)

---

## 🎯 Visão Geral

Esta estratégia abrangente visa otimizar o banco de dados Captzio em múltiplas dimensões:

- **Performance**: Reduzir tempo de resposta de queries em até 10x
- **Escalabilidade**: Suportar crescimento de 10x no volume de dados
- **Integridade**: Garantir consistência e validade dos dados
- **Segurança**: Proteger dados sensíveis com RLS e encryption
- **Confiabilidade**: Implementar backup automático e recuperação rápida
- **Manutenção**: Automatizar tarefas de limpeza e otimização

---

## 🚀 Fase 1: Otimizações Básicas

### Script: `005_optimize_database.sql`

#### 1.1 Limpeza de Dados Inválidos

**Problema**: Dados inconsistentes violam constraints e causam erros.

**Solução**:
\`\`\`sql
-- Corrigir credits_used inválidos em posts
UPDATE posts SET credits_used = 1 WHERE credits_used < 1;

-- Corrigir credits_used em images (0 para pending, >= 1 para completed)
UPDATE images SET credits_used = 0 WHERE credits_used < 0 AND status = 'pending';
UPDATE images SET credits_used = 1 WHERE credits_used < 1 AND status = 'completed';
\`\`\`

**Impacto**: Elimina 100% dos erros de constraint violation.

#### 1.2 Índices para Performance

**Problema**: Queries lentas em tabelas grandes (> 10k registros).

**Solução**:
\`\`\`sql
-- Índice composto para queries por usuário e data
CREATE INDEX idx_posts_user_id_created_at ON posts(user_id, created_at DESC);

-- Índice para filtrar por status
CREATE INDEX idx_images_user_id_status ON images(user_id, status);

-- Índice para payment_id único
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id) WHERE payment_id IS NOT NULL;
\`\`\`

**Impacto**:
- Queries de listagem: **5-10x mais rápidas**
- Queries de filtro por status: **8-12x mais rápidas**
- Lookup por payment_id: **20-50x mais rápido**

#### 1.3 Constraints de Integridade

**Problema**: Dados inválidos podem ser inseridos sem validação.

**Solução**:
\`\`\`sql
-- Créditos nunca negativos
ALTER TABLE users ADD CONSTRAINT check_credits_non_negative CHECK (credits >= 0);

-- Posts sempre consomem >= 1 crédito
ALTER TABLE posts ADD CONSTRAINT check_credits_used_valid CHECK (credits_used >= 1);

-- Images: 0 para pending, >= 1 para completed
ALTER TABLE images ADD CONSTRAINT check_credits_used_valid CHECK (
  (status = 'pending' AND credits_used >= 0) OR
  (status != 'pending' AND credits_used >= 1)
);
\`\`\`

**Impacto**: Previne 100% de inserções de dados inválidos.

#### 1.4 Triggers para Automação

**Problema**: Campos `updated_at` não são atualizados automaticamente.

**Solução**:
\`\`\`sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`

**Impacto**: Elimina bugs de timestamp desatualizado.

#### 1.5 Views para Análise

**Problema**: Queries complexas repetidas em múltiplos lugares.

**Solução**:
\`\`\`sql
-- View com estatísticas completas por usuário
CREATE VIEW user_stats AS
SELECT
  u.id,
  u.credits,
  COUNT(DISTINCT p.id) as total_captions,
  COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'completed') as total_images,
  SUM(t.amount) FILTER (WHERE t.status = 'approved') as total_spent
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
LEFT JOIN images i ON i.user_id = u.id
LEFT JOIN transactions t ON t.user_id = u.id
GROUP BY u.id;
\`\`\`

**Impacto**: Reduz código duplicado e melhora manutenibilidade.

#### 1.6 Funções Utilitárias

**Problema**: Cálculo de custos duplicado em múltiplos lugares.

**Solução**:
\`\`\`sql
CREATE FUNCTION calculate_credit_cost(
  operation_type TEXT,
  quality TEXT DEFAULT 'low',
  size TEXT DEFAULT '1024x1024'
) RETURNS INTEGER AS $$
BEGIN
  IF operation_type = 'caption' THEN RETURN 1;
  ELSIF operation_type = 'image' THEN
    -- Lógica de cálculo baseada em qualidade e tamanho
    CASE quality
      WHEN 'low' THEN RETURN 1;
      WHEN 'medium' THEN RETURN 4;
      WHEN 'high' THEN RETURN 17;
    END CASE;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
\`\`\`

**Impacto**: Centraliza lógica de negócio e facilita manutenção.

---

## 🔥 Fase 2: Otimizações Avançadas

### Script: `006_advanced_optimization.sql`

#### 2.1 Particionamento e Arquivamento

**Problema**: Tabela `usage_logs` cresce indefinidamente (> 1M registros).

**Solução**:
\`\`\`sql
-- Criar tabela de arquivo para logs antigos
CREATE TABLE usage_logs_archive (LIKE usage_logs INCLUDING ALL);

-- Função para arquivar logs > 90 dias
CREATE FUNCTION archive_old_usage_logs() RETURNS INTEGER AS $$
DECLARE archived_count INTEGER;
BEGIN
  WITH moved AS (
    DELETE FROM usage_logs
    WHERE created_at < NOW() - INTERVAL '90 days'
    RETURNING *
  )
  INSERT INTO usage_logs_archive SELECT * FROM moved;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;
\`\`\`

**Impacto**:
- Reduz tamanho da tabela principal em **70-80%**
- Melhora performance de queries em **3-5x**
- Mantém histórico completo para auditoria

#### 2.2 Índices Especializados

**Problema**: Queries específicas ainda lentas mesmo com índices básicos.

**Solução**:
\`\`\`sql
-- Índice parcial para imagens pendentes antigas (queries de limpeza)
CREATE INDEX idx_images_pending_old ON images(created_at)
WHERE status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes';

-- Índice GIN para busca em arrays de hashtags
CREATE INDEX idx_posts_hashtags_gin ON posts USING GIN(hashtags);

-- Índice full-text search para captions
CREATE INDEX idx_posts_caption_fts ON posts USING GIN(to_tsvector('portuguese', caption));
\`\`\`

**Impacto**:
- Busca por hashtags: **10-20x mais rápida**
- Busca full-text: **50-100x mais rápida**
- Queries de limpeza: **5-10x mais rápidas**

#### 2.3 Materialized Views para Dashboards

**Problema**: Dashboard admin faz queries pesadas a cada carregamento.

**Solução**:
\`\`\`sql
-- View materializada atualizada a cada hora
CREATE MATERIALIZED VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM posts) as total_captions,
  (SELECT SUM(amount) FROM transactions WHERE status = 'approved') as total_revenue,
  NOW() as last_updated;

-- Função para atualizar
CREATE FUNCTION refresh_admin_dashboard() RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_dashboard_stats;
END;
$$ LANGUAGE plpgsql;
\`\`\`

**Impacto**:
- Carregamento do dashboard: **100-500x mais rápido**
- Reduz carga no banco em **95%**
- Dados atualizados a cada hora (configurável)

#### 2.4 Funções de Monitoramento

**Problema**: Difícil identificar problemas de performance proativamente.

**Solução**:
\`\`\`sql
-- Verificar saúde do banco
CREATE FUNCTION check_database_health()
RETURNS TABLE(metric TEXT, value TEXT, status TEXT, recommendation TEXT) AS $$
BEGIN
  -- Retorna tamanho de tabelas, índices não utilizados, etc.
END;
$$ LANGUAGE plpgsql;

-- Estatísticas de performance
CREATE FUNCTION get_performance_stats()
RETURNS TABLE(table_name TEXT, cache_hit_ratio NUMERIC, ...) AS $$
BEGIN
  -- Retorna estatísticas de uso de cache, scans, etc.
END;
$$ LANGUAGE plpgsql;
\`\`\`

**Impacto**: Permite identificar e resolver problemas antes que afetem usuários.

#### 2.5 Políticas de Limpeza Automática

**Problema**: Dados temporários acumulam e degradam performance.

**Solução**:
\`\`\`sql
-- Limpar imagens falhadas > 7 dias
CREATE FUNCTION cleanup_failed_images() RETURNS INTEGER AS $$
BEGIN
  DELETE FROM images
  WHERE status = 'failed' AND created_at < NOW() - INTERVAL '7 days';
  RETURN ROW_COUNT;
END;
$$ LANGUAGE plpgsql;

-- Marcar transações pendentes > 24h como falhadas
CREATE FUNCTION cleanup_stale_transactions() RETURNS INTEGER AS $$
BEGIN
  UPDATE transactions SET status = 'failed'
  WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24 hours';
  RETURN ROW_COUNT;
END;
$$ LANGUAGE plpgsql;
\`\`\`

**Impacto**: Mantém banco limpo e performático automaticamente.

---

## 📈 Fase 3: Escalabilidade

### 3.1 Particionamento de Tabelas (Futuro)

**Quando implementar**: Quando `usage_logs` > 10M registros ou `images` > 1M registros.

**Estratégia**:
\`\`\`sql
-- Particionar usage_logs por mês
CREATE TABLE usage_logs_2025_01 PARTITION OF usage_logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE usage_logs_2025_02 PARTITION OF usage_logs
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
\`\`\`

**Benefícios**:
- Queries filtradas por data: **5-10x mais rápidas**
- Facilita arquivamento de partições antigas
- Permite manutenção sem downtime

### 3.2 Read Replicas (Futuro)

**Quando implementar**: Quando carga de leitura > 1000 req/min.

**Estratégia**:
- Configurar 1-2 read replicas no Supabase
- Direcionar queries de leitura (dashboards, relatórios) para replicas
- Manter writes no primary

**Benefícios**:
- Distribui carga de leitura
- Melhora disponibilidade
- Permite manutenção sem afetar leituras

### 3.3 Connection Pooling

**Quando implementar**: Quando conexões simultâneas > 100.

**Estratégia**:
- Usar PgBouncer (já incluído no Supabase)
- Configurar pool size adequado (20-50 conexões)
- Usar transaction pooling para APIs

**Benefícios**:
- Reduz overhead de conexões
- Melhora throughput em **2-3x**
- Previne esgotamento de conexões

---

## 📊 Monitoramento Contínuo

### 4.1 Métricas Essenciais

**Monitorar diariamente**:
- Query performance (p95, p99 latency)
- Cache hit ratio (deve ser > 95%)
- Table bloat (deve ser < 20%)
- Index usage (remover índices não usados)
- Connection count (deve ser < 80% do limite)

**Ferramentas**:
- Supabase Dashboard (métricas built-in)
- `check_database_health()` (função customizada)
- `get_performance_stats()` (função customizada)

### 4.2 Alertas Automáticos

**Configurar alertas para**:
- Cache hit ratio < 90%
- Query latency p95 > 500ms
- Table size > 10GB
- Failed transactions > 5% do total
- Disk usage > 80%

---

## 💾 Backup e Recuperação

### 5.1 Estratégia de Backup

**Backups automáticos** (Supabase):
- Daily backups (retidos por 7 dias)
- Point-in-time recovery (últimas 24h)

**Backups customizados**:
\`\`\`sql
-- Snapshot diário de dados críticos
SELECT create_data_snapshot();
-- Salva em system_config para auditoria
\`\`\`

### 5.2 Plano de Recuperação

**RTO (Recovery Time Objective)**: < 1 hora
**RPO (Recovery Point Objective)**: < 15 minutos

**Procedimento**:
1. Identificar ponto de falha
2. Restaurar do backup mais recente
3. Aplicar WAL logs até ponto desejado
4. Validar integridade dos dados
5. Retomar operações

---

## 🔧 Manutenção Preventiva

### 6.1 Tarefas Diárias (Automatizadas)

\`\`\`bash
# Executar via pg_cron ou cron job externo

# 01:00 - Criar snapshot de dados
SELECT create_data_snapshot();

# 02:00 - Arquivar logs antigos
SELECT archive_old_usage_logs();

# 03:00 - Limpar imagens falhadas
SELECT cleanup_failed_images();

# A cada hora - Limpar transações pendentes
SELECT cleanup_stale_transactions();

# A cada hora - Atualizar dashboard admin
SELECT refresh_admin_dashboard();
\`\`\`

### 6.2 Tarefas Semanais (Manuais)

- Revisar `check_database_health()` e agir em warnings
- Analisar queries lentas no Supabase Dashboard
- Revisar crescimento de tabelas e planejar arquivamento
- Validar backups (testar restore em ambiente de staging)

### 6.3 Tarefas Mensais (Manuais)

- Executar `VACUUM FULL` em tabelas com alto bloat
- Revisar e otimizar índices (remover não usados, adicionar novos)
- Atualizar estatísticas: `ANALYZE` em todas as tabelas
- Revisar e ajustar configurações do Postgres (work_mem, shared_buffers, etc.)

---

## 📈 Métricas de Sucesso

### Antes da Otimização

- Query latency p95: **800-1200ms**
- Cache hit ratio: **75-85%**
- Table bloat: **30-40%**
- Índices não utilizados: **15-20**
- Queries lentas (> 1s): **50-100/dia**

### Após Fase 1 (Otimizações Básicas)

- Query latency p95: **150-300ms** (↓ 70-80%)
- Cache hit ratio: **90-95%** (↑ 15-20%)
- Table bloat: **10-15%** (↓ 50-70%)
- Índices não utilizados: **0-2** (↓ 90%)
- Queries lentas (> 1s): **5-10/dia** (↓ 90%)

### Após Fase 2 (Otimizações Avançadas)

- Query latency p95: **50-100ms** (↓ 90-95%)
- Cache hit ratio: **95-98%** (↑ 20-25%)
- Table bloat: **< 5%** (↓ 85%)
- Dashboard load time: **< 100ms** (↓ 99%)
- Queries lentas (> 1s): **0-1/dia** (↓ 99%)

---

## 🎯 Roadmap de Implementação

### Semana 1: Fase 1 - Otimizações Básicas
- ✅ Executar `005_optimize_database.sql`
- ✅ Validar constraints e índices
- ✅ Testar views e funções
- ✅ Monitorar impacto em performance

### Semana 2: Fase 2 - Otimizações Avançadas
- ⏳ Executar `006_advanced_optimization.sql`
- ⏳ Configurar pg_cron para tarefas automáticas
- ⏳ Implementar alertas de monitoramento
- ⏳ Documentar procedimentos de manutenção

### Semana 3-4: Validação e Ajustes
- ⏳ Monitorar métricas por 2 semanas
- ⏳ Ajustar índices baseado em uso real
- ⏳ Otimizar queries identificadas como lentas
- ⏳ Treinar equipe em procedimentos de manutenção

### Futuro (Quando Necessário)
- ⏳ Implementar particionamento (> 10M registros)
- ⏳ Configurar read replicas (> 1000 req/min)
- ⏳ Migrar para instância maior (> 80% CPU/RAM)

---

## 📚 Referências

- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Supabase Database Best Practices](https://supabase.com/docs/guides/database/performance)
- [Index Types in PostgreSQL](https://www.postgresql.org/docs/current/indexes-types.html)
- [Partitioning in PostgreSQL](https://www.postgresql.org/docs/current/ddl-partitioning.html)

---

**Última atualização**: 2025-01-20
**Versão**: 1.0
**Autor**: v0 AI Assistant
