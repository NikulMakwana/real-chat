FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json first.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Expose the application port.
EXPOSE 4000

# The command to start the application.
CMD ["node", "server.js"]
