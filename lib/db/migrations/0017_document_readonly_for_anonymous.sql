-- Migration: Restrict document write operations for anonymous users
-- Allow read access for everyone, but restrict write operations to owners only

-- Drop existing policies
DROP POLICY IF EXISTS "users_own_documents" ON "Document";
DROP POLICY IF EXISTS "public_document_read_access" ON "Document";

-- Create policy allowing owners to do everything (read, write, update, delete)
CREATE POLICY "users_own_documents" ON "Document"
    FOR ALL
    USING ("userId" = current_user_id() AND current_user_id() IS NOT NULL);

-- Create policy allowing public read-only access to documents
-- This enables anonymous users to view documents in public chats but not edit them
CREATE POLICY "public_document_read_access" ON "Document"
    FOR SELECT
    USING (true);  -- Allow all read access - editing is blocked by API level checks