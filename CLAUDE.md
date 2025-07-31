# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands
- CLI list pid use `ss -ltnp | grep ':3000'`
## Commit Message Convention

This website follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

Commit message will be checked using [husky and commit lint](https://theodorusclarence.com/library/husky-commitlint-prettier), you can't commit if not using the proper convention below.

### PPT Generation
- Generate image using kling AI, Flux AI?
- Generate text using chatgpt 4.1, claude 3.5?
- AI Editing Tools in PPT Artifact?

### Format

`<type>(optional scope): <description>`
Example: `feat(pre-event): add speakers section`

### 1. Type

Available types are:

- feat → Changes about addition or removal of a feature. Ex: `feat: add table on landing page`, `feat: remove table from landing page`
- fix → Bug fixing, followed by the bug. Ex: `fix: illustration overflows in mobile view`
- docs → Update documentation (README.md)
- style → Updating style, and not changing any logic in the code (reorder imports, fix whitespace, remove comments)
- chore → Installing new dependencies, or bumping deps
- refactor → Changes in code, same output, but different approach
- ci → Update github workflows, husky
- test → Update testing suite, cypress files
- revert → when reverting commits
- perf → Fixing something regarding performance (deriving state, using memo, callback)
- vercel → Blank commit to trigger vercel deployment. Ex: `vercel: trigger deployment`

## GIT
- After You make a lot of changes, use git add . and and git commit -m "feat: ..." use the commit message rules above
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
- Lint for Production: `pnpm tsc --noEmit`

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
## CoreUI
- **Tailwind CSS** + **shadcn/ui** for styling
- **https://tweakcn.com/editor/theme** for theme shadcn UI
- https://www.kibo-ui.com/ Code-block, Image Crop, Color Picker, Markdown Editor, KBDkey, Sandbox code, VideoPlayer
- https://blocks.mvp-subha.me/docs/basic/loaders MVPBlocks for loader UI and Landing Page
- https://originui.com/
- **Biome** for linting and formatting

## Landing Page UI reference
- **https://skiper-ui.com/** for components
- **https://ui.aceternity.com/** for component
- **https://www.cult-ui.com/** card references
- **https://ui.aceternity.com/** for more animated UI

## Reference Create UI
- https://21st.dev/ All In One UI References    

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
- Provider abstraction supporting multiple models (Gemini default, OpenRouter optional)
- Streaming responses with structured outputs
- Tool calling capabilities for artifacts and documents
- Reasoning model support with custom middleware
- OpenRouter integration for access to GPT-4, Claude, and other models

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

#### AI Providers
```env
# Default provider (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key

# Optional OpenRouter integration (for GPT-4, Claude, etc.)
OPENROUTER_API_KEY=your_openrouter_api_key
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

## Serverless Best Practices (Vercel)

### ⚠️ Cost Optimization Warning
- **Keep realtime database connections client-side** when possible
- Moving realtime DB connections from client to server-side can increase function duration by 10000x
- Server-side realtime connections stay constantly running, causing unexpected high charges
- Use server-side connections only when absolutely necessary for security/functionality

### Database Connection Patterns
- **Client-side**: Good for realtime features, lower serverless costs
- **Server-side**: Use for sensitive operations, API routes, but monitor duration closely
- **Hybrid**: Keep auth/sensitive queries server-side, realtime subscriptions client-side
