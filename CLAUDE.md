# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
- Use `pnpm` for package management (configured in package.json)
- Install dependencies: `pnpm install`
- Start development server: `pnpm dev` (uses Next.js with Turbo)

### Build & Deployment
- Build application: `pnpm build` (runs database migrations then builds)
- Start production server: `pnpm start`

### Code Quality
- Lint and fix: `pnpm lint:fix` (runs Next.js lint and Biome)
- Format code: `pnpm format` (uses Biome formatter)
- Quick lint: `pnpm lint`

### Database Operations
- Generate migrations: `pnpm db:generate`
- Run migrations: `pnpm db:migrate`
- Open database studio: `pnpm db:studio`
- Push schema changes: `pnpm db:push`

### Testing
- Run tests: `pnpm test` (uses Playwright for E2E testing)

## Architecture Overview

### Core Technologies
- **Next.js 15** with App Router and React Server Components
- **AI SDK** by Vercel for LLM integration with streaming
- **Drizzle ORM** with PostgreSQL (Vercel Postgres/Neon)
- **NextAuth** for authentication (Google OAuth + credentials)
- **Tailwind CSS** + **shadcn/ui** for styling
- **Biome** for linting and formatting

### Project Structure
```
app/
├── (auth)/          # Authentication pages and logic
├── chat/          # Main chat interface and API routes
├── (payments)/      # Payment processing (LemonSqueezy)
└── layout.tsx       # Root layout with theme provider

lib/
├── ai/              # AI model configuration and providers
├── db/              # Database schema, queries, and migrations
├── artifacts/       # Artifact generation system
└── editor/          # Code editor and diff functionality

components/
├── ui/              # Base UI components (shadcn/ui)
├── chat.tsx         # Main chat component
├── message.tsx      # Message rendering
└── sidebar*.tsx     # Sidebar components

artifacts/           # Artifact type handlers (code, text, image, sheet)
```

### Key Architecture Patterns

**Database Schema** (lib/db/schema.ts):
- Modern message structure with `parts` supporting attachments
- Document versioning and collaboration features
- User management with OAuth integration
- Chat visibility controls (private/public)

**AI Integration** (lib/ai/):
- Provider abstraction supporting multiple models
- Streaming responses with structured outputs
- Tool calling capabilities for artifacts and documents
- Reasoning model support with custom middleware

**Authentication Flow**:
- Routes: `/login`, `/register` with NextAuth
- Protected routes via middleware.ts
- Session management with database persistence
- Support for Google OAuth and credential-based auth

**Message System**:
- Parts-based message structure supporting text, images, code blocks
- Real-time streaming with AI SDK
- Artifact generation and management
- Document collaboration with suggestions

### Code Style (from RULES.md)
- Use 2 spaces for indentation
- Single quotes for strings
- PascalCase for components and types
- camelCase for variables and functions
- kebab-case for component filenames
- Maximum 100 character line length


### Testing Strategy
- Playwright E2E tests in tests/ directory
- Test utilities in tests/auth-helper.ts
- Page objects pattern in tests/pages/
- Authentication setup in tests/auth.setup.ts

### Key Files to Understand
- `app/(chat)/actions.ts` - Server actions for chat functionality
- `lib/db/queries.ts` - All database operations
- `components/chat.tsx` - Main chat interface
- `lib/ai/models.ts` - AI model configuration
- `middleware.ts` - Authentication and route protection

### Environment Setup
- Requires environment variables from .env.example
- Uses Vercel for deployment and environment management
- Database migrations run automatically on build
- Supports both development and production AI providers

### 🔧 Production Setup Requirements

#### Email Service (Resend)
```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### Authentication
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_secret_key_here
GOOGLE_ID=your_google_oauth_client_id
GOOGLE_SECRET=your_google_oauth_client_secret
```

#### Database
```env
DATABASE_URL=your_database_connection_string
```

#### Payment Processing (LemonSqueezy)
```env
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_SIGNING_SECRET=your_webhook_signing_secret
```

### 🎯 Features Implemented
- ✅ NextAuth.js with Google OAuth and credentials
- ✅ Password reset via email (Resend integration)
- ✅ Welcome and payment confirmation emails
- ✅ LemonSqueezy payment processing
- ✅ User access management and session handling
- ✅ Database schema with password reset tokens