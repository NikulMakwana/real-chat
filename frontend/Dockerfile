# Stage 1: Build
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# 1. First install react-scripts explicitly
COPY package.json .
RUN npm install 

# 2. Then install all other dependencies
COPY package*.json ./
RUN npm install --force && \
    npm list react-scripts  # Verify installation

# 3. Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=frontend-builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]