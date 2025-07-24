
# TODO
- [x] Create ppt editor, similar to sheet-editor, text-editor etc
- [] Fix artifact type confusion bug - when user is working with PPT artifact and requests changes, system incorrectly creates new sheet artifact instead of updating existing PPT artifact
- [] Investigate AI prompt/context detection for artifact type selection
- [] Review artifact creation logic to properly maintain context of current artifact type
- [] Test PPT artifact update scenarios to ensure proper artifact type persistence
- [] Make the Pricing UI consistent in pricing page and also in paywall modal

# NOTES

### LemonSqueezy Local Test
- ngrok http --url=informed-commonly-alpaca.ngrok-free.app 3000

## Development
- **Developer Control Flag**: Use `DEV_ENABLE_EXTERNAL_SERVICES` in `/lib/dev-config.ts` to enable/disable email sending and Google OAuth
  - Default: `true` (both features enabled)
  - Set to `false` to disable both email sending and Google OAuth for development

## Deployment 
- Bug when using file env as the environment variable in CLI use dashboard instead?
- https://www.mindscribe.xyz became https://mindscribe.xyz
- the environment variable end up with `\n` at the end of the line, fix using 

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
```

# Backlog
## Though About Tool Calling
- We need to separate, tool that need user to choose, or wheter the AI choose it

## Industry News Keep it Up
- Openai API docs https://platform.openai.com/docs/overview
- Anthropic API docs https://docs.anthropic.com/claude/api
- OpenRouter https://openrouter.ai/docs/ 

