'use strict'

// 输出 Banner
require('./lib/others/logBanner')()

const ColorLog = require('sim-color-log')

// 输出程序开始运行信息
ColorLog.log('服务端程序已开始加载', 'LibMS')

// 正式开始加载程序
const express = require('express')
const app = express()

/**
 * 一个全局变量，用于保证 express 监听端口一定在系统完全加载完毕后
 * @type {Promise<any[]>}
 */
global._PromisesToDo = []

// 访问 Logs ，所有请求方式路由
const morganLogs = require('./router/all/morganLogs')
// 依赖 Redis 的 session ，所有请求方式路由
const sessionRedis = require('./router/all/sessionRedis')

// 图书操作总路由
const postBooksMain = require('./router/post/books/postBooksMain')
// 图书分类总路由
const getCategoriesMain = require('./router/get/categories/getCateoriesMain')
// 用户操作总路由
const postUsersMain = require('./router/post/users/postUsersMain')

// 端口号
const PORT_NUMBER = 3000

// 提供静态文件目录
app.use(express.static('static'))

// 利用 Morgan 提供 Log 信息
app.use(morganLogs)
// 利用 Redis 设置一个 Session
app.use(sessionRedis)

// 将所有路由设置到 app 上
// 图书操作相关 Post 请求路由
app.use(postBooksMain)
// 图书分类相关 Get 请求路由
app.use(getCategoriesMain)
// 用户操作相关 Post 请求路由
app.use(postUsersMain)

// 当全部需要加载的项目均已加载完成，开始监听端口
Promise.all(global._PromisesToDo).then(values =>
  app.listen(PORT_NUMBER, () => {
    ColorLog.warn(`Express 服务器已工作，端口号: ${PORT_NUMBER}`, 'LibMS')
    ColorLog.log('服务端程序加载完毕', 'LibMS')
    // 历史使命已经结束，该全局变量已经可以删除了
    delete global._PromisesToDo
  })
)
// db.users.delete().confirm()
// db.users.update({ name: 'handle3', password: 'pass5' }, { id: 7 })
