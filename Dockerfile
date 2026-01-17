# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install ALL deps (including dev)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the NestJS project (needs nest CLI)
RUN npm run build

# ---- Stage 2: Run ----
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only dist + package files
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Install only production deps
RUN npm install --production

EXPOSE 3000
CMD ["npm", "run", "start:prod"]