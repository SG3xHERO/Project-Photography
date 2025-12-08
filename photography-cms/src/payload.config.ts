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
  cors: [
    'https://photos.benfoggon.com',
    'https://benfoggon.com',
    'http://localhost:*',
  ],
  csrf: [
    'https://photos.benfoggon.com',
    'https://benfoggon.com',
    'http://localhost:*',
  ],
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
      access: {
        read: () => true, // Public read access so images can be displayed
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
      },
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
      access: {
        read: () => true, // Public read access for frontend
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
      },
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
        {
          name: 'photos',
          type: 'relationship',
          relationTo: 'photos',
          hasMany: true,
          admin: {
            description: 'Photos in this album - you can add photos here or assign them when creating photos',
          },
        },
      ],
    },
    // Photos collection
    {
      slug: 'photos',
      access: {
        read: () => true, // Public read access for frontend
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
      },
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
      access: {
        read: () => true, // Public read access
      },
      fields: [
        // Hero Section
        {
          name: 'hero',
          type: 'group',
          label: 'Hero Section',
          fields: [
            {
              name: 'badge',
              type: 'text',
              defaultValue: 'Portfolio',
              admin: {
                description: 'Small badge text above title',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              defaultValue: 'Motorcycle Photography',
              admin: {
                description: 'Main hero title',
              },
            },
            {
              name: 'subtitle',
              type: 'text',
              defaultValue: 'Capturing the Spirit of the Ride',
              admin: {
                description: 'Subtitle below the title',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              defaultValue: 'From the adrenaline of track racing to the artistry of custom builds, I document the passion and craftsmanship that makes motorcycling extraordinary. Each photograph tells a story of speed, style, and freedom.',
              admin: {
                description: 'Hero description text',
              },
            },
            {
              name: 'primaryButtonText',
              type: 'text',
              defaultValue: 'View Featured',
            },
            {
              name: 'secondaryButtonText',
              type: 'text',
              defaultValue: 'Browse Albums',
            },
          ],
        },
        // About Section
        {
          name: 'about',
          type: 'group',
          label: 'About Section',
          fields: [
            {
              name: 'sectionLabel',
              type: 'text',
              defaultValue: 'About',
              admin: {
                description: 'Small label above title',
              },
            },
            {
              name: 'title',
              type: 'text',
              defaultValue: 'Passion for Motorcycle Photography',
              admin: {
                description: 'About section title',
              },
            },
            {
              name: 'paragraph1',
              type: 'textarea',
              defaultValue: "I'm passionate about capturing the raw energy and beauty of motorcycles. From track racing to custom builds, I document the culture and craftsmanship that makes motorcycling special.",
              admin: {
                description: 'First paragraph',
              },
            },
            {
              name: 'paragraph2',
              type: 'textarea',
              defaultValue: "Each photo tells a story of speed, style, and freedom. Whether it's the intensity of a race, the artistry of a custom build, or the adventure of the open road, my goal is to preserve these moments in stunning detail.",
              admin: {
                description: 'Second paragraph',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'About section image',
              },
            },
            {
              name: 'imageFallbackUrl',
              type: 'text',
              defaultValue: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800',
              admin: {
                description: 'Fallback image URL if no image uploaded',
              },
            },
            {
              name: 'features',
              type: 'array',
              label: 'Feature Items',
              defaultValue: [
                {
                  title: 'Professional Quality',
                  description: 'High-resolution images perfect for prints and digital use',
                  icon: 'camera',
                },
                {
                  title: 'Motorcycle Specialist',
                  description: 'Specialized in racing, custom builds, and adventure photography',
                  icon: 'shield',
                },
                {
                  title: 'Passion Driven',
                  description: 'Every shot captures the soul and spirit of the ride',
                  icon: 'heart',
                },
              ],
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'icon',
                  type: 'select',
                  options: [
                    { label: 'Camera', value: 'camera' },
                    { label: 'Shield', value: 'shield' },
                    { label: 'Heart', value: 'heart' },
                    { label: 'Star', value: 'star' },
                    { label: 'Zap', value: 'zap' },
                  ],
                  defaultValue: 'camera',
                },
              ],
            },
          ],
        },
        // Other Projects Section
        {
          name: 'otherProjects',
          type: 'group',
          label: 'Other Projects Section',
          fields: [
            {
              name: 'sectionLabel',
              type: 'text',
              defaultValue: 'Network',
              admin: {
                description: 'Small label above title',
              },
            },
            {
              name: 'title',
              type: 'text',
              defaultValue: 'Other Projects',
              admin: {
                description: 'Section title',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              defaultValue: 'Explore my other work and projects',
              admin: {
                description: 'Section description',
              },
            },
            {
              name: 'projects',
              type: 'array',
              label: 'Projects',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Project URL',
                  },
                },
                {
                  name: 'buttonText',
                  type: 'text',
                  defaultValue: 'Visit Site',
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Project thumbnail image',
                  },
                },
                {
                  name: 'imageFallbackUrl',
                  type: 'text',
                  admin: {
                    description: 'Fallback image URL if no image uploaded',
                  },
                },
              ],
            },
          ],
        },
        // Footer
        {
          name: 'footer',
          type: 'group',
          label: 'Footer',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              defaultValue: 'A collection of motorcycle photography capturing the spirit of the ride.',
              admin: {
                description: 'Footer description text',
              },
            },
            {
              name: 'copyrightText',
              type: 'text',
              defaultValue: '2025 Ben Foggon Photography. All rights reserved.',
              admin: {
                description: 'Copyright text (year will be auto-updated in frontend)',
              },
            },
            {
              name: 'links',
              type: 'array',
              label: 'Footer Links',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        // Social Media
        {
          name: 'socialLinks',
          type: 'array',
          label: 'Social Media Links',
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              options: [
                { label: 'Instagram', value: 'instagram' },
                { label: 'Twitter', value: 'twitter' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'GitHub', value: 'github' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
        // Contact
        {
          name: 'contactEmail',
          type: 'email',
          label: 'Contact Email',
          admin: {
            description: 'Primary contact email address',
          },
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
