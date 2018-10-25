const express = require('express')
const app = express()

// 图书分类 Get 路由
const getCategories = require('./router/getCategories')

// 将所有路由设置到 app 上
app.use('/categories', getCategories)

// 开始监听端口
app.listen(3000, () => console.log('Express服务器已开始监听端口: 3000'))

// db.users.delete().confirm()
// db.users.update({ name: 'handle3', password: 'pass5' }, { id: 7 })
