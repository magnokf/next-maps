
FROM node:lts-alpine as base

# Set working directory for all build stages.
WORKDIR /app

# Copy the package.json and package-lock.json files into the image.
COPY package*.json ./

RUN npm install

RUN npm run prisma generate

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN npm run build
# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["npm", "start"]