const performance = require('perf_hooks').performance
const crypto = require('crypto')
const redisClient = require('../../sql/redisClient')
/**
 * Redis 缓存检查机制
 * @param {Function} handler Router 处理函数，必须使用 req.send() 来返回数据
 * @param {number} expiredTime 缓存过期时间单位为秒，默认值为 7 天即 604800 秒
 * @param {Function} getKeyFunction 获取 Redis Key 的函数
 * @description 参考了 https://www.jianshu.com/p/9852d59280ca
 */
const checkCache = (
  handler,
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
        handler.call(null, req, res, next)
      }
    })
  }
}
module.exports = checkCache
