'use client'

import React, { useEffect, useState, useCallback } from 'react'

interface PhotoStats {
  totalPhotos: number
  totalAlbums: number
  featuredPhotos: number
  categories: { name: string; count: number }[]
  recentPhotos: { id: string; title: string; thumbnailUrl: string }[]
}

const CATEGORY_LABELS: Record<string, string> = {
  racing: 'Racing',
  custom: 'Custom',
  adventure: 'Adventure',
  detail: 'Detail',
  vintage: 'Vintage',
  street: 'Street',
  portrait: 'Portrait',
  landscape: 'Landscape',
  other: 'Other',
}

export default function SiteStatsDashboard() {
  const [stats, setStats] = useState<PhotoStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const [photosRes, albumsRes, featuredRes, recentRes, allCatRes] = await Promise.all([
        fetch('/api/photos?limit=0'),
        fetch('/api/albums?limit=0'),
        fetch('/api/photos?where[featured][equals]=true&limit=0'),
        fetch('/api/photos?limit=5&sort=-createdAt&depth=1'),
        fetch('/api/photos?limit=500&depth=0&select=category'),
      ])

      const [photosData, albumsData, featuredData, recentData, allCatData] = await Promise.all([
        photosRes.json(),
        albumsRes.json(),
        featuredRes.json(),
        recentRes.json(),
        allCatRes.json(),
      ])

      const categoryCounts: Record<string, number> = {}
      if (allCatData.docs) {
        for (const p of allCatData.docs) {
          if (p.category) {
            categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
          }
        }
      }

      const categories = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      const recentPhotos = (recentData.docs || []).map((p: any) => {
        let thumbnailUrl = ''
        if (p.image) {
          if (p.image.sizes?.thumbnail?.url) thumbnailUrl = p.image.sizes.thumbnail.url
          else if (p.image.url) thumbnailUrl = p.image.url
        }
        return { id: p.id, title: p.title || 'Untitled', thumbnailUrl }
      })

      setStats({
        totalPhotos: photosData.totalDocs ?? 0,
        totalAlbums: albumsData.totalDocs ?? 0,
        featuredPhotos: featuredData.totalDocs ?? 0,
        categories,
        recentPhotos,
      })
    } catch (e) {
      console.error('SiteStatsDashboard: failed to load stats', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: 24,
      marginBottom: 20,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
          📷 Site Overview
        </h2>
        <button
          onClick={loadStats}
          style={{
            padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'inherit', fontFamily: 'inherit',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px 0', margin: 0 }}>Loading stats…</p>
      ) : !stats ? (
        <p style={{ textAlign: 'center', color: '#f87171', margin: 0 }}>Could not load stats — is the CMS running?</p>
      ) : (
        <>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {([
              { label: 'Total Photos', value: stats.totalPhotos, color: '#ef4444', icon: '🖼️' },
              { label: 'Albums', value: stats.totalAlbums, color: '#f97316', icon: '📁' },
              { label: 'Featured', value: stats.featuredPhotos, color: '#10b981', icon: '⭐' },
            ] as const).map(({ label, value, color, icon }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${color}33`,
                borderRadius: 10,
                padding: '16px 12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 5, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          {stats.categories.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, marginBottom: 10, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                By Category
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stats.categories.map(({ name, count }) => (
                  <span key={name} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#f87171',
                  }}>
                    {CATEGORY_LABELS[name] ?? name} · {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent uploads */}
          {stats.recentPhotos.length > 0 && (
            <div>
              <h3 style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Recent Uploads
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {stats.recentPhotos.map(photo => (
                  <div key={photo.id} style={{ width: 72 }}>
                    <div style={{
                      width: 72, height: 54, borderRadius: 8, overflow: 'hidden',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      {photo.thumbnailUrl ? (
                        <img
                          src={photo.thumbnailUrl}
                          alt={photo.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: 0.3 }}>
                          📷
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: 10, opacity: 0.5, marginTop: 4, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 72,
                    }}>
                      {photo.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href="/admin/collections/photos" style={quickLinkStyle}>View All Photos →</a>
            <a href="/admin/collections/albums" style={quickLinkStyle}>Manage Albums →</a>
          </div>
        </>
      )}
    </div>
  )
}

const quickLinkStyle: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
  color: '#f87171', textDecoration: 'none',
}
