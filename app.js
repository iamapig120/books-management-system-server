const express = require('express')
const performance = require('perf_hooks').performance
const app = express()
const dbcon = require('./dbcon')
const dbInstance = dbcon.connect({
  host: 'localhost',
  user: 'root',
  password: 'Iamapig120',
  database: 'library'
})
const tables = dbInstance.tables

const crypto = require('crypto')
const redis = require('redis')
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
  password: 'redisPass'
})

/**
 * Redis 缓存检查机制
 * @param {Function} fun Router 处理函数，必须使用 req.send() 来返回数据
 * @param {number} expiredTime 缓存过期时间，默认值为 7 天
 * @description 参考了 https://www.jianshu.com/p/9852d59280ca
 */
const checkCache = (
  fun,
  expiredTime = 604800,
  getKeyFunction = request => {
    let query
    if (request.method === 'GET') {
      query = request.query
    } else {
      query = request.body
    }
    const hash = crypto
      .createHash('md5')
      .update(
        getKeyFunction(
          [request.method, request.url, JSON.stringify(query)].join('|')
        )
      )
      .digest('hex')
    return hash
  }
) => {
  return (req, res, next) => {
    const start = performance.now()
    const key = getKeyFunction(req)
    redisClient.get(key, (err, value) => {
      if (err) {
        throw err
      }
      if (value) {
        res.send.call(res, value)
        console.log('--响应用时: ', performance.now() - start)
      } else {
        const sendFunction = res.send
        res.send = resData => {
          sendFunction.call(res, resData)
          redisClient.setex(key, expiredTime, resData)
          console.log('--响应用时: ', performance.now() - start)
        }
        fun.call(null, req, res, next)
      }
    })
  }
}

const categories = tables.categories
/**
 * 图书分类上限数目，用于减小缓存大小
 */
let categoriesLimit
;(async () => {
  categoriesLimit = (await categories.select({
    orderBy: { id: false },
    limit: [0, 1]
  }))[0].id
  console.log('分类目录上限已读取: ')
  console.log('--上限数目为: ', categoriesLimit)
})()
/**
 * 图书分类 路由
 */
const routerCategories = express.Router()
const getCategoriesId = async (req, res, next) => {
  let parent_id = req.params.id
  if (parent_id === '0') {
    parent_id = null
  }
  const result = categories.select({
    where: {
      parent_id
    },
    orderBy: { id: true },
    columns: ['id', 'code', 'name']
  })
  res.send(JSON.stringify(await result))
  next()
}
routerCategories.get('/:id.json', (req, res, next) => {
  console.log('分类目录被请求: ')
  console.log('--请求方式为: ', req.method)
  console.log('--IP地址为: ', req.ip)
  console.log('--时间戳: ', Date.now())
  console.log('--分类目录ID: ', req.params.id)
  next()
})
routerCategories.get(
  '/:id.json',
  checkCache(getCategoriesId, undefined, req => {
    let id = parseInt(req.params.id)
    if (id > categoriesLimit) {
      id = -1
    }
    return 'json-categories-' + id
  })
)
app.use('/categories', routerCategories)
app.listen(3000, () => console.log('Express服务器已开始监听端口: 3000'))
// db.users.delete().confirm()
// db.users.update({ name: 'handle3', password: 'pass5' }, { id: 7 })
