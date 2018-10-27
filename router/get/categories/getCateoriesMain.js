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

routerCategoriesMain.use('/categories', getCategories, getCategoryChains)

module.exports = routerCategoriesMain
