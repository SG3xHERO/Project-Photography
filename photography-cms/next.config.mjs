// Temporarily disabled withPayload to debug build issues
// import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker deployment
  output: 'standalone',
  
  experimental: {
    reactCompiler: false,
  },
  
  // Webpack config to handle Payload
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'sharp']
    return config
  },
}

export default nextConfig
// export default withPayload(nextConfig)
