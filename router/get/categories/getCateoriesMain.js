'use strict'

const express = require('express')
/**
 * 图书分类 总路由
 */
const routerCategoriesMain = express.Router()

// 图书分类 Get 路由
const getCategories = require('./includes/getCategories')
// 图书分类链 Get 路由
const getCategoryChains = require('./chains/getCategoryChains')

// 检查是否已登录 路由
const checkLogined = require('../../all/checkLogined')

// 检查满足用户组 路由
const checkUserGroup = require('../../all/checkUserGroup')

routerCategoriesMain.use(
  '/categories',
  checkLogined,
  checkUserGroup(1),
  getCategories,
  getCategoryChains
)

module.exports = routerCategoriesMain
