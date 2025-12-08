# Photography Site - Complete Docker Deployment Guide

## 🚀 Quick Deploy to Portainer

### Step 1: Prepare the Image

You need to build the CMS Docker image first:

```powershell
# Navigate to CMS directory
cd photography-cms

# Build the image
docker build -t photography-cms:latest .

# Go back to root
cd ..
```

Or use the automated script:
```powershell
cd photography-cms
.\build-and-deploy.ps1
```

### Step 2: Deploy Stack in Portainer

1. **Open Portainer** (usually http://your-server:9000)

2. **Go to Stacks** → **Add Stack**

3. **Configuration**:
   - **Name**: `photography-site`
   - **Build method**: Web editor
   - **Deployment**: Select your Docker environment

4. **Paste the Stack Content**:
   - Copy the entire contents of `docker-compose.yml` from the root directory
   - Paste into the Web editor

5. **Add Environment Variables**:
   Click "Add environment variable" for each:
   
   | Name | Value | Required |
   |------|-------|----------|
   | `PAYLOAD_SECRET` | Generate: `openssl rand -base64 32` | ✅ Yes |
   | `PAYLOAD_PUBLIC_SERVER_URL` | `http://YOUR_SERVER_IP:3000` | ✅ Yes |
   | `ADMIN_EMAIL` | Your admin email | ✅ Yes |
   | `ADMIN_PASSWORD` | Secure password | ✅ Yes |
   | `CMS_PORT` | `3000` | No (default) |
   | `FRONTEND_PORT` | `8080` | No (default) |
   | `CLOUDINARY_CLOUD_NAME` | Your Cloudinary name | Recommended |
   | `CLOUDINARY_API_KEY` | Your API key | Recommended |
   | `CLOUDINARY_API_SECRET` | Your API secret | Recommended |

6. **Deploy the Stack**
   - Click "Deploy the stack"
   - Wait for all services to start (check "Containers" view)

### Step 3: Verify Deployment

Check that all containers are running:
- ✅ `photography-mongodb` (healthy)
- ✅ `photography-cms` (running)
- ✅ `photography-frontend` (running)

### Step 4: Access Your Site

- **Frontend Website**: `http://YOUR_SERVER_IP:8080`
- **CMS Admin Panel**: `http://YOUR_SERVER_IP:3000/admin`
- **CMS API**: `http://YOUR_SERVER_IP:3000/api`

---

## 🐳 Alternative: Local Docker Compose

For local testing or development:

```powershell
# Copy environment file
cp .env.example .env

# Edit .env with your settings
notepad .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📝 Configuration Files

All Docker configuration is now in the **root directory**:

- `docker-compose.yml` - Main stack configuration
- `.env.example` - Environment variables template
- `nginx.conf` - Frontend web server config
- `.dockerignore` - Files to exclude from Docker

---

## 🔧 Update Frontend API URL

After deployment, update the CMS URL in `app.js`:

```javascript
const CONFIG = {
  CMS_API_URL: 'http://YOUR_SERVER_IP:3000/api', // Update this!
}
```

Then restart the frontend container:
```powershell
docker restart photography-frontend
```

---

## 🛠️ Troubleshooting

### Portainer Error: "no such file or directory"

**Solution**: Make sure you're using `docker-compose.yml` in the **root directory**, not the one in `photography-cms/` folder.

### CMS Image Not Found

**Error**: `image photography-cms:latest not found`

**Solution**: Build the image first:
```powershell
cd photography-cms
docker build -t photography-cms:latest .
```

### MongoDB Won't Start

**Check**: View logs in Portainer or run:
```powershell
docker logs photography-mongodb
```

### Frontend Shows 404

**Check**:
1. Verify files are mounted correctly
2. Check nginx.conf is loaded
3. View logs: `docker logs photography-frontend`

### Can't Access CMS Admin

**Check**:
1. CMS container is running: `docker ps | Select-String photography-cms`
2. Port 3000 is accessible (firewall)
3. Environment variables are set correctly
4. View logs: `docker logs photography-cms`

---

## 🔐 Security Checklist

Before production:

- [ ] Generate secure `PAYLOAD_SECRET`
- [ ] Change default admin password
- [ ] Use HTTPS (reverse proxy with Traefik/nginx)
- [ ] Update CORS settings in `photography-cms/src/payload.config.ts`
- [ ] Restrict port access via firewall
- [ ] Set up regular MongoDB backups
- [ ] Use strong Cloudinary credentials

---

## 📊 Service Architecture

```
┌─────────────────────────────────────────────┐
│            Docker Stack                     │
│                                             │
│  ┌─────────────┐  ┌─────────────┐         │
│  │  Frontend   │  │     CMS     │         │
│  │   (nginx)   │  │  (Payload)  │         │
│  │  Port 8080  │  │  Port 3000  │         │
│  └──────┬──────┘  └──────┬──────┘         │
│         │                │                 │
│         └────────┬───────┘                 │
│                  │                         │
│         ┌────────▼────────┐                │
│         │    MongoDB      │                │
│         │   Port 27017    │                │
│         │   (internal)    │                │
│         └─────────────────┘                │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Post-Deployment Steps

1. **Configure CMS**:
   - Log in to `http://YOUR_SERVER_IP:3000/admin`
   - Update site settings
   - Upload photos

2. **Update Frontend**:
   - Edit `app.js` with correct API URL
   - Restart frontend: `docker restart photography-frontend`

3. **Test Everything**:
   - Visit `http://YOUR_SERVER_IP:8080`
   - Verify photos load from CMS
   - Test lightbox and filters

4. **Optional Enhancements**:
   - Set up reverse proxy (Traefik) for HTTPS
   - Configure custom domain
   - Set up automated backups

---

## 📚 Additional Resources

- Main Documentation: `README-COMPLETE.md`
- Quick Reference: `QUICK-REFERENCE.md`
- CMS Guide: `photography-cms/README.md`
- Architecture: `ARCHITECTURE.md`

---

**Ready to deploy?** Follow Step 1 to build the image, then deploy via Portainer!
