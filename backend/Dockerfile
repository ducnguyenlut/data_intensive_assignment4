# Use official Node.js LTS image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port
EXPOSE 2000

# Run seed script first, then start server
# Use && so server starts only if seed succeeds
CMD ["sh", "-c", "node seed.js && node server.js"]
