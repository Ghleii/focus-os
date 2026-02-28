FROM node:22-alpine

WORKDIR /app

# 依存関係ファイルを先にコピー（キャッシュ効率化）
COPY package.json package-lock.json ./
RUN npm ci

# ソースコードをコピー
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
