'use strict'

const express = require('express')
const app = express()
const ColorLog = require('sim-color-log')

// 输出 Banner
require('./lib/others/logBanner')()

// 输出程序开始运行信息
ColorLog.ok('服务端程序已开始加载，请稍后……', 'LibMS')

/**
 * 一个全局变量，用于保证 express 监听端口一定在系统完全加载完毕后
 * @type {Promise<any[]>}
 */
global._PromisesToDo = []

// 访问 Logs ，所有请求方式路由
const morganLogs = require('./router/all/morganLogs')

// 图书分类总路由
const getCategoriesMain = require('./router/get/categories/getCateoriesMain')

// 端口号
const PORT_NUMBER = 3000

// 利用 Morgan 提供 Log 信息
app.use(morganLogs)
// 将所有路由设置到 app 上
app.use(getCategoriesMain)

// 当全部需要加载的项目均已加载完成，开始监听端口
Promise.all(global._PromisesToDo).then(values =>
  app.listen(PORT_NUMBER, () => {
    ColorLog.warn(`Express 服务器已工作，端口号: ${PORT_NUMBER}`)
    ColorLog.ok('服务端程序加载完毕', 'LibMS')
    // 历史使命已经结束，该全局变量已经可以删除了
    delete global._PromisesToDo
  })
)
// db.users.delete().confirm()
// db.users.update({ name: 'handle3', password: 'pass5' }, { id: 7 })
