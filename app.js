// Photography Site - Main JavaScript with CMS Integration
// Inspired by ProjectNetworks design

// Configuration
const CONFIG = {
  CMS_API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://cms.benfoggon.com/api', // Update with your CMS URL
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
}

// State management
const state = {
  photos: [],
  albums: [],
  settings: {},
  currentCategory: 'all',
  currentAlbum: null,
  lightboxIndex: 0,
  loading: false,
}

// Cache management
const cache = {
  data: {},
  set(key, value) {
    this.data[key] = {
      value,
      timestamp: Date.now(),
    }
  },
  get(key) {
    const cached = this.data[key]
    if (!cached) return null
    if (Date.now() - cached.timestamp > CONFIG.CACHE_DURATION) {
      delete this.data[key]
      return null
    }
    return cached.value
  },
}

// API Helper Functions
const api = {
  async fetch(endpoint, options = {}) {
    const cached = cache.get(endpoint)
    if (cached && !options.noCache) return cached

    try {
      const response = await fetch(`${CONFIG.CMS_API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      cache.set(endpoint, data)
      return data
    } catch (error) {
      console.error('API Fetch Error:', error)
      // Fallback to local data if CMS is unavailable
      return this.fallbackData(endpoint)
    }
  },

  async getPhotos(params = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.featured) queryParams.append('where[featured][equals]', 'true')
    if (params.category) queryParams.append('where[category][equals]', params.category)
    if (params.limit) queryParams.append('limit', params.limit)
    queryParams.append('sort', '-publishedDate')
    
    const query = queryParams.toString()
    const endpoint = `/photos${query ? `?${query}` : ''}`
    const response = await this.fetch(endpoint)
    return response.docs || []
  },

  async getAlbums() {
    const response = await this.fetch('/albums?limit=100')
    return response.docs || []
  },

  async getSettings() {
    return await this.fetch('/globals/site-settings')
  },

  async getPhoto(id) {
    const response = await this.fetch(`/photos/${id}`)
    return response
  },

  // Fallback to local JSON if CMS is unavailable
  fallbackData(endpoint) {
    console.warn('Using fallback data for:', endpoint)
    if (endpoint.includes('/photos')) {
      return fetch('/data/photos.json').then(r => r.json()).then(data => ({ docs: data.featured || [] }))
    }
    if (endpoint.includes('/site-settings')) {
      return fetch('/data/content.json').then(r => r.json())
    }
    return { docs: [] }
  },
}

// UI Rendering Functions
const ui = {
  showLoading(show = true) {
    const loader = document.getElementById('loading')
    if (loader) {
      loader.style.display = show ? 'flex' : 'none'
    }
    state.loading = show
  },

  renderSettings() {
    const settings = state.settings

    // Update page title
    document.title = `${settings.siteTitle || 'BF Photography'} - ${settings.siteSubtitle || 'Motorcycle Photography'}`

    // Update hero section
    const heroTitle = document.querySelector('.hero-title')
    const heroSubtitle = document.querySelector('.hero-subtitle')
    if (heroTitle) heroTitle.textContent = settings.siteTitle || 'BF Photography'
    if (heroSubtitle) heroSubtitle.textContent = settings.siteSubtitle || 'Capturing the Spirit of Motorcycles'

    // Update about section
    const aboutTitle = document.querySelector('#about .section-title')
    const aboutContent = document.querySelector('#about .about-content')
    if (aboutTitle) aboutTitle.textContent = settings.aboutTitle || 'About My Photography'
    if (aboutContent && settings.aboutContent) {
      // Convert rich text to HTML (simplified - you may need a proper converter)
      aboutContent.innerHTML = typeof settings.aboutContent === 'string' 
        ? settings.aboutContent 
        : this.richTextToHTML(settings.aboutContent)
    }

    // Update highlights
    this.renderHighlights(settings.highlights || [])

    // Update social links
    this.renderSocialLinks(settings)
  },

  richTextToHTML(richText) {
    // Simple rich text converter - adapt based on Payload's output
    if (typeof richText === 'string') return richText
    if (richText.root && richText.root.children) {
      return richText.root.children.map(child => {
        if (child.type === 'paragraph') {
          return `<p>${child.children.map(c => c.text || '').join('')}</p>`
        }
        return ''
      }).join('')
    }
    return ''
  },

  renderHighlights(highlights) {
    const container = document.querySelector('.highlights-grid')
    if (!container || !highlights.length) return

    container.innerHTML = highlights.map(h => `
      <div class="highlight-card" data-aos="fade-up">
        <div class="highlight-icon">
          <i class="fas fa-${h.icon || 'star'}"></i>
        </div>
        <h3>${h.title}</h3>
        <p>${h.description}</p>
      </div>
    `).join('')
  },

  renderSocialLinks(settings) {
    const socialContainer = document.querySelector('.social-links')
    if (!socialContainer) return

    const links = []
    if (settings.instagram) links.push({ icon: 'instagram', url: settings.instagram })
    if (settings.facebook) links.push({ icon: 'facebook', url: settings.facebook })
    if (settings.twitter) links.push({ icon: 'twitter', url: settings.twitter })
    if (settings.youtube) links.push({ icon: 'youtube', url: settings.youtube })

    socialContainer.innerHTML = links.map(link => `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link">
        <i class="fab fa-${link.icon}"></i>
      </a>
    `).join('')
  },

  renderPhotos(photos = state.photos) {
    const grid = document.querySelector('.gallery-grid')
    if (!grid) return

    if (!photos.length) {
      grid.innerHTML = '<p class="no-photos">No photos found</p>'
      return
    }

    grid.innerHTML = photos.map((photo, index) => {
      const imageUrl = this.getImageUrl(photo.image)
      const thumbnailUrl = this.getImageUrl(photo.image, 'card')
      
      return `
        <div class="gallery-item" data-category="${photo.category}" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
          <div class="gallery-item-inner">
            <img 
              src="${thumbnailUrl}" 
              alt="${photo.image?.alt || photo.title}"
              loading="lazy"
              class="gallery-image"
            />
            <div class="gallery-overlay">
              <div class="gallery-info">
                <h3 class="gallery-title">${photo.title}</h3>
                <p class="gallery-category">
                  <i class="fas fa-tag"></i> ${this.formatCategory(photo.category)}
                </p>
                ${photo.exifData?.camera ? `
                  <p class="gallery-exif">
                    <i class="fas fa-camera"></i> ${photo.exifData.camera}
                  </p>
                ` : ''}
              </div>
              <button 
                class="btn-view" 
                onclick="lightbox.open(${index})"
                aria-label="View ${photo.title}"
              >
                <i class="fas fa-search-plus"></i> View
              </button>
            </div>
          </div>
        </div>
      `
    }).join('')
  },

  getImageUrl(image, size = 'featured') {
    if (!image) return '/assets/images/placeholder.jpg'
    
    // Handle different image formats from CMS
    if (typeof image === 'string') return image
    
    // Cloudinary or uploaded image
    if (image.sizes && image.sizes[size]) {
      return image.sizes[size].url
    }
    
    return image.url || image.filename || '/assets/images/placeholder.jpg'
  },

  formatCategory(category) {
    if (!category) return 'Uncategorized'
    return category.charAt(0).toUpperCase() + category.slice(1)
  },

  renderFilters() {
    const container = document.querySelector('.filter-buttons')
    if (!container) return

    const categories = ['all', ...new Set(state.photos.map(p => p.category).filter(Boolean))]
    
    container.innerHTML = categories.map(cat => `
      <button 
        class="filter-btn ${cat === state.currentCategory ? 'active' : ''}"
        onclick="filters.setCategory('${cat}')"
        data-category="${cat}"
      >
        ${this.formatCategory(cat)}
      </button>
    `).join('')
  },
}

// Filter Functions
const filters = {
  setCategory(category) {
    state.currentCategory = category
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category)
    })

    // Filter photos
    const filtered = category === 'all' 
      ? state.photos 
      : state.photos.filter(p => p.category === category)
    
    ui.renderPhotos(filtered)
    
    // Refresh AOS animations
    if (window.AOS) AOS.refresh()
  },

  search(query) {
    if (!query) {
      ui.renderPhotos()
      return
    }

    const lowerQuery = query.toLowerCase()
    const filtered = state.photos.filter(photo => {
      return photo.title?.toLowerCase().includes(lowerQuery) ||
             photo.description?.toLowerCase().includes(lowerQuery) ||
             photo.category?.toLowerCase().includes(lowerQuery) ||
             photo.tags?.some(t => t.tag?.toLowerCase().includes(lowerQuery))
    })

    ui.renderPhotos(filtered)
    if (window.AOS) AOS.refresh()
  },
}

// Lightbox Functions
const lightbox = {
  open(index) {
    state.lightboxIndex = index
    const photo = state.photos[index]
    if (!photo) return

    const modal = document.getElementById('lightbox')
    if (!modal) return

    const img = modal.querySelector('.lightbox-image')
    const title = modal.querySelector('.lightbox-title')
    const description = modal.querySelector('.lightbox-description')
    const exif = modal.querySelector('.lightbox-exif')
    const counter = modal.querySelector('.lightbox-counter')

    if (img) img.src = ui.getImageUrl(photo.image, 'featured')
    if (title) title.textContent = photo.title
    if (description) description.textContent = photo.description || ''
    if (counter) counter.textContent = `${index + 1} / ${state.photos.length}`

    // Render EXIF data
    if (exif && photo.exifData) {
      const exifItems = []
      if (photo.exifData.camera) exifItems.push(`<i class="fas fa-camera"></i> ${photo.exifData.camera}`)
      if (photo.exifData.lens) exifItems.push(`<i class="fas fa-aperture"></i> ${photo.exifData.lens}`)
      if (photo.exifData.settings) exifItems.push(`<i class="fas fa-sliders-h"></i> ${photo.exifData.settings}`)
      if (photo.exifData.location) exifItems.push(`<i class="fas fa-map-marker-alt"></i> ${photo.exifData.location}`)
      exif.innerHTML = exifItems.join('<span class="separator">•</span>')
    }

    modal.classList.add('active')
    document.body.style.overflow = 'hidden'
  },

  close() {
    const modal = document.getElementById('lightbox')
    if (modal) {
      modal.classList.remove('active')
      document.body.style.overflow = ''
    }
  },

  next() {
    state.lightboxIndex = (state.lightboxIndex + 1) % state.photos.length
    this.open(state.lightboxIndex)
  },

  prev() {
    state.lightboxIndex = (state.lightboxIndex - 1 + state.photos.length) % state.photos.length
    this.open(state.lightboxIndex)
  },
}

// Scroll Animations
const animations = {
  init() {
    // Initialize AOS if available
    if (window.AOS) {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 100,
      })
    }

    // Parallax effect for hero
    this.initParallax()

    // Navbar scroll effect
    this.initNavbarScroll()
  },

  initParallax() {
    const hero = document.querySelector('.hero-section')
    if (!hero) return

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset
      const parallaxSpeed = 0.5
      hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`
    })
  },

  initNavbarScroll() {
    const navbar = document.querySelector('.navbar')
    if (!navbar) return

    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled')
      } else {
        navbar.classList.remove('scrolled')
      }
    })
  },
}

// Event Listeners
function initEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('searchInput')
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filters.search(e.target.value)
    })
  }

  // Lightbox keyboard navigation
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightbox')
    if (!modal || !modal.classList.contains('active')) return

    if (e.key === 'Escape') lightbox.close()
    if (e.key === 'ArrowRight') lightbox.next()
    if (e.key === 'ArrowLeft') lightbox.prev()
  })

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute('href'))
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    })
  })

  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle')
  const navMenu = document.querySelector('.nav-menu')
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active')
      menuToggle.classList.toggle('active')
    })
  }
}

// Initialize Application
async function init() {
  console.log('Initializing Photography Site...')
  ui.showLoading(true)

  try {
    // Load data from CMS
    const [photos, albums, settings] = await Promise.all([
      api.getPhotos({ limit: 100 }),
      api.getAlbums(),
      api.getSettings(),
    ])

    // Update state
    state.photos = photos
    state.albums = albums
    state.settings = settings

    console.log('Loaded:', { 
      photos: photos.length, 
      albums: albums.length,
      settings: !!settings 
    })

    // Render UI
    ui.renderSettings()
    ui.renderPhotos()
    ui.renderFilters()

    // Initialize animations and events
    animations.init()
    initEventListeners()

    console.log('✓ Site initialized successfully')
  } catch (error) {
    console.error('Initialization error:', error)
    // Try to load fallback data
    try {
      const fallbackPhotos = await fetch('/data/photos.json').then(r => r.json())
      state.photos = fallbackPhotos.featured || []
      ui.renderPhotos()
      ui.renderFilters()
    } catch (fallbackError) {
      console.error('Fallback data failed:', fallbackError)
      document.querySelector('.gallery-grid').innerHTML = '<p class="error-message">Failed to load photos. Please try again later.</p>'
    }
  } finally {
    ui.showLoading(false)
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// Export for debugging
if (typeof window !== 'undefined') {
  window.photographySite = {
    state,
    api,
    ui,
    filters,
    lightbox,
    reload: init,
  }
}
