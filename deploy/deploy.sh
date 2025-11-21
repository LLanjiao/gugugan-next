#!/bin/bash

APP_NAME="my-next-app"
IMAGE_NAME="my-next-app"
PORT=3000

echo "🚀 开始构建新镜像..."
docker build -t $IMAGE_NAME .

echo "🛑 停止旧容器（如果存在）..."
docker stop $APP_NAME || true

echo "🗑 删除旧容器（如果存在）..."
docker rm $APP_NAME || true

echo "🧹 删除旧镜像（如果存在）..."
docker rmi $(docker images -q $IMAGE_NAME | head -n 1) || true

echo "🚀 启动新容器..."
docker run -d \
  --name $APP_NAME \
  -p $PORT:3000 \
  $IMAGE_NAME

echo "🎉 部署完成！当前容器："
docker ps | grep $APP_NAME