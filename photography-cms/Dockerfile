# Dockerfile for Payload CMS v3 with Next.js
# Using Debian-based image to avoid Alpine native module issues

FROM node:18-slim AS base

# Stage 1: Dependencies
FROM base AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with verbose output
RUN npm install --legacy-peer-deps --loglevel verbose

# Stage 2: Builder
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PAYLOAD_SECRET=build-time-secret-replace-at-runtime
ENV MONGODB_URI=mongodb://localhost:27017/placeholder

# Build the application with verbose output
RUN echo "Starting build..." && npm run build --verbose 2>&1

# Stage 3: Production Runner
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory with correct permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create media directory for uploads
RUN mkdir -p ./media && chown nextjs:nodejs ./media

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the standalone Next.js server
CMD ["node", "server.js"]
