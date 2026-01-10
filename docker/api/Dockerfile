FROM node:20-slim AS builder

WORKDIR /app

# Copy workspace configuration
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/api ./apps/api

# Build the application
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY apps/api/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./dist

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
