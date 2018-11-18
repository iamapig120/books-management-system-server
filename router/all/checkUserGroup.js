'use strict'

const express = require('express')
const redisClient = require('../../lib/sql/redisClient')
const mysqlClient = require('../../lib/sql/mysqlClient')

/**
 * 检查登录权限 路由，对所有请求都进行处理
 */
const checkUserGroupRouter = express.Router()

const checkLoginedFunction = (...groupIDs) => {
  if (groupIDs.length > 0) {
    groupIDs = groupIDs.map(value => value.toString())
  }
  /**
   * 实际返回的路由函数
   * @param {express.Request} req Request对象
   * @param {express.Response} res Response对象
   * @param {express.NextFunction} next NextFunction对象
   */
  return async (req, res, next) => {
    let mysqlResult
    if (req.session.uid) {
      if (
        groupIDs.indexOf(
          await redisClient.hget('user-group', req.session.uid)
        ) > -1
      ) {
        next()
      } else if (
        groupIDs.indexOf(
          await (async () => {
            mysqlResult = await mysqlClient.tables.users.select({
              where: {
                id: req.session.uid
              }
            })
            if (mysqlResult.length > 0) {
              const groupValueString = mysqlResult[0].group.toString()
              redisClient.hset(
                'user-group',
                mysqlResult[0].id,
                groupValueString
              )
              return groupValueString
            } else {
              return null
            }
          })()
        ) > -1
      ) {
        next()
      } else {
        res.statusCode = 401
        res.send({
          status: 2,
          info: 'No Authority'
        })
      }
    } else {
      res.statusCode = 401
      res.send({
        status: 1,
        info: "Havn't Logined"
      })
    }
  }
}

const setRouter = groupID =>
  checkUserGroupRouter.use(checkLoginedFunction(groupID))

module.exports = setRouter
