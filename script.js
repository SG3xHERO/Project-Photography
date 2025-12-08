/**
 * BF Photography - Enhanced JavaScript
 * Modern interactions and photo gallery functionality
 */

(function($) {
  'use strict';

  // Configuration - Payload CMS
  const API_BASE = 'https://cms.benfoggon.com/api'; // Payload CMS
  let currentLightboxIndex = 0;
  let currentPhotos = [];

  // ==========================================
  // Page Loading & Preloader
  // ==========================================
  $(window).on('load', function() {
    setTimeout(function() {
      $('#js-preloader').addClass('loaded');
    }, 500);
  });

  // ==========================================
  // Navigation Scroll Effect
  // ==========================================
  $(window).on('scroll', function() {
    const scroll = $(window).scrollTop();
    
    // Add scrolled class to nav
    if (scroll >= 50) {
      $('.main-nav').addClass('scrolled');
    } else {
      $('.main-nav').removeClass('scrolled');
    }

    // Back to top button visibility
    if (scroll >= 300) {
      $('#backToTop').addClass('visible');
    } else {
      $('#backToTop').removeClass('visible');
    }
  });

  // ==========================================
  // Mobile Menu Toggle
  // ==========================================
  $('.mobile-menu-toggle').on('click', function() {
    $(this).toggleClass('active');
    $('.nav-links').toggleClass('active');
    $('body').toggleClass('menu-open');
  });

  // Close mobile menu when clicking a link
  $('.nav-link').on('click', function() {
    if ($(window).width() < 968) {
      $('.mobile-menu-toggle').removeClass('active');
      $('.nav-links').removeClass('active');
      $('body').removeClass('menu-open');
    }
  });

  // ==========================================
  // Smooth Scrolling for Anchor Links
  // ==========================================
  $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').on('click', function(event) {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && 
        location.hostname === this.hostname) {
      
      let target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      
      if (target.length) {
        event.preventDefault();
        
        $('html, body').animate({
          scrollTop: target.offset().top - 80
        }, 800, 'swing');
        
        // Update active nav link
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
      }
    }
  });

  // ==========================================
  // Back to Top Button
  // ==========================================
  $('#backToTop').on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 600);
    return false;
  });

  // ==========================================
  // Active Navigation on Scroll
  // ==========================================
  $(window).on('scroll', function() {
    const scrollPos = $(window).scrollTop() + 100;

    $('section[id]').each(function() {
      const section = $(this);
      const sectionTop = section.offset().top;
      const sectionBottom = sectionTop + section.outerHeight();
      const sectionId = section.attr('id');

      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        $('.nav-link').removeClass('active');
        $('.nav-link[href*="' + sectionId + '"]').addClass('active');
      }
    });
  });

  // ==========================================
  // Load Featured Photos
  // ==========================================
  async function loadFeaturedPhotos() {
    const featuredGrid = $('#featured-grid');
    
    try {
      // Load from Payload CMS - featured photos with depth to populate image
      const response = await fetch(`${API_BASE}/photos?where[featured][equals]=true&depth=1&limit=6`);
      
      if (!response.ok) {
        throw new Error('API not available');
      }
      
      const data = await response.json();
      
      // Check if we have photos from CMS
      if (data.docs && data.docs.length > 0) {
        displayFeaturedPhotos(data.docs);
      } else {
        console.log('No featured photos in CMS, loading demo...');
        loadDemoFeaturedPhotos();
      }
    } catch (error) {
      console.log('Loading demo photos...', error);
      // Fallback to demo data
      loadDemoFeaturedPhotos();
    }
  }

  function loadDemoFeaturedPhotos() {
    const demoPhotos = [
      {
        id: 1,
        title: 'Track Day Excellence',
        description: 'Capturing the intensity of motorcycle racing at its finest',
        image: 'https://images.unsplash.com/photo-1558980394-4c7c9923c096?w=800',
        category: 'Racing'
      },
      {
        id: 2,
        title: 'Custom Build Beauty',
        description: 'Artistry meets engineering in this stunning custom motorcycle',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
        category: 'Custom'
      },
      {
        id: 3,
        title: 'Open Road Freedom',
        description: 'The spirit of adventure captured on the open highway',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        category: 'Adventure'
      },
      {
        id: 4,
        title: 'Precision Engineering',
        description: 'Close-up details that showcase mechanical perfection',
        image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
        category: 'Detail'
      },
      {
        id: 5,
        title: 'Speed in Motion',
        description: 'Dynamic action shots from the racetrack',
        image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
        category: 'Racing'
      },
      {
        id: 6,
        title: 'Vintage Classic',
        description: 'Timeless beauty of classic motorcycle design',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        category: 'Classic'
      }
    ];

    displayFeaturedPhotos(demoPhotos);
  }

  function displayFeaturedPhotos(photos) {
    const featuredGrid = $('#featured-grid');
    featuredGrid.empty();

    if (!photos || photos.length === 0) {
      featuredGrid.html('<p class="text-center">No featured photos available</p>');
      return;
    }

    currentPhotos = photos;

    photos.forEach((photo, index) => {
      // Handle Payload CMS image format
      let imageUrl = '';
      if (photo.image) {
        if (typeof photo.image === 'string') {
          imageUrl = photo.image;
        } else if (photo.image.sizes && photo.image.sizes.card) {
          imageUrl = photo.image.sizes.card.url;
        } else if (photo.image.url) {
          imageUrl = photo.image.url;
        }
        // Make sure URL is absolute
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = API_BASE.replace('/api', '') + imageUrl;
        }
      }
      // Fallback for demo data format
      if (!imageUrl) {
        imageUrl = photo.url || 'https://via.placeholder.com/800x600';
      }
      
      const title = photo.title || 'Untitled';
      const description = photo.description || '';
      
      const photoCard = `
        <article class="photo-card" data-index="${index}">
          <img src="${imageUrl}" alt="${title}" loading="lazy">
          <div class="photo-card-overlay">
            <h3 class="photo-card-title">${title}</h3>
            <p class="photo-card-description">${description}</p>
          </div>
        </article>
      `;
      
      featuredGrid.append(photoCard);
    });

    // Attach click handlers
    $('.photo-card').on('click', function() {
      const index = $(this).data('index');
      openLightbox(index);
    });
  }

  // ==========================================
  // Load Albums
  // ==========================================
  async function loadAlbums() {
    const albumsGrid = $('#albums-grid');
    
    try {
      // Load from Payload CMS with depth to populate cover image
      const response = await fetch(`${API_BASE}/albums?depth=1&limit=10`);
      
      if (!response.ok) {
        throw new Error('API not available');
      }
      
      const data = await response.json();
      
      // Check if we have albums from CMS
      if (data.docs && data.docs.length > 0) {
        displayAlbums(data.docs);
      } else {
        console.log('No albums in CMS, loading demo...');
        loadDemoAlbums();
      }
    } catch (error) {
      console.log('Loading demo albums...', error);
      loadDemoAlbums();
    }
  }

  function loadDemoAlbums() {
    const demoAlbums = [
      {
        id: 1,
        title: 'Racing Season 2024',
        description: 'A complete collection from the 2024 racing season, featuring intense track action, pit scenes, and victory celebrations.',
        cover: 'https://images.unsplash.com/photo-1558980394-4c7c9923c096?w=800',
        photoCount: 45,
        date: '2024'
      },
      {
        id: 2,
        title: 'Custom Builds Showcase',
        description: 'Stunning custom motorcycles from talented builders. Each bike tells a unique story of creativity and craftsmanship.',
        cover: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
        photoCount: 32,
        date: '2024'
      },
      {
        id: 3,
        title: 'Off-Road Adventures',
        description: 'Dirt bikes, trails, and adventure motorcycles conquering challenging terrain and exploring the great outdoors.',
        cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        photoCount: 28,
        date: '2023'
      },
      {
        id: 4,
        title: 'Classic Motorcycles',
        description: 'Timeless vintage motorcycles, restored to perfection. A tribute to the golden age of motorcycling.',
        cover: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800',
        photoCount: 38,
        date: '2023'
      }
    ];

    displayAlbums(demoAlbums);
  }

  function displayAlbums(albums) {
    const albumsGrid = $('#albums-grid');
    albumsGrid.empty();

    if (!albums || albums.length === 0) {
      albumsGrid.html('<p class="text-center">No albums available</p>');
      return;
    }

    albums.forEach(album => {
      // Handle Payload CMS cover image format
      let coverUrl = '';
      if (album.coverImage) {
        if (typeof album.coverImage === 'string') {
          coverUrl = album.coverImage;
        } else if (album.coverImage.sizes && album.coverImage.sizes.card) {
          coverUrl = album.coverImage.sizes.card.url;
        } else if (album.coverImage.url) {
          coverUrl = album.coverImage.url;
        }
        // Make sure URL is absolute
        if (coverUrl && !coverUrl.startsWith('http')) {
          coverUrl = API_BASE.replace('/api', '') + coverUrl;
        }
      }
      // Fallback for demo data
      if (!coverUrl) {
        coverUrl = album.cover || 'https://via.placeholder.com/800x600';
      }
      
      const title = album.title || 'Untitled Album';
      const description = album.description || '';
      const photoCount = album.photoCount || 0;
      const date = album.publishedDate ? new Date(album.publishedDate).getFullYear() : '';
      
      const albumCard = `
        <article class="album-card" data-album-id="${album.id}" data-album-slug="${album.slug || ''}">
          <div class="album-image">
            <img src="${coverUrl}" alt="${title}" loading="lazy">
            <div class="album-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              ${photoCount} Photos
            </div>
          </div>
          <div class="album-content">
            <h3 class="album-title">${title}</h3>
            <p class="album-description">${description}</p>
            <div class="album-meta">
              <span>${date}</span>
            </div>
          </div>
        </article>
      `;
      
      albumsGrid.append(albumCard);
    });

    // Attach click handlers for albums
    $('.album-card').on('click', function() {
      const albumId = $(this).data('album-id');
      const albumSlug = $(this).data('album-slug');
      // You can implement album view functionality here
      console.log('Opening album:', albumId, albumSlug);
    });
  }

  // ==========================================
  // Lightbox Functionality
  // ==========================================
  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxContent();
    $('#lightbox').addClass('active');
    $('body').css('overflow', 'hidden');
  }

  function closeLightbox() {
    $('#lightbox').removeClass('active');
    $('body').css('overflow', '');
  }

  function updateLightboxContent() {
    if (!currentPhotos || currentPhotos.length === 0) return;

    const photo = currentPhotos[currentLightboxIndex];
    
    // Handle Payload CMS image format for lightbox (use full size)
    let imageUrl = '';
    if (photo.image) {
      if (typeof photo.image === 'string') {
        imageUrl = photo.image;
      } else if (photo.image.sizes && photo.image.sizes.full) {
        imageUrl = photo.image.sizes.full.url;
      } else if (photo.image.url) {
        imageUrl = photo.image.url;
      }
      // Make sure URL is absolute
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = API_BASE.replace('/api', '') + imageUrl;
      }
    }
    // Fallback for demo data
    if (!imageUrl) {
      imageUrl = photo.url || '';
    }
    
    const title = photo.title || 'Untitled';
    const description = photo.description || '';

    $('#lightbox-image').attr('src', imageUrl).attr('alt', title);
    $('#lightbox-title').text(title);
    $('#lightbox-description').text(description);
  }

  function nextPhoto() {
    currentLightboxIndex = (currentLightboxIndex + 1) % currentPhotos.length;
    updateLightboxContent();
  }

  function prevPhoto() {
    currentLightboxIndex = (currentLightboxIndex - 1 + currentPhotos.length) % currentPhotos.length;
    updateLightboxContent();
  }

  // Lightbox Event Handlers
  $('.lightbox-close').on('click', closeLightbox);
  $('.lightbox-next').on('click', nextPhoto);
  $('.lightbox-prev').on('click', prevPhoto);

  // Close lightbox on background click
  $('#lightbox').on('click', function(e) {
    if (e.target === this) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  $(document).on('keydown', function(e) {
    if ($('#lightbox').hasClass('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    }
  });

  // ==========================================
  // Lazy Loading Images
  // ==========================================
  function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
            
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // ==========================================
  // Animation on Scroll
  // ==========================================
  function animateOnScroll() {
    const elements = document.querySelectorAll('.photo-card, .album-card, .project-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '0';
          entry.target.style.transform = 'translateY(30px)';
          
          setTimeout(() => {
            entry.target.style.transition = 'all 0.6s ease-out';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, 100);
          
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  // ==========================================
  // Initialize Everything
  // ==========================================
  function init() {
    loadFeaturedPhotos();
    loadAlbums();
    setupLazyLoading();
    
    // Delay animation observer to allow content to load
    setTimeout(animateOnScroll, 1000);
  }

  // Start when DOM is ready
  $(document).ready(function() {
    init();
  });

  // ==========================================
  // Content Management Helper
  // ==========================================
  
  // This function helps you update content without a full CMS
  // You can call this from browser console to add photos/albums
  window.BFPhotography = {
    addFeaturedPhoto: function(photo) {
      currentPhotos.push(photo);
      displayFeaturedPhotos(currentPhotos);
      console.log('Photo added successfully!');
    },
    
    // Example: BFPhotography.addFeaturedPhoto({
    //   title: 'My Photo',
    //   description: 'Description here',
    //   image: 'https://example.com/image.jpg'
    // })
    
    exportData: function() {
      const data = {
        featured: currentPhotos,
        timestamp: new Date().toISOString()
      };
      console.log('Current data:', JSON.stringify(data, null, 2));
      return data;
    },
    
    loadFromJSON: function(jsonData) {
      if (jsonData.featured) {
        currentPhotos = jsonData.featured;
        displayFeaturedPhotos(currentPhotos);
        console.log('Data loaded successfully!');
      }
    }
  };

})(jQuery);

// ==========================================
// Performance Optimization
// ==========================================
// Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debounce to scroll handlers if needed
window.addEventListener('scroll', debounce(() => {
  // Additional scroll handling if needed
}, 100));
