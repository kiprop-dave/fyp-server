FROM node:19-alpine

# Create app directory
WORKDIR /usr/src/app

# get package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Install typescript
RUN npm install typescript

# Copy source code
COPY . .

# Build app
RUN npm run build

# Expose port 5000
EXPOSE 5000

# Run app
CMD [ "npm", "start" ]