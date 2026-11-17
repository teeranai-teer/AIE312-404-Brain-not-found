# Backend: Node 22 แบบเล็ก
FROM node:22-alpine
WORKDIR /app

# ติดตั้งเฉพาะ package ที่ใช้ตอนรันจริง (ไม่รวม devDependencies)
COPY package*.json ./
RUN npm ci --omit=dev

# คัดลอกโค้ด (ไฟล์ที่ไม่ต้องการถูกกันไว้ใน .dockerignore)
COPY . .

# พอร์ตของ BE (ค่าจริงมาจากตัวแปร PORT ถ้ามี)
EXPOSE 3000
CMD ["npm", "start"]