"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    'strapi::logger',
    'strapi::errors',
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'connect-src': ["'self'", 'https:', 'http:', 'cms.projectnetworks.co.uk', 'images.projectnetworks.co.uk'],
                    'img-src': [
                        "'self'",
                        'data:',
                        'blob:',
                        'cms.projectnetworks.co.uk',
                        'images.projectnetworks.co.uk'
                    ],
                    'media-src': [
                        "'self'",
                        'data:',
                        'blob:',
                        'cms.projectnetworks.co.uk',
                        'images.projectnetworks.co.uk'
                    ],
                    'script-src': ["'self'", "'unsafe-inline'"],
                    'frame-src': ["'self'"],
                },
            },
            cors: {
                origin: [
                    'https://cms.projectnetworks.co.uk',
                    'https://images.projectnetworks.co.uk',
                    'http://images.projectnetworks.co.uk',
                    'http://localhost:3000',
                    'http://localhost:1337'
                ],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                headers: [
                    'Content-Type',
                    'Authorization',
                    'Origin',
                    'Accept',
                    'X-Requested-With'
                ],
                credentials: true,
            },
        },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
];
