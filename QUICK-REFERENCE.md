# 🚀 Photography Site - Quick Reference Card

## One-Command Deploy

```powershell
# From the root directory (Project-Photography/)
.\deploy.ps1

# Follow prompts for Portainer or local deployment
```

## Environment Variables (Required)

```env
PAYLOAD_SECRET=<openssl rand -base64 32>
PAYLOAD_PUBLIC_SERVER_URL=http://your-server-ip:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourSecurePassword123
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

## Portainer Deployment (3 Steps)

1. **Build**: `.\deploy.ps1` (choose option 2 or 3)
2. **Deploy**: Portainer → Stacks → Add Stack → Paste `docker-compose.yml` (from root)
3. **Access**: CMS at `http://your-server-ip:3000/admin`, Site at `http://your-server-ip:8080`

## Local Development (3 Steps)

```powershell
cd photography-cms
npm install
npm run dev
# Access: http://localhost:3000/admin
```

## Docker Compose (2 Steps)

```powershell
cd photography-cms
docker-compose up -d
# Access: http://localhost:3000/admin
```

## Key URLs

| Service | URL |
|---------|-----|
| Admin Panel | `http://your-server:3000/admin` |
| REST API | `http://your-server:3000/api` |
| GraphQL | `http://your-server:3000/api/graphql` |
| Photos API | `http://your-server:3000/api/photos` |
| Settings API | `http://your-server:3000/api/globals/site-settings` |

## Common Commands

```powershell
# View logs
docker logs photography-cms

# Restart CMS
docker restart photography-cms

# Backup MongoDB
docker exec photography-cms-mongodb mongodump --out /tmp/backup

# Run migration
npm run migrate

# Build TypeScript
npm run build

# Generate types
npm run generate:types
```

## API Examples

### Get Featured Photos
```bash
curl http://localhost:3000/api/photos?where[featured][equals]=true
```

### Get Site Settings
```bash
curl http://localhost:3000/api/globals/site-settings
```

### GraphQL Query
```graphql
query {
  Photos(where: { featured: { equals: true } }) {
    docs {
      id
      title
      image { url }
    }
  }
}
```

## Frontend Integration

Update `app.js`:
```javascript
const CONFIG = {
  CMS_API_URL: 'http://your-server-ip:3000/api',
}
```

Fetch photos:
```javascript
const photos = await fetch(`${CONFIG.CMS_API_URL}/photos?where[featured][equals]=true`)
  .then(r => r.json())
  .then(data => data.docs)
```

## File Structure

```
Project-Photography/
├── photography-cms/          ← Backend CMS
│   ├── src/                  ← TypeScript source
│   ├── Dockerfile            ← Production build
│   ├── docker-compose.yml    ← Local dev
│   ├── portainer-stack.yml   ← Portainer deploy
│   └── DEPLOYMENT.md         ← Full guide
├── app.js                    ← Frontend JS
├── index-new.html            ← Main site
├── styles-new.css            ← Styles
└── README-COMPLETE.md        ← Full docs
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CMS won't start | Check logs: `docker logs photography-cms` |
| Can't log in | Verify admin credentials in env vars |
| Images not loading | Check Cloudinary credentials |
| Frontend can't connect | Update API URL in `app.js` |
| MongoDB error | Ensure container is healthy: `docker ps` |

## Quick Links

- 📖 **Full Guide**: `README-COMPLETE.md`
- 🚀 **Deploy Guide**: `photography-cms/DEPLOYMENT.md`
- 💻 **CMS Docs**: `photography-cms/README.md`
- 🎯 **Summary**: `PROJECT-SUMMARY.md`
- ⚡ **Quick Start**: Run `.\QUICK-START.ps1`

## Support Resources

- Payload CMS: https://payloadcms.com/docs
- Docker: https://docs.docker.com
- Portainer: https://docs.portainer.io
- Cloudinary: https://cloudinary.com/documentation

## Security Checklist

- [ ] Generated secure `PAYLOAD_SECRET`
- [ ] Changed default admin password
- [ ] Updated CORS in `payload.config.ts`
- [ ] Configured HTTPS/SSL
- [ ] Set up MongoDB backups
- [ ] Restricted network access

## Next Steps

1. ✅ Read `PROJECT-SUMMARY.md`
2. ✅ Run `.\QUICK-START.ps1`
3. ✅ Deploy to Portainer
4. ✅ Configure Cloudinary
5. ✅ Upload photos
6. ✅ Update frontend API URL
7. ✅ Test everything
8. ✅ Go live!

---

**Need help?** Start with `.\QUICK-START.ps1` or read `README-COMPLETE.md`
