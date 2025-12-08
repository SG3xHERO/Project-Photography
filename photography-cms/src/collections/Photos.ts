import { CollectionConfig } from 'payload'

export const Photos: CollectionConfig = {
  slug: 'photos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', 'createdAt'],
    description: 'Manage your photography portfolio images',
  },
  access: {
    read: () => true, // Public read access
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The title of the photograph',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the title',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'A brief description of the photograph',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The main photograph',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Racing', value: 'racing' },
        { label: 'Custom', value: 'custom' },
        { label: 'Adventure', value: 'adventure' },
        { label: 'Detail', value: 'detail' },
        { label: 'Vintage', value: 'vintage' },
        { label: 'Street', value: 'street' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Category of photography',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        description: 'Tags for searchability and filtering',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Display this photo on the homepage',
        position: 'sidebar',
      },
    },
    {
      name: 'exifData',
      type: 'group',
      admin: {
        description: 'Camera and lens information',
      },
      fields: [
        {
          name: 'camera',
          type: 'text',
          admin: {
            placeholder: 'e.g., Canon EOS R5',
          },
        },
        {
          name: 'lens',
          type: 'text',
          admin: {
            placeholder: 'e.g., Canon RF 70-200mm f/2.8',
          },
        },
        {
          name: 'settings',
          type: 'text',
          admin: {
            placeholder: 'e.g., ISO 400, f/2.8, 1/1000s',
          },
        },
        {
          name: 'location',
          type: 'text',
          admin: {
            placeholder: 'e.g., Laguna Seca Raceway',
          },
        },
      ],
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'albums',
      type: 'relationship',
      relationTo: 'albums',
      hasMany: true,
      admin: {
        description: 'Albums this photo belongs to',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
