#!/bin/bash

# 检测 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo ".env 文件不存在，复制 .env.example 到 .env"
    cp .env.example .env
fi

# 启动 PM2
pm2 start ecosystem.config.js
