
# TODO
- [] Create ppt editor, similar to sheet-editor, text-editor etc
- [] Enhance paywall handling for insufficient credits
  - [] Add preventive credit checks before message submission
  - [] Improve error handling for different credit error types (insufficient_credits vs no_credits_plan)
  - [] Enhance user feedback with specific messages for different credit scenarios
  - [] Add loading states and better UX during credit validation
  - [] Consider adding credit balance display in UI

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

