FROM node:19-alpine

# Create app directory
WORKDIR /usr/src/app

# get package.json
COPY package.json ./

# Copy tsconfig.json
COPY tsconfig.json ./

# Install production dependencies
RUN npm install --only=production

# Install typescript
RUN npm install typescript

# Bundle src directory
COPY src ./

# Build app
RUN npm run build

# Expose port 5000
EXPOSE 5000

# Run app
CMD [ "npm", "start" ]