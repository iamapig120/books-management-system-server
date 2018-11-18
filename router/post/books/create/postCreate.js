'use strict'

const express = require('express')
const multer = require('multer')
const mysqlClient = require('../../../../lib/sql/mysqlClient')

const postRouter = multer().none()

/**
 * 登出 Post 请求路由
 */
const routerPostCreate = express.Router()

/**
 * 登出
 * @param {express.Request} req Request对象
 * @param {express.Response} res Response对象
 * @param {express.NextFunction} next NextFunction对象
 */
const routerFunction = async (req, res, next) => {
  if (!req.body) return res.sendStatus(400)
  const {
    id,
    type,
    name,
    state,
    author,
    translator,
    press,
    pages,
    price,
    publishNumber,
    publishTime,
    isbn,
    brief,
    outline,
    isPeriodical,
    periodicalID,
    remarks
  } = req.body
  const result = await mysqlClient.tables.books.insert([
    // id,
    null,
    type,
    name,
    state,
    author,
    translator,
    press,
    pages,
    price,
    publishNumber,
    publishTime,
    isbn,
    brief,
    outline,
    isPeriodical,
    periodicalID,
    remarks
  ])
  if (result.insertId) {
    res.send({
      status: 0,
      info: 'Insert Succ.'
    })
  } else {
    res.send({
      status: 99,
      info: 'Unknown Wrons.'
    })
  }
  next()
}

routerPostCreate.post('/create', postRouter, routerFunction)

// crypto.createHash('SHA-256').update('9981797954')

module.exports = routerPostCreate
