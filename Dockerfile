# 1. 使用 Node 官方镜像
FROM node:18-alpine AS builder

# 2. 设置工作目录
WORKDIR /app

# 3. 复制依赖文件并安装
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install --frozen-lockfile || yarn install --frozen-lockfile

# 4. 复制项目文件
COPY . .

# 5. 构建 Next.js 项目
RUN npm run build || yarn build

# -------------------------
# 第二阶段：运行环境
# -------------------------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# 只复制必要文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Next.js 默认运行端口
EXPOSE 3000

CMD ["npm", "start"]
