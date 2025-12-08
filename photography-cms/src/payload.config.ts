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
    // Users collection for authentication
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    // Media collection for image uploads
    {
      slug: 'media',
      upload: {
        staticDir: path.resolve(dirname, '../media'),
        mimeTypes: ['image/*'],
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
          },
          {
            name: 'card',
            width: 768,
            height: 576,
            position: 'centre',
          },
          {
            name: 'full',
            width: 1920,
            height: undefined,
            position: 'centre',
          },
        ],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
          required: true,
        },
      ],
    },
    // Albums collection
    {
      slug: 'albums',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'coverImage', 'photoCount', 'updatedAt'],
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            description: 'URL-friendly version of the title (e.g., "summer-2024")',
          },
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'coverImage',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show this album on the homepage',
          },
        },
        {
          name: 'publishedDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
      ],
    },
    // Photos collection
    {
      slug: 'photos',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'image', 'album', 'category', 'featured'],
      },
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
          name: 'album',
          type: 'relationship',
          relationTo: 'albums',
          hasMany: false,
          admin: {
            description: 'Which album does this photo belong to?',
          },
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
            { label: 'Portrait', value: 'portrait' },
            { label: 'Landscape', value: 'landscape' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Show this photo on the homepage',
          },
        },
        {
          name: 'publishedDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'camera',
          type: 'text',
          admin: {
            description: 'Camera used (optional)',
          },
        },
        {
          name: 'lens',
          type: 'text',
          admin: {
            description: 'Lens used (optional)',
          },
        },
        {
          name: 'settings',
          type: 'text',
          admin: {
            description: 'Camera settings like ISO, aperture, shutter (optional)',
          },
        },
      ],
    },
  ],
  // Global settings for the site
  globals: [
    {
      slug: 'siteSettings',
      label: 'Site Settings',
      fields: [
        {
          name: 'siteTitle',
          type: 'text',
          required: true,
          defaultValue: 'Photography Portfolio',
        },
        {
          name: 'siteDescription',
          type: 'textarea',
          defaultValue: 'A photography portfolio showcasing beautiful images',
        },
        {
          name: 'heroTitle',
          type: 'text',
          defaultValue: 'Welcome to my Photography',
        },
        {
          name: 'heroSubtitle',
          type: 'text',
          defaultValue: 'Capturing moments that matter',
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'aboutTitle',
          type: 'text',
          defaultValue: 'About Me',
        },
        {
          name: 'aboutText',
          type: 'richText',
        },
        {
          name: 'aboutImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'contactEmail',
          type: 'email',
        },
        {
          name: 'socialLinks',
          type: 'array',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'Twitter', value: 'twitter' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'LinkedIn', value: 'linkedin' },
              ],
            },
            {
              name: 'url',
              type: 'text',
            },
          ],
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
})
