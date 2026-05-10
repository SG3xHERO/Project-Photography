/**
 * BF Photography — Anime.js Interactions + CMS Gallery Logic
 * Canvas particles · Preloader · Hero · Scroll reveals
 * Payload CMS integration · Lightbox · Download · Share
 */

/* =====================================================
   PART 1 — ANIME.JS / VANILLA JS (runs before jQuery)
   ===================================================== */
(function () {
  'use strict';

  /* ---- Utilities ---- */
  function splitChars(el) {
    var words = el.textContent.trim().split(' ');
    el.innerHTML = words.map(function (word) {
      var chars = word.split('').map(function (c) {
        return '<span class="char">' + c + '</span>';
      }).join('');
      return '<span style="display:inline-block;white-space:nowrap">' + chars + '</span>';
    }).join('<span class="char word-gap" style="display:inline-block;width:0.25em">&nbsp;</span>');
    return el.querySelectorAll('.char');
  }

  /* ---- Particle Canvas ---- */
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    var MAX_DIST = 140;
    var COUNT = window.innerWidth < 768 ? 40 : 80;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function Particle() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.4 + 0.1;
    }

    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    };

    resize();
    window.addEventListener('resize', function () {
      resize();
      particles = Array.from({ length: COUNT }, function () { return new Particle(); });
    });
    particles = Array.from({ length: COUNT }, function () { return new Particle(); });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, ' + p.alpha + ')';
        ctx.fill();
        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            var strength = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(239, 68, 68, ' + strength + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---- Preloader ---- */
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    var fill      = document.querySelector('.preloader-fill');
    var label     = document.querySelector('.preloader-label');
    var letters   = document.querySelectorAll('.preloader-logo span');

    anime({
      targets: letters,
      opacity: [0, 1],
      translateY: [30, 0],
      delay: anime.stagger(150),
      easing: 'easeOutExpo',
      duration: 700,
      complete: function () {
        anime({ targets: label, opacity: [0, 1], duration: 400, easing: 'easeOutQuad' });
      }
    });

    var progress = 0;
    var interval = setInterval(function () {
      progress += Math.random() * 18 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (fill) fill.style.width = '100%';
        setTimeout(hidePreloader, 400);
      } else {
        if (fill) fill.style.width = progress + '%';
      }
    }, 80);

    function hidePreloader() {
      if (!preloader) return;
      preloader.classList.add('hidden');
      setTimeout(function () {
        preloader.style.display = 'none';
        initHero();
        initOrbAnimation();
      }, 650);
    }

    setTimeout(function () {
      if (preloader && !preloader.classList.contains('hidden')) hidePreloader();
    }, 3500);
  }

  /* ---- Gradient Orbs ---- */
  function initOrbAnimation() {
    var orbs = document.querySelectorAll('.gradient-orb');
    orbs.forEach(function (orb, i) {
      anime({ targets: orb, opacity: [0, 0.25], duration: 1500, easing: 'easeOutQuad' });
      anime({
        targets: orb,
        translateX: [{ value: (i % 2 === 0 ? 60 : -60), duration: 8000 + i * 2000 }, { value: 0, duration: 8000 + i * 2000 }],
        translateY: [{ value: (i % 2 === 0 ? -40 : 50), duration: 8000 + i * 2000 }, { value: 0, duration: 8000 + i * 2000 }],
        scale: [{ value: 1.1, duration: 8000 + i * 2000 }, { value: 0.9, duration: 8000 + i * 2000 }],
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
        delay: i * 2000
      });
    });

    var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    var orbX = mouseX, orbY = mouseY;
    var orb3 = document.querySelector('.orb-3');
    document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
    (function trackMouse() {
      if (orb3) {
        orbX += (mouseX - orbX) * 0.03;
        orbY += (mouseY - orbY) * 0.03;
        orb3.style.left = orbX + 'px';
        orb3.style.top  = orbY + 'px';
      }
      requestAnimationFrame(trackMouse);
    })();
  }

  /* ---- Hero Entrance ---- */
  function initHero() {
    var line2 = document.querySelector('.split-text');
    if (line2) splitChars(line2);

    var tl = anime.timeline({ easing: 'easeOutExpo' });
    tl.add({ targets: '.nav-link', opacity: [0, 1], translateY: [-15, 0], delay: anime.stagger(60), duration: 600 }, 0);
    tl.add({ targets: '#hero-badge', opacity: [0, 1], scale: [0.8, 1], duration: 500, easing: 'easeOutBack' }, 300);
    tl.add({ targets: '.hero-line-1', opacity: [0, 1], translateY: [20, 0], duration: 600 }, 500);
    tl.add({ targets: '.hero-line-2 .char', opacity: [0, 1], translateY: [60, 0], rotateX: [-90, 0], delay: anime.stagger(35), duration: 700, easing: 'easeOutBack' }, 650);
    tl.add({ targets: '#hero-sub',     opacity: [0, 1], translateY: [20, 0], duration: 600 }, 1300);
    tl.add({ targets: '#hero-desc',    opacity: [0, 1], translateY: [20, 0], duration: 600 }, 1450);
    tl.add({ targets: '#hero-actions', opacity: [0, 1], translateY: [20, 0], duration: 600 }, 1600);
    tl.add({ targets: '#hero-stats',   opacity: [0, 1], translateY: [15, 0], duration: 600 }, 1750);
  }

  /* ---- Navigation ---- */
  function initNav() {
    var nav    = document.getElementById('main-nav');
    var toggle = document.getElementById('nav-toggle');
    var links  = document.getElementById('nav-links');

    window.addEventListener('scroll', function () {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
      var btt = document.getElementById('backToTop');
      if (btt) btt.classList.toggle('visible', window.scrollY > 400);
      updateActiveNav();
    }, { passive: true });

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', links.classList.contains('open'));
      });
      links.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          toggle.classList.remove('active');
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    var btt = document.getElementById('backToTop');
    if (btt) btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  function updateActiveNav() {
    var scrollPos = window.scrollY + 120;
    document.querySelectorAll('section[id], header[id]').forEach(function (section) {
      var top    = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id     = section.getAttribute('id');
      var link   = document.querySelector('.nav-link[href="#' + id + '"]');
      if (link && scrollPos >= top && scrollPos < bottom) {
        document.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }

  /* ---- Scroll Reveals ---- */
  function initScrollReveal() {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          sectionObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal-section').forEach(function (el) { sectionObs.observe(el); });

    // Project cards (network section)
    var cardObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var cards = entry.target.querySelectorAll('.pcard');
          anime({
            targets: cards,
            opacity: [0, 1],
            translateY: [40, 0],
            scale: [0.95, 1],
            delay: anime.stagger(140),
            duration: 700,
            easing: 'easeOutBack',
            complete: function () { cards.forEach(function (c) { c.classList.add('visible'); }); }
          });
          cardObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card-grid').forEach(function (el) { cardObs.observe(el); });

    // Stats counter
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          initCounters();
          statsObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    var statsEl = document.querySelector('.hero-stats');
    if (statsEl) statsObs.observe(statsEl);
  }

  /* ---- Counters ---- */
  function initCounters() {
    document.querySelectorAll('.counter').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      anime({ targets: el, innerHTML: [0, target], round: 1, duration: 1800, easing: 'easeOutExpo' });
    });
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initPreloader();
    initNav();
    initScrollReveal();
  });

})();

/* =====================================================
   PART 2 — JQUERY: CMS, GALLERY, LIGHTBOX, ROUTING
   ===================================================== */
(function ($) {
  'use strict';

  // Configuration - Payload CMS
  var API_BASE = 'https://cms.benfoggon.com/api';
  var currentLightboxIndex = 0;
  var currentPhotos = [];
  var currentAlbum = null;

  // ==========================================
  // Dropdown Menu
  // ==========================================
  var dropdownTimeout;

  $('#photography-dropdown-trigger').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('#photography-dropdown').toggleClass('active');
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('.logo, .photography-dropdown').length) {
      $('#photography-dropdown').removeClass('active');
    }
  });

  $('.logo').on('mouseenter', function () {
    if ($(window).width() >= 968) {
      clearTimeout(dropdownTimeout);
      $('#photography-dropdown').addClass('active');
    }
  });

  $('.logo, .photography-dropdown').on('mouseleave', function () {
    if ($(window).width() >= 968) {
      dropdownTimeout = setTimeout(function () {
        $('#photography-dropdown').removeClass('active');
      }, 200);
    }
  });

  $('.photography-dropdown').on('mouseenter', function () {
    if ($(window).width() >= 968) clearTimeout(dropdownTimeout);
  });

  // Logo BF click → go home
  $('#logo-home .logo-icon, #logo-home .logo-name').on('click', function (e) {
    e.preventDefault();
    window.location.hash = '';
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      location.reload();
    } else {
      window.location.href = '/';
    }
  });

  // ==========================================
  // Scroll & Navigation
  // ==========================================
  $(window).on('scroll', function () {
    var scroll = $(window).scrollTop();
    if (scroll >= 300) {
      $('#backToTop').addClass('visible');
    } else {
      $('#backToTop').removeClass('visible');
    }
  });

  // Close mobile menu on link click
  $('.nav-link').on('click', function () {
    if ($(window).width() < 968) {
      $('#nav-toggle').removeClass('active');
      $('#nav-links').removeClass('open');
      $('body').removeClass('menu-open');
    }
  });

  // Smooth scroll for anchors (exclude # only and #0)
  $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').on('click', function (event) {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
        location.hostname === this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        event.preventDefault();
        $('html, body').animate({ scrollTop: target.offset().top - 80 }, 800, 'swing');
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
      }
    }
  });

  // Back to top
  $('#backToTop').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600);
    return false;
  });

  // Active nav on scroll
  $(window).on('scroll.nav', function () {
    var scrollPos = $(window).scrollTop() + 100;
    $('section[id]').each(function () {
      var section = $(this);
      var sectionTop    = section.offset().top;
      var sectionBottom = sectionTop + section.outerHeight();
      var sectionId     = section.attr('id');
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        $('.nav-link').removeClass('active');
        $('.nav-link[href*="' + sectionId + '"]').addClass('active');
      }
    });
  });

  // ==========================================
  // URL Routing
  // ==========================================
  function handleRouting() {
    var hash = window.location.hash;
    if (hash.indexOf('#album/') === 0) {
      var albumIdentifier = hash.replace('#album/', '');
      openAlbumByIdentifier(albumIdentifier);
      return;
    }
    if (hash.indexOf('#photo/') === 0) {
      var photoId = hash.replace('#photo/', '');
      openPhotoById(photoId);
      return;
    }
  }

  window.addEventListener('hashchange', handleRouting);

  $(window).on('load', function () {
    handleRouting();
  });

  // ==========================================
  // Site Settings
  // ==========================================
  async function loadSiteSettings() {
    try {
      var response = await fetch(API_BASE + '/globals/siteSettings');
      if (!response.ok) throw new Error('Failed to load settings');
      var data = await response.json();
      applySiteSettings(data);
    } catch (error) {
      console.log('Using default site settings');
    }
  }

  function applySiteSettings(settings) {
    if (settings.hero) {
      if (settings.hero.badge)    $('.hero-badge span').text(settings.hero.badge);
      if (settings.hero.title)    $('.hero-line-2').text(settings.hero.title);
      if (settings.hero.subtitle) $('#hero-sub').text(settings.hero.subtitle);
      if (settings.hero.description) $('#hero-desc').text(settings.hero.description);
    }
    if (settings.about) {
      if (settings.about.paragraph1) $('.about-text p').first().text(settings.about.paragraph1);
      if (settings.about.paragraph2) $('.about-text p').last().text(settings.about.paragraph2);
      if (settings.about.image) {
        var imageUrl = '';
        if (settings.about.image.sizes && settings.about.image.sizes.card) {
          imageUrl = settings.about.image.sizes.card.url;
        } else if (settings.about.image.url) {
          imageUrl = settings.about.image.url;
        } else if (typeof settings.about.image === 'string') {
          imageUrl = settings.about.image;
        }
        if (imageUrl) {
          if (!imageUrl.startsWith('http')) imageUrl = API_BASE.replace('/api', '') + imageUrl;
          $('.about-img-frame img').attr('src', imageUrl);
        }
      }
    }
    if (settings.footer) {
      if (settings.footer.copyrightText) {
        $('.footer-copy').html('&copy; ' + settings.footer.copyrightText);
      }
    }
  }

  function getFeatureIcon(iconType) {
    var icons = {
      camera: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',
      shield: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      heart:  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
      zap:    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
    };
    return icons[iconType] || icons.camera;
  }

  // ==========================================
  // Featured Photos
  // ==========================================
  async function loadFeaturedPhotos() {
    try {
      var response = await fetch(API_BASE + '/photos?where[featured][equals]=true&depth=1&limit=6');
      if (!response.ok) throw new Error('API not available');
      var data = await response.json();
      if (data.docs && data.docs.length > 0) {
        displayFeaturedPhotos(data.docs);
      } else {
        loadDemoFeaturedPhotos();
      }
    } catch (error) {
      console.log('Loading demo photos...', error);
      loadDemoFeaturedPhotos();
    }
  }

  function loadDemoFeaturedPhotos() {
    var demoPhotos = [
      { id: 1, title: 'Track Day Excellence', description: 'Capturing the intensity of motorcycle racing at its finest', image: 'https://images.unsplash.com/photo-1558980394-4c7c9923c096?w=800', category: 'Racing' },
      { id: 2, title: 'Custom Build Beauty', description: 'Artistry meets engineering in this stunning custom motorcycle', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', category: 'Custom' },
      { id: 3, title: 'Open Road Freedom', description: 'The spirit of adventure captured on the open highway', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', category: 'Adventure' },
      { id: 4, title: 'Precision Engineering', description: 'Close-up details that showcase mechanical perfection', image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800', category: 'Detail' },
      { id: 5, title: 'Speed in Motion', description: 'Dynamic action shots from the racetrack', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', category: 'Racing' },
      { id: 6, title: 'Vintage Classic', description: 'Timeless beauty of classic motorcycle design', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', category: 'Classic' }
    ];
    displayFeaturedPhotos(demoPhotos);
  }

  function displayFeaturedPhotos(photos) {
    var featuredGrid = $('#featured-grid');
    featuredGrid.empty();
    if (!photos || photos.length === 0) { featuredGrid.html('<p class="text-center">No featured photos available</p>'); return; }

    currentPhotos = photos;

    photos.forEach(function (photo, index) {
      var imageUrl = '';
      if (photo.image) {
        if (typeof photo.image === 'string') {
          imageUrl = photo.image;
        } else if (photo.image.sizes && photo.image.sizes.card) {
          imageUrl = photo.image.sizes.card.url;
        } else if (photo.image.url) {
          imageUrl = photo.image.url;
        }
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = API_BASE.replace('/api', '') + imageUrl;
        }
      }
      if (!imageUrl) imageUrl = photo.url || 'https://via.placeholder.com/800x600';

      var title       = photo.title || 'Untitled';
      var description = photo.description || '';
      var photoId     = photo.id || photo._id || index;

      var photoCard = '<article class="photo-card" data-index="' + index + '" data-photo-id="' + photoId + '">' +
        '<div class="photo-wrapper">' +
          '<img src="' + imageUrl + '" alt="' + title + '" loading="lazy" oncontextmenu="return false;" draggable="false">' +
          '<div class="photo-watermark">Ben Foggon</div>' +
          '<div class="photo-protection-overlay"></div>' +
        '</div>' +
        '<div class="photo-card-overlay">' +
          '<h3 class="photo-card-title">' + title + '</h3>' +
          '<p class="photo-card-description">' + description + '</p>' +
          '<button class="photo-share-btn" data-photo-id="' + photoId + '" data-title="' + title + '" title="Share this photo">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>' +
              '<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</article>';

      featuredGrid.append(photoCard);
    });

    // Attach photo card click handlers
    $('.photo-card').on('click', function (e) {
      if ($(e.target).closest('.photo-share-btn').length) return;
      var index = $(this).data('index');
      openLightbox(index);
    });

    $('.photo-share-btn').on('click', function (e) {
      e.stopPropagation();
      var photoId = $(this).data('photo-id');
      var title   = $(this).data('title');
      window.sharePhoto(photoId, title);
    });

    // Animate photo cards in using Anime.js
    setTimeout(function () {
      if (typeof anime !== 'undefined') {
        anime({
          targets: '.photo-card',
          opacity: [0, 1],
          translateY: [30, 0],
          delay: anime.stagger(80),
          duration: 600,
          easing: 'easeOutExpo'
        });
      }
    }, 100);
  }

  // ==========================================
  // Albums
  // ==========================================
  async function loadAlbums() {
    try {
      var response = await fetch(API_BASE + '/albums?depth=1&limit=10');
      if (!response.ok) throw new Error('API not available');
      var data = await response.json();
      if (data.docs && data.docs.length > 0) {
        displayAlbums(data.docs);
      } else {
        loadDemoAlbums();
      }
    } catch (error) {
      console.log('Loading demo albums...', error);
      loadDemoAlbums();
    }
  }

  function loadDemoAlbums() {
    var demoAlbums = [
      { id: 1, title: 'Racing Season 2024', description: 'A complete collection from the 2024 racing season, featuring intense track action, pit scenes, and victory celebrations.', cover: 'https://images.unsplash.com/photo-1558980394-4c7c9923c096?w=800', photoCount: 45, date: '2024' },
      { id: 2, title: 'Custom Builds Showcase', description: 'Stunning custom motorcycles from talented builders. Each bike tells a unique story of creativity and craftsmanship.', cover: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', photoCount: 32, date: '2024' },
      { id: 3, title: 'Off-Road Adventures', description: 'Dirt bikes, trails, and adventure motorcycles conquering challenging terrain and exploring the great outdoors.', cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', photoCount: 28, date: '2023' },
      { id: 4, title: 'Classic Motorcycles', description: 'Timeless vintage motorcycles, restored to perfection. A tribute to the golden age of motorcycling.', cover: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800', photoCount: 38, date: '2023' }
    ];
    displayAlbums(demoAlbums);
  }

  function displayAlbums(albums) {
    var albumsGrid = $('#albums-grid');
    albumsGrid.empty();
    if (!albums || albums.length === 0) { albumsGrid.html('<p class="text-center">No albums available</p>'); return; }

    albums.forEach(function (album) {
      var coverUrl = '';
      if (album.coverImage) {
        if (typeof album.coverImage === 'string') {
          coverUrl = album.coverImage;
        } else if (album.coverImage.sizes && album.coverImage.sizes.card) {
          coverUrl = album.coverImage.sizes.card.url;
        } else if (album.coverImage.url) {
          coverUrl = album.coverImage.url;
        }
        if (coverUrl && !coverUrl.startsWith('http')) coverUrl = API_BASE.replace('/api', '') + coverUrl;
      }
      if (!coverUrl) coverUrl = album.cover || 'https://via.placeholder.com/800x600';

      var title       = album.title || 'Untitled Album';
      var description = album.description || '';
      var slug        = album.slug || album.id || '';
      var date        = album.publishedDate ? new Date(album.publishedDate).getFullYear() : '';

      var photoCount = 0;
      if (album.photos && Array.isArray(album.photos)) {
        photoCount = album.photos.length;
      } else if (album.photoCount) {
        photoCount = album.photoCount;
      } else if (typeof album.photos === 'number') {
        photoCount = album.photos;
      }

      var albumCard = '<article class="album-card" data-album-id="' + album.id + '" data-album-slug="' + slug + '">' +
        '<div class="album-image">' +
          '<img src="' + coverUrl + '" alt="' + title + '" loading="lazy">' +
          '<div class="album-badge">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' +
            photoCount + ' Photo' + (photoCount !== 1 ? 's' : '') +
          '</div>' +
        '</div>' +
        '<div class="album-content">' +
          '<h3 class="album-title">' + title + '</h3>' +
          '<p class="album-description">' + description + '</p>' +
          '<div class="album-meta"><span>' + date + '</span></div>' +
        '</div>' +
      '</article>';

      albumsGrid.append(albumCard);
    });

    $('.album-card').on('click', function () {
      var albumId   = $(this).data('album-id');
      var albumSlug = $(this).data('album-slug');
      window.location.hash = 'album/' + (albumSlug || albumId);
    });
  }

  // ==========================================
  // Album View
  // ==========================================
  async function openAlbumByIdentifier(identifier) {
    try {
      var album = null;
      var albumId = null;

      var slugResponse = await fetch(API_BASE + '/albums?where[slug][equals]=' + identifier + '&depth=2&limit=1');
      if (slugResponse.ok) {
        var slugData = await slugResponse.json();
        if (slugData.docs && slugData.docs.length > 0) {
          album = slugData.docs[0];
          albumId = album.id;
        }
      }

      if (!album) {
        albumId = identifier;
        var idResponse = await fetch(API_BASE + '/albums/' + albumId + '?depth=2');
        if (idResponse.ok) {
          album = await idResponse.json();
        }
      }

      if (album) {
        await displayAlbumPage(album, albumId);
      } else {
        console.error('Album not found');
        window.location.hash = '';
      }
    } catch (error) {
      console.error('Error loading album:', error);
      window.location.hash = '';
    }
  }

  async function displayAlbumPage(album, albumId) {
    currentAlbum = album;

    var albumPhotos = [];
    if (album.photos && album.photos.length > 0) albumPhotos = album.photos;

    if (albumPhotos.length === 0) {
      var photosResponse = await fetch(API_BASE + '/photos?where[album][equals]=' + albumId + '&depth=1');
      if (photosResponse.ok) {
        var photosData = await photosResponse.json();
        albumPhotos = photosData.docs || [];
      }
    }

    currentPhotos = albumPhotos;

    $('.hero-section').hide();
    $('.albums-section').hide();
    $('.about-section').hide();
    $('.sister-sites-section').hide();
    $('.featured-section').show();

    var featuredSection = $('.featured-section');
    var container = featuredSection.find('.container').first();

    featuredSection.find('.album-navigation').remove();

    container.prepend('<div class="album-navigation">' +
      '<button class="album-back-btn" onclick="window.location.hash = \'\'; location.reload();">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>' +
        '<span>Back to Albums</span>' +
      '</button>' +
    '</div>');

    var featuredGrid  = $('#featured-grid');
    var sectionHeader = $('.featured-section .section-header');

    featuredGrid.empty();

    if (albumPhotos.length > 0) {
      displayFeaturedPhotos(albumPhotos);
      $('html, body').animate({ scrollTop: 0 }, 400);

      sectionHeader.find('.section-label').text('Album');
      sectionHeader.find('.section-title').html(
        (album.title || 'Album Photos') +
        ' <button class="album-share-btn" onclick="shareAlbum(\'' + (album.slug || albumId) + '\', \'' + (album.title || '') + '\')" title="Share this album">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>' +
        '</button>'
      );
      sectionHeader.find('.section-desc').text(album.description || (albumPhotos.length + ' photo' + (albumPhotos.length !== 1 ? 's' : '') + ' in this album'));
    } else {
      featuredGrid.html('<p style="text-align:center;color:rgba(255,255,255,0.45);padding:60px 20px;">No photos in this album yet.</p>');
    }
  }

  // ==========================================
  // Lightbox
  // ==========================================
  function openPhotoById(photoId) {
    if (currentPhotos && currentPhotos.length > 0) {
      var index = currentPhotos.findIndex(function (p) { return (p.id || p._id) == photoId; });
      if (index !== -1) { openLightbox(index); return; }
    }
    fetchPhotoById(photoId);
  }

  async function fetchPhotoById(photoId) {
    try {
      showShareNotification('Loading photo...');
      var response = await fetch(API_BASE + '/photos/' + photoId + '?depth=1');
      if (response.ok) {
        var photo   = await response.json();
        var albumId = typeof photo.album === 'object' ? photo.album.id : photo.album;
        var albumSlug = typeof photo.album === 'object' ? photo.album.slug : null;
        if (photo.album) {
          window.location.hash = 'album/' + (albumSlug || albumId);
          setTimeout(function () {
            var idx = currentPhotos.findIndex(function (p) { return (p.id || p._id) == photoId; });
            if (idx !== -1) openLightbox(idx);
          }, 500);
        } else {
          loadFeaturedPhotos().then(function () {
            var idx = currentPhotos.findIndex(function (p) { return (p.id || p._id) == photoId; });
            if (idx !== -1) openLightbox(idx);
          });
        }
      } else {
        throw new Error('Photo not found');
      }
    } catch (error) {
      console.error('Error loading photo:', error);
      showShareNotification('Photo not found');
      setTimeout(function () { window.location.hash = ''; }, 2000);
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
    var photo   = currentPhotos[currentLightboxIndex];

    var imageUrl = '';
    if (photo.image) {
      if (typeof photo.image === 'string') {
        imageUrl = photo.image;
      } else if (photo.image.sizes && photo.image.sizes.full) {
        imageUrl = photo.image.sizes.full.url;
      } else if (photo.image.url) {
        imageUrl = photo.image.url;
      }
      if (imageUrl && !imageUrl.startsWith('http')) imageUrl = API_BASE.replace('/api', '') + imageUrl;
    }
    if (!imageUrl) imageUrl = photo.url || '';

    var title       = photo.title || 'Untitled';
    var description = photo.description || '';
    var photoId     = photo.id || photo._id;

    $('#lightbox-image').attr('src', imageUrl).attr('alt', title);
    $('#lightbox-title').text(title);
    $('#lightbox-description').text(description);

    if (currentAlbum) {
      $('#lightbox-album-context').show();
      $('#lightbox-album-name').text(currentAlbum.title || 'Album');
    } else {
      $('#lightbox-album-context').hide();
    }

    $('#lightbox-share-btn').attr('data-photo-id', photoId).attr('data-title', title);
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

  $('.lightbox-close').on('click', closeLightbox);
  $('.lightbox-next').on('click', nextPhoto);
  $('.lightbox-prev').on('click', prevPhoto);

  $('#lightbox').on('click', function (e) {
    if (e.target === this) closeLightbox();
  });

  $(document).on('keydown', function (e) {
    if ($('#lightbox').hasClass('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft')  prevPhoto();
    }
  });

  // ==========================================
  // Share
  // ==========================================
  window.sharePhoto = function (photoId, title) {
    var url  = window.location.origin + window.location.pathname + '#photo/' + photoId;
    var text = 'Check out this photo: ' + title;
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function (err) { console.log('Share error:', err); });
    } else {
      copyToClipboard(url);
      showShareNotification('Photo link copied to clipboard!');
    }
  };

  window.shareAlbum = function (albumSlug, title) {
    var url  = window.location.origin + window.location.pathname + '#album/' + albumSlug;
    var text = 'Check out this album: ' + title;
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function (err) { console.log('Share error:', err); });
    } else {
      copyToClipboard(url);
      showShareNotification('Album link copied to clipboard!');
    }
  };

  // ==========================================
  // Download with Watermark
  // ==========================================
  window.downloadPhotoWithWatermark = async function (imageUrl, title) {
    try {
      showShareNotification('Preparing download with watermark...');
      var canvas = document.createElement('canvas');
      var ctx    = canvas.getContext('2d');
      var img    = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = function () {
        canvas.width  = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        var watermarkText = 'Ben Foggon';
        var fontSize      = Math.max(20, img.height / 40);
        var padding       = fontSize * 0.6;

        ctx.font          = '600 ' + fontSize + 'px "Poppins", sans-serif';
        ctx.textBaseline  = 'bottom';

        var textMetrics = ctx.measureText(watermarkText);
        var textWidth   = textMetrics.width;
        var textHeight  = fontSize;

        var x = img.width  - textWidth  - padding * 2;
        var y = img.height - padding;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - padding, y - textHeight - padding, textWidth + padding * 2, textHeight + padding * 2);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(watermarkText, x, y);

        canvas.toBlob(function (blob) {
          var url  = URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.href     = url;
          link.download = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_benfoggon.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showShareNotification('Photo downloaded with watermark!');
        }, 'image/jpeg', 0.95);
      };

      img.onerror = function () { showShareNotification('Failed to download. Please try again.'); };
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
      var textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  function showShareNotification(message) {
    var notification = $(
      '<div class="share-notification">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
        message +
      '</div>'
    );
    $('body').append(notification);
    setTimeout(function () { notification.addClass('show'); }, 100);
    setTimeout(function () {
      notification.removeClass('show');
      setTimeout(function () { notification.remove(); }, 300);
    }, 3000);
  }

  // ==========================================
  // Image Protection
  // ==========================================
  function setupImageProtection() {
    $(document).on('contextmenu', 'img, .photo-wrapper, .lightbox-image-wrapper', function (e) {
      e.preventDefault();
      showShareNotification('Right-click disabled. Use the Download button.');
      return false;
    });

    $(document).on('dragstart', 'img', function (e) {
      e.preventDefault();
      return false;
    });
  }

  // ==========================================
  // Init
  // ==========================================
  function init() {
    loadSiteSettings();
    loadFeaturedPhotos();
    loadAlbums();
    setupImageProtection();
  }

  $(document).ready(function () {
    init();
  });

  // ==========================================
  // Content Management Helper
  // ==========================================
  window.BFPhotography = {
    addFeaturedPhoto: function (photo) {
      currentPhotos.push(photo);
      displayFeaturedPhotos(currentPhotos);
      console.log('Photo added successfully!');
    },
    exportData: function () {
      var data = { featured: currentPhotos, timestamp: new Date().toISOString() };
      console.log('Current data:', JSON.stringify(data, null, 2));
      return data;
    },
    loadFromJSON: function (jsonData) {
      if (jsonData.featured) {
        currentPhotos = jsonData.featured;
        displayFeaturedPhotos(currentPhotos);
        console.log('Data loaded successfully!');
      }
    }
  };

})(jQuery);
