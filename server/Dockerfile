# Sử dụng image Golang mới nhất
FROM golang:1.24 AS builder

# Đặt thư mục làm việc trong container
WORKDIR /app

COPY go.mod go.mod
# Copy toàn bộ mã nguồn vào container

# Tải về tất cả các dependencies
RUN go mod tidy

COPY . .
# Build ứng dụng backend
RUN go build -o server ./cmd/web/main.go

EXPOSE 8080

# Chạy server
CMD ["./server"]
