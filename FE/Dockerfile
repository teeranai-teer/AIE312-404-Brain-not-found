# ขั้นที่ 1: build เว็บด้วย Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL ถูกฝังตอน build จึงต้องส่งเข้ามาเป็น build argument
ARG VITE_API_URL=https://aie312-404-brain-not-found-be.onrender.com
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ขั้นที่ 2: เสิร์ฟไฟล์ที่ build แล้วด้วย nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80