import path from 'path'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudinaryPlugin } from '@payloadcms/storage-cloudinary'

// Collections
import { Users } from './collections/Users'
import { Photos } from './collections/Photos'
import { Albums } from './collections/Albums'
import { Media } from './collections/Media'

// Globals
import { SiteSettings } from './globals/SiteSettings'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Photography CMS',
      favicon: '/favicon.ico',
    },
  },
  collections: [Users, Photos, Albums, Media],
  globals: [SiteSettings],
  editor: lexicalEditor({}),
  typescript: {
    outputFile: path.resolve(__dirname, '../payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.MONGODB_URI || '',
  }),
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173',
  ].filter(Boolean),
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173',
  ].filter(Boolean),
  plugins: [
    // Cloudinary storage plugin (optional - can use local storage instead)
    ...(process.env.CLOUDINARY_CLOUD_NAME
      ? [
          cloudinaryPlugin({
            collections: {
              media: {
                adapter: 'cloudinary',
                options: {
                  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                  apiKey: process.env.CLOUDINARY_API_KEY,
                  apiSecret: process.env.CLOUDINARY_API_SECRET,
                  folder: 'photography-cms',
                },
              },
            },
          }),
        ]
      : []),
  ],
  // Enable GraphQL
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, '../schema.graphql'),
  },
})
