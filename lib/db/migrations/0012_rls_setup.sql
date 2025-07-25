-- Row Level Security (RLS) Setup for Production
-- This migration enables RLS and creates security policies for all tables
-- Safe to run multiple times - uses IF NOT EXISTS and DROP IF EXISTS

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Suggestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "users_own_data" ON "User";
DROP POLICY IF EXISTS "users_own_chats" ON "Chat";
DROP POLICY IF EXISTS "public_chats_readable" ON "Chat";
DROP POLICY IF EXISTS "users_own_messages_deprecated" ON "Message";
DROP POLICY IF EXISTS "public_chat_messages_readable_deprecated" ON "Message";
DROP POLICY IF EXISTS "users_own_messages_v2" ON "Message_v2";
DROP POLICY IF EXISTS "public_chat_messages_readable_v2" ON "Message_v2";
DROP POLICY IF EXISTS "users_vote_accessible_chats_deprecated" ON "Vote";
DROP POLICY IF EXISTS "users_vote_accessible_chats_v2" ON "Vote_v2";
DROP POLICY IF EXISTS "users_own_documents" ON "Document";
DROP POLICY IF EXISTS "users_own_document_suggestions" ON "Suggestion";
DROP POLICY IF EXISTS "admin_only_system_settings" ON "SystemSettings";

-- Create authentication helper functions
CREATE OR REPLACE FUNCTION set_current_user_id(user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT set_config('app.current_user_id', user_id::text, true);
$$;

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN current_setting('app.current_user_id', true) = '' THEN NULL
    WHEN current_setting('app.current_user_id', true) IS NULL THEN NULL
    ELSE current_setting('app.current_user_id', true)::uuid
  END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM "User" 
    WHERE id = current_user_id() 
    AND email IN ('nandarafi80@gmail.com') -- Update this for production
  );
$$;

-- User table policies - users can only access their own record
CREATE POLICY "users_own_data" ON "User"
    FOR ALL
    USING (id = current_user_id() AND current_user_id() IS NOT NULL);

-- Chat table policies - users can only access their own chats
CREATE POLICY "users_own_chats" ON "Chat"
    FOR ALL
    USING ("userId" = current_user_id() AND current_user_id() IS NOT NULL);

-- Public chats can be read by anyone (for sharing functionality)
CREATE POLICY "public_chats_readable" ON "Chat"
    FOR SELECT
    USING (visibility = 'public');

-- Message table policies (deprecated) - requires user context
CREATE POLICY "users_own_messages_deprecated" ON "Message"
    FOR ALL
    USING (
        current_user_id() IS NOT NULL 
        AND "chatId" IN (
            SELECT id FROM "Chat" WHERE "userId" = current_user_id()
        )
    );

-- Public chat messages can be read by anyone
CREATE POLICY "public_chat_messages_readable_deprecated" ON "Message"
    FOR SELECT
    USING ("chatId" IN (
        SELECT id FROM "Chat" WHERE visibility = 'public'
    ));

-- Message_v2 table policies - requires user context
CREATE POLICY "users_own_messages_v2" ON "Message_v2"
    FOR ALL
    USING (
        current_user_id() IS NOT NULL 
        AND "chatId" IN (
            SELECT id FROM "Chat" WHERE "userId" = current_user_id()
        )
    );

-- Public chat messages can be read by anyone
CREATE POLICY "public_chat_messages_readable_v2" ON "Message_v2"
    FOR SELECT
    USING ("chatId" IN (
        SELECT id FROM "Chat" WHERE visibility = 'public'
    ));

-- Vote table policies (deprecated) - requires user context
CREATE POLICY "users_vote_accessible_chats_deprecated" ON "Vote"
    FOR ALL
    USING (
        current_user_id() IS NOT NULL 
        AND "chatId" IN (
            SELECT id FROM "Chat" 
            WHERE "userId" = current_user_id() OR visibility = 'public'
        )
    );

-- Vote_v2 table policies - requires user context
CREATE POLICY "users_vote_accessible_chats_v2" ON "Vote_v2"
    FOR ALL
    USING (
        current_user_id() IS NOT NULL 
        AND "chatId" IN (
            SELECT id FROM "Chat" 
            WHERE "userId" = current_user_id() OR visibility = 'public'
        )
    );

-- Document table policies - requires user context
CREATE POLICY "users_own_documents" ON "Document"
    FOR ALL
    USING ("userId" = current_user_id() AND current_user_id() IS NOT NULL);

-- Suggestion table policies - requires user context
CREATE POLICY "users_own_document_suggestions" ON "Suggestion"
    FOR ALL
    USING (
        current_user_id() IS NOT NULL 
        AND (
            "userId" = current_user_id() 
            OR "documentId" IN (
                SELECT id FROM "Document" WHERE "userId" = current_user_id()
            )
        )
    );

-- SystemSettings table policies - only allow access to admin users with context
CREATE POLICY "admin_only_system_settings" ON "SystemSettings"
    FOR ALL
    USING (current_user_id() IS NOT NULL AND is_admin());