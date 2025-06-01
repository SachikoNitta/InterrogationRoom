# 1. ビルド用イメージ
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# 2. 実行用イメージ
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
