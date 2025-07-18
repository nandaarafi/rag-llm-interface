# Database Setup Guide

This guide helps you set up PostgreSQL locally using Docker for the AI Chatbot project.

## Quick Start

1. **Start the database:**
   ```bash
   ./scripts/db.sh start
   ```

2. **Copy environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Run database migrations:**
   ```bash
   ./scripts/db.sh migrate
   ```

4. **Start the application:**
   ```bash
   pnpm dev
   ```

## Database Management Commands

### Basic Operations
```bash
# Start PostgreSQL
./scripts/db.sh start

# Stop PostgreSQL
./scripts/db.sh stop

# Restart PostgreSQL
./scripts/db.sh restart

# View logs
./scripts/db.sh logs
```

### Web Interface (pgAdmin)
```bash
# Start with web interface
./scripts/db.sh pgadmin

# Access pgAdmin at: http://localhost:5050
# Login: admin@example.com / admin
```

### Database Operations
```bash
# Connect to database via command line
./scripts/db.sh connect

# Run migrations
./scripts/db.sh migrate

# Open Drizzle Studio
./scripts/db.sh studio

# Reset database (⚠️ deletes all data)
./scripts/db.sh reset
```

## Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** ai_chatbot
- **Username:** postgres
- **Password:** password

**Connection String:**
```
postgresql://postgres:password@localhost:5432/ai_chatbot
```

## pgAdmin Setup

1. Start services with `./scripts/db.sh pgadmin`
2. Open http://localhost:5050 in your browser
3. Login with `admin@example.com` / `admin`
4. Add server connection:
   - **Host:** postgres (container name)
   - **Port:** 5432
   - **Database:** ai_chatbot
   - **Username:** postgres
   - **Password:** password

## Troubleshooting

### Port Already in Use
If port 5432 is already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Change to different port
```

Then update your connection string to use port 5433.

### Container Won't Start
Check if you have Docker running:
```bash
docker --version
docker-compose --version
```

### Data Persistence
Data is stored in Docker volumes and persists between container restarts. Use `./scripts/db.sh reset` to completely remove all data.

## Development Workflow

1. Start database: `./scripts/db.sh start`
2. Run migrations: `./scripts/db.sh migrate`
3. Start dev server: `pnpm dev`
4. Make schema changes in `lib/db/schema.ts`
5. Generate migration: `pnpm db:generate`
6. Run new migration: `./scripts/db.sh migrate`

## Production Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Set up proper backup procedures
- Consider using managed database services for production