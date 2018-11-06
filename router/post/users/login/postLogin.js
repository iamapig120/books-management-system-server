'use strict'

const express = require('express')
const multer = require('multer')
const crypto = require('crypto')
// const bodyParser = require('body-parser')
const mysqlClient = require('../../../../lib/sql/mysqlClient')
const redisClient = require('../../../../lib/sql/redisClient')

const postRouter = multer().none()
// const postRouter = bodyParser.urlencoded({ extended: false })

/**
 * 登入 Post 请求路由
 */
const routerPostLogin = express.Router()

/**
 * 登入
 * @param {express.Request} req Request对象
 * @param {express.Response} res Response对象
 * @param {express.NextFunction} next NextFunction对象
 */
const routerFunction = async (req, res, next) => {
  if (!req.body) return res.sendStatus(400)
  if (req.session.uid) {
    res.send({
      status: 2,
      info: "Havn't Logout."
    })
    next()
    return
  }
  const account = (req.body.account || '').toString()
  const password = (req.body.password || '').toString()
  if (
    account.length > 0 &&
    password.length > 0 &&
    account.length < 128 &&
    password.length < 192
  ) {
    mysqlClient.tables.users
      .select({
        where: {
          account,
          password: crypto
            .createHmac('sha256', '9981797954')
            .update(password)
            .digest('hex')
        }
      })
      .then(value => {
        if (value.length > 0) {
          req.session.uid = value[0].id
          redisClient.hset('users-group', value[0].id, value[0].group)
          res.send({
            status: 0,
            info: 'Login Succ.'
          })
        } else {
          res.send({
            status: 1,
            info: 'Wrong Acc or Pass.'
          })
        }
        next()
      })
  } else {
    res.send({
      status: 2,
      info: 'Wrong Acc or Pass.'
    })
    next()
  }
}

routerPostLogin.post('/login', postRouter, routerFunction)

module.exports = routerPostLogin
