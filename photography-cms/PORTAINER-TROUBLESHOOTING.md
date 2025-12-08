# Portainer Deployment Troubleshooting Guide

## Issue: Build Failed with Exit Code 1

**Error Message:**
```
Failed to deploy a stack: compose build operation failed: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
```

## Solutions Applied

### 1. **Updated Dockerfile** ✅
The Dockerfile has been optimized with a multi-stage build:
- **Builder stage**: Compiles TypeScript and builds Payload
- **Production stage**: Only includes runtime dependencies and built files

**Key improvements:**
- Uses `npm ci` instead of `npm install` for reproducible builds
- Explicitly compiles TypeScript before Payload build
- Sets required environment variables during build
- Separates build and production dependencies

### 2. **Updated Build Script** ✅
Modified `package.json` to compile TypeScript before running Payload build:
```json
"build": "tsc && payload build"
```

### 3. **Updated Portainer Stack Configuration** ✅
Added build context to `portainer-stack.yml`:
```yaml
cms:
  build:
    context: .
    dockerfile: Dockerfile
  image: photography-cms:latest
```

## Deployment Steps for Portainer

### Option A: Deploy via Portainer UI (Recommended)

1. **Navigate to Portainer**
   - Go to your Portainer instance
   - Click on "Stacks" → "Add stack"

2. **Configure Stack**
   - Name: `photography-cms`
   - Build method: Select "Repository"
   - Repository URL: Your Git repository URL
   - Repository reference: `main` (or your branch name)
   - Compose path: `photography-cms/portainer-stack.yml`

3. **Set Environment Variables**
   Click "Add environment variable" and set:
   ```
   PAYLOAD_SECRET=your-super-secret-key-change-this
   PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.com
   CMS_PORT=3000
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Enable Build**
   - Check "Enable build" option
   - This will build the image from the Dockerfile

5. **Deploy**
   - Click "Deploy the stack"
   - Monitor the build logs

### Option B: Build Locally and Push

If you prefer to build the image locally:

```powershell
# Navigate to the CMS directory
cd c:\Users\benf\Documents\Forgejo\Project-Photography\photography-cms

# Build the image
docker build -t photography-cms:latest .

# Tag for your registry (if using private registry)
docker tag photography-cms:latest your-registry/photography-cms:latest

# Push to registry
docker push your-registry/photography-cms:latest

# Then update portainer-stack.yml to use the image directly (remove build section)
```

### Option C: Use Docker Compose Locally First

Test the build locally before deploying to Portainer:

```powershell
# Navigate to the CMS directory
cd c:\Users\benf\Documents\Forgejo\Project-Photography\photography-cms

# Create .env file with your variables
Copy-Item .env.example .env
# Edit .env with your actual values

# Build and start
docker-compose up --build

# Test if it works
# Visit http://localhost:3000/admin

# If successful, deploy to Portainer
```

## Common Build Issues and Fixes

### Issue: "Cannot find module 'payload'"
**Cause:** Dependencies not installed properly
**Fix:** Ensure `npm ci` runs successfully in Dockerfile

### Issue: "TypeScript compilation failed"
**Cause:** TypeScript errors in source code
**Fix:** 
```powershell
# Install dependencies locally
npm install

# Check for TypeScript errors
npm run build

# Fix any errors before deploying
```

### Issue: "PAYLOAD_SECRET not set"
**Cause:** Missing environment variable during build
**Fix:** Dockerfile now sets a dummy secret for build time. Real secret is used at runtime.

### Issue: "Module not found: path"
**Cause:** @types/node not installed
**Fix:** Already included in devDependencies in package.json

## Verification Steps

After successful deployment:

1. **Check Container Status**
   ```bash
   docker ps | grep photography-cms
   ```

2. **Check Logs**
   ```bash
   docker logs photography-cms
   ```
   
   Look for:
   - "Server listening on port 3000"
   - "Payload Admin URL: http://localhost:3000/admin"

3. **Test Health Check**
   ```bash
   curl http://localhost:3000/admin
   ```

4. **Access Admin Panel**
   - Navigate to: `http://your-server:3000/admin`
   - Login with admin credentials

## Environment Variables Reference

Required variables:
- `PAYLOAD_SECRET`: Secret key for Payload (use a strong random string)
- `PAYLOAD_PUBLIC_SERVER_URL`: Public URL of your CMS
- `MONGODB_URI`: Set automatically by docker-compose
- `NODE_ENV`: Set to `production`

Optional variables:
- `CMS_PORT`: Default is 3000
- `CLOUDINARY_CLOUD_NAME`: For image storage
- `CLOUDINARY_API_KEY`: For image storage
- `CLOUDINARY_API_SECRET`: For image storage
- `ADMIN_EMAIL`: Initial admin user email (default: admin@example.com)
- `ADMIN_PASSWORD`: Initial admin password (default: changeme)

## Still Having Issues?

1. **Check Portainer Build Logs**
   - In Portainer, go to your stack
   - Click on the container
   - Check "Logs" tab for detailed error messages

2. **Verify Files are Present**
   - Ensure all source files are in the repository
   - Check `.dockerignore` isn't excluding necessary files

3. **Test Build Manually**
   ```powershell
   # Clone your repository
   git clone <your-repo-url>
   cd photography-cms
   
   # Try building
   docker build -t test-build .
   
   # Check what failed
   docker build --progress=plain -t test-build .
   ```

4. **Check Payload Version Compatibility**
   - Ensure you're using Payload 3.x compatible configuration
   - Current package.json shows: `"payload": "^3.0.0"`

## Next Steps

After successful deployment:
1. Change default admin password
2. Configure Cloudinary for image uploads
3. Set up SSL/TLS with reverse proxy (nginx/Caddy)
4. Configure automated backups for MongoDB
5. Set up monitoring and logging

## Support

If you continue to experience issues:
- Check Payload CMS documentation: https://payloadcms.com/docs
- Review Docker build logs carefully
- Ensure all dependencies in package.json are compatible
