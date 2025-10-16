# Captzio - AI Social Media Content Generator

Captzio is a full-stack web application that helps businesses generate engaging social media content using AI. Generate captions, hashtags, CTAs, and images powered by OpenAI's GPT-5 nano and GPT Image 1.

## Features

- **AI Caption Generation**: Create engaging captions with hashtags and CTAs
- **AI Image Generation**: Generate custom images for your posts
- **Credit System**: Pay-as-you-go with flexible credit packs
- **Payment Integration**: Secure payments via Mercado Pago
- **User Dashboard**: Manage posts, images, and credits
- **Admin Panel**: Monitor usage, transactions, and system configuration

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI (GPT-5 nano, GPT Image 1)
- **Payments**: Mercado Pago
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- Mercado Pago account (sandbox for testing)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd captzio-web
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your credentials.

4. Set up the database:
\`\`\`bash
npm run db:push
npm run db:seed
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database (dev)
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data

## Default Admin Credentials

- Email: admin@captzio.com
- Password: admin123

**Change these credentials in production!**

## Project Structure

\`\`\`
captzio-web/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # User dashboard
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   └── (public)/          # Public pages
├── components/            # React components
├── lib/                   # Utilities and configurations
├── prisma/                # Database schema and migrations
└── public/                # Static assets
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Content Generation
- `POST /api/generate/caption` - Generate captions
- `POST /api/generate/image-prompt` - Generate image prompt
- `POST /api/image/create` - Create image generation job
- `GET /api/image/job/:id` - Get job status

### Payments
- `POST /api/billing/create-preference` - Create Mercado Pago preference
- `POST /api/webhook/mercadopago` - Handle payment webhooks

### User
- `GET /api/user/credits` - Get user credits
- `GET /api/user/history` - Get usage history

### Admin
- `GET /api/admin/usage` - Get system usage stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/config` - Update system config

## Mercado Pago Integration

### Testing in Sandbox

1. Create a Mercado Pago developer account
2. Get your sandbox credentials
3. Add them to `.env`:
   - `MP_ACCESS_TOKEN` (server-side)
   - `NEXT_PUBLIC_MP_PUBLIC_KEY` (client-side)
4. Use test cards from [Mercado Pago docs](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards)

### Webhook Setup

1. Configure webhook URL in Mercado Pago dashboard:
   - URL: `https://your-domain.com/api/webhook/mercadopago`
   - Events: `payment`
2. Webhook validates and credits user account automatically

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Hosting

- **Vercel Postgres**: Integrated with Vercel
- **Supabase**: Free tier available
- **Neon**: Serverless PostgreSQL
- **Railway**: Easy PostgreSQL hosting

## Testing

Run manual tests:

1. Register a new user
2. Generate captions (check token usage in DB)
3. Purchase credits via Mercado Pago sandbox
4. Simulate payment and verify webhook
5. Generate an image (check credit deduction)
6. Access admin panel to view stats

## Security Notes

- Never commit `.env` file
- Use strong `NEXTAUTH_SECRET` in production
- Enable HTTPS in production
- Validate all webhook signatures
- Implement rate limiting for API routes
- Use environment variables for all secrets

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
