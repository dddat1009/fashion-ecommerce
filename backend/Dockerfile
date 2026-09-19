# Use Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port your backend runs on (e.g., 4000)
EXPOSE 4000

# Command to start the backend
CMD ["npm", "start"]
