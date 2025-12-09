# 🎨 BF Photography - Modern Photography Portfolio

A stunning, modern photography portfolio website with an ultra-modern design inspired by ProjectNetworks. Built with clean HTML, CSS, and JavaScript.

## ✨ Features

### 🎯 Design Highlights
- **Modern Purple/Blue Gradient Theme** - Eye-catching color scheme inspired by ProjectNetworks
- **Animated Background Effects** - Floating gradient orbs and noise overlay
- **Smooth Animations** - Fade-in effects, hover transitions, and scroll animations
- **Fully Responsive** - Perfect on desktop, tablet, and mobile devices
- **Dark Theme** - Professional dark mode design optimized for photography

### 📸 Photography Features
- **Featured Photos Gallery** - Showcase your best work
- **Album Collections** - Organize photos into albums
- **Lightbox Viewer** - Full-screen photo viewing with keyboard navigation
- **Lazy Loading** - Optimized image loading for fast performance
- **SEO Optimized** - Proper meta tags and structured data

### 🚀 Performance
- **Fast Loading** - Optimized assets and lazy loading
- **Smooth Scrolling** - Enhanced user experience
- **Mobile Optimized** - Touch-friendly and responsive
- **Clean Code** - Well-organized and maintainable

## 📁 File Structure

```
Project-Photography/
├── index-new.html          # New modern homepage
├── styles-new.css          # Complete styling
├── script-new.js           # All functionality
├── data/
│   └── content.json        # Content configuration
├── favicons/               # Site icons
└── README-NEW.md          # This file
```

## 🎨 Better CMS Recommendations

Your current Strapi setup might be overkill for a photography site. Here are better alternatives:

### **Option 1: Static JSON Files (Recommended for Simplicity)**
✅ **Best for**: Small to medium portfolios  
✅ **Pros**: 
- No server needed
- Super fast
- Easy to update
- Free hosting (GitHub Pages, Netlify, Vercel)
- No database required

Create a `data/photos.json` file:
```json
{
  "featured": [
    {
      "id": 1,
      "title": "Track Day Excellence",
      "description": "Description here",
      "image": "https://your-cdn.com/image.jpg",
      "category": "Racing"
    }
  ],
  "albums": [...]
}
```

### **Option 2: Directus (Modern & Lightweight)**
✅ **Best for**: If you want a CMS UI  
✅ **Pros**:
- Modern interface
- Lighter than Strapi
- Better for media management
- SQL-based (MySQL, PostgreSQL, SQLite)
- Open source

**Setup**:
```bash
npm init directus-project my-photos
```

### **Option 3: Sanity.io (Cloud-Based)**
✅ **Best for**: Collaborative editing  
✅ **Pros**:
- Excellent image handling
- Real-time collaboration
- Free tier available
- Hosted (no server management)
- Great media CDN

**Setup**:
```bash
npm install -g @sanity/cli
sanity init
```

### **Option 4: Cloudinary + JSON**
✅ **Best for**: Large photo libraries  
✅ **Pros**:
- Powerful image optimization
- Automatic responsive images
- Free tier: 25GB storage
- Simple JSON for metadata

### **Why Not Strapi?**
❌ Too heavy for simple photo galleries  
❌ Requires constant server  
❌ Overkill for photography sites  
❌ More suited for complex data models

## 🚀 Quick Start

### Option A: Use Demo Data (Fastest)
The site is pre-configured with demo photos from Unsplash. Just:

1. **Open `index-new.html`** in your browser
2. **That's it!** The demo data will load automatically

### Option B: Connect Your Own Photos

1. **Update `data/content.json`** with your information
2. **Replace demo photos** in `script-new.js`
3. **Or connect to your existing Strapi API** (if keeping it)

### Option C: Deploy to Production

#### Using Netlify (Recommended - Free):
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy
```

#### Using Vercel (Also Free):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Using GitHub Pages:
1. Push to GitHub
2. Go to Settings > Pages
3. Select branch and save
4. Your site will be live at `https://yourusername.github.io/Project-Photography`

## 🔧 Customization

### Change Colors
Edit `styles-new.css` variables:
```css
:root {
  --color-primary: #db01f9;      /* Main purple */
  --color-secondary: #0071f8;    /* Main blue */
  --color-accent: #00f5ff;       /* Accent cyan */
}
```

### Update Content
Edit `data/content.json`:
```json
{
  "site": {
    "title": "Your Name Photography",
    "subtitle": "Your Tagline",
    "description": "Your description"
  }
}
```

### Add Photos Programmatically
Open browser console on your site:
```javascript
// Add a featured photo
BFPhotography.addFeaturedPhoto({
  title: 'My Amazing Photo',
  description: 'Description here',
  image: 'https://example.com/photo.jpg',
  category: 'Racing'
});

// Export current data
BFPhotography.exportData();
```

## 📸 Managing Your Photos

### Method 1: JSON File (Simplest)
Create `data/photos.json`:
```json
{
  "featured": [
    {
      "id": 1,
      "title": "Photo Title",
      "description": "Photo description",
      "image": "https://your-image-url.jpg",
      "category": "Racing"
    }
  ],
  "albums": [
    {
      "id": 1,
      "title": "Album Title",
      "description": "Album description",
      "cover": "https://cover-image.jpg",
      "photoCount": 25,
      "date": "2024"
    }
  ]
}
```

Then update `script-new.js` to load from this file instead of the API.

### Method 2: Cloudinary Integration
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Upload your photos
3. Use their URL transformation API
4. Example:
```javascript
const cloudinaryBase = 'https://res.cloudinary.com/your-cloud/image/upload/';
const photoUrl = cloudinaryBase + 'w_800,q_auto,f_auto/your-photo.jpg';
```

### Method 3: GitHub as CMS
1. Store photos in a GitHub repo
2. Use GitHub's raw content URLs
3. Update via GitHub web interface or commits
4. Free and version controlled!

## 🎯 Connecting to Your Current Strapi

If you want to keep using Strapi, update `script-new.js`:

```javascript
const API_BASE = 'https://your-strapi-url.com/api';
```

Make sure your Strapi endpoints match:
- `/api/featured-photos?populate=*`
- `/api/albums?populate=*`

## 🌐 API Integration Examples

### Using Fetch with JSON File
```javascript
async function loadPhotos() {
  const response = await fetch('./data/photos.json');
  const data = await response.json();
  displayPhotos(data.featured);
}
```

### Using Directus API
```javascript
const API_BASE = 'https://your-directus.com';
const response = await fetch(`${API_BASE}/items/photos`);
```

### Using Sanity API
```javascript
const query = '*[_type == "photo"]';
const response = await fetch(
  `https://your-project.api.sanity.io/v1/data/query/production?query=${query}`
);
```

## 📱 Mobile Optimization

The site is fully responsive with breakpoints at:
- **968px** - Tablet landscape
- **640px** - Mobile

Mobile features:
- ✅ Hamburger menu
- ✅ Touch-friendly buttons
- ✅ Optimized images
- ✅ Fast loading

## 🎨 Design System

### Color Palette
- **Primary**: `#db01f9` (Purple)
- **Secondary**: `#0071f8` (Blue)
- **Accent**: `#00f5ff` (Cyan)
- **Background**: `#0a0a0f` (Dark)
- **Surface**: `#12121a` (Card background)

### Typography
- **Display**: Poppins (headings)
- **Body**: Inter (text)

### Spacing Scale
- Uses 4px base unit
- Consistent spacing throughout

## 🚀 Performance Tips

1. **Optimize Images**:
   - Use WebP format
   - Max width: 2000px
   - Use CDN (Cloudinary recommended)

2. **Lazy Loading**:
   - Already implemented
   - Images load as you scroll

3. **Caching**:
   - Set up browser caching
   - Use service workers for offline support

## 📊 SEO Checklist

✅ Meta titles and descriptions  
✅ Open Graph tags  
✅ Twitter Cards  
✅ Structured data (Schema.org)  
✅ Canonical URLs  
✅ Alt text for images  
✅ Sitemap.xml (create one)  
✅ robots.txt (create one)  

## 🔐 Security Best Practices

- ✅ HTTPS only
- ✅ No sensitive data in frontend
- ✅ Sanitize any user input
- ✅ Use Content Security Policy

## 📝 Next Steps

1. **Replace demo content** with your actual photos
2. **Choose a CMS solution** (or stick with JSON)
3. **Deploy to production** (Netlify/Vercel recommended)
4. **Set up custom domain**
5. **Add Google Analytics** (already has gtag.js)
6. **Create sitemap.xml**
7. **Test on real devices**

## 🆘 Troubleshooting

### Photos not loading?
- Check console for errors
- Verify image URLs are accessible
- Check CORS settings if using external API

### Lightbox not working?
- Ensure jQuery is loaded
- Check console for JavaScript errors
- Verify photo data structure

### Mobile menu not toggling?
- Check if jQuery is loaded
- Clear browser cache
- Test in different browsers

## 📞 Support & Contact

- **Portfolio**: https://benfoggon.com
- **Network**: https://projectnetworks.co.uk

## 📄 License

All code is provided as-is for your photography portfolio.

---

**Built with ❤️ for motorcycle photography**

*Last updated: December 2025*
