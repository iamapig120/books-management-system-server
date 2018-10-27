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
 * 图书分类链 路由
 */
const routerCategoryChains = express.Router()
/**
 * 获取图书馆分类链信息
 * @param {express.Request} req Request对象
 * @param {express.Response} res Response对象
 * @param {express.NextFunction} next NextFunction对象
 */
const getCategoryChainFun = async (req, res, next) => {
  let result
  let idToSearch = req.params.id
  if (idToSearch === '0') {
    idToSearch = null
  }
  /**
   * @type {Array<>}
   */
  let queryRes
  while (
    await (async () => {
      queryRes = await categories.select({
        where: {
          id: idToSearch
        }
        // orderBy: { id: true }
        // columns: ['id', 'code', 'name', 'parent_Id']
      })
      return queryRes.length > 0
    })()
  ) {
    if (result) {
      queryRes[0].categories = result
    }
    result = queryRes[0]
    idToSearch = queryRes[0].parent_id
    delete queryRes[0].parent_id
  }
  res.send(JSON.stringify(result || {}))
  next()
}

routerCategoryChains.get(
  '/category-chains/:id.json',
  (() => {
    return checkCache({
      handler: getCategoryChainFun,
      getKeyFun: req => {
        let id = parseInt(req.params.id)
        if (id > categoriesLimit) {
          id = -1
        }
        // return 'json-category-chain-' + id
        return id
      },
      hashKey: 'category-chains'
    })
  })()
)

module.exports = routerCategoryChains
