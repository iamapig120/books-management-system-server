'use strict'

const databaseConnect = require('./mysqlConnect.js')
const databaseInstance = databaseConnect.connect({
  host: 'localhost',
  user: 'root',
  password: 'Iamapig120',
  database: 'library'
})
module.exports = databaseInstance
