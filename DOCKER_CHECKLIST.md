# Docker Setup Checklist

Use this checklist to verify your Docker setup is complete and correct.

## ✅ Files Created

- [ ] `Dockerfile` - Multi-stage build configuration
- [ ] `docker-compose.yml` - Docker Compose configuration
- [ ] `.dockerignore` - Files to exclude from Docker build
- [ ] `.env.example` - Environment variable template
- [ ] `DOCKER.md` - Comprehensive Docker documentation
- [ ] `QUICKSTART.md` - Quick start guide

## ✅ Configuration Verified

- [ ] `.gitignore` excludes `.env` but includes `.env.example`
- [ ] `Dockerfile` uses Node 20 Alpine
- [ ] `Dockerfile` includes Prisma generation
- [ ] `Dockerfile` builds Next.js for production
- [ ] `docker-compose.yml` exposes port 3000
- [ ] `docker-compose.yml` uses `.env` file

## ✅ Pre-Deployment Checklist

- [ ] NeonDB database created and accessible
- [ ] Clerk application created with correct URLs
- [ ] `.env` file created from `.env.example`
- [ ] All environment variables filled in `.env`
- [ ] Docker and Docker Compose installed

## ✅ Deployment Steps

1. [ ] Clone repository
2. [ ] Copy `.env.example` to `.env`
3. [ ] Fill in environment variables
4. [ ] Run migrations: `docker compose run smrl npx prisma migrate deploy`
5. [ ] Start application: `docker compose up -d`
6. [ ] Verify application is running: `docker compose ps`
7. [ ] Check logs: `docker compose logs`
8. [ ] Access application: http://localhost:3000

## ✅ Post-Deployment Verification

- [ ] Application loads at http://localhost:3000
- [ ] Landing page displays correctly
- [ ] Sign-in redirects to Clerk
- [ ] Dashboard requires authentication
- [ ] Can create short URLs
- [ ] Short URLs redirect correctly
- [ ] Click analytics are logged

## ✅ Production Checklist

- [ ] Use production Clerk keys (pk_live_*, sk_live_*)
- [ ] Use production database URL
- [ ] Set NEXT_PUBLIC_APP_URL to production domain
- [ ] Set up reverse proxy (Nginx/Caddy)
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up monitoring
- [ ] Configure backups (NeonDB handles this)
- [ ] Test disaster recovery

## ✅ Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] No secrets in code
- [ ] Database uses SSL
- [ ] Strong database password
- [ ] Clerk webhook secret configured (if using webhooks)
- [ ] HTTPS enabled in production
- [ ] Regular security updates

## ✅ Maintenance Checklist

- [ ] Monitor Docker logs regularly
- [ ] Update Docker images monthly
- [ ] Review NeonDB backups
- [ ] Test restore procedures
- [ ] Monitor disk space
- [ ] Monitor memory usage
- [ ] Review Clerk usage

## Common Issues

### Build Fails
```bash
# Clear cache and rebuild
docker compose build --no-cache
```

### Port Already in Use
```bash
# Check what's using port 3000
netstat -tulpn | grep 3000  # Linux
lsof -i :3000               # macOS
netstat -ano | findstr 3000 # Windows
```

### Database Connection Fails
```bash
# Test connection
docker compose run smrl npx prisma db pull
```

### Migrations Fail
```bash
# Check migration status
docker compose run smrl npx prisma migrate status

# Reset and reapply
docker compose run smrl npx prisma migrate reset
docker compose run smrl npx prisma migrate deploy
```

## Support

If you encounter issues:
1. Check logs: `docker compose logs -f`
2. Review [DOCKER.md](DOCKER.md)
3. Review [README.md](README.md)
4. Open an issue on GitHub

## Success Criteria

Your Docker setup is complete when:
- ✅ `docker compose up` starts without errors
- ✅ Application accessible at http://localhost:3000
- ✅ Authentication works via Clerk
- ✅ Short URLs can be created
- ✅ Redirects work correctly
- ✅ Analytics are logged
- ✅ No errors in logs
