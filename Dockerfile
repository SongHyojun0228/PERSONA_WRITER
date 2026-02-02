# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript server
RUN npm run build:server

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the app
CMD [ "node", "dist-server/server.js" ]
