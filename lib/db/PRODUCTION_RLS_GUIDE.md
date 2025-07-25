# Production RLS Deployment Guide

This guide explains how to deploy Row Level Security (RLS) to production using Drizzle migrations.

## Production Deployment Steps

### 1. Deploy Database Schema + RLS Policies

```bash
# This will now include RLS setup automatically
pnpm db:migrate
```

The migration `0012_rls_setup.sql` includes:
- ✅ RLS enabled on all tables
- ✅ Authentication helper functions
- ✅ Security policies for all tables
- ✅ Admin access controls

### 2. Update Admin Email for Production

```bash
# Set your production admin email
ADMIN_EMAIL=admin@yourcompany.com npx tsx scripts/rls/update-admin-email.ts
```

### 3. Verify RLS is Working

```bash
# Test the setup (optional)
npx tsx scripts/rls/check-rls-status.ts
```

### 4. Check Current Admin Email

To see which email is currently configured as admin:

```sql
-- Query the admin email configuration
SELECT prosrc FROM pg_proc WHERE proname = 'is_admin';
```

Or use the npm script:
```bash
# Check admin email and RLS status
pnpm db:rls:status
```

## Environment Variables

Make sure these are set in production:

```env
DATABASE_URL=your_production_database_url
```

## Security Notes

### Default Admin Email
The migration sets the default admin email to `nandarafi80@gmail.com`. **You MUST update this for production** using the update script above.

### Database Role Considerations
- If using a **superuser role**: RLS policies are created but may be bypassed
- If using a **regular role**: RLS policies are fully enforced
- **Application-level security** via `withUserContext()` works regardless

### Production Checklist

- [ ] Run `pnpm db:migrate` 
- [ ] Update admin email with `scripts/update-admin-email.ts`
- [ ] Test a few critical queries to ensure they work
- [ ] Verify admin-only features are restricted
- [ ] Monitor for any authentication errors in production

## Rollback Plan

If you need to disable RLS in production:

```sql
-- Emergency rollback - disable RLS on all tables
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Message_v2" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote_v2" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Suggestion" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSettings" DISABLE ROW LEVEL SECURITY;
```

## Monitoring

Watch for these potential issues in production:
- Empty query results (may indicate missing user context)
- Authentication errors in logs
- Slow queries (RLS policies add complexity)
- Admin access issues

## Support

If you encounter issues:
1. Check that `withUserContext()` is being used in all user-specific queries
2. Verify the admin email is set correctly
3. Test queries with and without user context
4. Check database connection role permissions