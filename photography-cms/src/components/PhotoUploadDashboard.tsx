'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface UploadedFile {
  mediaId: string
  filename: string
  previewUrl: string
  originalName: string
}

interface PhotoTag {
  mediaId: string
  previewUrl: string
  originalName: string
  title: string
  description: string
  location: string
  shotDate: string
  bike: string
  category: string
  albumId: string
  featured: boolean
  saved: boolean
  saving: boolean
  error: string
}

interface Album {
  id: string
  title: string
}

type Stage = 'upload' | 'tagging' | 'complete'

// ── Helpers ────────────────────────────────────────────────────────────────────

function cleanFilename(name: string): string {
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = {
  root: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '7px 11px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'inherit',
    fontSize: 13,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  } as React.CSSProperties,

  select: {
    width: '100%',
    padding: '7px 11px',
    borderRadius: 8,
    background: 'rgba(14,14,28,0.95)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'inherit',
    fontSize: 13,
    fontFamily: 'inherit',
  } as React.CSSProperties,

  label: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 4,
    display: 'block',
    opacity: 0.5,
  } as React.CSSProperties,

  btn: (bg = '#ef4444', disabled = false): React.CSSProperties => ({
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    fontSize: 14,
    background: disabled ? 'rgba(255,255,255,0.08)' : bg,
    color: '#fff',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  }),

  ghostBtn: {
    padding: '7px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'inherit',
    fontWeight: 500,
    fontSize: 13,
    fontFamily: 'inherit',
  } as React.CSSProperties,
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function PhotoUploadDashboard() {
  const [stage, setStage] = useState<Stage>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, label: '' })
  const [uploadError, setUploadError] = useState('')
  const [photoQueue, setPhotoQueue] = useState<PhotoTag[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [bulkLocation, setBulkLocation] = useState('')
  const [bulkAlbum, setBulkAlbum] = useState('')
  const [isSavingAll, setIsSavingAll] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/albums?limit=50&sort=title')
      .then((r) => r.json())
      .then((d) => setAlbums((d.docs || []).map((a: any) => ({ id: a.id, title: a.title }))))
      .catch(() => {})
  }, [])

  // ── Upload handler ─────────────────────────────────────────────────────────

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files.length) return
    setUploadError('')
    setIsUploading(true)
    setUploadProgress({ current: 0, total: files.length, label: 'Uploading to CMS…' })

    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))

      const res = await fetch('/api/bulk-upload', { method: 'POST', body: formData })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(err.error ?? 'Upload failed')
      }

      const result = await res.json()
      const uploaded: UploadedFile[] = result.uploaded ?? []

      if (!uploaded.length) throw new Error('No valid image files were found')

      setPhotoQueue(
        uploaded.map((f) => ({
          mediaId: f.mediaId,
          previewUrl: f.previewUrl,
          originalName: f.originalName,
          title: cleanFilename(f.originalName),
          description: '',
          location: '',
          shotDate: '',
          bike: '',
          category: '',
          albumId: '',
          featured: false,
          saved: false,
          saving: false,
          error: '',
        })),
      )
      setStage('tagging')
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [])

  // ── Drag & drop ────────────────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(Array.from(e.dataTransfer.files))
  }
  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) handleFiles(files)
    e.target.value = ''
  }

  // ── Photo queue helpers ────────────────────────────────────────────────────

  const updatePhoto = (idx: number, updates: Partial<PhotoTag>) =>
    setPhotoQueue((q) => q.map((p, i) => (i === idx ? { ...p, ...updates } : p)))

  const savePhoto = async (idx: number) => {
    const photo = photoQueue[idx]
    if (!photo || photo.saved || photo.saving) return

    updatePhoto(idx, { saving: true, error: '' })

    try {
      const body: Record<string, any> = {
        title: photo.title.trim() || photo.originalName,
        image: photo.mediaId,
        featured: photo.featured,
      }
      if (photo.description) body.description = photo.description
      if (photo.location) body.location = photo.location
      if (photo.bike) body.bike = photo.bike
      if (photo.category) body.category = photo.category
      if (photo.albumId) body.album = photo.albumId
      if (photo.shotDate) body.shotDate = photo.shotDate

      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.errors?.[0]?.message ?? err.message ?? 'Save failed')
      }

      updatePhoto(idx, { saved: true, saving: false })
    } catch (err: any) {
      updatePhoto(idx, { saving: false, error: err.message ?? 'Failed to save' })
    }
  }

  const saveAll = async () => {
    setIsSavingAll(true)
    for (let i = 0; i < photoQueue.length; i++) {
      if (!photoQueue[i].saved) await savePhoto(i)
    }
    setIsSavingAll(false)
    if (photoQueue.every((p) => p.saved)) setStage('complete')
  }

  const applyBulkFields = () =>
    setPhotoQueue((q) =>
      q.map((p) => ({
        ...p,
        location: bulkLocation || p.location,
        albumId: bulkAlbum || p.albumId,
      })),
    )

  const resetDashboard = () => {
    setStage('upload')
    setPhotoQueue([])
    setUploadError('')
    setBulkLocation('')
    setBulkAlbum('')
  }

  const savedCount = photoQueue.filter((p) => p.saved).length
  const totalCount = photoQueue.length

  // ── RENDER: UPLOAD STAGE ──────────────────────────────────────────────────

  if (stage === 'upload') {
    return (
      <div style={s.root}>
        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>
          📤 Mass Photo Upload
        </h2>

        {/* Dropzone */}
        <div
          style={{
            border: `2px dashed ${isDragging ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 12,
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.zip"
            style={{ display: 'none' }}
            onChange={onFileInput}
          />
          <div style={{ fontSize: 44, marginBottom: 12 }}>📁</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Drag &amp; drop photos or a ZIP file here
          </div>
          <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 20 }}>
            JPG · PNG · WEBP · HEIC · or a .zip containing any of these
          </div>
          <button
            style={s.btn()}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
          >
            Browse Files
          </button>
        </div>

        {/* Upload progress */}
        {isUploading && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8, textAlign: 'center' }}>
              {uploadProgress.label}
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #ef4444, #f97316)',
                borderRadius: 3,
                width: '60%',
                animation: 'bf-pulse 1.4s ease-in-out infinite',
              }} />
            </div>
          </div>
        )}

        {/* Error */}
        {uploadError && (
          <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13 }}>
            ⚠️ {uploadError}
          </div>
        )}

        <style>{`
          @keyframes bf-pulse {
            0%, 100% { opacity: 0.6; transform: scaleX(0.85); }
            50%       { opacity: 1;   transform: scaleX(1.05); }
          }
        `}</style>
      </div>
    )
  }

  // ── RENDER: COMPLETE STAGE ────────────────────────────────────────────────

  if (stage === 'complete') {
    return (
      <div style={s.root}>
        <div style={{ textAlign: 'center', padding: '36px 0' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>
            {savedCount} photo{savedCount !== 1 ? 's' : ''} saved!
          </h2>
          <p style={{ opacity: 0.55, marginBottom: 28, fontSize: 14 }}>
            They are now in the CMS and will show on the site if featured.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={s.btn()} onClick={resetDashboard}>Upload More</button>
            <a
              href="/admin/collections/photos"
              style={{ ...s.ghostBtn, textDecoration: 'none', display: 'inline-block' }}
            >
              View in Library →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── RENDER: TAGGING STAGE ─────────────────────────────────────────────────

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>🏷️ Tag Your Photos</h2>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.5 }}>
            {savedCount}/{totalCount} saved — all tag fields are optional
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={s.ghostBtn} onClick={resetDashboard}>← Start Over</button>
          <button
            style={s.btn(savedCount === totalCount ? '#10b981' : '#ef4444', isSavingAll)}
            onClick={saveAll}
            disabled={isSavingAll}
          >
            {isSavingAll ? 'Saving…' : savedCount === totalCount ? '✓ All Saved' : `Save All (${totalCount - savedCount})`}
          </button>
        </div>
      </div>

      {/* Bulk apply row */}
      <div style={{
        padding: '16px', marginBottom: 20,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.4, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Apply to All Photos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <label style={s.label}>Location</label>
            <input
              style={s.input}
              placeholder="e.g. Brands Hatch, UK"
              value={bulkLocation}
              onChange={(e) => setBulkLocation(e.target.value)}
            />
          </div>
          <div>
            <label style={s.label}>Album</label>
            <select style={s.select} value={bulkAlbum} onChange={(e) => setBulkAlbum(e.target.value)}>
              <option value="">— Select album —</option>
              {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <button style={s.btn('#f97316')} onClick={applyBulkFields}>
            Apply →
          </button>
        </div>
      </div>

      {/* Photo cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
        {photoQueue.map((photo, idx) => (
          <PhotoCard
            key={photo.mediaId}
            photo={photo}
            idx={idx}
            albums={albums}
            onUpdate={updatePhoto}
            onSave={savePhoto}
          />
        ))}
      </div>

      {/* All saved prompt */}
      {savedCount === totalCount && totalCount > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button style={s.btn('#10b981')} onClick={() => setStage('complete')}>
            Done — View Results →
          </button>
        </div>
      )}
    </div>
  )
}

// ── PhotoCard sub-component ────────────────────────────────────────────────────

interface PhotoCardProps {
  photo: PhotoTag
  idx: number
  albums: Album[]
  onUpdate: (idx: number, updates: Partial<PhotoTag>) => void
  onSave: (idx: number) => void
}

function PhotoCard({ photo, idx, albums, onUpdate, onSave }: PhotoCardProps) {
  const disabled = photo.saved || photo.saving

  const inp = (field: keyof PhotoTag, placeholder: string, label: string, type = 'text') => (
    <div>
      <label style={s.label}>{label}</label>
      <input
        style={s.input}
        type={type}
        placeholder={placeholder}
        value={photo[field] as string}
        onChange={(e) => onUpdate(idx, { [field]: e.target.value } as any)}
        disabled={disabled}
      />
    </div>
  )

  return (
    <div style={{
      background: photo.saved ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${photo.saved ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 170, background: 'rgba(0,0,0,0.4)' }}>
        {photo.previewUrl ? (
          <img
            src={photo.previewUrl}
            alt={photo.originalName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, opacity: 0.2 }}>📷</div>
        )}
        {photo.saved && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(16,185,129,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
          }}>
            ✓
          </div>
        )}
        {/* Filename label */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '20px 10px 8px',
          fontSize: 10, opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {photo.originalName}
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: 14 }}>
        {photo.error && (
          <div style={{ marginBottom: 10, padding: '7px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: 12 }}>
            ⚠️ {photo.error}
          </div>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          {inp('title', 'Photo title', 'Title *')}
          {inp('location', 'e.g. Brands Hatch, UK', 'Location')}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {inp('shotDate', '', 'Date', 'date')}
            <div>
              <label style={s.label}>Category</label>
              <select
                style={s.select}
                value={photo.category}
                onChange={(e) => onUpdate(idx, { category: e.target.value })}
                disabled={disabled}
              >
                <option value="">— None —</option>
                <option value="racing">Racing</option>
                <option value="custom">Custom</option>
                <option value="adventure">Adventure</option>
                <option value="detail">Detail</option>
                <option value="vintage">Vintage</option>
                <option value="street">Street</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {inp('bike', 'e.g. Ducati Panigale V4', 'The Bike')}

          <div>
            <label style={s.label}>Album</label>
            <select
              style={s.select}
              value={photo.albumId}
              onChange={(e) => onUpdate(idx, { albumId: e.target.value })}
              disabled={disabled}
            >
              <option value="">— No album —</option>
              {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'default' : 'pointer', fontSize: 13 }}>
            <input
              type="checkbox"
              checked={photo.featured}
              onChange={(e) => onUpdate(idx, { featured: e.target.checked })}
              disabled={disabled}
              style={{ width: 15, height: 15 }}
            />
            Feature on homepage
          </label>
        </div>

        <button
          style={{ ...s.btn(photo.saved ? '#10b981' : '#ef4444', disabled), width: '100%', marginTop: 14 }}
          onClick={() => onSave(idx)}
          disabled={disabled}
        >
          {photo.saving ? 'Saving…' : photo.saved ? '✓ Saved' : 'Save Photo'}
        </button>
      </div>
    </div>
  )
}
