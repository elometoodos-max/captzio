# Captzio - Plataforma de Geração de Conteúdo com IA

![Captzio Logo](public/logo.png)

**Captzio** é a primeira plataforma de IA treinada especificamente para o mercado brasileiro, ajudando criadores de conteúdo, empreendedores e agências a gerar legendas, hashtags e imagens profissionais para redes sociais.

## 🚀 Características Principais

- **IA em Português Brasileiro Nativo**: Entende gírias, expressões e contexto cultural brasileiro
- **Geração de Legendas**: Crie legendas envolventes com hashtags e CTAs otimizados
- **Geração de Imagens**: Crie imagens profissionais com DALL-E 3 (1024x1024)
- **Memória de Marca**: A IA aprende o estilo único da sua marca
- **Sistema de Créditos**: Pague apenas pelo que usar, sem mensalidades
- **Gamificação**: Sistema de conquistas com recompensas
- **Painel Admin**: Gerenciamento completo de usuários e sistema
- **Pagamentos Seguros**: Integração com Mercado Pago (PIX, Cartão, Boleto)

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4 + shadcn/ui
- **Fontes**: Inter (body) + Poppins (headings)
- **Ícones**: Lucide React
- **Animações**: CSS Animations + Transitions

### Backend
- **Runtime**: Node.js 18+
- **API Routes**: Next.js API Routes
- **Autenticação**: Supabase Auth
- **Validação**: Zod + Custom validators

### Banco de Dados
- **Database**: PostgreSQL (Supabase)
- **ORM**: SQL direto (sem ORM para melhor performance)
- **Migrations**: Scripts SQL versionados

### Integrações
- **IA**: OpenAI API (GPT-4o-mini para legendas, DALL-E 3 para imagens)
- **Pagamentos**: Mercado Pago API
- **Storage**: Vercel Blob (para imagens geradas)
- **Cache**: Upstash Redis
- **Search**: Upstash Vector Search

### DevOps
- **Hospedagem**: Vercel
- **CI/CD**: GitHub Actions + Vercel
- **Monitoramento**: Vercel Analytics
- **Logs**: Console logs (produção)

## 📋 Pré-requisitos

- Node.js 18+ e pnpm
- Conta Supabase (banco de dados PostgreSQL)
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

Crie um arquivo `.env.local` com as seguintes variáveis:

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
MP_ACCESS_TOKEN=seu_access_token_mercadopago
MP_WEBHOOK_SECRET=seu_webhook_secret

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Admin
ADMIN_EMAIL=admin@captzio.com
\`\`\`

### 4. Configure o banco de dados

Execute os scripts SQL na ordem:

\`\`\`bash
# No Supabase SQL Editor, execute:
# 1. scripts/001_create_tables.sql
# 2. scripts/002_create_functions.sql
# 3. scripts/003_seed_data.sql
# 4. scripts/004_create_admin_user.sql
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
│   ├── (auth)/                   # Páginas de autenticação
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
│   │   ├── profile/             # Perfil do usuário
│   │   ├── settings/            # Configurações
│   │   ├── stats/               # Estatísticas
│   │   ├── brand-style/         # Estilo de marca
│   │   ├── achievements/        # Conquistas
│   │   └── transactions/        # Histórico de transações
│   ├── admin/                    # Painel administrativo
│   │   ├── login/               # Login admin
│   │   ├── users/               # Gerenciar usuários
│   │   ├── transactions/        # Ver transações
│   │   └── config/              # Configurações do sistema
│   ├── api/                      # API Routes
│   │   ├── generate-caption/    # API de legendas
│   │   ├── generate-image/      # API de imagens
│   │   ├── check-job/           # Verificar status de job
│   │   └── webhook/             # Webhooks (Mercado Pago)
│   ├── about/                    # Sobre nós
│   ├── pricing/                  # Preços
│   ├── features/                 # Recursos
│   ├── faq/                      # Perguntas frequentes
│   ├── help/                     # Central de ajuda
│   ├── contact/                  # Contato
│   ├── terms/                    # Termos de uso
│   ├── privacy/                  # Política de privacidade
│   ├── not-found.tsx             # Página 404
│   ├── layout.tsx                # Layout raiz
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Estilos globais
├── components/                   # Componentes React
│   ├── ui/                       # Componentes shadcn/ui
│   ├── logo.tsx                  # Logo do Captzio
│   └── dashboard-header.tsx     # Header do dashboard
├── lib/                          # Utilitários
│   ├── supabase/                # Cliente Supabase
│   ├── config.ts                # Configurações
│   ├── validation.ts            # Validações
│   ├── error-handler.ts         # Tratamento de erros
│   ├── rate-limit.ts            # Rate limiting
│   └── types.ts                 # Tipos TypeScript
├── scripts/                      # Scripts SQL
│   ├── 001_create_tables.sql
│   ├── 002_create_functions.sql
│   ├── 003_seed_data.sql
│   └── 004_create_admin_user.sql
├── public/                       # Arquivos estáticos
└── middleware.ts                 # Middleware Next.js
\`\`\`

## 💳 Sistema de Créditos

### Custos por Operação
- **1 crédito** = 1 legenda com hashtags e CTA
- **5 créditos** = 1 imagem em alta qualidade (1024x1024)

### Pacotes Disponíveis
1. **Básico**: R$ 19,90 → 50 créditos
2. **Profissional**: R$ 49,90 → 150 créditos + 10 bônus
3. **Empresarial**: R$ 149,90 → 500 créditos + 50 bônus

### Características
- Créditos **nunca expiram**
- Sem mensalidades ou assinaturas
- Novos usuários ganham **2 créditos grátis**

## 🔐 Credenciais Padrão

### Admin
- **Email**: admin@captzio.com
- **Senha**: admin123

**⚠️ IMPORTANTE**: Altere essas credenciais em produção!

## 🚀 Deploy na Vercel

### 1. Conecte o repositório
1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe o projeto do GitHub

### 2. Configure as variáveis de ambiente
Adicione todas as variáveis do `.env.local` na seção "Environment Variables" da Vercel

### 3. Deploy
A Vercel fará o deploy automaticamente a cada push na branch `main`

## 💰 Custos Estimados por Escala

### Pequena Escala (0-100 usuários/mês)
| Serviço | Plano | Custo Mensal |
|---------|-------|--------------|
| Vercel | Hobby (grátis) | R$ 0 |
| Supabase | Free Tier | R$ 0 |
| OpenAI API | Pay-as-you-go | ~R$ 50-200 |
| Mercado Pago | Taxa por transação (4-6%) | Variável |
| Upstash Redis | Free Tier | R$ 0 |
| **TOTAL** | | **~R$ 50-200/mês** |

### Média Escala (100-1.000 usuários/mês)
| Serviço | Plano | Custo Mensal |
|---------|-------|--------------|
| Vercel | Pro | R$ 100 |
| Supabase | Pro | R$ 125 |
| OpenAI API | Pay-as-you-go | ~R$ 500-2.000 |
| Mercado Pago | Taxa por transação | Variável |
| Upstash Redis | Pay-as-you-go | ~R$ 50 |
| **TOTAL** | | **~R$ 775-2.275/mês** |

### Grande Escala (1.000-10.000 usuários/mês)
| Serviço | Plano | Custo Mensal |
|---------|-------|--------------|
| Vercel | Enterprise | R$ 500+ |
| Supabase | Team/Enterprise | R$ 500+ |
| OpenAI API | Pay-as-you-go | ~R$ 5.000-20.000 |
| Mercado Pago | Taxa por transação | Variável |
| Upstash Redis | Pay-as-you-go | ~R$ 200 |
| CDN/Storage | Cloudflare R2 | ~R$ 100 |
| **TOTAL** | | **~R$ 6.300-21.300/mês** |

### Notas sobre Custos
- **OpenAI API**: Maior custo variável. Depende do uso (legendas vs imagens)
- **Mercado Pago**: Taxa de 4-6% por transação + R$ 0,40 por boleto
- **Vercel**: Pode ser substituído por VPS (mais barato em grande escala)
- **Supabase**: Pode ser substituído por PostgreSQL gerenciado (Railway, Neon)

## ⚠️ Limitações Atuais

### Técnicas
1. **Sem Rate Limiting Robusto**: Implementação básica, vulnerável a abuso
2. **Sem Cache de Respostas**: Cada geração consome API, aumentando custos
3. **Sem Fila de Jobs**: Imagens são geradas síncronamente (pode dar timeout)
4. **Sem Monitoramento**: Falta APM (Application Performance Monitoring)
5. **Sem Testes Automatizados**: Sem testes unitários ou E2E
6. **Logs Básicos**: Apenas console.log, sem sistema de logs estruturado
7. **Sem Backup Automatizado**: Banco de dados sem backup automático
8. **Sem CDN para Imagens**: Imagens servidas diretamente do Vercel Blob

### Funcionais
1. **Sem Edição de Conteúdo**: Usuários não podem editar legendas/imagens salvas
2. **Sem Compartilhamento**: Não há opção de compartilhar conteúdo gerado
3. **Sem Agendamento**: Não é possível agendar posts
4. **Sem Integração Direta**: Não posta automaticamente nas redes sociais
5. **Sem Análise de Engajamento**: Não rastreia performance dos posts
6. **Sem Equipes**: Cada conta é individual, sem colaboração
7. **Sem API Pública**: Não há API para integrações externas
8. **Sem Exportação em Massa**: Não é possível exportar todo o histórico

### Segurança
1. **Sem 2FA**: Autenticação de dois fatores não implementada
2. **Sem CAPTCHA**: Vulnerável a bots em formulários
3. **Sem WAF**: Sem Web Application Firewall
4. **Sem DDoS Protection**: Proteção básica da Vercel apenas
5. **Sem Auditoria de Segurança**: Código não auditado profissionalmente

### UX/UI
1. **Sem Dark Mode Completo**: Implementação parcial
2. **Sem Onboarding**: Novos usuários não têm tutorial
3. **Sem Notificações Push**: Apenas notificações in-app básicas
4. **Sem Modo Offline**: Requer conexão constante
5. **Sem PWA**: Não funciona como app instalável

## 🎯 Roadmap de Melhorias

### Curto Prazo (1-3 meses)
- [ ] Implementar rate limiting robusto com Upstash Redis
- [ ] Adicionar cache de respostas da IA (reduzir custos em 30-50%)
- [ ] Implementar fila de jobs com BullMQ ou Inngest
- [ ] Adicionar testes unitários (Jest) e E2E (Playwright)
- [ ] Implementar sistema de logs estruturado (Axiom ou Logtail)
- [ ] Adicionar 2FA com TOTP
- [ ] Criar onboarding interativo para novos usuários
- [ ] Implementar edição de conteúdo salvo
- [ ] Adicionar CAPTCHA (hCaptcha ou Cloudflare Turnstile)

### Médio Prazo (3-6 meses)
- [ ] Integração direta com Instagram API
- [ ] Integração com TikTok API
- [ ] Sistema de agendamento de posts
- [ ] Análise de engajamento (métricas de posts)
- [ ] Suporte a equipes e colaboração
- [ ] API pública para integrações
- [ ] Exportação em massa (CSV, JSON)
- [ ] CDN para imagens (Cloudflare R2)
- [ ] Backup automatizado do banco de dados
- [ ] Monitoramento APM (Sentry ou New Relic)

### Longo Prazo (6-12 meses)
- [ ] App mobile nativo (React Native)
- [ ] Análise preditiva de engajamento com ML
- [ ] Geração de vídeos curtos com IA
- [ ] Marketplace de templates
- [ ] Programa de afiliados
- [ ] Suporte multi-idioma (Espanhol, Inglês)
- [ ] Expansão para outros países da América Latina
- [ ] White-label para agências
- [ ] Integração com ferramentas de design (Canva, Figma)
- [ ] Sistema de recomendação de conteúdo

## 🔧 O Que Precisa Ser Pago/Melhorado

### Essencial para Crescimento
1. **OpenAI API Credits**: Comprar créditos em volume (desconto de até 30%)
2. **Vercel Pro**: Necessário para mais de 100 usuários simultâneos
3. **Supabase Pro**: Necessário para mais de 500MB de dados
4. **Domínio Próprio**: captzio.com.br (~R$ 40/ano)
5. **SSL Certificado**: Incluído na Vercel (grátis)
6. **Email Transacional**: SendGrid ou Resend (~R$ 50/mês)

### Recomendado
1. **CDN**: Cloudflare R2 para imagens (~R$ 100/mês)
2. **Monitoramento**: Sentry para erros (~R$ 130/mês)
3. **Analytics**: Mixpanel ou Amplitude (~R$ 200/mês)
4. **Backup**: Supabase Point-in-Time Recovery (~R$ 50/mês)
5. **WAF**: Cloudflare Pro (~R$ 100/mês)

### Opcional (Escala)
1. **Redis Dedicado**: Upstash Pro (~R$ 200/mês)
2. **Queue System**: Inngest ou BullMQ (~R$ 150/mês)
3. **Search Engine**: Algolia ou Typesense (~R$ 300/mês)
4. **Customer Support**: Intercom ou Zendesk (~R$ 400/mês)

## 📊 Métricas de Sucesso

### KPIs Principais
- **Taxa de Conversão**: % de visitantes que se cadastram
- **Taxa de Ativação**: % de usuários que geram conteúdo
- **Retenção D7/D30**: % de usuários que voltam após 7/30 dias
- **LTV (Lifetime Value)**: Valor médio por usuário
- **CAC (Customer Acquisition Cost)**: Custo para adquirir cliente
- **Churn Rate**: % de usuários que param de usar

### Metas Iniciais (3 meses)
- 1.000 usuários cadastrados
- 500 usuários ativos mensais
- R$ 10.000 em receita mensal
- Taxa de conversão de 5%
- Retenção D30 de 40%

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@captzio.com
- **Website**: [captzio.vercel.app](https://captzio.vercel.app)
- **GitHub Issues**: [github.com/seu-usuario/captzio/issues](https://github.com/seu-usuario/captzio/issues)

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [OpenAI](https://openai.com/) - API de IA
- [Vercel](https://vercel.com/) - Hospedagem e Deploy

---

**Feito com ❤️ no Brasil 🇧🇷**
