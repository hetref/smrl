# Docker Deployment Guide

This guide explains how to deploy SMRL URL Shortener using Docker.

## Prerequisites

- Docker and Docker Compose installed
- A NeonDB (PostgreSQL) database
- Clerk authentication credentials

## Quick Start

### 1. Clone and Configure

```bash
# Clone the repository
git clone <repository-url>
cd smrl

# Copy environment template
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

### 2. Configure Environment Variables

Edit `.env` with your actual credentials:

```env
# Database (NeonDB connection string)
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations

**Important:** Migrations must be run manually before starting the app:

```bash
docker compose run smrl npx prisma migrate deploy
```

This command:
- Connects to your NeonDB instance
- Applies all pending migrations
- Generates the Prisma client

### 4. Start the Application

```bash
# Build and start
docker compose up --build

# Or run in detached mode
docker compose up -d --build
```

### 5. Access the Application

Open your browser and navigate to:
- **Local**: http://localhost:3000
- **Network**: http://your-server-ip:3000

## Docker Commands Reference

### Basic Operations

```bash
# Start the application
docker compose up

# Start in detached mode (background)
docker compose up -d

# Stop the application
docker compose down

# View logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# Restart the application
docker compose restart
```

### Rebuilding

```bash
# Rebuild after code changes
docker compose up --build

# Force rebuild without cache
docker compose build --no-cache
docker compose up
```

### Database Operations

```bash
# Run migrations
docker compose run smrl npx prisma migrate deploy

# Generate Prisma client (if needed)
docker compose run smrl npx prisma generate

# Access Prisma Studio (for debugging)
docker compose run -p 5555:5555 smrl npx prisma studio
```

### Maintenance

```bash
# Remove stopped containers
docker compose rm

# Remove all containers and volumes
docker compose down -v

# View container status
docker compose ps

# Execute commands inside container
docker compose exec smrl sh
```

## Architecture

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimization:

1. **Base**: Sets up Node.js 20 Alpine environment
2. **Dependencies**: Installs npm packages
3. **Builder**: Generates Prisma client and builds Next.js
4. **Runner**: Production-optimized runtime image

### What's Included

- ✅ Node.js 20 LTS (Alpine)
- ✅ Production Next.js build
- ✅ Prisma client generation
- ✅ Optimized layer caching
- ✅ Minimal runtime dependencies

### What's NOT Included

- ❌ PostgreSQL database (use external NeonDB)
- ❌ Development dependencies
- ❌ Source code (only built artifacts)
- ❌ Auto-running migrations

## Production Deployment

### Environment Variables

For production, update these variables:

```env
# Use your production domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Use production Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Use production database
DATABASE_URL="postgresql://..."
```

### Security Checklist

- [ ] Use production Clerk keys (not test keys)
- [ ] Use strong database credentials
- [ ] Enable SSL for database connection
- [ ] Set up firewall rules
- [ ] Use HTTPS (reverse proxy with Nginx/Caddy)
- [ ] Regularly update Docker images
- [ ] Monitor logs for errors

### Reverse Proxy Setup (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Reverse Proxy Setup (Caddy)

Example Caddyfile:

```
yourdomain.com {
    reverse_proxy localhost:3000
}
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs smrl

# Check if port 3000 is already in use
netstat -tulpn | grep 3000  # Linux
lsof -i :3000               # macOS
netstat -ano | findstr 3000 # Windows
```

### Database Connection Issues

```bash
# Test database connection
docker compose run smrl npx prisma db pull

# Verify environment variables
docker compose config
```

### Build Failures

```bash
# Clear Docker cache
docker compose build --no-cache

# Remove old images
docker image prune -a
```

### Prisma Issues

```bash
# Regenerate Prisma client
docker compose run smrl npx prisma generate

# Check migration status
docker compose run smrl npx prisma migrate status
```

## Performance Optimization

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  smrl:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Health Checks

Add health check to `docker-compose.yml`:

```yaml
services:
  smrl:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Backup and Restore

### Database Backup

Since you're using NeonDB, backups are handled by Neon:
- Automatic daily backups
- Point-in-time recovery
- Manual backup via Neon dashboard

### Application Data

No application data is stored in the container. All data is in:
- NeonDB (database)
- Clerk (authentication)

## Monitoring

### View Logs

```bash
# All logs
docker compose logs

# Last 100 lines
docker compose logs --tail=100

# Follow logs
docker compose logs -f

# Logs for specific time
docker compose logs --since 1h
```

### Container Stats

```bash
# Real-time stats
docker stats smrl

# One-time stats
docker stats --no-stream smrl
```

## Updating

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose up --build -d

# Run migrations if needed
docker compose run smrl npx prisma migrate deploy
```

### Update Dependencies

```bash
# Update npm packages
npm update

# Rebuild Docker image
docker compose build --no-cache
docker compose up -d
```

## Support

For issues or questions:
- Check the [main README](README.md)
- Review Docker logs: `docker compose logs`
- Open an issue on GitHub

## License

MIT
