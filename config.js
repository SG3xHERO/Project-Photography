const CONFIG = {
    API: {
        BASE_URL: 'https://cms.projectnetworks.co.uk/api',
        MEDIA_URL: 'https://cms.projectnetworks.co.uk',
        
        // Update these to match your Strapi configuration
        ALBUMS: '/albums',     // For listing all albums
        ALBUM: '/album',       // For single album (add this new line)
        PHOTOS: '/photos',
        FEATURED: '/featured-photo',
        ABOUT: '/about',
        
        TOKEN: '6499a7b724758b6ca9f49271da369e34319d9c2c1b54e4eb1c82a68e9234ac2b4fe1206af917f252e303be9454547adb19fecadad1e670ac648848a451b5a098c32ae2806f667d637bf26299f2a63fb60e615eb05ef55e9449efa2899b1994ccebc131ba799433fae981bab8faaaac72c17334a1bdcd0551e69f54971d6d11f2'
    },
    
    AUTH: {
        LOGIN_URL: 'https://cms.projectnetworks.co.uk/admin',
    },
    
    SITE: {
        TITLE: 'MOTO - Motorcycle Photography',
        DESCRIPTION: 'A personal collection of motorcycle photography',
        ITEMS_PER_PAGE: 8,
    },
    
    FEATURES: {
        ENABLE_SHARING: true,
        ENABLE_COMMENTS: true,
    }
};