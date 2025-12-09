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
  let currentAlbum = null;

  // ==========================================
  // Page Loading & Preloader
  // ==========================================
  $(window).on('load', function() {
    setTimeout(function() {
      $('#js-preloader').addClass('loaded');
    }, 500);
    
    // Handle URL routing on page load
    handleRouting();
  });

  // ==========================================
  // URL Routing for Albums and Photos
  // ==========================================
  function handleRouting() {
    const hash = window.location.hash;
    
    // Check for album route: #album/slug or #album/id
    if (hash.startsWith('#album/')) {
      const albumIdentifier = hash.replace('#album/', '');
      openAlbumByIdentifier(albumIdentifier);
      return;
    }
    
    // Check for photo route: #photo/id
    if (hash.startsWith('#photo/')) {
      const photoId = hash.replace('#photo/', '');
      openPhotoById(photoId);
      return;
    }
  }

  // Listen for hash changes
  window.addEventListener('hashchange', handleRouting);

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
  // Photography Dropdown Menu
  // ==========================================
  let dropdownTimeout;
  
  $('#photography-dropdown-trigger').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#photography-dropdown').toggleClass('active');
  });

  // Close dropdown when clicking outside
  $(document).on('click', function(e) {
    if (!$(e.target).closest('.logo, .photography-dropdown').length) {
      $('#photography-dropdown').removeClass('active');
    }
  });

  // Hover behavior for desktop
  $('.logo').on('mouseenter', function() {
    if ($(window).width() >= 968) {
      clearTimeout(dropdownTimeout);
      $('#photography-dropdown').addClass('active');
    }
  });

  $('.logo, .photography-dropdown').on('mouseleave', function() {
    if ($(window).width() >= 968) {
      dropdownTimeout = setTimeout(function() {
        $('#photography-dropdown').removeClass('active');
      }, 200);
    }
  });

  $('.photography-dropdown').on('mouseenter', function() {
    if ($(window).width() >= 968) {
      clearTimeout(dropdownTimeout);
    }
  });

  // Logo BF click to go home
  $('#logo-home .logo-text').on('click', function(e) {
    e.preventDefault();
    window.location.hash = '';
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      location.reload();
    } else {
      window.location.href = '/';
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
  // Load and Apply Site Settings
  // ==========================================
  async function loadSiteSettings() {
    try {
      const response = await fetch(`${API_BASE}/globals/siteSettings`);
      if (!response.ok) throw new Error('Failed to load settings');
      
      const data = await response.json();
      applySiteSettings(data);
    } catch (error) {
      console.log('Using default site settings');
    }
  }

  function applySiteSettings(settings) {
    // Hero Section
    if (settings.hero) {
      if (settings.hero.badge) {
        $('.hero-badge span').text(settings.hero.badge);
      }
      if (settings.hero.title) {
        $('.hero-title .gradient-text').text(settings.hero.title);
      }
      if (settings.hero.subtitle) {
        $('.hero-subtitle').text(settings.hero.subtitle);
      }
      if (settings.hero.description) {
        $('.hero-text').text(settings.hero.description);
      }
      if (settings.hero.primaryButtonText) {
        $('.hero-actions .btn-primary').contents().last()[0].textContent = settings.hero.primaryButtonText;
      }
      if (settings.hero.secondaryButtonText) {
        $('.hero-actions .btn-outline').contents().last()[0].textContent = settings.hero.secondaryButtonText;
      }
    }

    // About Section
    if (settings.about) {
      if (settings.about.sectionLabel) {
        $('.about-section .section-label').text(settings.about.sectionLabel);
      }
      if (settings.about.title) {
        $('.about-section .section-title').html(`${settings.about.title.split(' ').slice(0, -2).join(' ')} <span class="gradient-text">${settings.about.title.split(' ').slice(-2).join(' ')}</span>`);
      }
      if (settings.about.paragraph1) {
        $('.about-text p').first().text(settings.about.paragraph1);
      }
      if (settings.about.paragraph2) {
        $('.about-text p').last().text(settings.about.paragraph2);
      }
      
      // Enhanced image handling for about section
      if (settings.about.image) {
        let imageUrl = '';
        
        // Try different image format possibilities
        if (settings.about.image.sizes?.card?.url) {
          imageUrl = settings.about.image.sizes.card.url;
        } else if (settings.about.image.sizes?.thumbnail?.url) {
          imageUrl = settings.about.image.sizes.thumbnail.url;
        } else if (settings.about.image.url) {
          imageUrl = settings.about.image.url;
        } else if (typeof settings.about.image === 'string') {
          imageUrl = settings.about.image;
        }
        
        // Make URL absolute if it's relative
        if (imageUrl) {
          if (!imageUrl.startsWith('http')) {
            imageUrl = `${API_BASE.replace('/api', '')}${imageUrl}`;
          }
          console.log('Setting about image to:', imageUrl);
          $('.about-image img').attr('src', imageUrl);
        }
      } else if (settings.about.imageFallbackUrl) {
        $('.about-image img').attr('src', settings.about.imageFallbackUrl);
      }

      // Update feature items
      if (settings.about.features && settings.about.features.length > 0) {
        const $featureContainer = $('.about-features');
        $featureContainer.empty();
        
        settings.about.features.forEach(feature => {
          const iconSVG = getFeatureIcon(feature.icon);
          $featureContainer.append(`
            <div class="feature-item">
              <div class="feature-icon">
                ${iconSVG}
              </div>
              <div class="feature-text">
                <h4>${feature.title}</h4>
                <p>${feature.description}</p>
              </div>
            </div>
          `);
        });
      }
    }

    // Other Projects Section
    if (settings.otherProjects) {
      if (settings.otherProjects.sectionLabel) {
        $('.sister-sites-section .section-label').text(settings.otherProjects.sectionLabel);
      }
      if (settings.otherProjects.title) {
        $('.sister-sites-section .section-title').text(settings.otherProjects.title);
      }
      if (settings.otherProjects.description) {
        $('.sister-sites-section .section-description').text(settings.otherProjects.description);
      }

      // Update projects
      if (settings.otherProjects.projects && settings.otherProjects.projects.length > 0) {
        const $projectGrid = $('.project-grid');
        $projectGrid.empty();
        
        settings.otherProjects.projects.forEach(project => {
          const imageUrl = project.image?.sizes?.card?.url 
            ? `${API_BASE.replace('/api', '')}${project.image.sizes.card.url}`
            : project.imageFallbackUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800';
          
          $projectGrid.append(`
            <article class="project-card">
              <div class="project-image">
                <img src="${imageUrl}" alt="${project.title}" loading="lazy">
              </div>
              <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-footer">
                  <a href="${project.url}" class="project-link" target="_blank" rel="noopener">
                    ${project.buttonText || 'Visit Site'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          `);
        });
      }
    }

    // Footer
    if (settings.footer) {
      if (settings.footer.description) {
        $('.footer-about p').text(settings.footer.description);
      }
      if (settings.footer.copyrightText) {
        $('.footer-bottom p').html(`&copy; ${settings.footer.copyrightText}`);
      }
      if (settings.footer.links && settings.footer.links.length > 0) {
        const $footerLinks = $('.footer-links ul');
        $footerLinks.empty();
        settings.footer.links.forEach(link => {
          $footerLinks.append(`<li><a href="${link.url}" target="_blank">${link.text}</a></li>`);
        });
      }
    }

    // Social Links
    if (settings.socialLinks && settings.socialLinks.length > 0) {
      const $socialLinks = $('.footer-social');
      $socialLinks.empty();
      settings.socialLinks.forEach(social => {
        const iconSVG = getSocialIcon(social.platform);
        $socialLinks.append(`
          <a href="${social.url}" target="_blank" rel="noopener" aria-label="${social.platform}">
            ${iconSVG}
          </a>
        `);
      });
    }
  }

  function getFeatureIcon(iconType) {
    const icons = {
      camera: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',
      shield: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      heart: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
      star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
      zap: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    };
    return icons[iconType] || icons.camera;
  }

  function getSocialIcon(platform) {
    const icons = {
      instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
      twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>',
      facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
      youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>',
      linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>',
      github: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>',
    };
    return icons[platform] || '';
  }

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
      const photoId = photo.id || photo._id || index;
      
      const photoCard = `
        <article class="photo-card" data-index="${index}" data-photo-id="${photoId}">
          <div class="photo-wrapper">
            <img src="${imageUrl}" alt="${title}" loading="lazy" oncontextmenu="return false;" draggable="false">
            <div class="photo-watermark">Ben Foggon</div>
            <div class="photo-protection-overlay"></div>
          </div>
          <div class="photo-card-overlay">
            <h3 class="photo-card-title">${title}</h3>
            <p class="photo-card-description">${description}</p>
            <button class="photo-share-btn" data-photo-id="${photoId}" data-title="${title}" title="Share this photo">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          </div>
        </article>
      `;
      
      featuredGrid.append(photoCard);
    });

    // Attach click handlers for photo cards
    $('.photo-card').on('click', function(e) {
      // Don't open lightbox if clicking share button
      if ($(e.target).closest('.photo-share-btn').length) {
        return;
      }
      const index = $(this).data('index');
      openLightbox(index);
    });
    
    // Attach share button handlers
    $('.photo-share-btn').on('click', function(e) {
      e.stopPropagation();
      const photoId = $(this).data('photo-id');
      const title = $(this).data('title');
      window.sharePhoto(photoId, title);
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
      const slug = album.slug || album.id || '';
      const date = album.publishedDate ? new Date(album.publishedDate).getFullYear() : '';
      
      // Calculate photo count - check multiple possible properties
      let photoCount = 0;
      if (album.photos && Array.isArray(album.photos)) {
        photoCount = album.photos.length;
      } else if (album.photoCount) {
        photoCount = album.photoCount;
      } else if (album.photos) {
        photoCount = album.photos;
      }
      
      const albumCard = `
        <article class="album-card" data-album-id="${album.id}" data-album-slug="${slug}">
          <div class="album-image">
            <img src="${coverUrl}" alt="${title}" loading="lazy">
            <div class="album-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              ${photoCount} Photo${photoCount !== 1 ? 's' : ''}
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
      // Navigate to album page with URL
      window.location.hash = `album/${albumSlug || albumId}`;
    });
  }

  // ==========================================
  // Open Album View
  // ==========================================
  async function openAlbumByIdentifier(identifier) {
    // Try to find album by slug first, then by ID
    try {
      let album = null;
      let albumId = null;
      
      // Try finding by slug
      const slugResponse = await fetch(`${API_BASE}/albums?where[slug][equals]=${identifier}&depth=2&limit=1`);
      if (slugResponse.ok) {
        const slugData = await slugResponse.json();
        if (slugData.docs && slugData.docs.length > 0) {
          album = slugData.docs[0];
          albumId = album.id;
        }
      }
      
      // If not found by slug, try by ID
      if (!album) {
        albumId = identifier;
        const idResponse = await fetch(`${API_BASE}/albums/${albumId}?depth=2`);
        if (idResponse.ok) {
          album = await idResponse.json();
        }
      }
      
      if (album) {
        await displayAlbumPage(album, albumId);
      } else {
        console.error('Album not found');
        // Reset to home
        window.location.hash = '';
      }
    } catch (error) {
      console.error('Error loading album:', error);
      window.location.hash = '';
    }
  }

  async function openAlbumView(albumId) {
    // Update URL
    const albumCard = $(`.album-card[data-album-id="${albumId}"]`);
    const albumSlug = albumCard.data('album-slug');
    window.location.hash = `album/${albumSlug || albumId}`;
  }
  
  async function displayAlbumPage(album, albumId) {
    currentAlbum = album;
    
    // Get photos from the album's photos relationship
    let albumPhotos = [];
    if (album.photos && album.photos.length > 0) {
      albumPhotos = album.photos;
    }
    
    // If no photos in the relationship, fetch all photos with this album ID
    if (albumPhotos.length === 0) {
      const photosResponse = await fetch(`${API_BASE}/photos?where[album][equals]=${albumId}&depth=1`);
      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        albumPhotos = photosData.docs || [];
      }
    }
    
    // Update currentPhotos for lightbox
    currentPhotos = albumPhotos;
    
    // Hide other sections and show only featured section
    $('.hero').hide();
    $('.albums-section').hide();
    $('.about-section').hide();
    $('.sister-sites-section').hide();
    
    // Show album view
    $('.featured-section').show();
    
    // Update navigation to make links work
    $('.nav-link').off('click').on('click', function(e) {
      e.preventDefault();
      const target = $(this).attr('href');
      
      if (target === '#home' || target.includes('benfoggon.com') || target.includes('projectnetworks')) {
        // External links or home - reload page
        if (target.startsWith('http')) {
          window.open(target, '_blank');
        } else {
          window.location.hash = '';
          location.reload();
        }
      } else {
        // Navigate to section
        window.location.hash = '';
        location.reload();
        setTimeout(() => {
          $('html, body').animate({
            scrollTop: $(target).offset().top - 80
          }, 800);
        }, 100);
      }
    });
    
    // Add back button container and button
    const featuredSection = $('.featured-section');
    const container = featuredSection.find('.container').first();
    
    // Remove old back button if exists
    featuredSection.find('.album-navigation').remove();
    
    // Add new back button in a proper container at the top of the section
    container.prepend(`
      <div class="album-navigation">
        <button class="album-back-btn" onclick="window.location.hash = ''; location.reload();">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Albums</span>
        </button>
      </div>
    `);
    
    const sectionHeader = $('.featured-section .section-header');
    
    // Display photos in featured grid
    const featuredGrid = $('#featured-grid');
    featuredGrid.empty();
    
    if (albumPhotos.length > 0) {
      displayFeaturedPhotos(albumPhotos);
      
      // Scroll to top
      $('html, body').animate({ scrollTop: 0 }, 400);
      
      // Update section title with share button
      sectionHeader.find('.section-label').text('Album');
      sectionHeader.find('.section-title').html(`
        ${album.title || 'Album Photos'}
        <button class="album-share-btn" onclick="shareAlbum('${album.slug || albumId}', '${album.title}')" title="Share this album">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
      `);
      sectionHeader.find('.section-description').text(album.description || `${albumPhotos.length} photo${albumPhotos.length !== 1 ? 's' : ''} in this album`);
    } else {
      featuredGrid.html('<p style="text-align: center; color: #888; padding: 60px 20px;">No photos in this album yet.</p>');
    }
  }

  // ==========================================
  // Lightbox Functionality
  // ==========================================
  function openPhotoById(photoId) {
    // Try to find in current photos first
    if (currentPhotos && currentPhotos.length > 0) {
      const index = currentPhotos.findIndex(p => (p.id || p._id) == photoId);
      if (index !== -1) {
        openLightbox(index);
        return;
      }
    }
    
    // If not found, try to fetch from API
    fetchPhotoById(photoId);
  }
  
  async function fetchPhotoById(photoId) {
    try {
      showShareNotification('Loading photo...');
      const response = await fetch(`${API_BASE}/photos/${photoId}?depth=1`);
      
      if (response.ok) {
        const photo = await response.json();
        
        // Check if photo belongs to an album
        if (photo.album) {
          const albumId = typeof photo.album === 'object' ? photo.album.id : photo.album;
          const albumSlug = typeof photo.album === 'object' ? photo.album.slug : null;
          
          // Load the album to get context
          window.location.hash = `album/${albumSlug || albumId}`;
          
          // Wait a bit then open the specific photo
          setTimeout(() => {
            const photoIndex = currentPhotos.findIndex(p => (p.id || p._id) == photoId);
            if (photoIndex !== -1) {
              openLightbox(photoIndex);
            }
          }, 500);
        } else {
          // Standalone photo - load all featured photos and open this one
          await loadFeaturedPhotos();
          const index = currentPhotos.findIndex(p => (p.id || p._id) == photoId);
          if (index !== -1) {
            openLightbox(index);
          } else {
            // Add this photo to currentPhotos and display
            currentPhotos = [photo];
            openLightbox(0);
          }
        }
      } else {
        throw new Error('Photo not found');
      }
    } catch (error) {
      console.error('Error loading photo:', error);
      showShareNotification('Photo not found');
      setTimeout(() => {
        window.location.hash = '';
      }, 2000);
    }
  }

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
    const photoId = photo.id || photo._id;

    $('#lightbox-image').attr('src', imageUrl).attr('alt', title);
    $('#lightbox-title').text(title);
    $('#lightbox-description').text(description);
    
    // Show album context if viewing from an album
    if (currentAlbum) {
      $('#lightbox-album-context').show();
      $('#lightbox-album-name').text(currentAlbum.title || 'Album');
    } else {
      $('#lightbox-album-context').hide();
    }
    
    // Update share button
    $('#lightbox-share-btn').attr('data-photo-id', photoId).attr('data-title', title);
    
    // Update download button
    $('#lightbox-download-btn').attr('data-image-url', imageUrl).attr('data-title', title);
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
  // Share Functionality
  // ==========================================
  window.sharePhoto = function(photoId, title) {
    const url = `${window.location.origin}${window.location.pathname}#photo/${photoId}`;
    const text = `Check out this photo: ${title}`;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback - copy to clipboard
      copyToClipboard(url);
      showShareNotification('Photo link copied to clipboard!');
    }
  };
  
  window.shareAlbum = function(albumSlug, title) {
    const url = `${window.location.origin}${window.location.pathname}#album/${albumSlug}`;
    const text = `Check out this album: ${title}`;
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback - copy to clipboard
      copyToClipboard(url);
      showShareNotification('Album link copied to clipboard!');
    }
  };
  
  // ==========================================
  // Download Photo with Watermark
  // ==========================================
  window.downloadPhotoWithWatermark = async function(imageUrl, title) {
    try {
      showShareNotification('Preparing download with watermark...');
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = function() {
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        const watermarkText = 'Ben Foggon';
        const fontSize = Math.max(20, img.height / 40); // Responsive font size
        const padding = fontSize * 0.6;
        
        ctx.font = `600 ${fontSize}px "Poppins", sans-serif`;
        ctx.textBaseline = 'bottom';
        
        // Measure text
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        // Position at bottom-right
        const x = img.width - textWidth - padding * 2;
        const y = img.height - padding;
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(
          x - padding,
          y - textHeight - padding,
          textWidth + padding * 2,
          textHeight + padding * 2
        );
        
        // Draw text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(watermarkText, x, y);
        
        // Convert to blob and download
        canvas.toBlob(function(blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_benfoggon.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          showShareNotification('Photo downloaded with watermark!');
        }, 'image/jpeg', 0.95);
      };
      
      img.onerror = function() {
        showShareNotification('Failed to download. Please try again.');
      };
      
      img.src = imageUrl;
      
    } catch (error) {
      console.error('Download error:', error);
      showShareNotification('Failed to download. Please try again.');
    }
  };
  
  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
  
  function showShareNotification(message) {
    // Create notification element
    const notification = $(`
      <div class="share-notification">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${message}
      </div>
    `);
    
    $('body').append(notification);
    
    setTimeout(() => {
      notification.addClass('show');
    }, 100);
    
    setTimeout(() => {
      notification.removeClass('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

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
    loadSiteSettings();
    loadFeaturedPhotos();
    loadAlbums();
    setupLazyLoading();
    
    // Prevent right-click on images
    $(document).on('contextmenu', 'img, .photo-wrapper, .lightbox-image-wrapper', function(e) {
      e.preventDefault();
      showShareNotification('Right-click disabled. Use the Download button.');
      return false;
    });
    
    // Prevent dragging images
    $(document).on('dragstart', 'img', function(e) {
      e.preventDefault();
      return false;
    });
    
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
