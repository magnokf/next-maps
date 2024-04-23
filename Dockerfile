FROM node:lts-alpine

# Set working directory for all build stages.
WORKDIR /app
# Copy the package.json and package-lock.json files into the image.
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
# Copy the rest of the source files into the image.
COPY . .

RUN npm run build

EXPOSE 3000
# Run the application.
CMD [ "npm", "run", "build:start"]