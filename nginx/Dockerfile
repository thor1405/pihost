# Stage 1: Build the React Application
FROM node:20-alpine as builder

WORKDIR /app
# We assume the build context is the root directory
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy master Nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy the built PiHost dashboard from Stage 1
RUN mkdir -p /var/www/pihost
COPY --from=builder /app/client/dist /var/www/pihost

# Create directory for User Sites
RUN mkdir -p /public_sites

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
