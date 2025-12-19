# Deployment Guide

Complete instructions for deploying the Microservices Architecture Design Tool to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Deployment](#local-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Checklist](#security-checklist)

## Prerequisites

- Node.js 20+
- Docker (for containerized deployment)
- PostgreSQL 14+ (for production database)
- OpenAI API account with active credits
- A web server/cloud platform account (optional)

## Local Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Create `.env.local` (development) or `.env.production` (production):

```env
# Required
OPENAI_API_KEY=your_key_here

# Database
DATABASE_URL=postgresql://user:password@host:5432/db_name

# Server
NODE_ENV=production
PORT=5000
```

### 3. Build

```bash
npm run build
```

### 4. Run

```bash
npm start
```

Access at: `http://localhost:5000`

## Docker Deployment

### Build Docker Image

```bash
# Using production build
docker build -t microservices-tool:latest .

# Or with specific tag
docker build -t microservices-tool:1.0.0 .
```

### Run Container

```bash
docker run -p 5000:5000 \
  -e OPENAI_API_KEY="your_key" \
  -e DATABASE_URL="postgresql://user:pass@db:5432/name" \
  -e NODE_ENV=production \
  microservices-tool:latest
```

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      DATABASE_URL: postgresql://postgres:password@db:5432/microservices_tool
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: microservices_tool
    restart: unless-stopped

volumes:
  postgres_data:
```

Deploy:

```bash
docker-compose up -d
```

## Cloud Platform Deployment

### Replit

1. Fork repository to your Replit account
2. Set secrets in Replit console:
   - `OPENAI_API_KEY`
   - `DATABASE_URL` (if using PostgreSQL)
3. Run: `npm run dev`

### Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Set environment variables:
   ```
   OPENAI_API_KEY=your_key
   DATABASE_URL=your_postgres_url
   NODE_ENV=production
   ```
4. Build command: `npm install && npm run build`
5. Start command: `npm start`

### Vercel (API + Static Frontend)

**Note:** Vercel has limitations with long-running Node.js servers. For best results, use serverless functions.

1. Split frontend and backend
2. Deploy frontend to Vercel
3. Deploy backend to serverless platform

### Heroku

1. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Add PostgreSQL:
   ```bash
   heroku addons:create heroku-postgresql:standard-0
   ```

3. Set environment variables:
   ```bash
   heroku config:set OPENAI_API_KEY="your_key"
   heroku config:set NODE_ENV=production
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04 LTS, t3.small or larger)

2. SSH into instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. Install Node.js and PostgreSQL:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install nodejs postgresql postgresql-contrib
   ```

4. Clone repository:
   ```bash
   git clone https://github.com/yourusername/microservices-tool.git
   cd microservices-tool
   ```

5. Install dependencies:
   ```bash
   npm install
   npm run build
   ```

6. Create `.env` file with production config

7. Set up PostgreSQL:
   ```bash
   sudo -u postgres createdb microservices_tool
   ```

8. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "microservices-tool" -- start
   pm2 save
   pm2 startup
   ```

9. Set up Nginx as reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Select Node.js runtime
3. Set build command: `npm install && npm run build`
4. Set run command: `npm start`
5. Add environment variables
6. Add PostgreSQL database
7. Deploy

## Environment Configuration

### Required Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Database (Production)
DATABASE_URL=postgresql://user:password@host:5432/database_name

# Server
NODE_ENV=production
PORT=5000
```

### Optional Variables

```env
# Logging
LOG_LEVEL=info

# Session
SESSION_SECRET=your-secure-random-string

# CORS
ALLOWED_ORIGINS=https://yourdomain.com
```

## Database Setup

### PostgreSQL Production Setup

1. Create database and user:

```bash
createuser app_user -P
createdb microservices_tool -O app_user
```

2. Connect and initialize schema:

```bash
psql -d microservices_tool -U app_user
```

3. Push schema with Drizzle:

```bash
npm run db:push
```

### Backup Strategy

```bash
# Daily backup
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Keep 30 days
find /backups -name 'db_*.sql.gz' -mtime +30 -delete
```

### Connection Pooling

For production, use PgBouncer or pgpool:

```bash
# Install pgbouncer
sudo apt install pgbouncer

# Configure /etc/pgbouncer/pgbouncer.ini
[databases]
microservices_tool = host=localhost port=5432 user=postgres password=***

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

## Monitoring & Logging

### Application Logs

Set log level and format:

```env
LOG_LEVEL=info
LOG_FORMAT=json
```

### System Monitoring

```bash
# CPU and Memory
top
ps aux | grep "node"

# Disk Space
df -h

# Port Status
netstat -tulpn | grep :5000
```

### Performance Monitoring

- Monitor API response times
- Track database query performance
- Watch OpenAI API usage and costs
- Monitor server CPU/memory/disk

### Error Tracking (Optional)

Add Sentry, LogRocket, or similar:

```bash
npm install @sentry/node
```

## Security Checklist

- [ ] OpenAI API key stored as environment variable (never in code)
- [ ] Database password secured and never in code
- [ ] HTTPS/SSL enabled in production
- [ ] Firewall rules restrict access appropriately
- [ ] Regular dependency updates: `npm audit`
- [ ] Database backups automated
- [ ] Environment variables secured in platform
- [ ] No debug mode in production
- [ ] Request validation with Zod enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Session timeout configured
- [ ] Database connection pooling enabled
- [ ] Server logs monitored for errors
- [ ] Regular security scanning

## Troubleshooting Deployment

### Application crashes on startup

```bash
npm run check  # Type check
npm run build  # Verify build succeeds
npm start      # Test locally
```

### Database connection fails

```bash
# Test connection
psql $DATABASE_URL

# Check credentials
echo $DATABASE_URL

# Verify database exists
psql -l
```

### OpenAI API errors

- Verify API key is correct: `echo $OPENAI_API_KEY`
- Check API quotas and usage at OpenAI dashboard
- Verify account has credits
- Test API directly: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

### High memory usage

- Check for memory leaks
- Verify database connection pooling
- Monitor Node.js heap: `node --max_old_space_size=2048 dist/index.cjs`

### Slow API responses

- Check database query performance
- Monitor OpenAI API response times
- Enable query logging: `npm run db:push`

## Scaling for Production

### Horizontal Scaling

1. Load balance across multiple instances
2. Use shared database for state
3. Use Redis for session storage

### Vertical Scaling

```env
NODE_OPTIONS=--max-old-space-size=4096
```

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Monitor query performance
EXPLAIN ANALYZE SELECT * FROM projects WHERE user_id = $1;
```

## Cost Optimization

- **OpenAI:** Monitor API calls, use batching when possible
- **Database:** Use appropriate instance size, archive old data
- **Server:** Right-size instances for your workload
- **CDN:** Serve static files from CDN
- **Backup:** Use incremental backups

---

For more help, see [README.md](./README.md) and [design_guidelines.md](./design_guidelines.md)
