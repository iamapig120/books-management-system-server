'use strict'

const dbcon = require('./mysqlConnect.js')
const dbInstance = dbcon.connect({
  host: 'localhost',
  user: 'root',
  password: 'Iamapig120',
  database: 'library'
})
module.exports = dbInstance
