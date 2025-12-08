import { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    description: 'Global site settings and information',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'siteTitle',
              type: 'text',
              required: true,
              defaultValue: 'BF Photography',
              admin: {
                description: 'Main site title',
              },
            },
            {
              name: 'siteSubtitle',
              type: 'text',
              defaultValue: 'Capturing the Spirit of Motorcycles',
              admin: {
                description: 'Site subtitle or tagline',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
              defaultValue: 'Motorcycle photography showcasing racing, custom builds, and off-road adventures',
              admin: {
                description: 'Site description for SEO',
              },
            },
            {
              name: 'author',
              type: 'text',
              required: true,
              defaultValue: 'Ben Foggon',
            },
            {
              name: 'contactEmail',
              type: 'email',
              required: true,
            },
          ],
        },
        {
          label: 'About',
          fields: [
            {
              name: 'aboutTitle',
              type: 'text',
              defaultValue: 'About My Photography',
            },
            {
              name: 'aboutContent',
              type: 'richText',
              required: true,
            },
            {
              name: 'highlights',
              type: 'array',
              maxRows: 6,
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  admin: {
                    placeholder: 'e.g., camera, motorcycle, heart',
                  },
                },
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
              ],
            },
          ],
        },
        {
          label: 'Social Media',
          fields: [
            {
              name: 'instagram',
              type: 'text',
              admin: {
                placeholder: 'https://instagram.com/username',
              },
            },
            {
              name: 'facebook',
              type: 'text',
              admin: {
                placeholder: 'https://facebook.com/username',
              },
            },
            {
              name: 'twitter',
              type: 'text',
              admin: {
                placeholder: 'https://twitter.com/username',
              },
            },
            {
              name: 'youtube',
              type: 'text',
              admin: {
                placeholder: 'https://youtube.com/@channel',
              },
            },
          ],
        },
        {
          label: 'SEO & Analytics',
          fields: [
            {
              name: 'metaImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Default social sharing image',
              },
            },
            {
              name: 'googleAnalyticsId',
              type: 'text',
              admin: {
                placeholder: 'G-XXXXXXXXXX',
              },
            },
            {
              name: 'facebookPixelId',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
