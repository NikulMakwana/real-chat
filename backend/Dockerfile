# Stage 1: Build dependencies and source code
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Stage 2: Final production image
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3001

CMD ["npm", "start"]
