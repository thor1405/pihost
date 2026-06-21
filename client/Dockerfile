# Stage 1: Build the React Application
FROM node:20-alpine as builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx is handled in the master docker-compose
# We'll just build an image that holds the built files, 
# or we can directly output them to a volume.
# Let's use a tiny image just to hold the volume data, or just build the image.

# Actually, the best way for docker-compose is to copy these files into an Nginx image.
# We'll do that by creating a standalone nginx image.
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/dist /app/dist
CMD ["echo", "Client built successfully!"]
