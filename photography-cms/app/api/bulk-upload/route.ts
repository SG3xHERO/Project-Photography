import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import path from 'path'

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.gif', '.avif'])

function extToMime(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.gif': 'image/gif',
    '.avif': 'image/avif',
  }
  return map[ext] ?? 'image/jpeg'
}

async function uploadMediaToPayload(
  payload: Awaited<ReturnType<typeof getPayload>>,
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  user: any,
): Promise<{ id: string; url: string }> {
  const media = await payload.create({
    collection: 'media',
    data: { alt: path.basename(filename, path.extname(filename)) },
    file: {
      data: fileBuffer,
      mimetype: mimeType,
      name: filename,
      size: fileBuffer.length,
    },
    overrideAccess: false,
    user,
  })

  return {
    id: media.id as string,
    url: (media as any).url ?? '',
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Authenticate the caller
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 })
    }

    const files = formData.getAll('files') as File[]
    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploaded: {
      mediaId: string
      filename: string
      previewUrl: string
      originalName: string
    }[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const name = file.name
      const ext = path.extname(name).toLowerCase()

      if (ext === '.zip') {
        // Dynamic import so adm-zip is only loaded when a ZIP is actually uploaded
        let AdmZip: typeof import('adm-zip')
        try {
          AdmZip = (await import('adm-zip')).default as any
        } catch {
          return NextResponse.json(
            { error: 'ZIP support requires adm-zip — run npm install in photography-cms' },
            { status: 500 },
          )
        }

        let zip: import('adm-zip')
        try {
          zip = new (AdmZip as any)(buffer)
        } catch {
          return NextResponse.json({ error: 'Could not parse ZIP file' }, { status: 400 })
        }

        const entries = (zip as any).getEntries() as any[]

        for (const entry of entries) {
          if (entry.isDirectory) continue
          const entryExt = path.extname(entry.name).toLowerCase()
          if (!ALLOWED_EXT.has(entryExt)) continue
          // Skip macOS resource fork dirs and hidden files
          const entryPath: string = entry.entryName
          if (entryPath.includes('__MACOSX') || path.basename(entryPath).startsWith('.')) continue

          const entryBuffer: Buffer = entry.getData()
          const mimeType = extToMime(entryExt)

          try {
            const result = await uploadMediaToPayload(payload, entryBuffer, entry.name, mimeType, user)
            uploaded.push({
              mediaId: result.id,
              filename: entry.name,
              previewUrl: result.url || `/api/media/file/${result.id}`,
              originalName: path.basename(entry.name),
            })
          } catch (err) {
            console.error(`[bulk-upload] Failed to upload ZIP entry "${entry.name}":`, err)
          }
        }
      } else if (ALLOWED_EXT.has(ext)) {
        const mimeType = file.type || extToMime(ext)

        try {
          const result = await uploadMediaToPayload(payload, buffer, name, mimeType, user)
          uploaded.push({
            mediaId: result.id,
            filename: name,
            previewUrl: result.url || `/api/media/file/${result.id}`,
            originalName: name,
          })
        } catch (err) {
          console.error(`[bulk-upload] Failed to upload "${name}":`, err)
        }
      }
      // silently skip unsupported file types
    }

    if (!uploaded.length) {
      return NextResponse.json({ error: 'No valid image files were found in the upload' }, { status: 400 })
    }

    return NextResponse.json({ uploaded })
  } catch (err: any) {
    console.error('[bulk-upload] Unexpected error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
