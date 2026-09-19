# Use Node.js image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the port (e.g., 5173 for Vite, 3000 for Create React App)
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
