# Captzio - Plataforma de Geração de Conteúdo com IA

![Captzio](https://img.shields.io/badge/Captzio-v1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Captzio** é a primeira plataforma de IA treinada especificamente para o mercado brasileiro, ajudando criadores de conteúdo, empreendedores e agências a gerar legendas, hashtags e imagens profissionais para redes sociais.

## 🎯 Visão Geral

O Captzio resolve um problema real: ferramentas de IA internacionais não entendem o contexto cultural brasileiro, gírias e expressões locais. Nossa plataforma foi desenvolvida do zero pensando no público brasileiro, oferecendo:

- **IA em Português Brasileiro Nativo**: Entende gírias, expressões e contexto cultural
- **Geração de Legendas**: Crie legendas envolventes com hashtags e CTAs otimizados
- **Geração de Imagens**: Crie imagens profissionais com GPT Image 1
- **Sistema de Créditos**: Pague apenas pelo que usar, sem mensalidades
- **Memória de Marca**: A IA aprende o estilo único da sua marca

## 🚀 Tecnologias

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **Linguagem**: TypeScript 5.0
- **Estilização**: Tailwind CSS v4 + shadcn/ui
- **Fontes**: Inter (body) + Poppins (display)
- **Ícones**: Lucide React
- **Animações**: CSS Animations + Framer Motion

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Autenticação**: Supabase Auth (email/password + OAuth)
- **Validação**: Zod + Custom validators

### Banco de Dados
- **Database**: PostgreSQL 15 (Supabase)
- **Queries**: SQL direto (sem ORM para melhor performance)
- **Migrations**: Scripts SQL versionados
- **RLS**: Row Level Security habilitado em todas as tabelas

### Integrações
- **IA**: OpenAI API
  - GPT-5 nano para legendas (rápido e econômico)
  - GPT Image 1 para imagens (qualidade profissional)
- **Pagamentos**: Mercado Pago (PIX, Cartão, Boleto)
- **Storage**: Vercel Blob (imagens geradas)
- **Cache**: Upstash Redis
- **Search**: Upstash Vector Search

### DevOps
- **Hospedagem**: Vercel
- **CI/CD**: GitHub Actions + Vercel
- **Monitoramento**: Vercel Analytics
- **Logs**: Console logs estruturados

## 📋 Pré-requisitos

- Node.js 18+ e pnpm 9+
- Conta Supabase (banco de dados + auth)
- Conta OpenAI (API key)
- Conta Mercado Pago (pagamentos)
- Conta Vercel (deploy)

## 🔧 Instalação Local

### 1. Clone o repositório
\`\`\`bash
git clone https://github.com/seu-usuario/captzio.git
cd captzio
\`\`\`

### 2. Instale as dependências
\`\`\`bash
pnpm install
\`\`\`

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local`:

\`\`\`env
# Supabase (Database + Auth)
SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# OpenAI
OPENAI_API_KEY=sk-proj-sua_chave_openai

# Mercado Pago
MP_ACCESS_TOKEN=seu_access_token
MP_WEBHOOK_SECRET=seu_webhook_secret

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Admin
ADMIN_EMAIL=admin@captzio.com
\`\`\`

### 4. Configure o banco de dados

Execute os scripts SQL na ordem no Supabase SQL Editor:

\`\`\`bash
1. scripts/001_create_tables.sql
2. scripts/004_patch_images_schema_and_policies.sql
3. scripts/005_optimize_database.sql
\`\`\`

### 5. Inicie o servidor de desenvolvimento

\`\`\`bash
pnpm dev
\`\`\`

Acesse [http://localhost:3000](http://localhost:3000)

## 🎯 Estrutura do Projeto

\`\`\`
captzio/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── logout/
│   │   └── verify-email/
│   ├── dashboard/                # Dashboard do usuário
│   │   ├── generate-caption/    # Gerar legendas
│   │   ├── generate-image/      # Gerar imagens
│   │   ├── library/             # Biblioteca de legendas
│   │   ├── images/              # Galeria de imagens
│   │   ├── buy-credits/         # Comprar créditos
│   │   └── ...
│   ├── admin/                    # Painel administrativo
│   ├── api/                      # API Routes
│   │   ├── generate-caption/    # API de legendas
│   │   ├── generate-image/      # API de imagens
│   │   ├── save-caption/        # Salvar legenda
│   │   ├── image-job/[id]/      # Status de job de imagem
│   │   └── webhook/             # Webhooks
│   ├── about/                    # Páginas informacionais
│   ├── pricing/
│   ├── features/
│   ├── faq/
│   ├── help/
│   ├── contact/
│   ├── terms/
│   ├── privacy/
│   ├── layout.tsx                # Layout raiz
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Estilos globais
├── components/                   # Componentes React
│   ├── ui/                       # shadcn/ui components
│   ├── logo.tsx                  # Logo do Captzio
│   ├── error-boundary.tsx        # Error boundary
│   └── ...
├── lib/                          # Utilitários
│   ├── supabase/                # Cliente Supabase
│   ├── config.ts                # Configurações
│   ├── validation.ts            # Validações
│   ├── performance.ts           # Utilitários de performance
│   ├── accessibility.ts         # Utilitários de acessibilidade
│   ├── analytics.ts             # Analytics
│   └── types.ts                 # Tipos TypeScript
├── scripts/                      # Scripts SQL
│   ├── 001_create_tables.sql
│   ├── 004_patch_images_schema_and_policies.sql
│   └── 005_optimize_database.sql
├── public/                       # Arquivos estáticos
└── middleware.ts                 # Middleware Next.js
\`\`\`

## 💳 Sistema de Créditos

### Custos por Operação
- **1 crédito** = 1 legenda com hashtags e CTA
- **1-25 créditos** = 1 imagem (varia por qualidade e tamanho)
  - Low quality 1024x1024: 1 crédito
  - Medium quality 1024x1024: 4 créditos
  - High quality 1024x1024: 17 créditos

### Pacotes Disponíveis
1. **Básico**: R$ 19,90 → 50 créditos
2. **Profissional**: R$ 49,90 → 150 créditos + 10 bônus
3. **Empresarial**: R$ 149,90 → 500 créditos + 50 bônus

### Características
- Créditos **nunca expiram**
- Sem mensalidades ou assinaturas
- Novos usuários ganham **2 créditos grátis**
- Admin tem créditos ilimitados

## 🎨 Design System

### Cores
- **Primary**: #2563EB (Captzio Blue)
- **Accent**: #EAB308 (Brazilian Gold)
- **Background**: #F9FAFB (Very light gray)
- **Foreground**: #111827 (Soft black)
- **Muted**: #6B7280 (Medium gray)

### Tipografia
- **Body**: Inter (sans-serif)
- **Display**: Poppins (headings)
- **Line Height**: 1.5-1.6 (relaxed)

### Componentes
- Todos os componentes usam shadcn/ui
- Design consistente em todas as páginas
- Responsivo mobile-first
- Acessibilidade WCAG 2.1 AA

## 🔐 Segurança

### Autenticação
- Supabase Auth com email/password
- Verificação de email obrigatória
- Tokens JWT com refresh automático
- Logout seguro com limpeza de sessão

### Row Level Security (RLS)
- Habilitado em todas as tabelas
- Usuários só acessam seus próprios dados
- Admin tem acesso total via role check
- Policies testadas e validadas

### API
- Validação de entrada com Zod
- Rate limiting básico
- Sanitização de dados
- Logs de erro estruturados

## 📊 Banco de Dados

### Tabelas Principais
- **users**: Usuários do sistema (estende auth.users)
- **posts**: Legendas geradas
- **images**: Imagens geradas
- **transactions**: Histórico de pagamentos
- **usage_logs**: Log de uso da API
- **system_config**: Configurações do sistema

### Otimizações
- Índices em colunas frequentemente consultadas
- Constraints para integridade de dados
- Triggers para atualização automática de timestamps
- View materializada para estatísticas
- Função para cálculo de custos

## 🚀 Deploy na Vercel

### 1. Conecte o repositório
\`\`\`bash
git push origin main
\`\`\`

### 2. Configure na Vercel
1. Importe o projeto do GitHub
2. Adicione todas as variáveis de ambiente
3. Deploy automático

### 3. Configure o domínio
1. Adicione domínio customizado
2. Configure DNS
3. SSL automático

## 💰 Custos Estimados

### Pequena Escala (0-100 usuários/mês)
| Serviço | Custo |
|---------|-------|
| Vercel Hobby | R$ 0 |
| Supabase Free | R$ 0 |
| OpenAI API | ~R$ 50-200 |
| Mercado Pago | 4-6% por transação |
| **TOTAL** | **~R$ 50-200/mês** |

### Média Escala (100-1.000 usuários/mês)
| Serviço | Custo |
|---------|-------|
| Vercel Pro | R$ 100 |
| Supabase Pro | R$ 125 |
| OpenAI API | ~R$ 500-2.000 |
| Mercado Pago | 4-6% por transação |
| Upstash Redis | ~R$ 50 |
| **TOTAL** | **~R$ 775-2.275/mês** |

### Grande Escala (1.000-10.000 usuários/mês)
| Serviço | Custo |
|---------|-------|
| Vercel Enterprise | R$ 500+ |
| Supabase Team | R$ 500+ |
| OpenAI API | ~R$ 5.000-20.000 |
| Mercado Pago | 4-6% por transação |
| Upstash Redis | ~R$ 200 |
| CDN/Storage | ~R$ 100 |
| **TOTAL** | **~R$ 6.300-21.300/mês** |

## ⚠️ Limitações Atuais

### Técnicas
- Rate limiting básico (vulnerável a abuso)
- Sem cache de respostas da IA
- Geração de imagens síncrona (pode dar timeout)
- Logs básicos (apenas console.log)
- Sem backup automatizado
- Sem CDN para imagens

### Funcionais
- Sem edição de conteúdo salvo
- Sem compartilhamento de conteúdo
- Sem agendamento de posts
- Sem integração direta com redes sociais
- Sem análise de engajamento
- Sem suporte a equipes
- Sem API pública

### Segurança
- Sem 2FA
- Sem CAPTCHA
- Sem WAF
- Sem DDoS protection avançado
- Sem auditoria de segurança profissional

## 🎯 Roadmap

### Curto Prazo (1-3 meses)
- [ ] Rate limiting robusto com Upstash Redis
- [ ] Cache de respostas da IA (reduzir custos 30-50%)
- [ ] Fila de jobs com BullMQ
- [ ] Testes unitários (Jest) e E2E (Playwright)
- [ ] Sistema de logs estruturado (Axiom)
- [ ] 2FA com TOTP
- [ ] Onboarding interativo
- [ ] Edição de conteúdo salvo
- [ ] CAPTCHA (hCaptcha)

### Médio Prazo (3-6 meses)
- [ ] Integração com Instagram API
- [ ] Integração com TikTok API
- [ ] Agendamento de posts
- [ ] Análise de engajamento
- [ ] Suporte a equipes
- [ ] API pública
- [ ] Exportação em massa
- [ ] CDN para imagens (Cloudflare R2)
- [ ] Backup automatizado
- [ ] Monitoramento APM (Sentry)

### Longo Prazo (6-12 meses)
- [ ] App mobile nativo (React Native)
- [ ] Análise preditiva com ML
- [ ] Geração de vídeos curtos
- [ ] Marketplace de templates
- [ ] Programa de afiliados
- [ ] Suporte multi-idioma
- [ ] Expansão América Latina
- [ ] White-label para agências

## 📈 Métricas de Sucesso

### KPIs Principais
- Taxa de Conversão: % de visitantes que se cadastram
- Taxa de Ativação: % de usuários que geram conteúdo
- Retenção D7/D30: % de usuários que voltam
- LTV (Lifetime Value): Valor médio por usuário
- CAC (Customer Acquisition Cost): Custo de aquisição
- Churn Rate: % de usuários inativos

### Metas Iniciais (3 meses)
- 1.000 usuários cadastrados
- 500 usuários ativos mensais
- R$ 10.000 em receita mensal
- Taxa de conversão de 5%
- Retenção D30 de 40%

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@captzio.com
- **Website**: [captzio.vercel.app](https://captzio.vercel.app)
- **GitHub**: [github.com/seu-usuario/captzio](https://github.com/seu-usuario/captzio)

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [OpenAI](https://openai.com/) - API de IA
- [Vercel](https://vercel.com/) - Hospedagem

---

**Feito com ❤️ no Brasil 🇧🇷**

*Captzio - A primeira IA que entende o Brasil*
