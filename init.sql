-- Initialize database for AI Chatbot
-- This file will be executed when the container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- You can add any initial setup here
-- The actual tables will be created by your Drizzle migrations

-- Create a user for the application (optional)
-- CREATE USER ai_chatbot_user WITH PASSWORD 'your_app_password';
-- GRANT ALL PRIVILEGES ON DATABASE ai_chatbot TO ai_chatbot_user;