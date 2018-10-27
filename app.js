'use strict'

const express = require('express')
const app = express()
const ColorLog = require('sim-color-log')

const logBanner = require('./lib/others/logBanner')

// 输出 Banner
logBanner()

// 访问 Logs ，所有请求方式路由
const morganLogs = require('./router/all/morganLogs')
// 图书分类 Get 路由
const getCategories = require('./router/get/categories/getCategories')
// 图书分类链 Get 路由
const getCategoryChains = require('./router/get/category-chains/getCategoryChains')

// 端口号
const PORT_NUMBER = 3000

// 利用 Morgan 提供 Log 信息
app.use(morganLogs)
// 将所有路由设置到 app 上
app.use(getCategories)
app.use(getCategoryChains)

// 开始监听端口
app.listen(PORT_NUMBER, () =>
  ColorLog.warn(`Express 服务器已工作，端口号: ${PORT_NUMBER}`)
)

// db.users.delete().confirm()
// db.users.update({ name: 'handle3', password: 'pass5' }, { id: 7 })
