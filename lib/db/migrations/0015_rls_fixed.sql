-- Fixed RLS policies that are secure by default
-- Drop existing policies and recreate them with proper security

-- Drop all existing policies first
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

-- Update the current_user_id function to handle NULL/empty values better
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

-- User table policies - users can only access their own record, requires context
CREATE POLICY "users_own_data" ON "User"
    FOR ALL
    USING (id = current_user_id() AND current_user_id() IS NOT NULL);

-- Chat table policies - users can only access their own chats, requires context
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