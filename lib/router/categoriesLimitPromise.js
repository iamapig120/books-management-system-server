'use strict'

const ColorLog = require('sim-color-log')

const mysqlClient = require('../sql/mysqlClient')

const categories = mysqlClient.tables.categories

const promiseFunction = (async () => {
  const id = (await categories.select({
    orderBy: { id: false },
    limit: [0, 1]
  }))[0].id
  ColorLog.ok('成功加载图书分类 ID 上限')
  return id
})()

global._PromisesToDo.push(promiseFunction)

module.exports = promiseFunction
