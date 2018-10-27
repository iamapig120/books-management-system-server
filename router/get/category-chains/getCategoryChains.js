'use strict'

const express = require('express')

const mysqlClient = require('../../../lib/sql/mysqlClient')
const redisClient = require('../../../lib/sql/redisClient')
const ColorLog = require('sim-color-log')

const categories = mysqlClient.tables.categories
const REDIS_KEY = 'categoryInfos'

/**
 * 系统加载时自动加载全部分类的基本信息到 Redis 内
 */
categories
  .select()
  .then(values => {
    const allPromise = []
    values.forEach(value => {
      allPromise.push(
        new Promise(resolve =>
          redisClient.hset(REDIS_KEY, value.id, JSON.stringify(value), resolve)
        )
      )
    })
  })
  .then(ColorLog.ok('已成功载入所有分类数据至 Redis 数据库中'))

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
      if (!(idToSearch >> 0)) {
        return false
      }
      queryRes = await new Promise(resolve =>
        redisClient.hget(REDIS_KEY, idToSearch || 0, (error, value) => {
          if (error) {
            throw error
          }
          if (value) {
            resolve(JSON.parse(value))
          } else {
            resolve(null)
          }
        })
      )
      return queryRes
    })()
  ) {
    if (result) {
      queryRes.categories = result
    }
    result = queryRes
    idToSearch = queryRes.parent_id
    delete queryRes.parent_id
  }
  res.send(JSON.stringify(result || {}))
  next()
}

routerCategoryChains.get(
  '/category-chains/:id.json',
  getCategoryChainFun
)

module.exports = routerCategoryChains
