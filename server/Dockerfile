# Sử dụng image Golang mới nhất
FROM golang:1.24 AS builder

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy toàn bộ mã nguồn vào container
COPY . .

# Tải về tất cả các dependencies
RUN go mod download

# Build ứng dụng backend
RUN go build -o server cmd/web/*.go

# Tạo container chạy ứng dụng Golang
FROM alpine:latest

WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080

# Chạy server
CMD ["./server"]
