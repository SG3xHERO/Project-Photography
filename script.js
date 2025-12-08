/**
 * Main JavaScript for Ben Foggon Photography Website
 * Handles all front-end interactions and API integrations
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the application
  initApp();
  initPhotoViewer();
  setupLazyLoading();
  initPortraitPhotoEnhancements();
  handleRouting();
  setTimeout(initShareButtons, 500);
  initImageLoadingSystem();
  if (window.initImageAnimations) {
    window.initImageAnimations();
  }
});

/**
 * Initialize the image loading animation system
 */
function initImageLoadingSystem() {
  console.log('Initializing image loading animation system');
  
  // Apply loading animation to existing images
  setupImageLoadingAnimation();
  
  // Enhance lazy loading with animations
  enhanceLazyLoading();
  
  // Patch any dynamically created content
  observeDynamicContent();
}

/**
 * Set up loading animation for a single image
 * @param {HTMLImageElement} img - The image element
 */
function setupSingleImageLoader(img) {
  // Skip if already processed
  if (img.dataset.loaderAdded === 'true') return;
  
  // Create loading animation container
  const loaderContainer = document.createElement('div');
  loaderContainer.className = 'image-loader-container';
  loaderContainer.innerHTML = `
    <div class="image-loader">
      <div class="image-loader-shimmer"></div>
    </div>
  `;
  
  // Add loader after the image in the DOM
  img.parentNode.insertBefore(loaderContainer, img.nextSibling);
  
  // Remove loader when image loads
  img.onload = function() {
    img.classList.add('loaded');
    
    // If this is a lazy-loaded image with data-src
    if (img.dataset.src && img.src !== img.dataset.src) {
      // For lazy-loaded images, keep the loader until the full image loads
      const fullSizeImg = new Image();
      fullSizeImg.onload = function() {
        img.classList.add('loaded');
      };
      fullSizeImg.src = img.dataset.src;
    }
    
    // Detect and mark portrait images
    if (img.naturalHeight > img.naturalWidth) {
      const photoCard = img.closest('.photo-card') || img.closest('.album-card');
      if (photoCard) {
        photoCard.classList.add('portrait');
      }
    }
  };
  
  // If image is already loaded
  if (img.complete) {
    img.classList.add('loaded');
    
    // Still check if it's a portrait
    if (img.naturalHeight > img.naturalWidth) {
      const photoCard = img.closest('.photo-card') || img.closest('.album-card');
      if (photoCard) {
        photoCard.classList.add('portrait');
      }
    }
  }
  
  // Handle error case
  img.onerror = function() {
    img.classList.add('loaded');
    img.src = '/api/placeholder/800x600';
    console.warn('Image failed to load:', img.src);
  };
  
  // Mark as processed
  img.dataset.loaderAdded = 'true';
}

/**
 * Enhance the existing lazy loading system with our loading animations
 */
function enhanceLazyLoading() {
  // Store reference to the original observeLazyImages function
  const originalObserveLazyImages = window.observeLazyImages;
  
  // Replace with enhanced version
  window.observeLazyImages = function() {
    // Call original function if it exists
    if (typeof originalObserveLazyImages === 'function') {
      originalObserveLazyImages();
    }
    
    // Add our loading animations only to images that haven't been processed yet
    const lazyImages = document.querySelectorAll('img[data-src]:not([data-loader-added="true"])');
    lazyImages.forEach(img => {
      setupSingleImageLoader(img);
    });
    
    console.log(`Enhanced lazy loading for ${lazyImages.length} images`);
  };
  
  // Run immediately to handle any existing lazy images
  window.observeLazyImages();
}

/**
 * Observe for dynamically added content and apply loading animations
 */
function observeDynamicContent() {
  // Use MutationObserver to watch for new content
  const observer = new MutationObserver((mutations) => {
    let newImagesFound = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          // Check if node is an element and process it
          if (node.nodeType === 1) { // ELEMENT_NODE
            // Handle new album view being added
            if (node.id === 'album-view') {
              console.log('Album view added, setting up image loaders');
              setTimeout(() => {
                const albumImages = node.querySelectorAll('.album-image img, .photo-card img');
                albumImages.forEach(img => setupSingleImageLoader(img));
                console.log(`Added loaders to ${albumImages.length} album images`);
              }, 100); // Small delay to ensure content is rendered
              newImagesFound = true;
            }
            
            // Handle any other newly added images
            const newImages = node.querySelectorAll('img');
            if (newImages.length) {
              newImages.forEach(img => setupSingleImageLoader(img));
              newImagesFound = true;
            }
            
            // If the node itself is an image
            if (node.tagName === 'IMG') {
              setupSingleImageLoader(node);
              newImagesFound = true;
            }
          }
        });
      }
    });
    
    // If we found new images, also run lazy loading enhancement
    if (newImagesFound && window.observeLazyImages) {
      setTimeout(window.observeLazyImages, 100);
    }
  });
  
  // Start observing the document body for DOM changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('Dynamic content observer initialized');
}

/**
 * Setup image loading animations for all relevant images
 */
function setupImageLoadingAnimation() {
  // Target album images, featured images, and about image
  const targetImages = document.querySelectorAll('.album-image img, .featured-image img, .about-image img, .photo-container img');
  
  targetImages.forEach(img => {
    setupSingleImageLoader(img);
  });
  
  console.log(`Setup image loading for ${targetImages.length} existing images`);
}

/**
 * Handle URL routing to support direct album links
 */
function handleRouting() {
  // Check if we have an album ID in the URL - format: /album/123
  const path = window.location.pathname;
  const albumMatch = path.match(/\/album\/(\d+)/);
  
  if (albumMatch && albumMatch[1]) {
    // We have a direct album URL, load that album
    const albumId = albumMatch[1];
    console.log(`Direct navigation to album ${albumId} detected`);
    
    // Hide landing page content
    hideMainContent();
    
    // Display the album
    displayAlbumView(albumId);
  } else {
    // If we have a hash-based URL (for backwards compatibility)
    const hashMatch = window.location.hash.match(/#album-(\d+)/);
    if (hashMatch && hashMatch[1]) {
      const albumId = hashMatch[1];
      console.log(`Hash-based album navigation detected: ${albumId}`);
      
      // Hide landing page content
      hideMainContent();
      
      // Display the album
      displayAlbumView(albumId);
    }
  }
  
  // Add popstate event listener for browser navigation
  window.addEventListener('popstate', handlePopState);
}

/**
 * Hide the main content of the landing page
 */
function hideMainContent() {
  document.querySelector('.main-nav').style.display = 'none';
  document.querySelector('.hero').style.display = 'none';
  document.querySelectorAll('section').forEach((section) => {
    section.style.display = 'none';
  });
  document.querySelector('.main-footer').style.display = 'none';
  
  // Save scroll position for when we return
  sessionStorage.setItem('scrollPosition', window.scrollY);
  
  // Scroll to top for new "page"
  window.scrollTo(0, 0);
}

/**
 * Primary application initialization
 */
async function initApp() {
  try {
    // Parallel loading of content sections
    await Promise.all([loadFeatured(), loadAlbums(), loadAbout()]);

    // Set up UI interactions
    setupEventListeners();
    setupScrollAnimations();
  } catch (error) {
    console.error("App Initialization Error:", error);
    showGlobalErrorMessage(
      "Failed to load website content. Please try again later."
    );
  }
}

/**
 * Handle browser back/forward navigation
 */
function handlePopState(event) {
  console.log('Navigation event detected', event.state);
  
  // Check if we're navigating to an album
  if (event.state && event.state.albumId) {
    // Hide landing page and show album
    hideMainContent();
    displayAlbumView(event.state.albumId);
  } else {
    // We're navigating back to the main page
    // Check if album view is currently displayed
    const albumView = document.getElementById("album-view");
    if (albumView && albumView.style.display === "block") {
      goBackToAlbums();
    }
  }
}

/**
 * Detect if an image is portrait and apply appropriate classes
 * @param {HTMLImageElement} img - The image element to check
 * @param {HTMLElement} photoCard - The photo card element containing the image
 */
function detectAndMarkPortraitImage(img, photoCard) {
  // We need to wait for the image to load to get its dimensions
  if (img.complete) {
    checkOrientation();
  } else {
    img.onload = checkOrientation;
  }

  function checkOrientation() {
    // Consider an image portrait if height > width
    if (img.naturalHeight > img.naturalWidth) {
      photoCard.classList.add("portrait");
      console.log("Portrait image detected:", img.src);
    } else {
      photoCard.classList.remove("portrait");
    }
  }
}

/**
 * Initialize the portrait photo enhancements
 * This should be called in your document ready function
 */
function initPortraitPhotoEnhancements() {
  // Enhance existing observeLazyImages function
  const originalObserveLazyImages = window.observeLazyImages;
  if (typeof originalObserveLazyImages === 'function') {
    window.observeLazyImages = function() {
      originalObserveLazyImages();
      enhanceLazyImageLoading();
    };
  }
  
  // Enhance the photo viewer
  enhancePhotoViewer();
  
  // Check any existing images
  document.querySelectorAll('.photo-card img, .photo-item img').forEach(img => {
    const container = img.closest('.photo-card') || img.closest('.photo-item');
    if (container) {
      detectAndMarkPortraitImage(img, container);
    }
  });
  
  console.log('Portrait photo enhancements initialized');
}

/**
 * Enhanced photo viewer with loading animations
 * To be called after initPhotoViewer in your existing code
 */
function enhancePhotoViewer() {
  // Get reference to the original openPhotoViewer function
  const originalOpenPhotoViewer = window.openPhotoViewer;
  
  // Only enhance if not already done
  if (typeof originalOpenPhotoViewer === 'function' && !window._enhancedLoaderPhotoViewer) {
    window.openPhotoViewer = function(photos, startIndex = 0) {
      // Call the original function
      originalOpenPhotoViewer(photos, startIndex);
      
      // Get the photo viewer and image
      const photoViewer = document.querySelector('.photo-viewer');
      const viewerImg = photoViewer.querySelector('.photo-container img');
      
      // Add loading animation
      if (viewerImg) {
        setupSingleImageLoader(viewerImg);
        
        // Make sure loading animation works when navigating
        const prevBtn = photoViewer.querySelector('.prev-photo');
        const nextBtn = photoViewer.querySelector('.next-photo');
        
        if (prevBtn) {
          const originalPrevClick = prevBtn.onclick;
          prevBtn.onclick = function(e) {
            if (originalPrevClick) originalPrevClick.call(this, e);
            viewerImg.classList.remove('loaded');
            setTimeout(() => setupSingleImageLoader(viewerImg), 50);
          };
        }
        
        if (nextBtn) {
          const originalNextClick = nextBtn.onclick;
          nextBtn.onclick = function(e) {
            if (originalNextClick) originalNextClick.call(this, e);
            viewerImg.classList.remove('loaded');
            setTimeout(() => setupSingleImageLoader(viewerImg), 50);
          };
        }
      }
    };
    
    window._enhancedLoaderPhotoViewer = true;
    console.log('Photo viewer enhanced with loading animations');
  }
}

/**
 * Enhanced image loading with portrait detection
 * This should be added to the observeLazyImages function
 */
function enhanceLazyImageLoading() {
  const lazyImages = document.querySelectorAll("img[data-src]");
  console.log(
    `Found ${lazyImages.length} images to enhance with portrait detection`
  );

  lazyImages.forEach((img) => {
    const originalOnload = img.onload;

    img.onload = function () {
      // Call the original onload if it exists
      if (originalOnload) originalOnload.call(this);

      // Find the parent photo card
      const photoCard =
        img.closest(".photo-card") || img.closest(".photo-item");
      if (photoCard) {
        detectAndMarkPortraitImage(img, photoCard);
      }
    };

    // If image is already loaded, check it immediately
    if (img.complete && img.naturalHeight > 0) {
      const photoCard =
        img.closest(".photo-card") || img.closest(".photo-item");
      if (photoCard) {
        detectAndMarkPortraitImage(img, photoCard);
      }
    }
  });
}

/**
 * Set up lazy loading for images
 */
function setupLazyLoading() {
  console.log("Setting up lazy loading for images");

  // Define the IntersectionObserver configuration
  const observerOptions = {
    rootMargin: "100px 0px", // Slightly increased margin for earlier loading
    threshold: 0.1, // Trigger when 10% of the image is visible
  };

  // Create a new IntersectionObserver
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Only process images with data-src attribute
        if (img.dataset.src) {
          console.log("Lazy loading image:", img.dataset.src);
          
          // Set a loading class to track state
          img.classList.add('loading');
          
          // Set the actual src attribute
          img.src = img.dataset.src;
          
          // Remove the data-src attribute to prevent loading again
          img.removeAttribute("data-src");
          
          // Unobserve this image since it's now loading
          imageObserver.unobserve(img);
          
          // Handle successful load
          img.onload = function() {
            img.classList.remove('loading');
            img.classList.add('loaded');
            
            // Find any placeholders and hide them
            const placeholder = img.previousElementSibling;
            if (placeholder && placeholder.classList.contains('image-placeholder')) {
              placeholder.style.display = 'none';
            }
          };
          
          // Handle image loading errors
          img.onerror = function() {
            console.error("Failed to load image:", img.src);
            img.src = '/api/placeholder/800x600';
            img.classList.remove('loading');
            img.classList.add('loaded');
            
            // Show error state in placeholder
            const placeholder = img.previousElementSibling;
            if (placeholder && placeholder.classList.contains('image-placeholder')) {
              placeholder.innerHTML = '<div class="image-error">!</div>';
            }
          };
        }
      }
    });
  }, observerOptions);

  // Make the observer function globally available
  window.observeLazyImages = function () {
    // Only observe images that have data-src and not loaded yet
    const lazyImages = document.querySelectorAll("img[data-src]:not(.loading):not(.loaded)");
    console.log(`Found ${lazyImages.length} new images to lazy load`);
    
    lazyImages.forEach((img) => {
      // Add a check to prevent double-loading
      if (!img.classList.contains('loading') && !img.classList.contains('loaded')) {
        imageObserver.observe(img);
      }
    });
  };

  // Call immediately to handle images that might already be in the DOM
  window.observeLazyImages();
}

/**
 * Set up proper image loading state for all images in the album view
 */
function setupImageLoadingState() {
  const images = document.querySelectorAll('.photo-card img[data-src]:not(.loaded):not(.loading), .photo-card img:not(.loaded)');
  
  console.log(`Setting up loading state for ${images.length} images`);
  
  images.forEach(img => {
    // Don't process images already being loaded
    if (img.classList.contains('loading') || img.classList.contains('loaded')) {
      return;
    }
    
    // Add loading class to track state
    img.classList.add('loading');
    
    // Hide spinner when image loads
    img.onload = function() {
      // Find the placeholder and hide it by adding loaded class to the image
      img.classList.remove('loading');
      img.classList.add('loaded');
      
      // Find any placeholders and hide them
      const placeholder = img.parentElement.querySelector('.image-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      
      // Check if this is a portrait image
      if (img.naturalHeight > img.naturalWidth) {
        const photoCard = img.closest('.photo-card');
        if (photoCard) {
          photoCard.classList.add('portrait');
        }
      }
    };
    
    // If image is already loaded, hide placeholder immediately
    if (img.complete && img.naturalHeight > 0) {
      img.classList.remove('loading');
      img.classList.add('loaded');
      
      const placeholder = img.parentElement.querySelector('.image-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      
      // Check if this is a portrait image
      if (img.naturalHeight > img.naturalWidth) {
        const photoCard = img.closest('.photo-card');
        if (photoCard) {
          photoCard.classList.add('portrait');
        }
      }
    }
    
    // Error handling
    img.onerror = function() {
      console.error("Failed to load image:", img.src);
      img.src = '/api/placeholder/800x600';
      img.classList.remove('loading');
      img.classList.add('loaded');
      
      const placeholder = img.parentElement.querySelector('.image-placeholder');
      if (placeholder) {
        // Replace spinner with error state
        placeholder.innerHTML = '<div class="image-error">!</div>';
      }
    };
  });
}

const DEMO_PHOTOS = {
  // Add entries for each album ID that exists in your system
  1: [
    {
      id: "photo-1-1",
      title: "Race Start",
      description: "Motorcycles lined up at the starting grid",
      date: "February 15, 2025",
      url: "https://placehold.co/800x600",
    },
    {
      id: "photo-1-2",
      title: "Sharp Turn",
      description: "Racer leaning into a tight corner",
      date: "February 15, 2025",
      url: "https://placehold.co/800x600",
    },
    {
      id: "photo-1-3",
      title: "Finish Line",
      description: "Victory at the checkered flag",
      date: "February 15, 2025",
      url: "https://placehold.co/800x600",
    },
  ],
  2: [
    {
      id: "photo-2-1",
      title: "Custom Chopper",
      description: "Hand-built custom motorcycle with chrome details",
      date: "January 20, 2025",
      url: "https://placehold.co/800x600",
    },
    {
      id: "photo-2-2",
      title: "Vintage Restoration",
      description: "Restored classic motorcycle",
      date: "January 20, 2025",
      url: "https://placehold.co/800x600",
    },
  ],
  3: [
    {
      id: "photo-3-1",
      title: "Mountain Trail",
      description: "Dirt bike on a mountain trail",
      date: "December 10, 2024",
      url: "https://placehold.co/800x600",
    },
    {
      id: "photo-3-2",
      title: "Mud Run",
      description: "Off-road motorcycle powering through mud",
      date: "December 10, 2024",
      url: "https://placehold.co/800x600",
    },
    {
      id: "photo-3-3",
      title: "Jump Action",
      description: "Dirt bike catching air over a jump",
      date: "December 10, 2024",
      url: "https://placehold.co/800x600",
    },
  ],
  // Add more album IDs as needed
};

/**
 * Initialize photo viewer functionality
 */
function initPhotoViewer() {
  const photoViewer = document.getElementById("photo-viewer");
  const photoContainer = photoViewer.querySelector(".photo-container img");
  const prevBtn = photoViewer.querySelector(".prev-photo");
  const nextBtn = photoViewer.querySelector(".next-photo");
  const closeBtn = photoViewer.querySelector(".close-viewer");
  const titleEl = photoViewer.querySelector(".photo-title");
  const dateEl = photoViewer.querySelector(".photo-date");
  const albumEl = photoViewer.querySelector(".photo-album");

  // Create download button if it doesn't exist
  let downloadBtn = photoViewer.querySelector(".download-photo");
  if (!downloadBtn) {
    downloadBtn = document.createElement("button");
    downloadBtn.classList.add("download-photo");
    downloadBtn.setAttribute("aria-label", "Download photo");
    downloadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
           stroke="currentColor" stroke-width="2" stroke-linecap="round" 
           stroke-linejoin="round" class="icon">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;
    photoViewer.appendChild(downloadBtn);
  }

  /**
   * Open photo viewer with a specific set of photos
   * @param {Array} photos - Array of photo objects
   * @param {number} startIndex - Index of the initial photo to show
   */
  window.openPhotoViewer = function (photos, startIndex = 0) {
    if (!photos || photos.length === 0) return;

    let currentIndex = startIndex;

    // Update photo display
    function updatePhotoDisplay() {
      const currentPhoto = photos[currentIndex];

      // Update image
      photoContainer.src = currentPhoto.url || "/api/placeholder/1200/800";
      photoContainer.alt = currentPhoto.title || "Photo";

      // Update photo info
      titleEl.textContent = currentPhoto.title || "Untitled Photo";
      dateEl.textContent = currentPhoto.date || "";
      albumEl.textContent = currentPhoto.album || "Unknown Album";

      // Update download button
      downloadBtn.onclick = () => downloadPhoto(currentPhoto);

      // Navigation button states
      prevBtn.style.display = photos.length > 1 ? "flex" : "none";
      nextBtn.style.display = photos.length > 1 ? "flex" : "none";
    }

    function addSwipeSupport() {
      const photoViewer = document.getElementById("photo-viewer");
      let touchStartX = 0;
      let touchEndX = 0;

      photoViewer.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        false
      );

      photoViewer.addEventListener(
        "touchend",
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        },
        false
      );

      function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
          // Swipe left - next photo
          document.querySelector(".next-photo").click();
        } else if (touchEndX > touchStartX + 50) {
          // Swipe right - previous photo
          document.querySelector(".prev-photo").click();
        }
      }
    }

    // Download current photo
    function downloadPhoto(photo) {
      fetch(photo.url)
        .then((response) => response.blob())
        .then((blob) => {
          const filename = `BF_Photography_${photo.title || "photo"}`;
          const blobUrl = URL.createObjectURL(blob);

          // Add attribution if needed
          if (CONFIG.FEATURES.ADD_WATERMARK) {
            const img = new Image();
            img.onload = function () {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");

              canvas.width = img.width;
              canvas.height = img.height;

              // Draw image
              ctx.drawImage(img, 0, 0);

              // Add attribution text
              ctx.font = "14px Arial";
              ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
              ctx.fillText("© Ben Foggon Photography", 20, canvas.height - 20);

              // Convert to blob and download
              canvas.toBlob(
                function (watermarkedBlob) {
                  const watermarkedUrl = URL.createObjectURL(watermarkedBlob);
                  triggerDownload(watermarkedUrl, filename);
                  URL.revokeObjectURL(watermarkedUrl);
                },
                "image/jpeg",
                0.95
              );
            };
            img.src = blobUrl;
          } else {
            triggerDownload(blobUrl, filename);
            URL.revokeObjectURL(blobUrl);
          }
        })
        .catch((error) => {
          console.error("Download failed:", error);
          alert("Failed to download photo. Please try again.");
        });

      function triggerDownload(url, filename) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }

    // Navigation handlers
    function showPrevPhoto() {
      currentIndex = (currentIndex - 1 + photos.length) % photos.length;
      updatePhotoDisplay();
    }

    function showNextPhoto() {
      currentIndex = (currentIndex + 1) % photos.length;
      updatePhotoDisplay();
    }

    // Set up event listeners
    prevBtn.onclick = showPrevPhoto;
    nextBtn.onclick = showNextPhoto;
    closeBtn.onclick = () => photoViewer.classList.remove("active");

    // Add keyboard navigation
    function handleKeyDown(e) {
      if (!photoViewer.classList.contains("active")) return;

      switch (e.key) {
        case "ArrowLeft":
          showPrevPhoto();
          break;
        case "ArrowRight":
          showNextPhoto();
          break;
        case "Escape":
          photoViewer.classList.remove("active");
          break;
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    // Initial display
    updatePhotoDisplay();

    // Show the viewer
    photoViewer.classList.add("active");

    // Clean up when closing
    closeBtn.onclick = () => {
      photoViewer.classList.remove("active");
      document.removeEventListener("keydown", handleKeyDown);
    };
  };
}

/**
 * Primary application initialization
 */
async function initApp() {
  try {
    // Parallel loading of content sections
    await Promise.all([loadFeatured(), loadAlbums(), loadAbout()]);

    // Set up UI interactions
    setupEventListeners();
    setupScrollAnimations();
    initPhotoViewer();
  } catch (error) {
    console.error("App Initialization Error:", error);
    showGlobalErrorMessage(
      "Failed to load website content. Please try again later."
    );
  }
}

/**
 * Load and render featured content
 */
async function loadFeatured() {
  const featuredContainer = document.getElementById("featured-card-container");

  try {
    // Fetch featured data
    const featured = await API.getFeatured();

    if (!featured) {
      featuredContainer.innerHTML = renderEmptyState(
        "No featured content available"
      );
      return;
    }

    // Use template for rendering
    const template = document.getElementById("featured-template");
    const clone = template.content.cloneNode(true);

    // Populate featured content
    const img = clone.querySelector(".featured-image img");
    img.src = featured.image || "https://placehold.co/800x600";
    img.alt = featured.title || "Featured Photo";

    clone.querySelector(".featured-title").textContent =
      featured.title || "Featured Photo";
    clone.querySelector(".featured-description").textContent =
      featured.description || "";
    clone.querySelector(".date").textContent = featured.date || "";

    // Album navigation
    const viewBtn = clone.querySelector(".view-album-btn");
    if (featured.albumId) {
      viewBtn.dataset.albumId = featured.albumId;
      viewBtn.addEventListener("click", () => {
        window.location.href = `album.html?id=${featured.albumId}`;
      });
      viewBtn.style.display = "inline-block";
    } else {
      viewBtn.style.display = "none";
    }

    // Replace content
    featuredContainer.innerHTML = "";
    featuredContainer.appendChild(clone);
  } catch (error) {
    console.error("Featured Content Error:", error);
    featuredContainer.innerHTML = renderErrorState(
      "Failed to load featured content"
    );
  }
}

/**
 * Load about page content with extensive debugging
 */
async function loadAbout() {
  console.log("🔍 loadAbout() function started");

  const aboutContentEl = document.getElementById("about-content");
  const aboutImageEl = document.getElementById("about-image");

  if (!aboutContentEl || !aboutImageEl) {
    console.error("❌ About page elements not found in the DOM");
    return;
  }

  try {
    console.log("🌐 Attempting to fetch about data");

    // Fetch about data
    const about = await API.getAbout();

    console.log("📦 Raw about data received:", JSON.stringify(about, null, 2));

    // Extremely detailed null/undefined checks
    if (about === null) {
      console.warn("❗ about data is null");
      aboutContentEl.innerHTML = `
        <span class="section-label">About</span>
        <h2 class="section-title">The Photographer</h2>
        <div class="about-text">No information available (null data).</div>
      `;
      return;
    }

    if (about === undefined) {
      console.warn("❗ about data is undefined");
      aboutContentEl.innerHTML = `
        <span class="section-label">About</span>
        <h2 class="section-title">The Photographer</h2>
        <div class="about-text">No information available (undefined data).</div>
      `;
      return;
    }

    // Attempt to extract content with multiple fallbacks
    let content = "No description available.";
    if (about.content) {
      content = about.content;
      console.log("📝 Content found:", content);
    } else {
      console.warn("❗ No content found in about data");
    }

    // Populate content
    const contentHtml = `
      <span class="section-label">About</span>
      <h2 class="section-title">The Photographer</h2>
      <div class="about-text">${content}</div>
    `;
    aboutContentEl.innerHTML = contentHtml;

    // Image handling with extensive logging
    if (about.image) {
      console.log("🖼️ Image URL found:", about.image);
      aboutImageEl.src = about.image;
      aboutImageEl.alt = about.title || "Photographer";
    } else {
      console.warn("❗ No image found, using placeholder");
      aboutImageEl.src = "/api/placeholder/600/700";
      aboutImageEl.alt = "Photographer";
    }

    console.log("✅ About content successfully loaded");
  } catch (error) {
    console.error("❌ About Content Load Error:", error);

    aboutContentEl.innerHTML = `
      <span class="section-label">About</span>
      <h2 class="section-title">The Photographer</h2>
      <div class="error-message">
        <p>Error: ${error.message}</p>
        <p>Failed to load about content</p>
      </div>
    `;

    aboutImageEl.src = "/api/placeholder/600/700";
    aboutImageEl.alt = "Photographer";
  }
}

/**
 * Load and render photo albums with proper click handlers
 * This function ensures all albums display and are clickable
 */
async function loadAlbums() {
  const albumGrid = document.getElementById("album-grid");

  try {
    // Show loading spinner
    albumGrid.innerHTML = '<div class="loading-spinner"></div>';
    
    // Fetch albums with higher limit to get all 38
    const albums = await API.getAlbums();
    console.log(`Loaded ${albums.length} albums from API`);

    if (!albums || albums.length === 0) {
      albumGrid.innerHTML = renderEmptyState("No albums available");
      return;
    }

    // Clear previous content
    albumGrid.innerHTML = "";

    // Album template
    const template = document.getElementById("album-card-template");

    // Render each album
    albums.forEach((album) => {
      const clone = template.content.cloneNode(true);

      // Album image
      const img = clone.querySelector(".album-image img");
      img.src = album.coverImage || "/api/placeholder/400/300";
      img.alt = album.title || "Album Cover";

      // Album details
      clone.querySelector(".album-count").textContent = `${
        album.photoCount || 0
      } photos`;
      clone.querySelector(".album-title").textContent =
        album.title || "Untitled Album";
      clone.querySelector(".album-description").textContent =
        album.description || "";
      clone.querySelector(".date").textContent = album.date || "";

      // Share button
      const shareBtn = clone.querySelector(".btn-icon.share");
      shareBtn.dataset.albumId = album.id;
      shareBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleShareAlbum(album.id);
      });

      // Add data-album-id to the album card for future updates
      const albumCard = clone.querySelector(".album-card");
      albumCard.dataset.albumId = album.id;

      // Add click handler for the album card
      albumCard.addEventListener("click", (e) => {
        e.preventDefault();
        console.log(`Album card clicked: ${album.id}`);

        // Save the clicked album ID to session storage
        const albumId = album.id;
        sessionStorage.setItem("currentAlbumId", albumId);

        // Also store the title for better resilience
        if (album.title) {
          sessionStorage.setItem("currentAlbumTitle", album.title);
          console.log(`Stored album title in session: "${album.title}"`);
        }

        // Hide main content
        document.querySelector('.main-nav').style.display = 'none';
        document.querySelector('.hero').style.display = 'none';
        document.querySelectorAll('section').forEach((section) => {
          section.style.display = 'none';
        });
        document.querySelector('.main-footer').style.display = 'none';
        
        // Save scroll position
        sessionStorage.setItem('scrollPosition', window.scrollY);
        
        // Scroll to top
        window.scrollTo(0, 0);

        // Then fetch and display the album
        displayAlbumView(albumId);

        // Update URL without redirecting
        window.history.pushState({ albumId }, "", `#album-${albumId}`);
      });

      albumGrid.appendChild(clone);
    });
    
    console.log("All albums rendered successfully with click handlers attached");
  } catch (error) {
    console.error("Albums Load Error:", error);
    albumGrid.innerHTML = renderErrorState("Failed to load albums");
  }
}

/**
 * Display an album view with proper links
 * @param {string|number} albumId - Album ID to display
 */
async function displayAlbumView(albumId) {
  // First, check if we're already displaying this album
  const currentDisplayedAlbum = sessionStorage.getItem("currentDisplayedAlbum");
  if (currentDisplayedAlbum === albumId) {
    console.log(`Album ${albumId} already being displayed, refreshing view`);
    // Just make sure it's visible and return
    const albumView = document.getElementById("album-view");
    if (albumView) {
      albumView.style.display = "block";
      return;
    }
  }
  
  // Set current album being displayed
  sessionStorage.setItem("currentDisplayedAlbum", albumId);
  console.log(`Starting to display album with ID: ${albumId}`);

  // Create or get album view container
  let albumView = document.getElementById("album-view");
  if (!albumView) {
    albumView = document.createElement("div");
    albumView.id = "album-view";
    albumView.className = "album-page-view";
    document.body.appendChild(albumView);
  }

  // Show loading
  albumView.innerHTML = '<div class="loading-spinner"></div>';
  albumView.style.display = "block";

  // Add a safety timeout to prevent infinite loading
  const loadingTimeout = setTimeout(() => {
    if (document.querySelector("#album-view .loading-spinner")) {
      console.error("Album loading timed out after 15 seconds");
      albumView.innerHTML = renderErrorState(
        "Album loading timed out. Please try again later."
      );
    }
  }, 15000);

  try {
    // Fetch basic album info first (without photos)
    console.log(`Fetching album metadata for ID: ${albumId}`);
    const album = await API.getAlbum(albumId);
    
    // Clear the safety timeout since we got a response
    clearTimeout(loadingTimeout);

    console.log("Album data received:", album);

    if (!album) {
      albumView.innerHTML = renderErrorState(
        "Album not found or failed to load"
      );
      return;
    }

    // More robust title extraction with detailed logging
    let albumTitle = 'Untitled Album';
    if (album.title) {
      albumTitle = album.title;
      console.log(`Found title directly in album: "${albumTitle}"`);
    } else if (album.attributes && album.attributes.title) {
      albumTitle = album.attributes.title;
      console.log(`Found title in album.attributes: "${albumTitle}"`);
    } else {
      albumTitle = `Album ${albumId}`;
      console.log(`No title found, using default: "${albumTitle}"`);
    }

    // Update page title for better SEO and user experience
    document.title = `${albumTitle} | ${CONFIG.SITE.TITLE || 'Photography Gallery'}`;
    
    // Store the album title in session storage for other parts of the application
    sessionStorage.setItem('currentAlbumTitle', albumTitle);
    console.log(`Album title set in session storage: "${albumTitle}"`);

    // Display album header with a more page-like structure
    let albumContent = `
      <header class="album-page-header">
        <div class="container">
          <a href="#" class="back-button" id="back-to-albums">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Albums
          </a>
          
          <!-- Add share button in album header -->
          <button class="btn-share-album" data-album-id="${albumId}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              Share Album
          </button>
        </div>
      </header>
      <div class="container">
        <div class="album-header">
            <h1 class="section-title">${albumTitle}</h1>
            <p class="album-description">${album.description || ""}</p>
            <div class="album-metadata">
                <span class="date">${album.date || ""}</span>
                <span class="photo-count">${album.photoCount || 0} photos</span>
            </div>
        </div>
        
        <!-- Main photo grid with loading state -->
        <div class="album-grid photo-album-grid" id="photo-grid">
            <div class="grid-loading-state">
                <div class="loading-spinner"></div>
                <p>Loading photos...</p>
            </div>
        </div>
        
        <div class="album-bottom-spacing"></div>
      </div>`;

    // Update the album view
    albumView.innerHTML = albumContent;

    // Set up back button with proper history handling
    const backButton = document.getElementById("back-to-albums");
    if (backButton) {
      backButton.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Back button clicked, returning to albums");
        goBackToAlbums();
      });
    } else {
      console.error("Back button element not found after rendering album view");
    }
    
    // Set up share button
    const shareBtn = albumView.querySelector(".btn-share-album");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        handleShareAlbum(albumId);
      });
    }
    
    // Now load photos in a separate call to prevent freezing
    loadAlbumPhotos(albumId);
    
  } catch (error) {
    // Clear the safety timeout
    clearTimeout(loadingTimeout);
    
    console.error("Error displaying album:", error);
    albumView.innerHTML = renderErrorState(
      `Failed to load album: ${error.message}`
    );
  }
}

/**
 * Load photos for an album in a separate call
 * @param {string|number} albumId - Album ID to load photos for
 */
async function loadAlbumPhotos(albumId) {
  const photoGrid = document.getElementById('photo-grid');
  if (!photoGrid) {
    console.error("Photo grid not found");
    return;
  }
  
  try {
    console.log(`Loading photos for album ${albumId}`);
    
    // Get photos from API
    const response = await fetch(
      `${CONFIG.API.BASE_URL}${CONFIG.API.PHOTOS}?filters[album][id][$eq]=${albumId}&populate=image&pagination[page]=1&pagination[pageSize]=12`,
      {
        headers: {
          Authorization: `Bearer ${CONFIG.API.TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Photo data received:", data);
    
    // Clear loading state
    photoGrid.innerHTML = '';
    
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      photoGrid.innerHTML = renderEmptyState("No photos available in this album");
      return;
    }
    
    // Get the total photo count and pages from meta
    const totalPhotos = data.meta?.pagination?.total || data.data.length;
    const totalPages = data.meta?.pagination?.pageCount || 1;
    const albumTitle = sessionStorage.getItem('currentAlbumTitle') || `Album ${albumId}`;
    
    // Update photo count display
    const photoCountEl = document.querySelector('.photo-count');
    if (photoCountEl) {
      photoCountEl.textContent = `${totalPhotos} photos`;
    }
    
    // Process photos
    data.data.forEach((photo, index) => {
      const photoAttrs = photo.attributes || photo;
      const photoId = photo.id;
      
      // Extract image URL
      let imageUrl = "/api/placeholder/400/300"; // Small thumbnail to start
      let fullSizeUrl = "/api/placeholder/1200/800";
      
      if (photoAttrs.image && photoAttrs.image.data && photoAttrs.image.data.attributes) {
        const attrs = photoAttrs.image.data.attributes;
        
        // Use thumbnail or small format for grid view to reduce bandwidth
        if (attrs.formats) {
          if (attrs.formats.thumbnail) {
            imageUrl = attrs.formats.thumbnail.url.startsWith("http")
              ? attrs.formats.thumbnail.url
              : `${CONFIG.API.MEDIA_URL}${attrs.formats.thumbnail.url}`;
          } else if (attrs.formats.small) {
            imageUrl = attrs.formats.small.url.startsWith("http")
              ? attrs.formats.small.url
              : `${CONFIG.API.MEDIA_URL}${attrs.formats.small.url}`;
          } else if (attrs.url) {
            imageUrl = attrs.url.startsWith("http")
              ? attrs.url
              : `${CONFIG.API.MEDIA_URL}${attrs.url}`;
          }
          
          // Use large format for fullsize
          if (attrs.formats.large) {
            fullSizeUrl = attrs.formats.large.url.startsWith("http")
              ? attrs.formats.large.url
              : `${CONFIG.API.MEDIA_URL}${attrs.formats.large.url}`;
          } else if (attrs.url) {
            fullSizeUrl = attrs.url.startsWith("http")
              ? attrs.url
              : `${CONFIG.API.MEDIA_URL}${attrs.url}`;
          }
        } else if (attrs.url) {
          imageUrl = attrs.url.startsWith("http")
            ? attrs.url
            : `${CONFIG.API.MEDIA_URL}${attrs.url}`;
          fullSizeUrl = imageUrl;
        }
      } else if (photoAttrs.image && photoAttrs.image.url) {
        // Support older Strapi structure
        imageUrl = photoAttrs.image.url.startsWith("http")
          ? photoAttrs.image.url
          : `${CONFIG.API.MEDIA_URL}${photoAttrs.image.url}`;
        fullSizeUrl = imageUrl;
      }
      
      const photoTitle = photoAttrs.title || `Photo ${index + 1}`;
      const photoDescription = photoAttrs.description || "";
      const photoDate = photoAttrs.date
        ? new Date(photoAttrs.date).toLocaleDateString()
        : "";
        
      // Create photo card with minimal HTML to start
      const photoCard = document.createElement('article');
      photoCard.className = 'album-card photo-card';
      photoCard.dataset.index = index;
      photoCard.dataset.id = photoId;
      
      photoCard.innerHTML = `
        <div class="album-image">
          <div class="image-placeholder">
            <div class="loading-spinner photo-spinner"></div>
          </div>
          <img 
            src="${imageUrl}" 
            alt="${photoTitle}" 
            loading="lazy" 
            data-fullsize="${fullSizeUrl}"
          />
          <div class="album-overlay">
            <span class="album-count">${index + 1}/${totalPhotos}</span>
          </div>
        </div>
        <div class="album-content">
          <h3 class="album-title">${photoTitle}</h3>
          <p class="album-description">${photoDescription}</p>
          <div class="album-footer">
            <span class="date">${photoDate}</span>
          </div>
        </div>
      `;
      
      photoGrid.appendChild(photoCard);
      
      // Store full photo data
      const photoData = {
        id: photoId,
        title: photoTitle,
        description: photoDescription,
        date: photoDate,
        url: fullSizeUrl,
        album: albumTitle
      };
      
      // Add click handler for photo viewer
      photoCard.addEventListener('click', () => {
        openPhotoViewer([photoData], 0);
      });
      
      // Add load event for each image
      const img = photoCard.querySelector('img');
      img.onload = function() {
        const placeholder = this.previousElementSibling;
        if (placeholder) placeholder.style.display = 'none';
        this.classList.add('loaded');
        
        // Check if this is a portrait image
        if (this.naturalHeight > this.naturalWidth) {
          photoCard.classList.add('portrait');
        }
      };
      
      img.onerror = function() {
        this.src = '/api/placeholder/400/300';
        const placeholder = this.previousElementSibling;
        if (placeholder) {
          placeholder.innerHTML = '<div class="image-error">!</div>';
        }
      };
    });
    
    // Add Load More button if there are more pages
    if (totalPages > 1) {
      const loadMoreContainer = document.createElement('div');
      loadMoreContainer.className = 'load-more-container';
      loadMoreContainer.innerHTML = `
        <button id="load-more-photos" class="btn load-more" data-album-id="${albumId}" data-page="2" data-total-pages="${totalPages}">
          Load More Photos
          <span class="photo-count-remaining">(${totalPhotos - data.data.length} more)</span>
        </button>
      `;
      
      photoGrid.after(loadMoreContainer);
      
      // Add event listener for Load More button
      document.getElementById('load-more-photos').addEventListener('click', handleLoadMorePhotos);
    }
    
  } catch (error) {
    console.error("Error loading album photos:", error);
    photoGrid.innerHTML = renderErrorState("Failed to load photos");
  }
}

/**
 * Handle clicking the Load More button
 * @param {Event} e - Click event
 */
async function handleLoadMorePhotos(e) {
  const button = e.currentTarget;
  const albumId = button.dataset.albumId;
  const page = parseInt(button.dataset.page, 10);
  const totalPages = parseInt(button.dataset.totalPages, 10);
  
  // Show loading state
  button.innerHTML = '<div class="loading-spinner button-spinner"></div> Loading...';
  button.disabled = true;
  
  try {
    // Load next page of photos
    const response = await fetch(
      `${CONFIG.API.BASE_URL}${CONFIG.API.PHOTOS}?filters[album][id][$eq]=${albumId}&populate=image&pagination[page]=${page}&pagination[pageSize]=12`,
      {
        headers: {
          Authorization: `Bearer ${CONFIG.API.TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const photoGrid = document.getElementById('photo-grid');
    const albumTitle = sessionStorage.getItem('currentAlbumTitle') || `Album ${albumId}`;
    const totalPhotos = data.meta?.pagination?.total || 0;
    
    // Append photos to the grid
    data.data.forEach((photo, idx) => {
      const index = ((page - 1) * 12) + idx;
      const photoAttrs = photo.attributes || photo;
      const photoId = photo.id;
      
      // Extract image URL (same logic as above)
      let imageUrl = "/api/placeholder/400/300";
      let fullSizeUrl = "/api/placeholder/1200/800";
      
      if (photoAttrs.image && photoAttrs.image.data && photoAttrs.image.data.attributes) {
        const attrs = photoAttrs.image.data.attributes;
        
        if (attrs.formats) {
          if (attrs.formats.thumbnail) {
            imageUrl = attrs.formats.thumbnail.url.startsWith("http")
              ? attrs.formats.thumbnail.url
              : `${CONFIG.API.MEDIA_URL}${attrs.formats.thumbnail.url}`;
          } else if (attrs.formats.small) {
            imageUrl = attrs.formats.small.url.startsWith("http")
              ? attrs.formats.small.url
              : `${CONFIG.API.MEDIA_URL}${attrs.formats.small.url}`;
          } else if (attrs.url) {
            imageUrl = attrs.url.startsWith("http")
              ? attrs.url
              : `${CONFIG.API.MEDIA_URL}${attrs.url}`;
          }
          
          if (attrs.formats.large) {
            fullSizeUrl = attrs.formats.large.url.startsWith("http")
              ? attrs.formats.large.url
              : `${CONFIG.API.MEDIA_URL}${attrs.formats.large.url}`;
          } else if (attrs.url) {
            fullSizeUrl = attrs.url.startsWith("http")
              ? attrs.url
              : `${CONFIG.API.MEDIA_URL}${attrs.url}`;
          }
        } else if (attrs.url) {
          imageUrl = attrs.url.startsWith("http")
            ? attrs.url
            : `${CONFIG.API.MEDIA_URL}${attrs.url}`;
          fullSizeUrl = imageUrl;
        }
      } else if (photoAttrs.image && photoAttrs.image.url) {
        imageUrl = photoAttrs.image.url.startsWith("http")
          ? photoAttrs.image.url
          : `${CONFIG.API.MEDIA_URL}${photoAttrs.image.url}`;
        fullSizeUrl = imageUrl;
      }
      
      const photoTitle = photoAttrs.title || `Photo ${index + 1}`;
      const photoDescription = photoAttrs.description || "";
      const photoDate = photoAttrs.date
        ? new Date(photoAttrs.date).toLocaleDateString()
        : "";
        
      // Create photo card
      const photoCard = document.createElement('article');
      photoCard.className = 'album-card photo-card';
      photoCard.dataset.index = index;
      photoCard.dataset.id = photoId;
      
      photoCard.innerHTML = `
        <div class="album-image">
          <div class="image-placeholder">
            <div class="loading-spinner photo-spinner"></div>
          </div>
          <img 
            src="${imageUrl}" 
            alt="${photoTitle}" 
            loading="lazy" 
            data-fullsize="${fullSizeUrl}"
          />
          <div class="album-overlay">
            <span class="album-count">${index + 1}/${totalPhotos}</span>
          </div>
        </div>
        <div class="album-content">
          <h3 class="album-title">${photoTitle}</h3>
          <p class="album-description">${photoDescription}</p>
          <div class="album-footer">
            <span class="date">${photoDate}</span>
          </div>
        </div>
      `;
      
      photoGrid.appendChild(photoCard);
      
      // Store photo data
      const photoData = {
        id: photoId,
        title: photoTitle,
        description: photoDescription,
        date: photoDate,
        url: fullSizeUrl,
        album: albumTitle
      };
      
      // Add click handler
      photoCard.addEventListener('click', () => {
        openPhotoViewer([photoData], 0);
      });
      
      // Add load event
      const img = photoCard.querySelector('img');
      img.onload = function() {
        const placeholder = this.previousElementSibling;
        if (placeholder) placeholder.style.display = 'none';
        this.classList.add('loaded');
        
        if (this.naturalHeight > this.naturalWidth) {
          photoCard.classList.add('portrait');
        }
      };
      
      img.onerror = function() {
        this.src = '/api/placeholder/400/300';
        const placeholder = this.previousElementSibling;
        if (placeholder) {
          placeholder.innerHTML = '<div class="image-error">!</div>';
        }
      };
    });
    
    // Update button for next page or remove if we're done
    if (page < totalPages) {
      button.dataset.page = page + 1;
      button.innerHTML = `
        Load More Photos
        <span class="photo-count-remaining">(${totalPhotos - ((page) * 12)} more)</span>
      `;
      button.disabled = false;
    } else {
      // Remove load more button when finished
      const loadMoreContainer = button.parentElement;
      loadMoreContainer.innerHTML = '<p class="all-loaded">All photos loaded</p>';
    }
    
  } catch (error) {
    console.error("Error loading more photos:", error);
    button.innerHTML = "Error loading more photos";
    button.disabled = true;
  }
}

/**
 * Copy a URL to clipboard and show feedback
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
  // Modern clipboard API method
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast("Link copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        fallbackCopyToClipboard(text);
      });
  } else {
    // Fallback for older browsers
    fallbackCopyToClipboard(text);
  }
}

/**
 * Add a footer to the album view page
 * This function should be called from your displayAlbumView function
 */
function addAlbumPageFooter() {
  // Check if we already have a footer in the album view
  const existingFooter = document.querySelector('#album-view .album-page-footer');
  if (existingFooter) {
    return; // Footer already exists, no need to add it again
  }

  // Get the album view container
  const albumView = document.getElementById('album-view');
  if (!albumView) {
    return; // No album view found
  }

  // Create the footer element
  const footer = document.createElement('footer');
  footer.className = 'main-footer album-page-footer';
  
  // Clone the content from the main footer
  const mainFooter = document.querySelector('.main-footer');
  if (mainFooter) {
    // Use the existing footer's content
    footer.innerHTML = mainFooter.innerHTML;
  } else {
    // Create footer content if original footer is not found
    footer.innerHTML = `
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">BF</div>
          <div class="footer-copyright">Site created by Ben Foggon</div>
          <div class="footer-links">
            <a
              href="https://www.instagram.com/ben.onabike/"
              class="footer-link social-link"
              target="_blank"
              rel="noopener"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="social-icon"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path
                  d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                ></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              Instagram
            </a>
          </div>
        </div>
      </div>
    `;
  }
  
  // Append the footer to the album view
  albumView.appendChild(footer);
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
  // Check if a toast container already exists
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    // Create a toast container
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 3000);
}

/**
 * Go back to albums list from album view
 */
function goBackToAlbums() {
  console.log("Executing goBackToAlbums function");
  
  // Hide the album view
  const albumView = document.getElementById("album-view");
  if (albumView) {
    albumView.style.display = "none";
  } else {
    console.warn("Album view not found when trying to go back");
  }

  // Show main content elements
  document.querySelector(".main-nav").style.display = "block";
  document.querySelector(".hero").style.display = "flex";
  document.querySelectorAll("section").forEach((section) => {
    section.style.display = "block";
  });
  document.querySelector(".main-footer").style.display = "block";

  // Restore scroll position
  const scrollPosition = sessionStorage.getItem("scrollPosition") || 0;
  window.scrollTo(0, parseInt(scrollPosition));

  // Update URL - simplified to avoid issues
  try {
    window.history.pushState({}, document.title, window.location.pathname);
    console.log("URL reset to:", window.location.pathname);
  } catch (e) {
    console.error("Error updating URL:", e);
  }
}

/**
 * Handle sharing an album with proper URL without navigation
 * @param {string|number} albumId - Album ID to share
 * @param {Event} event - Click event
 */
function handleShareAlbum(albumId, event) {
  // Prevent the event from bubbling up to parent elements
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // Create a properly structured URL for sharing
  const shareUrl = `${window.location.origin}/album/${albumId}`;
  
  // Try to use the Web Share API first (for mobile devices)
  if (navigator.share) {
    navigator.share({
      title: `Album from ${document.title}`,
      url: shareUrl
    }).catch(error => {
      console.log('Error sharing:', error);
      // Fallback to clipboard copying
      copyToClipboard(shareUrl);
    });
  } else {
    // Fallback to clipboard copying
    copyToClipboard(shareUrl);
  }
}

/**
 * Initializes all share buttons on the page
 * Add this to your document ready or initialization function
 */
function initShareButtons() {
  document.querySelectorAll('.btn-icon.share').forEach(button => {
    button.addEventListener('click', function(e) {
      const albumId = this.dataset.albumId;
      handleShareAlbum(albumId, e);
    });
  });
}

// Create a function to be called after your existing app initialization
function initImageAnimations() {
  initImageLoadingSystem();
  enhancePhotoViewer();
  
  // Add smooth staggered loading effect for album cards
  document.querySelectorAll('.album-card, .photo-card').forEach((card, index) => {
    card.style.animationDelay = `${0.1 + (index * 0.05)}s`;
  });
  
  console.log('Image animations initialized');
}
window.initImageAnimations = initImageAnimations;

// Initialize the photo loading fix at the end of your script
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initPhotoLoadingFix, 500);
});

// Add event listener for browser back button
window.addEventListener("popstate", function (e) {
  const albumView = document.getElementById("album-view");
  if (albumView && albumView.style.display === "block") {
    goBackToAlbums();
  }
});
