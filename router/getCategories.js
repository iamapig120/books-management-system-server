const express = require('express')
const mysqlClient = require('../lib/sql/mysqlClient')
const categories = mysqlClient.tables.categories
const checkCache = require('../lib/router/functions/checkCache')
/**
 * 图书分类上限数目，用于减小缓存大小
 */
let categoriesLimit
;(async () => {
  categoriesLimit = (await categories.select({
    orderBy: { id: false },
    limit: [0, 1]
  }))[0].id
  console.log('分类目录上限已读取: ')
  console.log('--上限数目为: ', categoriesLimit)
})()
/**
 * 图书分类 路由
 */
const routerCategories = express.Router()
const getCategoriesId = async (req, res, next) => {
  let parent_id = req.params.id
  if (parent_id === '0') {
    parent_id = null
  }
  const result = categories.select({
    where: {
      parent_id
    },
    orderBy: { id: true },
    columns: ['id', 'code', 'name']
  })
  const resultName = categories.select({
    where: {
      id: parent_id
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

routerCategories.get('/:id.json', (req, res, next) => {
  console.log('分类目录被请求: ')
  console.log('--请求方式为: ', req.method)
  console.log('--IP地址为: ', req.ip)
  console.log('--时间戳: ', Date.now())
  console.log('--分类目录ID: ', req.params.id)
  next()
})
routerCategories.get(
  '/:id.json',
  checkCache(getCategoriesId, undefined, req => {
    let id = parseInt(req.params.id)
    if (id > categoriesLimit) {
      id = -1
    }
    return 'json-categories-' + id
  })
)
module.exports = routerCategories
