const express = require('express')
const mysqlClient = require('../../lib/sql/mysqlClient')
const checkCache = require('../../lib/router/functions/checkCache')
const categories = mysqlClient.tables.categories
const ColorLog = require('sim-color-log')
/**
 * 图书分类上限数目，用于减小缓存大小
 */
let categoriesLimit
;(async () => {
  categoriesLimit = (await categories.select({
    orderBy: { id: false },
    limit: [0, 1]
  }))[0].id
  ColorLog.log('分类目录上限已读取: ')
  ColorLog.log('上限数目为: ' + categoriesLimit)
})()
/**
 * 图书分类 路由
 */
const routerCategories = express.Router()
const getCategoriesId = async (req, res, next) => {
  let parentId = req.params.id
  if (parentId === '0') {
    parentId = null
  }
  const result = categories.select({
    where: {
      parent_Id: parentId
    },
    orderBy: { id: true },
    columns: ['id', 'code', 'name']
  })
  const resultName = categories.select({
    where: {
      id: parentId
    },
    orderBy: { id: true },
    columns: ['id', 'code', 'name']
  })
  res.send(
    JSON.stringify({
      key: await resultName,
      categories: await result
    })
  )
  next()
}

routerCategories.get(
  '/categories/:id.json',
  checkCache(getCategoriesId, undefined, req => {
    let id = parseInt(req.params.id)
    if (id > categoriesLimit) {
      id = -1
    }
    return 'json-categories-' + id
  })
)
module.exports = routerCategories
