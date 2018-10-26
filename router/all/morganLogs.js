// 按日期 Log ，参考了 https://www.jianshu.com/p/ff6763c7d823
'use strict'

const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const FileStreamRotator = require('file-stream-rotator')

/**
 * Log 文件存储路径
 */
const logDirectory = path.join(process.cwd(), '/logs')

// 如果不存在目录，则创建
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory)
}

const accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, '/%DATE%.log'),
  frequency: 'daily',
  verbose: false
})

morgan.format(
  'normal',
  ':remote-addr [:date] :method :url :status - :response-time ms'
)

module.exports = morgan('normal', { stream: accessLogStream })
