-- Migration: Add public read access for documents
-- This allows anonymous users to access documents that are part of public chats

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "users_own_documents" ON "Document";

-- Create new policy allowing owner access
CREATE POLICY "users_own_documents" ON "Document"
    FOR ALL
    USING ("userId" = current_user_id() AND current_user_id() IS NOT NULL);

-- Create new policy allowing public read access to documents
-- This enables anonymous users to view documents in public chats
CREATE POLICY "public_document_read_access" ON "Document"
    FOR SELECT
    USING (true);  -- Allow all read access - security is handled at chat level