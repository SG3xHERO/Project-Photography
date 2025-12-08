# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm install --legacy-peer-deps

# Copy TypeScript config and source files
COPY tsconfig.json ./
COPY nodemon.json ./
COPY src ./src

# Set dummy environment variable for build (Payload may need this)
ENV PAYLOAD_SECRET=build-time-secret-key-change-in-production
ENV NODE_ENV=production

# Build the application (just TypeScript compilation)
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create media directory
RUN mkdir -p ./media

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/admin', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "run", "serve"]
