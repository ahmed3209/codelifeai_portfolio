# ── Stage 1: Build client ────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ── Stage 2: Production server ───────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install server deps
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy server source
COPY server/ ./server/

# Copy built client into server/public
COPY --from=client-builder /app/client/../server/public ./server/public

# Create data directory
RUN mkdir -p /app/server/db

EXPOSE 4000
CMD ["node", "server/index.js"]
