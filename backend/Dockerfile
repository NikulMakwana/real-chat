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

# Copy the installed dependencies and application from the builder stage
COPY --from=builder /app ./

# Expose the port on which your application runs
EXPOSE 3001

# Command to run the backend application
CMD ["npm", "start"]
