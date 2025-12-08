import payload from 'payload'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config()

// Import your existing JSON data
const contentData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../data/content.json'), 'utf-8')
)
const photosData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../data/photos.json'), 'utf-8')
)

const migrate = async () => {
  console.log('Starting migration...')

  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
    local: true,
  })

  try {
    // 1. Migrate Site Settings
    console.log('Migrating site settings...')
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteTitle: contentData.site.title,
        siteSubtitle: contentData.site.subtitle,
        description: contentData.site.description,
        author: contentData.site.author,
        contactEmail: contentData.site.email,
        instagram: contentData.site.social?.instagram,
        aboutTitle: contentData.about.title,
        aboutContent: contentData.about.content,
        highlights: contentData.about.highlights,
      },
    })
    console.log('✓ Site settings migrated')

    // 2. Migrate Photos
    console.log('Migrating photos...')
    const photoMap = new Map() // Store mapping of old photo IDs to new Payload IDs

    for (const photo of photosData.featured || []) {
      console.log(`  - Migrating photo: ${photo.title}`)

      // Note: This assumes you're using Cloudinary or external URLs
      // If you want to upload files, you'll need to download them first
      const createdPhoto = await payload.create({
        collection: 'photos',
        data: {
          title: photo.title,
          slug: photo.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
          description: photo.description,
          category: photo.category.toLowerCase(),
          tags: photo.tags?.map((tag: string) => ({ tag })) || [],
          featured: true,
          publishedDate: photo.date,
          // For image, you'll need to either:
          // 1. Use existing Cloudinary URLs (create media records)
          // 2. Download and re-upload images
          // We'll handle this separately
        },
      })

      photoMap.set(photo.id, createdPhoto.id)
      console.log(`  ✓ Photo migrated: ${photo.title}`)
    }

    console.log('✓ All photos migrated')

    // 3. Migrate Albums (if you have any in your data)
    if (contentData.albums && contentData.albums.length > 0) {
      console.log('Migrating albums...')
      for (const album of contentData.albums) {
        await payload.create({
          collection: 'albums',
          data: {
            title: album.title,
            slug: album.slug || album.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: album.description,
            featured: album.featured || false,
            // Map photo IDs to new Payload IDs
            photos: album.photos?.map((id: number) => photoMap.get(id)).filter(Boolean) || [],
          },
        })
        console.log(`  ✓ Album migrated: ${album.title}`)
      }
      console.log('✓ All albums migrated')
    }

    console.log('\n🎉 Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Log in to the admin panel: http://localhost:3000/admin')
    console.log('2. Upload/replace images in the Media library')
    console.log('3. Update photo records to use the uploaded media')
    console.log('4. Review and adjust content as needed')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

migrate()
