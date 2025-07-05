# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# This copies ONLY package.json, not node_modules
COPY package*.json ./

# This installs dependencies INSIDE the container, compiling them for Alpine/AMD64
RUN npm install

# This copies the rest of your source code
COPY . .

# Now we build
RUN npm run build

# This removes dev dependencies
RUN npm prune --production

# Stage 2: Production
FROM node:18-alpine
WORKDIR /usr/src/app

# Copy ONLY the artifacts from the builder stage.
# This includes the correctly compiled node_modules.
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json . 

EXPOSE 3000
CMD ["node", "dist/main"]