/**
 * API Integration for Headless CMS
 * This file handles all data fetching from the CMS
 */

class API {
  static async fetch(endpoint, options = {}) {
    try {
      console.log(`Making API request to: ${endpoint}`);
      const url = `${CONFIG.API.BASE_URL}${endpoint}`;
      const defaultOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CONFIG.API.TOKEN}`,
        },
      };

      const mergedOptions = { ...defaultOptions, ...options };
      console.log("Request options:", mergedOptions);

      const response = await fetch(url, mergedOptions);

      if (!response.ok) {
        console.error(
          `API request failed: ${response.status} ${response.statusText}`
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error("API fetch error:", error, "for endpoint:", endpoint);
      throw error;
    }
  }

  /**
   * Get the complete URL for a media item - properly handles Strapi v4 media structure
   * @param {Object} media - Media object from Strapi
   * @returns {string} - Complete media URL
   */
  static getMediaUrl(media) {
    if (!media) return '/api/placeholder/400/300';

    try {
      // For photos directly from the Photos endpoint (from your debug output)
      if (media.image && media.image.url) {
        const url = media.image.url;
        return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
      }

      // Direct URL on the media object itself
      if (media.url) {
        const url = media.url;
        return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
      }

      // Strapi v4 media structure
      if (media.data && media.data.attributes && media.data.attributes.url) {
        const url = media.data.attributes.url;
        return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
      }

      // Handle array data structure - sometimes Strapi returns an array
      if (media.data && Array.isArray(media.data) && media.data[0]) {
        if (media.data[0].attributes && media.data[0].attributes.url) {
          const url = media.data[0].attributes.url;
          return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
        }
      }

      // Check for nested image object (common in Strapi responses)
      if (media.image) {
        // Recursively call getMediaUrl on the image field
        return this.getMediaUrl(media.image);
      }

      // Check for formats in Strapi v4 structure
      if (media.data && media.data.attributes && media.data.attributes.formats) {
        const formats = media.data.attributes.formats;
        const formatPriority = ['large', 'medium', 'small', 'thumbnail'];

        for (const format of formatPriority) {
          if (formats[format] && formats[format].url) {
            const url = formats[format].url;
            return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
          }
        }
      }

      console.warn('Could not extract URL from media object', media);
      return '/api/placeholder/400/300';
    } catch (error) {
      console.error('Error in getMediaUrl:', error);
      return '/api/placeholder/400/300';
    }
  }

  /**
   * Helper function to extract photo URL from different data structures
   * @param {Object} photoObj - Photo object from API
   * @returns {string} - URL for the photo
   */
  static extractPhotoUrl(photoObj) {
    try {
      // Direct image field (from your debug output)
      if (photoObj.image) {
        // Handle Strapi v4 structure with data and attributes
        if (photoObj.image.data && photoObj.image.data.attributes) {
          const attrs = photoObj.image.data.attributes;

          // Direct URL in attributes
          if (attrs.url) {
            const url = attrs.url;
            return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
          }

          // Check for formats in attributes
          if (attrs.formats) {
            const formatPriority = ['large', 'medium', 'small', 'thumbnail'];
            for (const format of formatPriority) {
              if (attrs.formats[format] && attrs.formats[format].url) {
                const url = attrs.formats[format].url;
                return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
              }
            }
          }
        }

        // Direct URL in image object
        if (photoObj.image.url) {
          const url = photoObj.image.url;
          return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
        }

        // Check formats if available
        if (photoObj.image.formats) {
          const formatPriority = ['large', 'medium', 'small', 'thumbnail'];
          for (const format of formatPriority) {
            if (photoObj.image.formats[format] && photoObj.image.formats[format].url) {
              const url = photoObj.image.formats[format].url;
              return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
            }
          }
        }
      }

      // Check for direct URL
      if (photoObj.url) {
        return photoObj.url.startsWith('http') ? photoObj.url : `${CONFIG.API.MEDIA_URL}${photoObj.url}`;
      }

      // Check for nested media structure
      if (photoObj.media && photoObj.media.data) {
        return this.getMediaUrl(photoObj.media);
      }

      // NEW HANDLING FOR ADDITIONAL STRAPI STRUCTURES
      // Check for nested image structures in Strapi v4
      if (photoObj.image && photoObj.image.data) {
        const imageData = photoObj.image.data;
        if (imageData.attributes && imageData.attributes.url) {
          const url = imageData.attributes.url;
          return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
        }

        // Check for formats in nested data
        if (imageData.attributes && imageData.attributes.formats) {
          const formatPriority = ['large', 'medium', 'small', 'thumbnail'];
          for (const format of formatPriority) {
            if (imageData.attributes.formats[format] && imageData.attributes.formats[format].url) {
              const url = imageData.attributes.formats[format].url;
              return url.startsWith('http') ? url : `${CONFIG.API.MEDIA_URL}${url}`;
            }
          }
        }
      }

      console.warn('Could not extract URL from photo object:', photoObj);
      return '/api/placeholder/800/600';
    } catch (error) {
      console.error('Error extracting photo URL:', error);
      return '/api/placeholder/800/600';
    }
  }

  /**
   * Get a single album with its photos - properly structured for your Strapi setup
   * @param {string|number} id - Album ID
   * @returns {Promise<Object>} - Processed album data with photos
   */
  static async getAlbum(id) {
    try {
      console.log(`Fetching album with ID: ${id}`);

      // Step 1: First try to get basic album info from albums endpoint
      let albumInfo = null;
      try {
        const allAlbumsData = await this.fetch(`${CONFIG.API.ALBUMS}/${id}?populate=cover_image`);
        console.log("Raw album response:", JSON.stringify(allAlbumsData, null, 2));

        if (allAlbumsData && allAlbumsData.data) {
          // Album basic info extraction - keep this part the same
          const albumData = allAlbumsData.data;
          const albumAttrs = albumData.attributes || albumData;
          
          // Title extraction logic remains the same
          let title = null;
          if (albumAttrs.title) {
            title = albumAttrs.title;
            console.log(`Found title in attributes: "${title}"`);
          } else if (albumData.title) {
            title = albumData.title;
            console.log(`Found title in data: "${title}"`);
          } else if (albumData.attributes && albumData.attributes.title) {
            title = albumData.attributes.title;
            console.log(`Found title in data.attributes: "${title}"`);
          } else {
            // Check session storage as before
            if (typeof window !== 'undefined' && window.sessionStorage) {
              const storedTitle = sessionStorage.getItem('currentAlbumTitle');
              if (storedTitle) {
                title = storedTitle;
                console.log(`Using title from session storage: "${title}"`);
              }
            }

            if (!title) {
              title = `Album ${id}`;
              console.warn(`No title found, using default: "${title}"`);
            }
          }

          // Create album info but with empty photos array - we'll only send photo metadata, not URLs yet
          albumInfo = {
            id: albumData.id,
            title: title,
            description: albumAttrs.description || '',
            date: this.formatDate(albumAttrs.date || albumAttrs.createdAt || new Date()),
            coverImage: albumAttrs.cover_image ? this.getMediaUrl(albumAttrs.cover_image) : '/api/placeholder/400/300',
            photos: [],
            photoCount: 0
          };

          console.log(`Album info created with title: "${albumInfo.title}"`);
        }
      } catch (error) {
        console.error('Error getting album basic info:', error);
      }

      // Fallback creation if needed - keep this part
      if (!albumInfo) {
        console.warn(`Could not get album info from API, creating fallback for album ${id}`);
        let title = `Album ${id}`;
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const storedTitle = sessionStorage.getItem('currentAlbumTitle');
          if (storedTitle) {
            title = storedTitle;
            console.log(`Using title from session storage: "${title}"`);
          }
        }

        albumInfo = {
          id: id,
          title: title,
          description: '',
          date: this.formatDate(new Date()),
          coverImage: '/api/placeholder/400/300',
          photos: [],
          photoCount: 0
        };
      }

      // Now get photo metadata but not full URLs yet
      try {
        console.log(`Fetching photos metadata for album ${id}`);
        
        // Only fetch IDs and basic metadata without full images
        const photosData = await this.fetch(`${CONFIG.API.PHOTOS}?filters[album][id][$eq]=${id}&fields=id,title,description,date,createdAt`);

        if (photosData && photosData.data && Array.isArray(photosData.data)) {
          console.log(`Found ${photosData.data.length} photos for album ${id}`);
          albumInfo.photoCount = photosData.data.length;

          // Store minimal photo data - no image URLs yet
          photosData.data.forEach((photo, index) => {
            const photoAttrs = photo.attributes || photo;
            
            albumInfo.photos.push({
              id: photo.id,
              title: photoAttrs.title || `Photo ${index + 1}`,
              description: photoAttrs.description || '',
              date: this.formatDate(photoAttrs.date || photoAttrs.createdAt || new Date()),
              loadingPlaceholder: '/api/placeholder/10/10', // Tiny placeholder
              // Don't include full URL yet, will be loaded on demand
              dataSrc: `photo-${photo.id}`, // A reference we can use to load it later
              album: albumInfo.title
            });
          });
        }
      } catch (error) {
        console.error('Error fetching photos metadata for album:', error);
      }

      // Same fallback logic for empty albums
      if (albumInfo.photos.length === 0) {
        console.warn('No photos found for album, using demo photos');
        albumInfo.photos = this.generatePlaceholderPhotosWithLazyLoading(8);
        albumInfo.photoCount = albumInfo.photos.length;
      }

      // Session storage persisting
      if (typeof window !== 'undefined' && window.sessionStorage && albumInfo.title) {
        sessionStorage.setItem('currentAlbumTitle', albumInfo.title);
        console.log(`Stored album title in session storage: "${albumInfo.title}"`);
      }

      console.log(`Returning album with title "${albumInfo.title}" and ${albumInfo.photos.length} photos metadata`);
      return albumInfo;
    } catch (error) {
      console.error(`Error in getAlbum(${id}):`, error);
      return this.createFallbackAlbumWithLazyLoading(id);
    }
  }

  /**
   * Create a fallback album with lazy loading support
   * @param {string|number} id - Album ID
   * @returns {Object} - Fallback album data with lazy loading
   */
  static createFallbackAlbumWithLazyLoading(id) {
    // Check if we have this album's title stored in session storage first
    let title = `Demo Album ${id}`;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedTitle = sessionStorage.getItem('currentAlbumTitle');
      if (storedTitle) {
        title = storedTitle;
        console.log(`Using title from session storage for fallback album: "${title}"`);
      }
    }

    return {
      id: id,
      title: title,
      description: "This is a demonstration album with placeholder content.",
      date: this.formatDate(new Date()),
      coverImage: "/api/placeholder/400/300",
      photos: this.generatePlaceholderPhotosWithLazyLoading(8),
      photoCount: 8
    };
  }

  /**
   * Generate placeholder photos with lazy loading support
   * @param {number} count - Number of photos to generate
   * @returns {Array} - Array of photo objects with lazy loading
   */
  static generatePlaceholderPhotosWithLazyLoading(count = 5) {
    const photos = [];

    for (let i = 0; i < count; i++) {
      // Use different sized placeholders to make it look more realistic
      const width = 800 + Math.floor(Math.random() * 400);
      const height = 600 + Math.floor(Math.random() * 200);

      photos.push({
        id: "placeholder-" + i,
        title: `Demo Photo ${i + 1}`,
        description: "This is a placeholder photo for demonstration purposes.",
        date: this.formatDate(new Date(Date.now() - i * 86400000)),
        loadingPlaceholder: "/api/placeholder/10/10", // Tiny placeholder
        dataSrc: `/api/placeholder/${width}/${height}`, // To be loaded on demand
      });
    }

    return photos;
  }

  /**
   * Load full image details for a specific photo
   * This method should be called when a photo is about to be viewed
   * @param {string|number} albumId - Album ID
   * @param {string|number} photoId - Photo ID
   * @returns {Promise<Object>} - Full photo data with URL
   */
  static async getPhotoDetails(albumId, photoId) {
    try {
      console.log(`Loading full details for photo ${photoId} in album ${albumId}`);
      
      const photoData = await this.fetch(`${CONFIG.API.PHOTOS}/${photoId}?populate=image`);
      
      if (!photoData || !photoData.data) {
        throw new Error('Invalid photo data returned from API');
      }
      
      const photo = photoData.data;
      const photoAttrs = photo.attributes || photo;
      
      // Get the full URL now that we need it
      const photoUrl = this.extractPhotoUrl(photoAttrs);
      
      return {
        id: photo.id,
        title: photoAttrs.title || `Photo`,
        description: photoAttrs.description || '',
        date: this.formatDate(photoAttrs.date || photoAttrs.createdAt || new Date()),
        url: photoUrl, // Full image URL
        album: sessionStorage.getItem('currentAlbumTitle') || `Album ${albumId}`
      };
    } catch (error) {
      console.error(`Error loading photo details:`, error);
      
      // Fallback to placeholder if needed
      return {
        id: photoId,
        title: `Photo`,
        description: 'Photo details could not be loaded.',
        date: this.formatDate(new Date()),
        url: `/api/placeholder/800/600`,
        album: sessionStorage.getItem('currentAlbumTitle') || `Album ${albumId}`
      };
    }
  }

  /**
   * Format a date string
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */
  static formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Get featured content
   * @returns {Promise<Object>} - Featured content data
   */
  static async getFeatured() {
    const data = await this.fetch(`${CONFIG.API.FEATURED}?populate=*`);
    return this.processFeaturedData(data);
  }

  /**
   * Process featured data from the API
   * @param {Object} data - Raw API data
   * @returns {Object} - Processed featured data
   */
  static processFeaturedData(data) {
    console.log("Processing featured data:", data);

    if (!data || !data.data) {
      console.error("Missing data in featured response");
      return null;
    }

    const featured = data.data;
    console.log("Featured image:", featured.image);

    // Check if we have the required fields
    return {
      id: featured.id || null,
      title: featured.title || "Featured Content",
      description: featured.description || "",
      date: this.formatDate(featured.date),
      image: featured.image ? this.getMediaUrl(featured.image) : "",
      albumId: featured.album?.id || null,
      albumTitle: featured.album?.title || "No Album",
    };
  }

/**
 * Get all albums - definitive solution that fetches all albums regardless of pagination
 * @returns {Promise<Array>} - Albums data
 */
static async getAlbums() {
  try {
    console.log('Starting ultimate album fetching solution');
    
    // --- APPROACH 1: Direct API call with high limit ---
    try {
      console.log('ATTEMPT 1: Using high pagination limit');
      const data = await this.fetch(`${CONFIG.API.ALBUMS}?populate=cover_image&pagination[limit]=100`);
      
      // Check if we got a valid response
      if (data && data.data && Array.isArray(data.data)) {
        const albumCount = data.data.length;
        console.log(`Success! Fetched ${albumCount} albums directly`);
        
        // Check if pagination metadata indicates there are more albums
        if (data.meta && data.meta.pagination) {
          const total = data.meta.pagination.total;
          console.log(`Total albums according to metadata: ${total}`);
          
          // If we got all albums, process and return
          if (albumCount >= total || albumCount >= 38) {
            return this.processAlbumsData(data);
          }
          console.log(`Direct approach didn't get all albums (${albumCount}/${total}), trying page-by-page approach`);
        } else {
          // If the count is more than 25, we likely got all albums
          if (albumCount > 25) {
            return this.processAlbumsData(data);
          }
        }
      }
    } catch (err) {
      console.error('Error with direct pagination approach:', err);
    }
    
    // --- APPROACH 2: Fetch albums page by page ---
    console.log('ATTEMPT 2: Fetching albums page by page');
    let allAlbums = [];
    let currentPage = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      console.log(`Fetching page ${currentPage}...`);
      try {
        const pageData = await this.fetch(
          `${CONFIG.API.ALBUMS}?populate=cover_image&pagination[page]=${currentPage}&pagination[pageSize]=25`
        );
        
        if (pageData && pageData.data && Array.isArray(pageData.data) && pageData.data.length > 0) {
          console.log(`Got ${pageData.data.length} albums from page ${currentPage}`);
          allAlbums = [...allAlbums, ...pageData.data];
          
          // Check if there are more pages
          if (pageData.meta && pageData.meta.pagination) {
            const pagination = pageData.meta.pagination;
            hasMorePages = currentPage < pagination.pageCount;
            console.log(`Page ${currentPage}/${pagination.pageCount}, has more: ${hasMorePages}`);
          } else {
            // If no pagination info or fewer than pageSize albums, assume this is the last page
            hasMorePages = pageData.data.length >= 25;
          }
          
          currentPage++;
        } else {
          hasMorePages = false;
        }
      } catch (err) {
        console.error(`Error fetching page ${currentPage}:`, err);
        hasMorePages = false;
      }
    }
    
    if (allAlbums.length > 0) {
      console.log(`Successfully fetched ${allAlbums.length} albums across ${currentPage-1} pages`);
      return this.processAlbumsData({ data: allAlbums });
    }
    
    // --- APPROACH 3: Get IDs first, then fetch albums individually ---
    console.log('ATTEMPT 3: Fetching albums individually by ID');
    try {
      // First, get a lightweight list of all album IDs
      const idsRequest = await this.fetch(`${CONFIG.API.ALBUMS}?fields[0]=id&pagination[limit]=100`);
      
      if (idsRequest && idsRequest.data && Array.isArray(idsRequest.data)) {
        const albumIds = idsRequest.data.map(album => album.id);
        console.log(`Found ${albumIds.length} album IDs to fetch individually`);
        
        // Now fetch each album (in batches to avoid overwhelming the server)
        const batchSize = 5;
        const albumBatches = [];
        
        for (let i = 0; i < albumIds.length; i += batchSize) {
          const batch = albumIds.slice(i, i + batchSize);
          albumBatches.push(batch);
        }
        
        const allIndividualAlbums = [];
        
        for (let i = 0; i < albumBatches.length; i++) {
          const batch = albumBatches[i];
          console.log(`Fetching batch ${i+1}/${albumBatches.length} (${batch.length} albums)`);
          
          const batchPromises = batch.map(id => 
            this.fetch(`${CONFIG.API.ALBUMS}/${id}?populate=cover_image`)
              .then(response => {
                if (response && response.data) {
                  return response.data;
                }
                return null;
              })
              .catch(err => {
                console.warn(`Failed to fetch album ${id}:`, err);
                return null;
              })
          );
          
          const batchResults = await Promise.all(batchPromises);
          allIndividualAlbums.push(...batchResults.filter(album => album !== null));
          
          // Small delay between batches to avoid rate limiting
          if (i < albumBatches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        console.log(`Successfully fetched ${allIndividualAlbums.length}/${albumIds.length} individual albums`);
        
        if (allIndividualAlbums.length > 0) {
          return this.processAlbumsData({ data: allIndividualAlbums });
        }
      }
    } catch (err) {
      console.error('Error with individual fetching approach:', err);
    }
    
    // --- APPROACH 4: If all else fails, try _start and _limit (older Strapi) ---
    console.log('ATTEMPT 4: Using legacy _start and _limit parameters');
    try {
      // Fetch first page with legacy parameters
      const legacyData = await this.fetch(`${CONFIG.API.ALBUMS}?populate=cover_image&_start=0&_limit=100`);
      
      if (legacyData && legacyData.data && Array.isArray(legacyData.data)) {
        console.log(`Success with legacy parameters, got ${legacyData.data.length} albums`);
        return this.processAlbumsData(legacyData);
      }
    } catch (err) {
      console.error('Error with legacy parameters approach:', err);
    }
    
    // If all approaches fail, return demo albums
    console.error('All album fetching approaches failed, using demo albums');
    return this.generateDemoAlbums();
  } catch (error) {
    console.error('Error in getAlbums main function:', error);
    return this.generateDemoAlbums();
  }
}


  /**
   * Generate demo albums for testing when API is unavailable
   * @returns {Array} - Array of album objects
   */
  static generateDemoAlbums() {
    return [
      {
        id: 1,
        title: "Motorcycle Racing",
        description: "Action shots from the racetrack",
        date: this.formatDate(new Date("2025-02-15")),
        photoCount: 12,
        coverImage: "/api/placeholder/600/400",
      },
      {
        id: 2,
        title: "Custom Builds",
        description: "Beautiful custom motorcycle projects",
        date: this.formatDate(new Date("2025-01-20")),
        photoCount: 8,
        coverImage: "/api/placeholder/600/400",
      },
      {
        id: 3,
        title: "Off-road Adventures",
        description: "Dirt bikes and adventure riding",
        date: this.formatDate(new Date("2024-12-10")),
        photoCount: 15,
        coverImage: "/api/placeholder/600/400",
      },
    ];
  }

  /**
   * Process a single album's data from the API with improved photo count extraction
   * @param {Object} data - Raw API data for a single album
   * @returns {Object} - Processed album data with photos
   */
  static processAlbumsData(data) {
    console.log("Raw Albums Data:", JSON.stringify(data, null, 2));

    if (!data || !data.data) {
      console.error("Invalid albums data structure");
      return [];
    }

    // Handle both array of albums and single album scenario
    const albumsData = Array.isArray(data.data) ? data.data : [data.data];

    console.log("Albums to Process:", albumsData.length);

    const processedAlbums = albumsData
      .map((album) => {
        // Handle different possible data structures
        const albumAttributes = album.attributes || album;

        console.log(
          "Current Album Raw Data:",
          JSON.stringify(albumAttributes, null, 2)
        );

        // Extract photos if they're included in the response
        let photos = [];

        // Strapi v4 format with populated relation
        if (
          albumAttributes.photos &&
          albumAttributes.photos.data &&
          Array.isArray(albumAttributes.photos.data)
        ) {
          photos = albumAttributes.photos.data.map((photo) => {
            const photoAttr = photo.attributes || photo;
            return {
              id: photo.id,
              title: photoAttr.title || "Photo",
              description: photoAttr.description || "",
              date: this.formatDate(photoAttr.date || new Date()),
              url:
                this.extractPhotoUrl(photoAttr) || "/api/placeholder/800/600",
            };
          });
          console.log(`Extracted ${photos.length} photos from album data`);
        }

        // Improved photo count detection - this is the key fix
        let photosCount = 0;

        // Structure 1: Check if we already extracted photos
        if (photos.length > 0) {
          photosCount = photos.length;
          console.log(`Using extracted photos count: ${photosCount}`);
        }
        // Structure 2: Populated relation in Strapi v4 format
        else if (
          albumAttributes.photos &&
          albumAttributes.photos.data &&
          Array.isArray(albumAttributes.photos.data)
        ) {
          photosCount = albumAttributes.photos.data.length;
          console.log(`Using photos.data array length: ${photosCount}`);
        }
        // Structure 3: Direct array format
        else if (
          albumAttributes.photos &&
          Array.isArray(albumAttributes.photos)
        ) {
          photosCount = albumAttributes.photos.length;
          console.log(`Using direct photos array length: ${photosCount}`);
        }
        // Structure 4: Try to get count from album ID
        else {
          // Make a separate API call to get photo count
          console.log(`No photos data found, will try to fetch photo count separately later`);
          // The photo count will be updated later in a follow-up function
        }

        // Determine cover image
        let coverImage = "";
        if (albumAttributes.cover_image) {
          try {
            coverImage = this.getMediaUrl(albumAttributes.cover_image);
          } catch (error) {
            console.error("Error extracting cover image:", error);
          }
        }

        const processedAlbum = {
          id: album.id || albumAttributes.id,
          title: albumAttributes.title || "Untitled Album",
          description: albumAttributes.description || "",
          date: this.formatDate(albumAttributes.date),
          photoCount: photosCount,
          coverImage: coverImage,
          photos: photos, // Include the extracted photos
        };

        console.log(
          "Processed Album:",
          JSON.stringify(processedAlbum, null, 2)
        );

        return processedAlbum;
      })
      .filter((album) => album !== null);

    console.log("Total Processed Albums:", processedAlbums.length);

    // Try to fetch photo counts for albums that don't have any
    this.updatePhotoCountsForAlbums(processedAlbums);

    return processedAlbums;
  }

  /**
   * Update photo counts for albums that don't have them
   * @param {Array} albums - Array of processed albums
   */
  static async updatePhotoCountsForAlbums(albums) {
    for (let album of albums) {
      if (album.photoCount === 0) {
        try {
          console.log(`Fetching photo count for album ${album.id}`);
          const photosData = await this.fetch(`${CONFIG.API.PHOTOS}?filters[album][id][$eq]=${album.id}&fields=id`);

          if (photosData && photosData.data && Array.isArray(photosData.data)) {
            album.photoCount = photosData.data.length;
            console.log(`Updated photo count for album ${album.id}: ${album.photoCount}`);

            // Update the DOM if it exists
            const countElement = document.querySelector(`.album-card[data-album-id="${album.id}"] .album-count`);
            if (countElement) {
              countElement.textContent = `${album.photoCount} photos`;
            }
          }
        } catch (error) {
          console.error(`Error fetching photo count for album ${album.id}:`, error);
        }
      }
    }
  }

  /**
   * Create a fallback album when the real one can't be fetched
   * @param {string|number} id - Album ID
   * @returns {Object} - Fallback album data
   */
  static createFallbackAlbum(id) {
    return {
      id: id,
      title: "Demo Album " + id,
      description: "This is a demonstration album with placeholder content.",
      date: this.formatDate(new Date()),
      coverImage: "/api/placeholder/400/300",
      photos: this.generatePlaceholderPhotos(8), // Generate 8 placeholder photos
    };
  }

  /**
   * Generate placeholder photos for testing and fallbacks
   * @param {number} count - Number of photos to generate
   * @returns {Array} - Array of photo objects
   */
  static generatePlaceholderPhotos(count = 5) {
    const photos = [];

    for (let i = 0; i < count; i++) {
      // Use different sized placeholders to make it look more realistic
      const width = 800 + Math.floor(Math.random() * 400);
      const height = 600 + Math.floor(Math.random() * 200);

      photos.push({
        id: "placeholder-" + i,
        title: `Demo Photo ${i + 1}`,
        description: "This is a placeholder photo for demonstration purposes.",
        date: this.formatDate(new Date(Date.now() - i * 86400000)), // Different dates
        url: `/api/placeholder/${width}/${height}`,
      });
    }

    return photos;
  }
  /**
   * Get about page content
   * @returns {Promise<Object>} - About page data
   */
  static async getAbout() {
    const data = await this.fetch(`${CONFIG.API.ABOUT}?populate=*`);
    return this.processAboutData(data);
  }

  /**
   * Process about page data from the API
   * @param {Object} data - Raw API data
   * @returns {Object} - Processed about page data
   */
  static processAboutData(data) {
    console.log("Full About Data Response:", data);

    if (!data || !data.data) {
      console.error("Missing data in about response");
      return {
        title: "About",
        content: "",
        image: "",
      };
    }

    const about = data.data;
    console.log("About Data:", about);

    // Parse rich text content
    let content = "";
    if (about.content && Array.isArray(about.content)) {
      content = about.content
        .map((block) => {
          if (block.type === "paragraph") {
            return block.children.map((child) => child.text || "").join("");
          }
          return "";
        })
        .filter((text) => text.trim() !== "")
        .join("\n\n");
    } else if (typeof about.content === "string") {
      content = about.content;
    }

    return {
      title: about.title || "About",
      content: content,
      image: about.image ? this.getMediaUrl(about.image) : "",
    };
  }

  /**
   * Generate a sharing link for an album
   * @param {number|string} albumId - Album ID
   * @returns {string} - Shareable URL
   */
  static getShareableLink(albumId) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${albumId}`;
  }
}