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
ENV DATABASE_URI=mongodb://localhost:27017/build-placeholder

# Debug: List files before build
RUN echo "========== Files before build ==========" && \
    ls -la && \
    echo "Working directory: $(pwd)"

# Build Next.js application (simplified without cross-env)
RUN npm run build

# Debug: Check what was created
RUN echo "========== Files after build ==========" && \
    ls -la && \
    if [ -d .next ]; then \
        echo "SUCCESS: .next exists" && ls -la .next/; \
    else \
        echo "ERROR: .next not found!"; \
    fi

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
