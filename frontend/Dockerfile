# Frontend Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Cache static assets aggressively, HTML lightly
RUN sed -i 's|#gzip  on;|gzip on;|' /etc/nginx/nginx.conf
EXPOSE 80
