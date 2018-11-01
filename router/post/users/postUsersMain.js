'use strict'

const express = require('express')
/**
 * 用户 Post 总路由
 */
const routerUsersMain = express.Router()

// 登录 Post 路由
const postLogin = require('./login/postLogin')
// 登出 Post 路由
const postLogout = require('./login/postLogout')

routerUsersMain.use('/users', postLogin, postLogout)

module.exports = routerUsersMain
