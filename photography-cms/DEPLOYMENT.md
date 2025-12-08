# Quick Deployment Guide for Portainer

## Prerequisites
- Docker and Portainer running on your home server
- Cloudinary account (free tier works) - Sign up at https://cloudinary.com

## Step 1: Prepare Environment Variables

Before deploying, gather these values:

1. **PAYLOAD_SECRET**: Generate a secure random string
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32
   
   # On Windows PowerShell:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

2. **PAYLOAD_PUBLIC_SERVER_URL**: Your server URL (e.g., `http://192.168.1.100:3000` or `https://cms.yourdomain.com`)

3. **Cloudinary Credentials**: Get from https://cloudinary.com/console
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

4. **Admin Credentials**: Choose your admin email and password
   - ADMIN_EMAIL
   - ADMIN_PASSWORD

## Step 2: Build Docker Image

### Option A: Build on Your Server

```bash
# Navigate to the CMS directory
cd photography-cms

# Build the Docker image
docker build -t photography-cms:latest .
```

### Option B: Build Locally and Export

```bash
# Build the image
docker build -t photography-cms:latest .

# Save to tar file
docker save photography-cms:latest -o photography-cms.tar

# Transfer to your server (use scp, USB, etc.)
# Then load on the server:
docker load -i photography-cms.tar
```

## Step 3: Deploy in Portainer

### Method 1: Using Portainer Stacks (Recommended)

1. **Open Portainer** in your browser (usually http://your-server:9000)

2. **Navigate to Stacks**
   - Click on "Stacks" in the left menu
   - Click "Add stack"

3. **Create the Stack**
   - Name: `photography-cms`
   - Build method: "Web editor"

4. **Paste the Stack Configuration**
   
   Copy this YAML (or use the `portainer-stack.yml` file):

   ```yaml
   version: '3.8'

   services:
     mongodb:
       image: mongo:7
       container_name: photography-cms-mongodb
       restart: unless-stopped
       environment:
         MONGO_INITDB_DATABASE: photography-cms
       volumes:
         - photography-mongodb-data:/data/db
       networks:
         - photography-network
       healthcheck:
         test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
         interval: 10s
         timeout: 5s
         retries: 5

     cms:
       image: photography-cms:latest
       container_name: photography-cms
       restart: unless-stopped
       ports:
         - "3000:3000"
       environment:
         MONGODB_URI: mongodb://mongodb:27017/photography-cms
         DATABASE_URI: mongodb://mongodb:27017/photography-cms
         PAYLOAD_SECRET: ${PAYLOAD_SECRET}
         PAYLOAD_PUBLIC_SERVER_URL: ${PAYLOAD_PUBLIC_SERVER_URL}
         PORT: 3000
         NODE_ENV: production
         CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
         CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
         CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
         ADMIN_EMAIL: ${ADMIN_EMAIL}
         ADMIN_PASSWORD: ${ADMIN_PASSWORD}
       depends_on:
         mongodb:
           condition: service_healthy
       networks:
         - photography-network
       volumes:
         - photography-media:/app/media

   volumes:
     photography-mongodb-data:
     photography-media:

   networks:
     photography-network:
   ```

5. **Add Environment Variables**
   
   Scroll down to "Environment variables" and add:
   
   | Name | Value |
   |------|-------|
   | PAYLOAD_SECRET | (your generated secret) |
   | PAYLOAD_PUBLIC_SERVER_URL | http://192.168.1.100:3000 |
   | CLOUDINARY_CLOUD_NAME | (your cloudinary name) |
   | CLOUDINARY_API_KEY | (your cloudinary key) |
   | CLOUDINARY_API_SECRET | (your cloudinary secret) |
   | ADMIN_EMAIL | admin@example.com |
   | ADMIN_PASSWORD | YourSecurePassword123 |

6. **Deploy the Stack**
   - Click "Deploy the stack"
   - Wait for containers to start (check "Containers" view)

7. **Verify Deployment**
   - Go to Containers in Portainer
   - You should see two containers running:
     - `photography-cms-mongodb`
     - `photography-cms`
   - Check logs for any errors

## Step 4: Access the CMS

1. Open your browser and go to: `http://your-server-ip:3000/admin`
2. Log in with your admin email and password
3. You should see the Payload CMS admin panel!

## Step 5: Import Existing Data

If you have existing photos in `data/photos.json`:

```bash
# SSH into your server or run in Portainer console
docker exec -it photography-cms npm run migrate
```

Or manually upload photos through the admin panel:
1. Go to Media → Upload files
2. Go to Photos → Create new
3. Fill in the details and link to uploaded media

## Step 6: Configure Your Frontend

Update your photography site to fetch from the CMS API:

```javascript
const API_URL = 'http://your-server-ip:3000/api'

// Fetch photos
const photos = await fetch(`${API_URL}/photos?where[featured][equals]=true`)
  .then(res => res.json())

// Fetch settings
const settings = await fetch(`${API_URL}/globals/site-settings`)
  .then(res => res.json())
```

## Troubleshooting

### Can't access the admin panel
- Check if containers are running: Portainer → Containers
- Verify port 3000 is not blocked by firewall
- Check logs in Portainer for errors

### Database connection errors
- Ensure MongoDB container is healthy (green status)
- Check environment variables are set correctly
- View logs: `docker logs photography-cms-mongodb`

### Image upload fails
- Verify Cloudinary credentials
- Check if media volume has proper permissions
- Try using local storage first (remove Cloudinary vars)

### Reset admin password
```bash
# Access the container shell in Portainer or via CLI:
docker exec -it photography-cms sh

# Create new admin (inside container):
node -e "
const payload = require('payload');
payload.init({ secret: process.env.PAYLOAD_SECRET, local: true }).then(() => {
  payload.create({
    collection: 'users',
    data: { email: 'newadmin@example.com', password: 'newpassword', name: 'Admin', role: 'admin' }
  }).then(() => process.exit(0));
});
"
```

## Production Checklist

- [ ] Changed default admin password
- [ ] Generated secure PAYLOAD_SECRET
- [ ] Set up HTTPS (reverse proxy with Traefik/nginx)
- [ ] Configured proper CORS in `payload.config.ts`
- [ ] Set up MongoDB backups
- [ ] Configured Cloudinary for image optimization
- [ ] Updated frontend to use production API URL
- [ ] Tested all API endpoints
- [ ] Set up monitoring/logging

## Next Steps

1. **Set up reverse proxy** (Traefik/nginx) for HTTPS
2. **Configure domain** to point to your server
3. **Set up automated backups** for MongoDB
4. **Add monitoring** (Uptime Kuma, Grafana)
5. **Optimize images** in Cloudinary dashboard
6. **Update frontend** to use the new CMS API

## Support

- Payload CMS Docs: https://payloadcms.com/docs
- Discord: https://discord.gg/payload
- GitHub Issues: https://github.com/payloadcms/payload/issues
