# System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR SETUP                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PORTAINER (Your Home Server)                 │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Photography CMS Stack                                    │ │
│  │                                                           │ │
│  │  ┌─────────────────┐       ┌─────────────────┐          │ │
│  │  │  MongoDB        │       │  Payload CMS    │          │ │
│  │  │  Container      │◄──────│  Container      │          │ │
│  │  │                 │       │                 │          │ │
│  │  │  Port: 27017    │       │  Port: 3000     │          │ │
│  │  │  (internal)     │       │  (exposed)      │          │ │
│  │  │                 │       │                 │          │ │
│  │  │  Volume:        │       │  - REST API     │          │ │
│  │  │  mongodb-data   │       │  - GraphQL API  │          │ │
│  │  │                 │       │  - Admin Panel  │          │ │
│  │  └─────────────────┘       └────────┬────────┘          │ │
│  │                                     │                   │ │
│  └─────────────────────────────────────┼───────────────────┘ │
│                                        │                     │
└────────────────────────────────────────┼─────────────────────┘
                                         │
                                         │ HTTP Requests
                                         │
        ┌────────────────────────────────┼────────────────────┐
        │                                ▼                    │
        │                    http://server-ip:3000/           │
        │                                                     │
        │  ┌─────────────────┐      ┌──────────────────┐    │
        │  │   Admin Panel   │      │   Public API     │    │
        │  │   /admin        │      │   /api/*         │    │
        │  │                 │      │                  │    │
        │  │  - Upload       │      │  - GET /photos   │    │
        │  │  - Edit         │      │  - GET /albums   │    │
        │  │  - Configure    │      │  - GET /settings │    │
        │  └─────────────────┘      └──────────────────┘    │
        └─────────────────────────────────────────────────────┘
                                         │
                                         │ Fetches Data
                                         │
        ┌────────────────────────────────▼─────────────────────┐
        │                    Frontend Website                  │
        │                  (Static Files)                      │
        │                                                      │
        │  ┌────────────────┐  ┌────────────────┐            │
        │  │  index.html    │  │    app.js      │            │
        │  │                │  │                │            │
        │  │  - Hero        │  │  - Fetch API   │            │
        │  │  - Gallery     │◄─┤  - Render UI   │            │
        │  │  - About       │  │  - Lightbox    │            │
        │  │  - Contact     │  │  - Filters     │            │
        │  └────────────────┘  └────────────────┘            │
        │                                                      │
        │  Served by: nginx/Apache/any web server             │
        └──────────────────────────────────────────────────────┘
                                         │
                                         │ Displays
                                         │
        ┌────────────────────────────────▼─────────────────────┐
        │                    End Users                         │
        │                (Desktop/Mobile/Tablet)               │
        │                                                      │
        │  - Browse photos                                     │
        │  - View galleries                                    │
        │  - Filter by category                                │
        │  - Search photos                                     │
        └──────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Cloudinary CDN (Optional but Recommended)             │   │
│  │                                                        │   │
│  │  - Image Storage                                       │   │
│  │  - Automatic Resizing                                  │   │
│  │  - CDN Delivery                                        │   │
│  │  - Transformations                                     │   │
│  │                                                        │   │
│  │  Connected to: Payload CMS Media Collection            │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘


DATA FLOW:
==========

1. ADMIN WORKFLOW:
   Admin → http://server:3000/admin → Login → Upload Photo
   → Payload saves to MongoDB + uploads to Cloudinary
   → Photo available via API

2. USER WORKFLOW:
   User → Visits your website → app.js fetches from API
   → Renders gallery → User clicks photo
   → Lightbox displays Cloudinary-optimized image

3. CONTENT UPDATE:
   Change setting in CMS → Saved to MongoDB
   → Frontend fetches new data → Updates automatically


DEPLOYMENT OPTIONS:
===================

┌─────────────────────────────────────────────────────────────────┐
│  Option 1: Portainer (Recommended)                             │
│                                                                 │
│  1. Build Docker image: .\build-and-deploy.ps1                 │
│  2. Create stack in Portainer with portainer-stack.yml         │
│  3. Set environment variables                                  │
│  4. Deploy!                                                    │
│                                                                 │
│  Pros: One-click deploy, easy management, auto-restart         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Option 2: Docker Compose                                      │
│                                                                 │
│  1. cd photography-cms                                          │
│  2. docker-compose up -d                                        │
│                                                                 │
│  Pros: Simple local testing, quick setup                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Option 3: Local Development                                   │
│                                                                 │
│  1. npm install                                                 │
│  2. npm run dev                                                 │
│                                                                 │
│  Pros: Hot reload, debugging, TypeScript development           │
└─────────────────────────────────────────────────────────────────┘


SECURITY LAYERS:
================

┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: Network                                               │
│  - Firewall rules                                               │
│  - Port restrictions                                            │
│  - HTTPS/SSL (recommended)                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: Application (Payload CMS)                             │
│  - PAYLOAD_SECRET for JWT signing                               │
│  - Admin authentication required                                │
│  - CORS restrictions                                            │
│  - Role-based access control                                    │
└─────────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: Database                                              │
│  - MongoDB authentication                                       │
│  - Network isolation (Docker network)                           │
│  - Volume encryption (optional)                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4: External Services                                     │
│  - Cloudinary API keys                                          │
│  - Environment variable security                                │
│  - No hardcoded credentials                                     │
└─────────────────────────────────────────────────────────────────┘


SCALING PATH:
=============

Current Setup (Small):
┌──────────┐
│ 1 Server │ ← You are here
└──────────┘

Medium Scale:
┌──────────┐     ┌──────────┐
│   CMS    │────▶│ Database │
└──────────┘     └──────────┘
      │
      ▼
┌──────────┐
│ Frontend │
└──────────┘

Large Scale:
┌──────────┐     ┌──────────┐     ┌──────────┐
│   CMS    │────▶│ Database │◀────│ Replica  │
└──────────┘     └──────────┘     └──────────┘
      │
      ▼
┌──────────┐     ┌──────────┐
│Frontend 1│     │Frontend 2│
└──────────┘     └──────────┘
      │               │
      └───────┬───────┘
              ▼
      ┌──────────────┐
      │ Load Balancer│
      └──────────────┘
```

## Key Concepts

### Payload CMS
- **Headless**: No built-in frontend, just APIs
- **TypeScript**: Type-safe development
- **Collections**: Photos, Albums, Media, Users
- **Globals**: Site-wide settings (SiteSettings)
- **APIs**: REST + GraphQL for flexibility

### Docker Architecture
- **Multi-stage build**: Small production images
- **Health checks**: Auto-restart if unhealthy
- **Volumes**: Persistent data storage
- **Networks**: Isolated container communication

### Frontend Integration
- **API-first**: Fetches all content from CMS
- **Fallback**: Uses local JSON if CMS unavailable
- **Caching**: Client-side cache for performance
- **Progressive**: Works offline with cached data

### Cloudinary Benefits
- **CDN**: Global fast delivery
- **Transforms**: Automatic resizing
- **Optimization**: WebP conversion, quality tuning
- **Storage**: No local disk space needed

## Questions?

Read the docs:
- **Quick Start**: `.\QUICK-START.ps1`
- **Full Guide**: `README-COMPLETE.md`
- **Deployment**: `photography-cms/DEPLOYMENT.md`
- **Reference**: `QUICK-REFERENCE.md`
