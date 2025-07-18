#!/bin/bash

# Database management script for AI Chatbot

case "$1" in
  "start")
    echo "🚀 Starting PostgreSQL database..."
    docker-compose up -d postgres
    echo "✅ PostgreSQL is running on localhost:5432"
    echo "📊 Database: ai_chatbot"
    echo "👤 User: postgres"
    echo "🔑 Password: password"
    ;;
  "stop")
    echo "🛑 Stopping PostgreSQL database..."
    docker-compose down
    echo "✅ PostgreSQL stopped"
    ;;
  "restart")
    echo "🔄 Restarting PostgreSQL database..."
    docker-compose restart postgres
    echo "✅ PostgreSQL restarted"
    ;;
  "logs")
    echo "📋 Showing PostgreSQL logs..."
    docker-compose logs -f postgres
    ;;
  "pgadmin")
    echo "🚀 Starting PostgreSQL with pgAdmin..."
    docker-compose up -d
    echo "✅ Services started:"
    echo "📊 PostgreSQL: localhost:5432"
    echo "🌐 pgAdmin: http://localhost:5050"
    echo "👤 pgAdmin login: admin@example.com / admin"
    ;;
  "reset")
    echo "⚠️  WARNING: This will delete all data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "🗑️  Removing database and volumes..."
      docker-compose down -v
      docker volume rm ai-chatbot_postgres_data 2>/dev/null || true
      docker volume rm ai-chatbot_pgadmin_data 2>/dev/null || true
      echo "✅ Database reset complete"
    else
      echo "❌ Reset cancelled"
    fi
    ;;
  "connect")
    echo "🔌 Connecting to PostgreSQL..."
    docker-compose exec postgres psql -U postgres -d ai_chatbot
    ;;
  "migrate")
    echo "🔄 Running database migrations..."
    pnpm db:migrate
    ;;
  "studio")
    echo "🎨 Opening Drizzle Studio..."
    pnpm db:studio
    ;;
  *)
    echo "📖 AI Chatbot Database Management"
    echo ""
    echo "Usage: $0 {start|stop|restart|logs|pgadmin|reset|connect|migrate|studio}"
    echo ""
    echo "Commands:"
    echo "  start    - Start PostgreSQL database"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart PostgreSQL"
    echo "  logs     - Show PostgreSQL logs"
    echo "  pgadmin  - Start with pgAdmin web interface"
    echo "  reset    - Remove all data and reset database"
    echo "  connect  - Connect to database via psql"
    echo "  migrate  - Run Drizzle migrations"
    echo "  studio   - Open Drizzle Studio"
    echo ""
    echo "Examples:"
    echo "  $0 start     # Start database"
    echo "  $0 pgadmin   # Start with web interface"
    echo "  $0 migrate   # Run migrations"
    ;;
esac