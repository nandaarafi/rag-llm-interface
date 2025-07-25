-- Row Level Security (RLS) Policies
-- This migration sets up security policies to ensure users can only access their own data

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

-- User table policies - users can only access their own record
CREATE POLICY "users_own_data" ON "User"
    FOR ALL
    USING (id = auth.uid()::uuid);

-- Chat table policies - users can only access their own chats
CREATE POLICY "users_own_chats" ON "Chat"
    FOR ALL
    USING ("userId" = auth.uid()::uuid);

-- Public chats can be read by anyone (for sharing functionality)
CREATE POLICY "public_chats_readable" ON "Chat"
    FOR SELECT
    USING (visibility = 'public');

-- Message table policies (deprecated) - users can only access messages from their chats
CREATE POLICY "users_own_messages_deprecated" ON "Message"
    FOR ALL
    USING ("chatId" IN (
        SELECT id FROM "Chat" WHERE "userId" = auth.uid()::uuid
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
        SELECT id FROM "Chat" WHERE "userId" = auth.uid()::uuid
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
        WHERE "userId" = auth.uid()::uuid OR visibility = 'public'
    ));

-- Vote_v2 table policies - users can only vote on messages from accessible chats
CREATE POLICY "users_vote_accessible_chats_v2" ON "Vote_v2"
    FOR ALL
    USING ("chatId" IN (
        SELECT id FROM "Chat" 
        WHERE "userId" = auth.uid()::uuid OR visibility = 'public'
    ));

-- Document table policies - users can only access their own documents
CREATE POLICY "users_own_documents" ON "Document"
    FOR ALL
    USING ("userId" = auth.uid()::uuid);

-- Suggestion table policies - users can only access suggestions for their documents
CREATE POLICY "users_own_document_suggestions" ON "Suggestion"
    FOR ALL
    USING ("userId" = auth.uid()::uuid OR 
           "documentId" IN (
               SELECT id FROM "Document" WHERE "userId" = auth.uid()::uuid
           ));

-- SystemSettings table policies - only allow access if user has admin role
-- Note: This assumes you'll add an admin role system. For now, restricting to specific user IDs
-- You may want to modify this based on your admin user management system
CREATE POLICY "admin_only_system_settings" ON "SystemSettings"
    FOR ALL
    USING (
        auth.uid()::uuid IN (
            SELECT id FROM "User" 
            WHERE email IN ('admin@yourdomain.com') -- Replace with your admin email(s)
        )
    );

-- Create a function to get the current user's ID (helper for authentication)
-- This assumes you're using a custom auth system with JWT or session-based auth
-- You'll need to modify this based on your authentication implementation

-- Alternative approach using a custom function for getting user ID from session
-- CREATE OR REPLACE FUNCTION current_user_id()
-- RETURNS uuid
-- LANGUAGE sql
-- STABLE
-- AS $$
--   SELECT COALESCE(
--     current_setting('app.current_user_id', true)::uuid,
--     NULL
--   );
-- $$;

-- If using the custom function approach, update policies to use current_user_id() instead of auth.uid()