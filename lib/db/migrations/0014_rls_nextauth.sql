-- Row Level Security (RLS) Policies for NextAuth + PostgreSQL
-- This version works with regular PostgreSQL and NextAuth (not Supabase)

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY; -- deprecated table
ALTER TABLE "Message_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote" ENABLE ROW LEVEL SECURITY; -- deprecated table
ALTER TABLE "Vote_v2" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Suggestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSettings" ENABLE ROW LEVEL SECURITY;

-- Create a function to set the current user context
CREATE OR REPLACE FUNCTION set_current_user_id(user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT set_config('app.current_user_id', user_id::text, true);
$$;

-- Create a function to get the current user ID from the session context
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('app.current_user_id', true)::uuid,
    NULL
  );
$$;

-- Create a function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM "User" 
    WHERE id = current_user_id() 
    AND email IN ('nandarafi80@gmail.com') -- Your admin email
  );
$$;

-- User table policies - users can only access their own record
CREATE POLICY "users_own_data" ON "User"
    FOR ALL
    USING (id = current_user_id());

-- Chat table policies - users can only access their own chats
CREATE POLICY "users_own_chats" ON "Chat"
    FOR ALL
    USING ("userId" = current_user_id());

-- Public chats can be read by anyone (for sharing functionality)
CREATE POLICY "public_chats_readable" ON "Chat"
    FOR SELECT
    USING (visibility = 'public');

-- Message table policies (deprecated) - users can only access messages from their chats
CREATE POLICY "users_own_messages_deprecated" ON "Message"
    FOR ALL
    USING ("chatId" IN (
        SELECT id FROM "Chat" WHERE "userId" = current_user_id()
    ));

-- Public chat messages can be read by anyone
CREATE POLICY "public_chat_messages_readable_deprecated" ON "Message"
    FOR SELECT
    USING ("chatId" IN (
        SELECT id FROM "Chat" WHERE visibility = 'public'
    ));

-- Message_v2 table policies - users can only access messages from their chats
CREATE POLICY "users_own_messages_v2" ON "Message_v2"
    FOR ALL
    USING ("chatId" IN (
        SELECT id FROM "Chat" WHERE "userId" = current_user_id()
    ));

-- Public chat messages can be read by anyone
CREATE POLICY "public_chat_messages_readable_v2" ON "Message_v2"
    FOR SELECT
    USING ("chatId" IN (
        SELECT id FROM "Chat" WHERE visibility = 'public'
    ));

-- Vote table policies (deprecated) - users can only vote on messages from accessible chats
CREATE POLICY "users_vote_accessible_chats_deprecated" ON "Vote"
    FOR ALL
    USING ("chatId" IN (
        SELECT id FROM "Chat" 
        WHERE "userId" = current_user_id() OR visibility = 'public'
    ));

-- Vote_v2 table policies - users can only vote on messages from accessible chats
CREATE POLICY "users_vote_accessible_chats_v2" ON "Vote_v2"
    FOR ALL
    USING ("chatId" IN (
        SELECT id FROM "Chat" 
        WHERE "userId" = current_user_id() OR visibility = 'public'
    ));

-- Document table policies - users can only access their own documents
CREATE POLICY "users_own_documents" ON "Document"
    FOR ALL
    USING ("userId" = current_user_id());

-- Suggestion table policies - users can only access suggestions for their documents
CREATE POLICY "users_own_document_suggestions" ON "Suggestion"
    FOR ALL
    USING ("userId" = current_user_id() OR 
           "documentId" IN (
               SELECT id FROM "Document" WHERE "userId" = current_user_id()
           ));

-- SystemSettings table policies - only allow access to admin users
CREATE POLICY "admin_only_system_settings" ON "SystemSettings"
    FOR ALL
    USING (is_admin());