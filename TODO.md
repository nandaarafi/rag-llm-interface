
# TODO
- [x] Create ppt editor, similar to sheet-editor, text-editor etc
- [x] Fix artifact type confusion bug - when user is working with PPT artifact and requests changes, system incorrectly creates new sheet artifact instead of updating existing PPT artifact
- [x] Investigate AI prompt/context detection for artifact type selection
- [x] Review artifact creation logic to properly maintain context of current artifact type
- [X] Test PPT artifact update scenarios to ensure proper artifact type persistence
- [X] Make the Pricing UI consistent in pricing page and also in paywall modal

# NOTES

### LemonSqueezy Local Test
- ngrok http --url=informed-commonly-alpaca.ngrok-free.app 3000

## Development
- **System Settings**: Database-driven configuration system for controlling external services
  - **Database Table**: `SystemSettings` with settings stored in database
  - **Settings Available** (Hierarchical):
    - `ENABLE_EXTERNAL_SERVICES`: **Master switch** - overrides all external services
    - `ENABLE_EMAIL_SENDING`: Control email sending (only when master switch is ON)
    - `ENABLE_GOOGLE_OAUTH`: Control Google OAuth login (only when master switch is ON)
  - **Management**:
    - View settings: `GET /api/system-settings` (public)
    - Admin management: `GET/POST /api/admin/system-settings` (requires auth)
    - Initialize defaults: `npx tsx scripts/init-system-settings.ts`
  - **Legacy**: `DEV_ENABLE_EXTERNAL_SERVICES` constant kept for backward compatibility

## Deployment 
- Bug when using file env as the environment variable in CLI use dashboard instead?
- https://www.mindscribe.xyz became https://mindscribe.xyz
- the environment variable end up with `\n` at the end of the line, fix using 

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
```
## Product Engineer Thinking
- How the wireframe
- How the JSON API format look like?
- How the architecture diagram look like?
# Backlog
## Agentic Tool Calling

## Though About Tool Calling
- We need to separate, tool that need user to choose, or wheter the AI choose it

## Industry News Keep it Up
- Openai API docs https://platform.openai.com/docs/overview
- Anthropic API docs https://docs.anthropic.com/claude/api
- OpenRouter https://openrouter.ai/docs/ 

