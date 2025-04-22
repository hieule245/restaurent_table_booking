# Sử dụng Node.js để chạy React
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy package.json và cài đặt dependencies trước (tận dụng cache)
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ mã nguồn frontend
COPY . .
COPY .env.prod .env

# Mở cổng ứng dụng React 
EXPOSE 3000

# Chạy ứng dụng React ở development mode
CMD ["npm", "start"]
