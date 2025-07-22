# UX 
- [x] In the Header make a state isAuthenticated or not. If authenticated then Show Dashboard button else show the default sign in and Get Started for free
- [x] Make redirected to /chat false if authenticated on '/'
- [x] If user wrong route, don't return show 404 page instead return to root '/'


###  Authentication & User Management
- [x] NextAuth.js integration with Google OAuth
- [x] User registration and login flows
- [x] Session management and middleware protection
- [x] Password reset functionality
- [x] When free user signin I want to setup the credit more flexible too, should we add that the pricing plan too? the default right now is, free=3credit, pro=300credit, and the ultra plan have 1000 credit
- [x] How I can Setting the pricing more flexible, for the free, pro, and ultra plan
- [x] Bug, when change the user to free plan the credit doesnt show up -> it because using maxCredit for the logic in sidebar-credit

### LemonSqueezy Local Test
- ngrok http --url=informed-commonly-alpaca.ngrok-free.app 3000

## Development
- **Developer Control Flag**: Use `DEV_ENABLE_EXTERNAL_SERVICES` in `/lib/dev-config.ts` to enable/disable email sending and Google OAuth
  - Default: `true` (both features enabled)
  - Set to `false` to disable both email sending and Google OAuth for development

## Deployment 
- Bug when using file env as the environment variable in CLI use dashboard instead?
- https://www.mindscribe.xyz became https://mindscribe.xyz

# Backlog
## Though About Tool Calling
- We need to separate, tool that need user to choose, or wheter the AI choose it

## Industry News Keep it Up
- Openai API docs https://platform.openai.com/docs/overview
- Anthropic API docs https://docs.anthropic.com/claude/api
- OpenRouter https://openrouter.ai/docs/ 

