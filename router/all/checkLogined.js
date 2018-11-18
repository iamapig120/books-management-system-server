'use strict'

const express = require('express')

/**
 * 检查登录状态 路由，对所有请求都进行处理
 */
const checkLoginedRouter = express.Router()

/**
 * 路由处理函数
 * @param {express.Request} req Request对象
 * @param {express.Response} res Response对象
 * @param {express.NextFunction} next NextFunction对象
 */
const checkLoginedFunction = (req, res, next) => {
  if (req.session.uid) {
    next()
  } else {
    res.statusCode = 401
    res.send({
      status: 1,
      info: "Havn't Logined"
    })
  }
}

checkLoginedRouter.use(checkLoginedFunction)

module.exports = checkLoginedRouter
