import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker deployment - creates standalone build
  output: 'standalone',

  experimental: {
    reactCompiler: false,
  },

  // Allow the frontend (photos.benfoggon.com) to use canvas cross-origin on media files
  async headers() {
    return [
      {
        source: '/media/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://photos.benfoggon.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, HEAD' },
          { key: 'Timing-Allow-Origin', value: 'https://photos.benfoggon.com' },
        ],
      },
    ];
  },
}

export default withPayload(nextConfig)
