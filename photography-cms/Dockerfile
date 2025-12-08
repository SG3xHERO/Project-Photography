# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --include=dev

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files needed for build
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./
COPY app ./app
COPY src ./src
COPY public ./public

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PAYLOAD_SECRET=build-time-secret-change-in-production
ENV SKIP_ENV_VALIDATION=1

# Debug: List files before build
RUN echo "Files in /app:" && ls -la && \
    echo "Files in /app/app:" && ls -la app/ && \
    echo "Files in /app/src:" && ls -la src/

# Build Next.js application
RUN npm run build 2>&1 | tee build.log || (cat build.log && exit 1)

# Debug: List build output and verify it's complete
RUN echo "========== Build completed. Checking output ==========" && \
    ls -la && \
    echo "========== Checking .next directory ==========" && \
    ls -la .next/ && \
    echo "========== Checking .next/BUILD_ID ==========" && \
    cat .next/BUILD_ID && \
    echo "========== Checking .next/server ==========" && \
    ls -la .next/server/ && \
    echo "========== Build verification complete =========="

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files for production
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/app ./app

# CRITICAL: Copy the .next build output - this MUST exist from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Debug: Verify .next directory was copied to runner
RUN ls -la && \
    echo "========== Checking .next in RUNNER ==========" && \
    ls -la .next/ && \
    echo "========== Checking BUILD_ID in RUNNER ==========" && \
    cat .next/BUILD_ID && \
    echo "========== Checking .next/server in RUNNER ==========" && \
    ls -la .next/server/

# Create media directory
RUN mkdir -p ./media && chown nextjs:nodejs ./media

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js production server
CMD ["node_modules/.bin/next", "start"]
