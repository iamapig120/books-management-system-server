'use strict'

const express = require('express')

const mysqlClient = require('../../../lib/sql/mysqlClient')
const checkCache = require('../../../lib/router/checkCache')
const categoriesLimitPromise = require('../../../lib/router/categoriesLimitPromise')

const categories = mysqlClient.tables.categories

/**
 * 图书分类上限数目，用于减小缓存大小
 */
let categoriesLimit
categoriesLimitPromise.then(value => (categoriesLimit = value))
/**
 * 图书分类 路由
 */
const routerCategories = express.Router()
/**
 * 获取图书馆分类信息 ID
 * @param {express.Request} req Request对象
 * @param {express.Response} res Response对象
 * @param {express.NextFunction} next NextFunction对象
 */
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
  res.send(JSON.stringify(await result))
  next()
}

routerCategories.get(
  '/categories/:id.json',
  (() => {
    return checkCache({
      handler: getCategoriesId,
      getKeyFun: req => {
        let id = parseInt(req.params.id)
        if (id > categoriesLimit) {
          id = -1
        }
        // return 'json-categories-' + id
        return id
      },
      hashKey: 'categories'
    })
  })()
)
module.exports = routerCategories
