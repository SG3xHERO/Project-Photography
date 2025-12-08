import path from 'path'
import { buildConfig } from 'payload/config'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { slateEditor } from '@payloadcms/richtext-slate'

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
  editor: slateEditor({}),
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
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, '../schema.graphql'),
  },
})
