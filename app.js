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
    return [request.method, eq.url, JSON.stringify(query)].join('|')
  }
) => {
  return (req, res, next) => {
    const start = performance.now()
    const sendFunction = res.send
    const key = crypto
      .createHash('md5')
      .update(getKeyFunction(req))
      .digest('hex')
    redisClient.get(key, (err, value) => {
      if (err) {
        throw err
      }
      if (value) {
        sendFunction.call(res, value)
        console.log('--响应用时: ', performance.now() - start)
      } else {
        res.send = resData => {
          redisClient.setex(key, expiredTime, resData)
          sendFunction.call(res, resData)
          console.log('--响应用时: ', performance.now() - start)
        }
        fun.call(null, req, res, next)
      }
    })
  }
}

const routerCategories = express.Router()
const categories = tables.categories
const getCategoriesId = async (req, res, next) => {
  let parent_id = parseInt(req.params.id)
  if (parent_id === 0) {
    parent_id = null
  }
  const result = categories.select(
    {
      parent_id
    },
    { id: true },
    ['id', 'code', 'name']
  )
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
    return 'categories-' + req.params.id
  })
)

app.use('/categories', routerCategories)
app.listen(3000, () => console.log('Example app listening on port 3000!'))
// db.users.delete().confirm()
// db.users.update({ name: 'handle3', password: 'pass5' }, { id: 7 })
