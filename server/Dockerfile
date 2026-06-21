FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application files
COPY . .

# Ensure the upload and public_sites directories exist
RUN mkdir -p uploads public_sites

# Expose API port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
