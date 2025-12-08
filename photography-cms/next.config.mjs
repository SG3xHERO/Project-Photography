import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker deployment - creates standalone build
  output: 'standalone',
  
  experimental: {
    reactCompiler: false,
  },
}

export default withPayload(nextConfig)
