# Photography CMS - Payload Setup

A powerful headless CMS for managing your photography portfolio, built with Payload CMS.

## 🚀 Features

- **Photo Management**: Full CRUD for photos with metadata, EXIF data, and categorization
- **Album Organization**: Group photos into albums
- **Media Library**: Integrated media management with Cloudinary support
- **Global Settings**: Manage site-wide settings from the admin panel
- **REST & GraphQL APIs**: Access your content via modern APIs
- **Docker Ready**: Fully containerized for easy deployment to Portainer
- **TypeScript**: Type-safe development experience

## 📋 Prerequisites

- Node.js 18+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- MongoDB (included in Docker setup)
- Cloudinary account (optional, for cloud image storage)

## 🛠️ Local Development Setup

### 1. Install Dependencies

```bash
cd photography-cms
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
# MongoDB connection (use localhost for local dev)
MONGODB_URI=mongodb://localhost:27017/photography-cms

# Generate a secure secret (use: openssl rand -base64 32)
PAYLOAD_SECRET=your-super-secret-key-here

# Your server URL
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Cloudinary credentials (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin user (created on first run)
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=secure-password
```

### 3. Start MongoDB (if not using Docker)

```bash
# Using Docker for MongoDB only:
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### 4. Run Development Server

```bash
npm run dev
```

The CMS will be available at:
- Admin Panel: http://localhost:3000/admin
- API: http://localhost:3000/api
- GraphQL: http://localhost:3000/api/graphql

### 5. Build for Production

```bash
npm run build
npm run serve
```

## 🐳 Docker Deployment

### Local Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Portainer Deployment

#### Method 1: Portainer Stack (Recommended)

1. Open Portainer UI
2. Go to **Stacks** → **Add Stack**
3. Name it `photography-cms`
4. Copy the contents of `portainer-stack.yml`
5. Set environment variables:
   ```
   PAYLOAD_SECRET=your-secret-key
   PAYLOAD_PUBLIC_SERVER_URL=http://your-domain.com
   CMS_PORT=3000
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
6. Click **Deploy the stack**

#### Method 2: Build & Deploy via CLI

```bash
# Build the image
docker build -t photography-cms:latest .

# Tag for your registry (if using one)
docker tag photography-cms:latest your-registry/photography-cms:latest

# Push to registry
docker push your-registry/photography-cms:latest

# Deploy stack in Portainer using portainer-stack.yml
```

## 🔄 Migrating Existing Content

Run the migration script to import your existing JSON data:

```bash
# Make sure the CMS is running
npm run dev

# In another terminal, run migration
npm run migrate
```

This will:
- Import all photos from `data/photos.json`
- Import site settings from `data/content.json`
- Create albums if defined
- Map relationships between photos and albums

## 📁 Project Structure

```
photography-cms/
├── src/
│   ├── collections/      # Payload collections
│   │   ├── Photos.ts     # Photos collection
│   │   ├── Albums.ts     # Albums collection
│   │   ├── Media.ts      # Media library
│   │   └── Users.ts      # Admin users
│   ├── globals/          # Global settings
│   │   └── SiteSettings.ts
│   ├── payload.config.ts # Main Payload config
│   └── server.ts         # Express server
├── scripts/
│   └── migrate.ts        # Data migration script
├── Dockerfile            # Production Docker image
├── docker-compose.yml    # Local Docker setup
├── portainer-stack.yml   # Portainer deployment
└── package.json
```

## 🔌 API Usage

### REST API Examples

```bash
# Get all photos
curl http://localhost:3000/api/photos

# Get a single photo
curl http://localhost:3000/api/photos/:id

# Get site settings
curl http://localhost:3000/api/globals/site-settings

# Get all albums
curl http://localhost:3000/api/albums
```

### GraphQL Example

```graphql
query {
  Photos {
    docs {
      id
      title
      description
      category
      featured
      image {
        url
        alt
      }
    }
  }
}
```

## 🖼️ Frontend Integration

Update your frontend to fetch from the CMS:

```javascript
// Fetch all featured photos
const response = await fetch('http://localhost:3000/api/photos?where[featured][equals]=true')
const data = await response.json()
const photos = data.docs

// Fetch site settings
const settingsResponse = await fetch('http://localhost:3000/api/globals/site-settings')
const settings = await settingsResponse.json()
```

## 🔒 Security Considerations

1. **Change Default Credentials**: Always update `PAYLOAD_SECRET`, admin email, and password
2. **Use HTTPS**: In production, always use HTTPS
3. **Environment Variables**: Never commit `.env` files
4. **CORS**: Update CORS settings in `payload.config.ts` for your domain
5. **Rate Limiting**: Consider adding rate limiting in production
6. **Backups**: Regularly backup MongoDB data

## 🎯 Next Steps

1. **Set up Cloudinary**: For optimized image delivery and transformations
2. **Configure Domain**: Point your domain to the CMS
3. **SSL/TLS**: Set up SSL certificates (use Traefik or nginx)
4. **Monitoring**: Add logging and monitoring (consider Sentry)
5. **Backups**: Set up automated MongoDB backups
6. **CDN**: Use Cloudflare or similar for static assets

## 📚 Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Portainer Documentation](https://docs.portainer.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🐛 Troubleshooting

### CMS won't start
- Check MongoDB is running: `docker ps | grep mongo`
- Verify environment variables are set correctly
- Check logs: `docker-compose logs cms`

### Can't log in
- Verify admin credentials in `.env`
- Check if user was created: Look for "Default admin user created" in logs

### Images not uploading
- Check Cloudinary credentials
- Verify `media` directory has write permissions
- Check Docker volume mounts

## 📝 License

MIT
