const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const redisClient = require('../../lib/sql/redisClient')

module.exports = session({
  store: new RedisStore({
    client: redisClient, // Redis 客户端对象
    ttl: 604800 // Redis session TTL 过期时间 （秒）
  }), // 本地存储 Session（Redis）
  secret: "Schrödinger's cat", // 用来对 Session id相关的 cookie 进行签名
  saveUninitialized: false, // 是否自动保存未初始化的会话，建议 false
  resave: false, // 是否每次都重新保存会话，建议 false
  cookie: {
    maxAge: 604800 * 1000 // 有效期，单位是毫秒
  }
})
