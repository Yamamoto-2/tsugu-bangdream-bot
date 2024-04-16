

# tsugu-bangdream-bot 


*✨ BanG Dream！少女乐团派对 多功能 BOT ✨*


[![npm](https://img.shields.io/npm/v/koishi-plugin-tsugu-bangdream-bot?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-tsugu-bangdream-bot) [![npm](https://img.shields.io/npm/l/koishi-plugin-tsugu-bangdream-bot?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-tsugu-bangdream-bot) [![npm](https://img.shields.io/npm/dt/koishi-plugin-tsugu-bangdream-bot?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-tsugu-bangdream-bot)


## 🤖 BOT 部署

| 部署方式 | 传送门 |
| --- | --- |
| **koishi 部署** | [![npm](https://img.shields.io/npm/v/koishi-plugin-tsugu-bangdream-bot?style=flat-square)](https://koishi.chat/zh-CN/manual/introduction.html)|
| **lpt 登陆端部署** | [![release](https://img.shields.io/github/v/release/kumoSleeping/lgr-tsugu-py?style=flat-square)](https://github.com/kumoSleeping/lgr-tsugu-py) |
| **py 自行构建**| [![pypi](https://img.shields.io/pypi/v/tsugu?style=flat-square)](https://github.com/kumoSleeping/tsugu-python-frontend/)|

## 🏠 后端部署

> 需要 `nodejs` 18+ 环境以及 `npm` 等包管理工具

  [![nodejs官网](https://img.shields.io/badge/nodejs官网-18.16.0+-green?style=flat-square)](https://nodejs.org/zh-cn/download/)

```bash
git clone git@github.com:Yamamoto-2/tsugu-bangdream-bot.git
cd tsugu-bangdream-bot
cd backend
npm install -g ts-node
npm install -g pm2
npm install 
# 此时安装时间可能较长，并且需要可以完善编译 canvas 的环境
# 启动后端
pm2 start ecosystem.config.js
```

## 🧹 后端日志清理

```bash
# 安装 pm2 的插件：定时清理日志
pm2 install pm2-logrotate
# 启动定时清理日志
pm2 set pm2-logrotate:compress 0
```


## 📖 文章

> 相关文章: https://www.bilibili.com/read/cv24464090 

## 📦 数据支持

| 项目 | 传送门 |
| --- | --- |
| 数据支持 | [🔗bestdori](https://bestdori.com/) |
| 车牌数据 | [🔗bandoristation](https://bandoristation.com) |


## 🐧 QQ 官方机器人
> 点击链接了解机器人详情 [Tsugu](https://qun.qq.com/qunpro/robot/qunshare?robot_uin=3889000770&robot_appid=102076262&biz_type=0)
