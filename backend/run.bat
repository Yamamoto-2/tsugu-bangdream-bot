title backend

IF NOT EXIST ".env" (
    echo .env 文件不存在，复制 .env.example 到 .env
    copy ".env.example" ".env"
)

:off
pm2 start ecosystem.config.js
goto off
pause