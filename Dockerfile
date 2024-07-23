# 阶段 1: 构建前端静态文件
# 使用 Node.js 的官方基础镜像
FROM node:18.12 AS build-stage

# 设置前端工作目录
WORKDIR /app/frontend

# 安装pnpm
RUN npm install --global pnpm

# 复制前端相关的文件
COPY ./frontend/package*.json ./
COPY ./frontend/pnpm-lock.yaml ./

# 安装前端依赖
RUN pnpm install

# 复制前端代码
COPY ./frontend .

# 构建前端静态文件
RUN npm run build

# 清理 pnpm 缓存
RUN pnpm store prune

# 阶段 2: 设置 Python 环境并复制前端构建产物
# 使用官方 Python 3.11 基础镜像
FROM python:3.11-slim-buster

# 设置时区环境变量
ENV TZ=Asia/Shanghai

# 设置 USTC 镜像源
RUN sed -i 's|http://deb.debian.org|https://mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY ./requirements.txt /app/requirements.txt

# 安装依赖和时区设置
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && apt-get install -y --fix-missing build-essential \
    && python -m pip install --upgrade pip \
    && pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple -r /app/requirements.txt \
    && apt-get remove -y build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 复制后端代码
COPY ./server /app/server
COPY ./start.sh ./start.py ./supervisord.conf /app/

# 从构建阶段复制前端构建产物
COPY --from=build-stage /app/frontend/dist /app/static

# 暴露容器内部的端口
EXPOSE 9115

# 启动命令
# CMD ["python", "/app/start.py"]
CMD ["bash", "/app/start.sh"]