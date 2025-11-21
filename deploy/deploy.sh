#!/bin/bash

# ==============================
# 配置区域（按需修改）
# ==============================
APP_NAME="nextjs-app"           # 容器名称
IMAGE_NAME="my-next-app"        # 镜像名称
APP_PORT=3000                   # 访问端口
PROJECT_DIR="$(dirname $(pwd))" # 项目根目录

# ==============================
# 开始部署
# ==============================
echo "🚀 正在部署 Next.js 项目..."
echo "📁 项目目录: $PROJECT_DIR"

cd $PROJECT_DIR

echo "🔄 拉取最新代码..."
git pull origin master

echo "📦 构建镜像: $IMAGE_NAME"
docker build -t $IMAGE_NAME .

echo "🛑 停止旧容器（如果存在）: $APP_NAME"
docker stop $APP_NAME 2>/dev/null || true

echo "🗑 删除旧容器（如果存在）: $APP_NAME"
docker rm $APP_NAME 2>/dev/null || true

echo "🚀 启动新容器..."
docker run -d \
  --name $APP_NAME \
  -p $APP_PORT:3000 \
  $IMAGE_NAME

echo "🎉 部署完成！当前容器："
docker ps | grep $APP_NAME