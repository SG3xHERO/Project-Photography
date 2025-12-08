import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-change-in-production',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      slug: 'media',
      upload: {
        staticDir: path.resolve(dirname, '../media'),
        mimeTypes: ['image/*'],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
    {
      slug: 'photos',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: 'Racing', value: 'racing' },
            { label: 'Custom', value: 'custom' },
            { label: 'Adventure', value: 'adventure' },
            { label: 'Detail', value: 'detail' },
            { label: 'Vintage', value: 'vintage' },
            { label: 'Street', value: 'street' },
          ],
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
  editor: lexicalEditor(),
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || 'mongodb://mongodb:27017/photography-cms',
  }),
  sharp,
  onInit: async (payload) => {
    // Create admin user if it doesn't exist
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
      const existingUsers = await payload.find({
        collection: 'users',
        where: { email: { equals: adminEmail } },
        limit: 1,
      })

      if (existingUsers.docs.length === 0) {
        await payload.create({
          collection: 'users',
          data: {
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD || 'changeme',
            name: 'Admin User',
          },
        })
        payload.logger.info(`Admin user created: ${adminEmail}`)
      }
    } catch (error) {
      payload.logger.error('Error creating admin user:', error)
    }
  },
})
