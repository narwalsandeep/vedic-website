# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Expose port 4200
EXPOSE 4200

# Start the application in development mode
CMD ["sh", "-c", "NG_CLI_ANALYTICS=false npm start -- --host 0.0.0.0"]
