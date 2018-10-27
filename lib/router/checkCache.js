'use strict'

const crypto = require('crypto')
const ColorLog = require('sim-color-log')
const redisClient = require('../sql/redisClient')

/**
 * Redis 缓存检查机制
 * @param {Function} handler Router 处理函数，必须使用 req.send() 来返回数据
 * @param {number} expiredTime 缓存过期时间单位为秒，默认值为 7 天即 604800 秒
 * @param {Function} getKeyFunction 获取 Redis Key 的函数
 * @description 参考了 https://www.jianshu.com/p/9852d59280ca
 */
const checkCache = ({
  handler,
  expiredTime = 604800,
  hashKey,
  getKeyFun = request => {
    let query
    if (request.method === 'GET') {
      query = request.query
    } else {
      query = request.body
    }
    const hash = crypto
      .createHash('md5')
      .update(
        getKeyFun(
          [request.method, request.url, JSON.stringify(query)].join('|')
        )
      )
      .digest('hex')
    return hash
  }
} = {}) => {
  return (req, res, next) => {
    const key = getKeyFun(req)
    const getValueCallback = (err, value) => {
      if (err) {
        throw err
      }
      if (value) {
        res.send(value)
        next()
      } else {
        const sendFunction = res.send
        res.send = resData => {
          sendFunction.call(res, resData)
          if (hashKey) {
            redisClient.hset(hashKey, key, resData)
            ColorLog.log(`已成功设置 ${key} 的值于 Set "${hashKey}" 内`, 'REDIS')
          } else {
            redisClient.setex(key, expiredTime, resData)
            ColorLog.log(
              `已成功设置 ${key} 的值，缓存有效期 ${expiredTime} 秒`,
              'REDIS'
            )
          }
        }
        handler(req, res, next)
      }
    }
    if (hashKey) {
      redisClient.hget(hashKey, key, getValueCallback)
    } else {
      redisClient.get(key, getValueCallback)
    }
  }
}
module.exports = checkCache
