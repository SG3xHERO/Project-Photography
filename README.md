# 📸 BF Photography Site

Modern photography portfolio with headless CMS backend, fully containerized and ready for Portainer deployment.

## 🚀 Quick Deploy

**Easiest way** - Run the automated script:

```powershell
.\deploy.ps1
```

This will:
- ✅ Build Docker images
- ✅ Setup environment
- ✅ Deploy locally OR prepare for Portainer

## 📦 What's Inside

- **Payload CMS** - Modern headless CMS backend (Port 3000)
- **Frontend Website** - Beautiful photography gallery (Port 8080)
- **MongoDB** - Database for content
- **Docker Ready** - One-click deployment to Portainer

## 🌐 After Deployment

| Service | URL |
|---------|-----|
| **Website** | http://localhost:8080 |
| **CMS Admin** | http://localhost:3000/admin |
| **API** | http://localhost:3000/api |

## 📚 Documentation

- **Quick Start**: `.\deploy.ps1` ← Start here!
- **Docker Guide**: [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md)
- **Complete Docs**: [README-COMPLETE.md](README-COMPLETE.md)
- **Quick Reference**: [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

## 🔧 Requirements

- Docker & Docker Compose
- Portainer (for server deployment)
- Cloudinary account (optional, for images)

## 📝 Configuration

1. Copy `.env.example` to `.env`
2. Update these required values:
   ```env
   PAYLOAD_SECRET=<generate-random-secret>
   PAYLOAD_PUBLIC_SERVER_URL=http://your-server-ip:3000
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=secure-password
   ```

3. Optional (recommended):
   ```env
   CLOUDINARY_CLOUD_NAME=your-name
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ```

## 🐳 Deployment Options

### Option 1: Docker Compose (Local)

```powershell
docker-compose up -d
```

### Option 2: Portainer

1. Run `.\deploy.ps1`
2. In Portainer: Stacks → Add Stack
3. Paste `docker-compose.yml` contents
4. Add environment variables
5. Deploy!

Full guide: [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md)

## 🛠️ Common Commands

```powershell
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart cms
docker-compose restart frontend
```

## 📁 Project Structure

```
Project-Photography/
├── docker-compose.yml      ← Main Docker config (deploy this!)
├── deploy.ps1              ← Automated build script
├── nginx.conf              ← Frontend web server config
├── .env.example            ← Environment template
├── index-new.html          ← Website
├── app.js                  ← Frontend JavaScript
├── styles-new.css          ← Styles
├── photography-cms/        ← CMS source code
│   ├── Dockerfile
│   └── src/
└── docs/                   ← Documentation
```

## 🎯 Next Steps

1. **Deploy**: Run `.\deploy.ps1`
2. **Login**: Go to http://localhost:3000/admin
3. **Upload**: Add photos via CMS
4. **Configure**: Update site settings
5. **Enjoy**: Visit http://localhost:8080

## 🆘 Troubleshooting

**Portainer error?**
- Use `docker-compose.yml` from **root directory**
- Build image first: `.\deploy.ps1`

**Can't access?**
- Check services: `docker-compose ps`
- View logs: `docker-compose logs`

**Need help?**
- Read: [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md)
- Check: [README-COMPLETE.md](README-COMPLETE.md)

## 📸 Features

✨ Modern admin panel for photo management  
✨ Automatic image optimization with Cloudinary  
✨ Responsive gallery with lightbox viewer  
✨ Category filtering and search  
✨ REST & GraphQL APIs  
✨ TypeScript throughout  
✨ Docker containerized  
✨ Production ready  

---

**Ready to start?** Run `.\deploy.ps1` now!
