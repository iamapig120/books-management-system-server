// 废弃的日志组件

const express = require('express')
const mysqlClient = require('../../lib/sql/mysqlClient')
const accessLogs = mysqlClient.tables.accessLogs
/**
 * 访客记录 路由，对所有请求都进行处理
 */
const accessLogsRouter = express.Router()

accessLogsRouter.all('*', (req, res, next) => {
  accessLogs.insert([null, Date.now(), req.method, req.url, null])
  console.log(req.url)
  next()
})

module.exports = accessLogsRouter
