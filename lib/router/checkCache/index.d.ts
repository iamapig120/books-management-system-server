/// <reference types="node" />
import express = require('express')
/**
 * 包装路由函数，以用于检查 Redis 缓存
 * @description 参考了 https://www.jianshu.com/p/9852d59280ca
 */
declare const checkCache: (
  /**
   * Router 处理函数，必须使用 req.send() 来返回数据
   */
  handler: express.RequestHandler,
  /**
   * 缓存过期时间单位为秒，默认值为 7 天即 604800 秒
   */
  expiredTime?: number,
  /**
   * 获取 Redis Key 的函数
   */
  getKeyFunction?: (request: express.Request) => string
) => void

module.exports = checkCache
