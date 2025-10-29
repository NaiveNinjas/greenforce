# Use Node LTS image
FROM registry.access.redhat.com/ubi9/nodejs-22-minimal

USER root

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

RUN chown -R 1001:0 /app

USER 1001

# Install dependencies
RUN npm ci && npx next telemetry disable

# Copy all frontend files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "run", "start"]
