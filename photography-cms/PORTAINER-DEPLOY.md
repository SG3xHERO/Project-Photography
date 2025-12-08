# Quick Portainer Deployment Guide

## Prerequisites
- Portainer instance running
- Git repository accessible by Portainer
- Required environment variables ready

## Step-by-Step Deployment

### 1. Prepare Environment Variables

Create these environment variables in Portainer:

| Variable | Example Value | Required |
|----------|---------------|----------|
| `PAYLOAD_SECRET` | `your-random-secret-key-min-32-chars` | ✅ Yes |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://cms.yourdomain.com` | ✅ Yes |
| `CMS_PORT` | `3000` | ⚪ Optional |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | ⚪ Optional |
| `CLOUDINARY_API_KEY` | `your-api-key` | ⚪ Optional |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | ⚪ Optional |

**Generate a secure PAYLOAD_SECRET:**
```powershell
# PowerShell - Generate random 32-character secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 2. Deploy to Portainer

#### Method A: Git Repository (Recommended)

1. **Open Portainer**
   - Navigate to: `http://your-portainer:9000`
   - Login

2. **Add New Stack**
   - Click: Stacks → Add stack
   - Name: `photography-cms`

3. **Repository Configuration**
   - Build method: **Repository**
   - Repository URL: `https://forgejo.yourdomain.com/your-username/Project-Photography`
   - Repository reference: `refs/heads/main`
   - Compose path: `photography-cms/portainer-stack.yml`
   - Authentication: Add if private repo

4. **Environment Variables**
   Click "Add environment variable" for each:
   ```
   PAYLOAD_SECRET=<your-secret-from-step-1>
   PAYLOAD_PUBLIC_SERVER_URL=https://cms.yourdomain.com
   CMS_PORT=3000
   ```

5. **Enable Build**
   - ✅ Check "Enable automatic updates from git"
   - ✅ Check "Enable build"

6. **Deploy**
   - Click "Deploy the stack"
   - Wait for build to complete (5-10 minutes)

#### Method B: Upload docker-compose file

1. **Open Portainer**
   - Navigate to: Stacks → Add stack
   - Name: `photography-cms`

2. **Upload**
   - Build method: **Upload**
   - Upload: `portainer-stack.yml`

3. **Set Variables** (same as Method A)

4. **Deploy**

### 3. Verify Deployment

#### Check Container Status
```bash
# SSH into your server
docker ps | grep photography

# You should see:
# photography-cms-mongodb
# photography-cms
```

#### Check Logs
```bash
# Check CMS logs
docker logs photography-cms

# Look for:
✅ "Server listening on port 3000"
✅ "Payload Admin URL: http://localhost:3000/admin"
✅ "Admin user created: admin@example.com"
```

#### Test Access
1. Open browser: `http://your-server:3000/admin`
2. Login with:
   - Email: `admin@example.com`
   - Password: `changeme` (or your `ADMIN_PASSWORD`)

### 4. Post-Deployment

#### Change Admin Password
1. Login to admin panel
2. Go to Account Settings
3. Change password immediately

#### Configure Reverse Proxy (Optional)
If using nginx/Caddy:
```nginx
server {
    listen 443 ssl;
    server_name cms.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Build Fails
See: `PORTAINER-TROUBLESHOOTING.md`

### Can't Access Admin
```bash
# Check if container is running
docker ps | grep photography-cms

# Check logs for errors
docker logs photography-cms

# Check MongoDB connection
docker exec photography-cms node -e "console.log(process.env.MONGODB_URI)"
```

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Test MongoDB connection
docker exec photography-cms-mongodb mongosh --eval "db.adminCommand('ping')"
```

## Update Deployment

To update after code changes:

### Option 1: Auto-update (if enabled)
1. Push changes to git
2. In Portainer: Stack → photography-cms → Pull and redeploy

### Option 2: Manual rebuild
```bash
# SSH into server
cd /path/to/photography-cms
git pull
docker-compose build --no-cache
docker-compose up -d
```

## Backup

### Backup MongoDB
```bash
# Create backup
docker exec photography-cms-mongodb mongodump --out=/backup/$(date +%Y%m%d)

# Copy backup out
docker cp photography-cms-mongodb:/backup ./backup
```

### Backup Media Files
```bash
# Copy media volume
docker run --rm -v photography-media:/data -v $(pwd):/backup alpine \
  tar czf /backup/media-backup-$(date +%Y%m%d).tar.gz /data
```

## Quick Commands

```bash
# Start stack
docker-compose up -d

# Stop stack
docker-compose down

# Restart CMS only
docker restart photography-cms

# View logs (follow)
docker logs -f photography-cms

# Check MongoDB
docker exec -it photography-cms-mongodb mongosh

# Shell into CMS container
docker exec -it photography-cms sh
```

## Support
- Payload CMS Docs: https://payloadcms.com/docs
- Docker Docs: https://docs.docker.com
- Portainer Docs: https://docs.portainer.io
