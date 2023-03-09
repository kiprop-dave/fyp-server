FROM node:19-alpine AS build

# Create app directory
WORKDIR /app

# Bundle app source
COPY . .

# Install app dependencies and build
RUN npm install && npm run build

# Production image
FROM node:19-alpine AS production

# Create app directory
WORKDIR /app

# Copy build files
COPY --from=build /app/dist ./dist

# Copy package.json and package-lock.json
COPY package*.json .

# Install production dependencies
RUN npm install --only=production

# Expose port
EXPOSE 5000

# Start app
CMD [ "npm", "start" ]