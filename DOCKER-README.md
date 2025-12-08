# Photography Site - Complete Docker Setup

This is the **main Docker Compose configuration** for deploying the entire photography site.

## 📦 What's Included

- **MongoDB**: Database for CMS content
- **Payload CMS**: Backend API and admin panel
- **Nginx Frontend**: Static website serving

## 🚀 Quick Start

### Option 1: Automated Script (Recommended)

```powershell
# Run the automated deployment script
.\deploy.ps1
```

This will:
1. Build the CMS Docker image
2. Create `.env` file if needed
3. Let you choose Docker Compose or Portainer deployment
4. Start all services

### Option 2: Manual Deployment

```powershell
# 1. Build CMS image
cd photography-cms
docker build -t photography-cms:latest .
cd ..

# 2. Create environment file
cp .env.example .env
# Edit .env with your settings

# 3. Start all services
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Stop services
docker-compose down
```

## 🔧 Required Environment Variables

Edit `.env` with these settings:

```env
# Required
PAYLOAD_SECRET=<generate-with-openssl-rand-base64-32>
PAYLOAD_PUBLIC_SERVER_URL=http://your-server-ip:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password-here

# Optional but recommended
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Ports (optional, defaults shown)
CMS_PORT=3000
FRONTEND_PORT=8080
```

## 🌐 Access After Deployment

- **Frontend Website**: http://localhost:8080 (or your-server-ip:8080)
- **CMS Admin Panel**: http://localhost:3000/admin
- **CMS API**: http://localhost:3000/api
- **GraphQL Playground**: http://localhost:3000/api/graphql

## 📝 Portainer Deployment

For Portainer deployment:

1. **Build the image first**:
   ```powershell
   .\deploy.ps1
   # Choose option 2 or 3
   ```

2. **In Portainer UI**:
   - Stacks → Add Stack
   - Name: `photography-site`
   - Copy contents of `docker-compose.yml`
   - Add environment variables
   - Deploy!

See full guide: [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md)

## 🔍 Service Details

### MongoDB
- **Image**: mongo:7
- **Port**: 27017 (internal only)
- **Volume**: mongodb-data
- **Health check**: Automatic

### CMS (Payload)
- **Image**: photography-cms:latest (built locally)
- **Port**: 3000 (exposed)
- **Volume**: cms-media
- **Depends on**: MongoDB

### Frontend (nginx)
- **Image**: nginx:alpine
- **Port**: 8080 (exposed)
- **Config**: nginx.conf
- **Serves**: index-new.html, app.js, styles-new.css

## 🛠️ Common Commands

```powershell
# View all containers
docker-compose ps

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f cms

# Restart a service
docker-compose restart cms

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

## 🔄 Update Workflow

When you make changes:

### Update CMS Code
```powershell
cd photography-cms
docker build -t photography-cms:latest .
cd ..
docker-compose restart cms
```

### Update Frontend Files
```powershell
# Just restart - volumes auto-sync
docker-compose restart frontend
```

### Update Configuration
```powershell
# Edit .env or docker-compose.yml
docker-compose up -d
```

## 🐛 Troubleshooting

### Services won't start
```powershell
# Check logs
docker-compose logs

# Check specific service
docker-compose logs cms
docker-compose logs mongodb
```

### MongoDB health check fails
```powershell
# Check MongoDB logs
docker-compose logs mongodb

# Manually test connection
docker exec -it photography-mongodb mongosh
```

### CMS can't connect to MongoDB
- Ensure MongoDB is healthy: `docker-compose ps`
- Check environment variables in `.env`
- View CMS logs: `docker-compose logs cms`

### Frontend shows 404
- Check nginx config: `nginx.conf`
- Verify files are mounted: `docker-compose exec frontend ls /usr/share/nginx/html`
- Check logs: `docker-compose logs frontend`

### Port already in use
Edit `.env` and change ports:
```env
CMS_PORT=3001
FRONTEND_PORT=8081
```

## 📊 Volume Management

### Backup MongoDB
```powershell
docker exec photography-mongodb mongodump --out /tmp/backup
docker cp photography-mongodb:/tmp/backup ./backup-$(Get-Date -Format 'yyyy-MM-dd')
```

### Restore MongoDB
```powershell
docker cp ./backup photography-mongodb:/tmp/restore
docker exec photography-mongodb mongorestore /tmp/restore
```

### Backup Media Files
```powershell
docker run --rm -v photography-cms-media:/data -v ${PWD}:/backup alpine tar czf /backup/media-backup.tar.gz /data
```

## 🔒 Security Notes

- Change default `PAYLOAD_SECRET` before production
- Use strong admin password
- Enable HTTPS with reverse proxy (Traefik/nginx)
- Restrict port access via firewall
- Keep Docker images updated
- Regular backups of MongoDB and media

## 📚 Additional Documentation

- Full Deployment Guide: [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md)
- CMS Documentation: [photography-cms/README.md](photography-cms/README.md)
- Complete Project Guide: [README-COMPLETE.md](README-COMPLETE.md)
- Quick Reference: [QUICK-REFERENCE.md](QUICK-REFERENCE.md)

---

**Ready to deploy?** Run `.\deploy.ps1` to get started!
