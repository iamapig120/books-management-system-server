'use strict'

const express = require('express')
/**
 * 用户 Post 总路由
 */
const routerBooksMain = express.Router()

// 新增书籍 Post 路由
const postCreate = require('./create/postCreate')
// 检查满足用户组 路由
const checkUserGroup = require('../../all/checkUserGroup')

routerBooksMain.use('/books', checkUserGroup(1), postCreate)

module.exports = routerBooksMain
