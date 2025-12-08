# BF Photography - Complete Project Guide

A modern photography portfolio website with a powerful headless CMS backend, inspired by the ProjectNetworks design aesthetic.

## 🎯 Project Overview

This is a complete photography portfolio solution featuring:
- **Payload CMS Backend**: Modern headless CMS for content management
- **Docker/Portainer Ready**: Full containerization for easy deployment
- **ProjectNetworks Design**: Beautiful purple/blue gradient aesthetic with smooth animations
- **Cloudinary Integration**: Optimized image delivery and transformations
- **Responsive Design**: Works perfectly on all devices

## 📁 Project Structure

```
Project-Photography/
├── photography-cms/          # Payload CMS backend
│   ├── src/                  # CMS source code
│   ├── Dockerfile            # Production Docker image
│   ├── docker-compose.yml    # Local development
│   ├── portainer-stack.yml   # Portainer deployment
│   ├── DEPLOYMENT.md         # Deployment guide
│   └── README.md             # CMS documentation
│
├── index-new.html            # Main website (new design)
├── app.js                    # Frontend JavaScript with CMS integration
├── styles-new.css            # ProjectNetworks-inspired styles
├── data/                     # Legacy JSON data (for migration)
│   ├── content.json
│   └── photos.json
└── README.md                 # This file
```

## 🚀 Quick Start

### Option 1: Deploy CMS to Portainer (Recommended)

1. **Navigate to CMS directory:**
   ```powershell
   cd photography-cms
   ```

2. **Build the Docker image:**
   ```powershell
   .\build-and-deploy.ps1
   ```

3. **Deploy in Portainer:**
   - Open Portainer → Stacks → Add Stack
   - Name: `photography-cms`
   - Paste contents from `portainer-stack.yml`
   - Add environment variables (see below)
   - Click "Deploy the stack"

4. **Access the CMS:**
   - Navigate to `http://your-server-ip:3000/admin`
   - Log in with your admin credentials

**Required Environment Variables:**
```env
PAYLOAD_SECRET=your-random-secret-key
PAYLOAD_PUBLIC_SERVER_URL=http://your-server-ip:3000
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

### Option 2: Local Development

1. **Install dependencies:**
   ```powershell
   cd photography-cms
   npm install
   ```

2. **Configure environment:**
   ```powershell
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start MongoDB:**
   ```powershell
   docker run -d -p 27017:27017 --name mongodb mongo:7
   ```

4. **Run development server:**
   ```powershell
   npm run dev
   ```

5. **Access:**
   - Admin: http://localhost:3000/admin
   - API: http://localhost:3000/api

## 🎨 Frontend Setup

### 1. Update API Configuration

Edit `app.js` and set your CMS URL:

```javascript
const CONFIG = {
  CMS_API_URL: 'http://your-server-ip:3000/api', // Change this!
  CACHE_DURATION: 5 * 60 * 1000,
}
```

### 2. Serve the Frontend

You can use any static file server. Examples:

**Using Python:**
```powershell
python -m http.server 8080
```

**Using Node:**
```powershell
npx http-server -p 8080
```

**Using Docker:**
```powershell
docker run -d -p 8080:80 -v ${PWD}:/usr/share/nginx/html:ro nginx:alpine
```

### 3. Access the Site

Open `http://localhost:8080/index-new.html` in your browser.

## 📊 CMS Features

### Collections

1. **Photos**
   - Title, description, slug
   - Category (Racing, Custom, Adventure, Detail, etc.)
   - Tags for filtering
   - EXIF data (camera, lens, settings, location)
   - Featured flag
   - Published date
   - Relationship to albums

2. **Albums**
   - Title, description, slug
   - Cover image
   - Photo relationships
   - Auto-calculated photo count
   - Featured flag

3. **Media**
   - Automatic image resizing (thumbnail, card, featured)
   - Cloudinary integration
   - Alt text and captions
   - Upload management

4. **Site Settings** (Global)
   - Site title and subtitle
   - About section content
   - Social media links
   - SEO metadata
   - Contact information
   - Highlights/features

### API Endpoints

```
GET /api/photos                      # List all photos
GET /api/photos/:id                  # Get single photo
GET /api/photos?where[featured][equals]=true  # Featured photos only
GET /api/albums                      # List all albums
GET /api/globals/site-settings       # Get site settings
GET /api/media                       # List media files
GET /api/graphql                     # GraphQL endpoint
```

## 🔄 Migrating Existing Data

If you have data in `data/photos.json` and `data/content.json`:

```powershell
cd photography-cms

# Make sure CMS is running
docker-compose up -d

# Run migration
npm run migrate
```

This will import all your existing photos, albums, and settings into Payload.

## 🎨 Design Features

The frontend includes:

- ✨ **Animated Background**: ProjectNetworks-style gradient particles
- 🎭 **Smooth Animations**: AOS scroll animations throughout
- 🖼️ **Lightbox Gallery**: Full-screen photo viewer with navigation
- 🔍 **Search & Filter**: Find photos by category or keywords
- 📱 **Fully Responsive**: Perfect on mobile, tablet, and desktop
- 🎯 **Smooth Scrolling**: Elegant navigation between sections
- 🌈 **Purple/Blue Theme**: Beautiful gradient color scheme

## 🛠️ Configuration

### Cloudinary Setup (Recommended)

1. **Sign up** at https://cloudinary.com (free tier available)
2. **Get credentials** from Dashboard → Account Details
3. **Add to Portainer** environment variables or `.env` file
4. **Upload photos** through the CMS admin panel
5. **Enjoy optimized delivery** with automatic resizing and CDN

### Custom Domain & SSL

If you want `cms.yourdomain.com`:

1. **Point DNS** to your server
2. **Use reverse proxy** (Traefik or nginx)
3. **Get SSL certificate** (Let's Encrypt)
4. **Update** `PAYLOAD_PUBLIC_SERVER_URL`

Example with Traefik labels (add to `portainer-stack.yml`):

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.cms.rule=Host(`cms.yourdomain.com`)"
  - "traefik.http.routers.cms.tls.certresolver=letsencrypt"
```

## 📝 Common Tasks

### Add a New Photo

1. Go to CMS Admin → Photos → Create New
2. Fill in title, description, category
3. Upload image (will auto-upload to Cloudinary)
4. Add EXIF data if desired
5. Check "Featured" if you want it on homepage
6. Save

### Create an Album

1. Go to CMS Admin → Albums → Create New
2. Add title and description
3. Select cover image
4. Select photos to include
5. Save

### Update Site Settings

1. Go to CMS Admin → Globals → Site Settings
2. Edit any field (title, about, social links)
3. Save
4. Changes reflect immediately on frontend

### Backup Your Data

```powershell
# Backup MongoDB
docker exec photography-cms-mongodb mongodump --out /tmp/backup
docker cp photography-cms-mongodb:/tmp/backup ./backup-$(Get-Date -Format 'yyyy-MM-dd')

# Or use Portainer volumes backup feature
```

## 🐛 Troubleshooting

### CMS Won't Start

**Check logs:**
```powershell
docker logs photography-cms
docker logs photography-cms-mongodb
```

**Common fixes:**
- Ensure MongoDB is healthy
- Check environment variables
- Verify port 3000 is not in use

### Frontend Can't Connect to API

**Check:**
1. CMS is running: `docker ps | Select-String photography`
2. API URL in `app.js` is correct
3. CORS is configured properly
4. No firewall blocking port 3000

**Test API manually:**
```powershell
Invoke-WebRequest -Uri "http://your-server:3000/api/photos" | Select-Object -ExpandProperty Content
```

### Images Not Loading

**Check:**
1. Cloudinary credentials are correct
2. Images were uploaded successfully (check Media library)
3. Image URLs in browser network tab
4. Fallback to local storage (remove Cloudinary vars)

## 📚 Documentation

- **CMS Guide**: See `photography-cms/README.md`
- **Deployment**: See `photography-cms/DEPLOYMENT.md`
- **Implementation**: See `photography-cms/IMPLEMENTATION-SUMMARY.md`
- **Payload Docs**: https://payloadcms.com/docs

## 🔒 Security Best Practices

- [ ] Change default `PAYLOAD_SECRET`
- [ ] Use strong admin password
- [ ] Enable HTTPS in production
- [ ] Keep MongoDB data backed up
- [ ] Update CORS settings for your domain
- [ ] Don't commit `.env` files
- [ ] Use Cloudinary for public images (not sensitive data)
- [ ] Keep Docker images updated

## 🎯 Next Steps

1. **Deploy CMS** to your Portainer server
2. **Upload photos** through admin panel
3. **Configure** site settings
4. **Update** `app.js` with your CMS URL
5. **Deploy frontend** to your web server
6. **Set up** custom domain and SSL
7. **Enjoy** your beautiful photography site!

## 💡 Tips

- Start with local development to test everything
- Use Cloudinary for best image performance
- Backup MongoDB regularly
- Monitor CMS logs in Portainer
- Cache API responses on frontend for speed
- Use the GraphQL endpoint for complex queries
- Add more collections as needed (Testimonials, Blog, etc.)

## 🆘 Getting Help

- **Payload Community**: https://discord.gg/payload
- **Payload Docs**: https://payloadcms.com/docs
- **Docker Docs**: https://docs.docker.com/
- **Portainer Docs**: https://docs.portainer.io/

## 📝 License

MIT - Feel free to use and modify for your own projects!

---

**Built with**: Payload CMS • Docker • Cloudinary • MongoDB • Love ❤️
