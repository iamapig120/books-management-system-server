'use strict'

const express = require('express')

/**
 * 登出 Post 请求路由
 */
const routerPostLogout = express.Router()

/**
 * 登出
 * @param {express.Request} req Request对象
 * @param {express.Response} res Response对象
 * @param {express.NextFunction} next NextFunction对象
 */
const routerFunction = async (req, res, next) => {
  if (!req.session.uid) {
    res.send({
      status: 2,
      info: "Havn't Login."
    })
  } else {
    req.session.uid = undefined
    delete req.session.uid
    res.send({
      status: 0,
      info: 'Logout Succ.'
    })
  }
  next()
}

routerPostLogout.post('/logout', routerFunction)

// crypto.createHash('SHA-256').update('9981797954')

module.exports = routerPostLogout
