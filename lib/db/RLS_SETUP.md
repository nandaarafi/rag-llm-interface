# Row Level Security (RLS) Setup Guide

This guide explains the Row Level Security implementation for your AI chatbot application.

## Overview

Row Level Security (RLS) has been implemented to ensure users can only access their own data. The setup includes:

1. RLS policies for all tables
2. Authentication helper functions
3. Integration utilities for your application code

## Files Created

- `0012_rls_policies.sql` - Initial RLS policies
- `0013_rls_auth_functions.sql` - Authentication helper functions and updated policies
- `auth-context.ts` - Application integration utilities
- `rls-integration-example.ts` - Example code showing how to use RLS

## How RLS Works

RLS policies are automatically applied to all database queries. When you set a user context using `setUserContext(userId)`, all subsequent queries will only return data that the user is authorized to access.

### Security Policies Implemented

#### User Table
- Users can only access their own user record
- No cross-user data access

#### Chat Table
- Users can only access chats they created
- Public chats are readable by everyone (for sharing functionality)

#### Message Tables (both deprecated and v2)
- Users can only access messages from their own chats
- Messages from public chats are readable by everyone

#### Vote Tables (both deprecated and v2)
- Users can only vote on messages from chats they have access to
- Includes both owned chats and public chats

#### Document Table
- Users can only access documents they created
- Complete isolation between users

#### Suggestion Table
- Users can only access suggestions they created
- Users can access suggestions on their own documents

#### SystemSettings Table
- Only admin users can access system settings
- Admin status is determined by email address (configurable)

## Setup Instructions

### 1. Run the Migrations

```bash
pnpm db:migrate
```

This will apply the RLS policies and create the authentication functions.

### 2. Update Admin Configuration

Edit the admin email in the migration file `0013_rls_auth_functions.sql`:

```sql
-- Replace 'admin@yourdomain.com' with your actual admin email
AND email IN ('admin@yourdomain.com', 'another-admin@yourdomain.com')
```

### 3. Integrate with Your Queries

Update your existing queries to use the user context. Here's the pattern:

```typescript
import { auth } from '@/app/(auth)/auth';
import { withUserContext } from './auth-context';

export async function someQuery() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return await withUserContext(session.user.id, async () => {
    // Your existing query here
    return await db.select().from(someTable);
  });
}
```

### 4. Handle Public Data

For queries that access public data (like public chats), you don't need user context:

```typescript
export async function getPublicChats() {
  // No user context needed - RLS policies handle public access
  return await db
    .select()
    .from(chat)
    .where(eq(chat.visibility, 'public'));
}
```

## Integration Patterns

### Pattern 1: User-Specific Queries
Use `withUserContext()` for all queries that should be filtered by user:

```typescript
export async function getUserChats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  return await withUserContext(session.user.id, async () => {
    return await db.select().from(chat);
  });
}
```

### Pattern 2: Public Queries
Don't use user context for public data:

```typescript
export async function getPublicContent() {
  return await db
    .select()
    .from(chat)
    .where(eq(chat.visibility, 'public'));
}
```

### Pattern 3: Admin Queries
Set admin user context for system operations:

```typescript
export async function getSystemSettings() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  return await withUserContext(session.user.id, async () => {
    return await db.select().from(systemSettings);
  });
}
```

## Testing RLS

### Test User Isolation

1. Create two user accounts
2. Create data with each user
3. Verify each user can only see their own data

### Test Public Access

1. Create public chats
2. Verify they're accessible without authentication
3. Verify private chats remain private

### Test Admin Access

1. Set your email as admin in the migration
2. Test system settings access
3. Verify non-admin users can't access system settings

## Security Considerations

1. **Always set user context** - Queries without user context will return empty results
2. **Handle authentication errors** - Check for valid sessions before queries
3. **Clear context** - The `withUserContext()` function automatically clears context
4. **Admin configuration** - Keep admin emails secure and up-to-date
5. **Public data** - Be intentional about what data is marked public

## Troubleshooting

### Empty Query Results
- Ensure user context is set before queries
- Check that the user ID in context matches the data owner
- Verify RLS policies are enabled on tables

### Permission Denied Errors
- Check if the user is authenticated
- Verify the user has access to requested data
- For admin operations, ensure user is configured as admin

### Performance Considerations
- RLS policies use indexes on userId columns
- Consider adding indexes if query performance is slow
- Public queries don't require user context and perform better

## Next Steps

1. Update all your existing queries in `queries.ts` to use the RLS pattern
2. Test thoroughly with multiple user accounts
3. Configure admin users for your production environment
4. Consider implementing role-based access if needed

## Example Migration

See `rls-integration-example.ts` for complete examples of how to modify your existing queries to work with RLS.