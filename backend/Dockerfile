# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
COPY server.js ./
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "server.js"]
