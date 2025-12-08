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

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create media directory for uploads
RUN mkdir -p ./media && chown -R nextjs:nodejs ./media

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js server
CMD ["node", "server.js"]
