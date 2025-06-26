// Dockerfile
FROM node:18-alpine
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install dependencies including dev dependencies for build
RUN npm ci
# Copy source code
COPY . .
# Build the application
RUN npm run build
# Remove dev dependencies
RUN npm ci --only=production && npm cache clean --force
# Expose port
EXPOSE 3000
# Set environment
ENV NODE_ENV=production
# Start the server
CMD ["node", "dist/server.js"]
