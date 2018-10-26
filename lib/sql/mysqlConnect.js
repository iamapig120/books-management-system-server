'use strict'

const ColorLog = require('sim-color-log')
// 引入 mysql 库
const mysql = require('mysql')
if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth = 1) {
    if (!Array.isArray(this)) return this
    return this.reduce((accumulator, currentValue, currentIndex, array) => {
      return accumulator.concat(
        depth > 1
          ? Array.prototype.flat.call(currentValue, depth - 1)
          : currentValue
      )
    }, [])
  }
}

/**
 * 抛出一个异常，提示参数缺失
 */
const throwIfMissing = () => {
  throw new Error(`Missing parameter, check the parameters`)
}

function connect (
  {
    host = 'localhost',
    waitForConnections = true,
    connectionLimit = 0xff,
    queueLimit = 0,
    charset = 'utf8'
  } = throwIfMissing()
) {
  const pool = mysql.createPool(arguments[0])
  /**
   * Library数据库对象
   * @type {{[x: string]: DataBaseTool}}
   */
  const db = new Proxy(
    {},
    {
      /**
       * @returns {DataBaseTool}
       */
      get: (obj, tableName) => {
        if (!obj[tableName]) {
          obj[tableName] = {
            /**
             * Get方法，参数为两个对象，key为列名，value为值，第二个参数可选
             * @param {Object} [where] 一个对象，key为列名，value为值
             * @param {Object} [orderBy] 依照什么排序，key为列名，value为是否ASC升序，false为DESC降序，true则为ASC升序
             * @param {Array<string} [columns] 一个字符串数组，选取出哪些列
             * @param {Array<number} [limit] 一个大小2的数组，限制选取范围
             */
            select: ({
              where = {},
              orderBy = {},
              columns = [],
              limit = []
            } = {}) => {
              const paramsKeys = Object.keys(where)
              const paramsLength = paramsKeys.length
              const paramsIndex = paramsKeys.reduce(
                (previousValue, currentValue) => {
                  if (where[currentValue] === null) {
                    return (previousValue += '0')
                  } else {
                    return (previousValue += '1')
                  }
                },
                '0'
              )
              const orderKeys = Object.keys(orderBy)
              const orderIndex = orderKeys.reduce(
                (previousValue, currentValue) => {
                  if (orderBy[currentValue] === false) {
                    return (previousValue += '0')
                  } else {
                    return (previousValue += '1')
                  }
                },
                '0'
              )
              const orderByLength = orderKeys.length
              const columnsLength = columns.length
              const limitLength = limit.length
              let columnsString
              if (columnsLength === 0) {
                columnsString = '*'
              } else {
                columnsString = columns.map(() => '??').join(',')
              }
              if (
                !obj[tableName]._getString[
                  [columnsLength, paramsIndex, orderIndex, limitLength].join(
                    '-'
                  )
                ]
              ) {
                obj[tableName]._getString[
                  [columnsLength, paramsIndex, orderIndex, limitLength].join(
                    '-'
                  )
                ] = (() => {
                  let returnString = `SELECT ${columnsString} FROM ??`
                  if (paramsLength > 0) {
                    returnString += ' WHERE'
                    for (let i = 0; i < paramsLength - 1; i++) {
                      if (where[paramsKeys[i]] === null) {
                        returnString += ' ??<=>? AND'
                      } else {
                        returnString += ' ??=? AND'
                      }
                    }
                    if (where[paramsKeys[paramsLength - 1]] === null) {
                      returnString += ' ??<=>?'
                    } else {
                      returnString += ' ??=?'
                    }
                  }
                  if (orderByLength > 0) {
                    returnString += ' ORDER BY'
                    for (let i = 0; i < orderByLength - 1; i++) {
                      returnString += ' ??'
                      returnString += orderBy[orderKeys[i]] ? ' ASC,' : ' DESC,'
                    }
                    returnString += ' ??'
                    returnString += orderBy[orderKeys[orderByLength - 1]]
                      ? ' ASC'
                      : ' DESC'
                  }
                  if (limitLength === 2) {
                    returnString += ' LIMIT ?, ?'
                  }
                  return returnString
                })()
              }
              return new Promise((resolve, reject) => {
                pool.query(
                  obj[tableName]._getString[
                    [columnsLength, paramsIndex, orderIndex, limitLength].join(
                      '-'
                    )
                  ],
                  [
                    ...columns,
                    tableName,
                    ...Object.entries(where).flat(),
                    ...orderKeys,
                    ...limit
                  ],
                  (err, result, fields) => {
                    if (err) {
                      throw err
                    }
                    resolve(result)
                  }
                )
                ColorLog.log('执行了一条Select语句', 'MySQL')
              })
            },
            _getString: {},
            get: (...p) => obj[tableName].select(...p),
            /**
             * @param {Array[String|number|null]} params 所有新行的参数，按照表顺序传入
             */
            insert: (params = throwIfMissing()) => {
              const paramsLength = params.length
              if (!obj[tableName]._insertString[paramsLength]) {
                obj[tableName]._insertString[paramsLength] = (() => {
                  let returnString = 'INSERT INTO ?? VALUES ('
                  for (let i = 0; i < paramsLength - 1; i++) {
                    returnString += '?,'
                  }
                  returnString += ' ?)'
                  return returnString
                })()
              }
              return new Promise((resolve, reject) => {
                pool.query(
                  obj[tableName]._insertString[paramsLength],
                  [tableName, ...params],
                  (err, result, fields) => {
                    if (err) {
                      throw err
                    }
                    resolve(result)
                  }
                )
                ColorLog.log('执行了一条Insert语句', 'MySQL')
              })
            },
            _insertString: {},
            /**
             * @param {Object} params1 键值对1，用于表明要更新的内容
             * @param {Object} [params2] 键值对2，用于查找对应的行
             */
            update: (params1 = throwIfMissing(), params2 = {}) => {
              const params1Length = Object.keys(params1).length
              const param2Keys = Object.keys(params2)
              const params2Length = param2Keys.length
              const params2Index = param2Keys.reduce(
                (previousValue, currentValue) => {
                  if (params[currentValue] === null) {
                    return (previousValue += '0')
                  } else {
                    return (previousValue += '1')
                  }
                },
                ''
              )
              if (!obj[tableName]._updateString[params1Length][params2Index]) {
                obj[tableName]._updateString[params1Length][
                  params2Index
                ] = (() => {
                  let returnString = 'UPDATE ?? SET'
                  for (let i = 0; i < params1Length - 1; i++) {
                    returnString += ' ??=? ,'
                  }
                  returnString += ' ??=?'
                  if (params2Length > 0) {
                    returnString += ' WHERE'
                    for (let i = 0; i < params2Length - 1; i++) {
                      if (params2[param2Keys[i]] === null) {
                        returnString += ' ??<=>? AND'
                      } else {
                        returnString += ' ??=? AND'
                      }
                    }
                    if (params2[param2Keys[params2Length - 1]] === null) {
                      returnString += ' ??<=>?'
                    } else {
                      returnString += ' ??=?'
                    }
                  }
                  return returnString
                })()
              }
              return new Promise((resolve, reject) => {
                pool.query(
                  obj[tableName]._updateString[params1Length][params2Index],
                  [
                    tableName,
                    ...Object.entries(params1).flat(),
                    ...Object.entries(params2).flat()
                  ],
                  (err, result, fields) => {
                    if (err) {
                      throw err
                    }
                    resolve(result)
                  }
                )
                ColorLog.log('执行了一条Update语句', 'MySQL')
              })
            },
            _updateString: new Proxy(
              {},
              {
                get: (obj, prop0) => {
                  if (!obj[prop0]) {
                    obj[prop0] = {}
                  }
                  return obj[prop0]
                }
              }
            ),
            /**
             * Del方法，参数为一个对象，key为列名，value为值
             * @param {Object} [params] 一个对象，key为列名，value为值
             */
            delete: (params = {}) => {
              const paramsKeys = Object.keys(params)
              const paramsLength = paramsKeys.length
              const paramsIndex = paramsKeys.reduce(
                (previousValue, currentValue) => {
                  if (params[currentValue] === null) {
                    return (previousValue += '0')
                  } else {
                    return (previousValue += '1')
                  }
                },
                ''
              )
              if (!obj[tableName]._deleteString[paramsIndex]) {
                obj[tableName]._deleteString[paramsIndex] = (() => {
                  let returnString = 'DELETE FROM ??'
                  if (paramsLength > 0) {
                    returnString += ' WHERE'
                    for (let i = 0; i < paramsLength - 1; i++) {
                      if (params[paramsKeys[i]] === null) {
                        returnString += ' ??<=>? AND'
                      } else {
                        returnString += ' ??=? AND'
                      }
                    }
                    if (params[paramsKeys[paramsLength - 1]] === null) {
                      returnString += ' ??<=>?'
                    } else {
                      returnString += ' ??=?'
                    }
                  }
                  return returnString
                })()
              }
              const confirmFun = () =>
                new Promise((resolve, reject) => {
                  pool.query(
                    obj[tableName]._deleteString[paramsIndex],
                    [tableName, ...Object.entries(params).flat()],
                    (err, result, fields) => {
                      if (err) {
                        throw err
                      }
                      resolve(result)
                    }
                  )
                  ColorLog.warn('执行了一条Delete语句！', 'MySQL')
                })
              if (paramsLength > 0) {
                ColorLog.warn('正在尝试执行Delete语句！', 'MySQL')
                return confirmFun()
              } else {
                return { confirm: () => confirmFun() }
              }
            },
            _deleteString: {},
            /**
             * 按照条件，对某列或全部行进行计数
             */
            count: (column, where) => {
              const columnsKeys = Object.keys(column)
              const columnsLenght = columnsKeys.length
              if (columnsLenght > 1) {
                throw Error('Count columns too much.')
              }
              const whereKeys = Object.keys(where)
              const whereLength = whereKeys.length
              const whereIndex = whereLength.reduce(
                (previousValue, currentValue) => {
                  if (params[currentValue] === null) {
                    return (previousValue += '0')
                  } else {
                    return (previousValue += '1')
                  }
                },
                ''
              )
              if (
                !obj[tableName]._countString[
                  [columnsKeys, whereIndex].join('-')
                ]
              ) {
                obj[tableName]._countString[
                  [columnsKeys, whereIndex].join('-')
                ] = () => {
                  let returnString
                  if (columnsLenght === 0) {
                    returnString = 'SELECT COUNT(*) FROM ??'
                  } else {
                    returnString = 'SELECT COUNT(?) AS ? FROM ??'
                  }
                  if (whereKeys > 0) {
                    returnString += ' WHERE'
                    for (let i = 0; i < whereLength - 1; i++) {
                      if (params[whereKeys[i]] === null) {
                        returnString += ' ??<=>? AND'
                      } else {
                        returnString += ' ??=? AND'
                      }
                    }
                    if (params[whereKeys[whereLength - 1]] === null) {
                      returnString += ' ??<=>?'
                    } else {
                      returnString += ' ??=?'
                    }
                  }
                  return returnString
                }
              }
              return new Promise((resolve, reject) => {
                pool.query(
                  obj[tableName]._countString[
                    [columnsKeys, whereIndex].join('-')
                  ],
                  [
                    ...Object.entries(column).flat(),
                    tableName,
                    ...Object.entries(where).flat()
                  ],
                  (err, result, fields) => {
                    if (err) {
                      throw err
                    }
                    resolve(result)
                  }
                )
                ColorLog.warn(
                  '执行了一条Select语句，并提供了Count操作',
                  'MySQL'
                )
              })
            },
            _countString: {}
            /**
             * 直接执行查询，表名并不会起到任何作用
             * @param {string} sqlStr 要进行填充的SQL语句
             * @param {Array<string|null|number>} params 一个数组，按顺序包含SQL语句的所有的参数
             * @return {Promise<any>} 返回一个Promise对象
             */
            // query: directQuery
          }
        }
        return Object.freeze(obj[tableName])
      },
      set: (obj, prop, value) => {
        return false
      }
    }
  )
  /**
   * 直接对数据库本身执行查询
   * @param {string} sqlStr 要进行填充的SQL语句
   * @param {Array<string|null|number>} [params] 一个数组，按顺序包含SQL语句的所有的参数
   * @return {Promise<any>} 返回一个Promise对象
   */
  const directQuery = (sqlStr = throwIfMissing(), params) => {
    return new Promise(
      (resolve,
      reject => {
        pool.query(sqlStr, params, (err, result, fields) => {
          if (err) {
            throw err
          }
          resolve(result)
        })
      })
    )
  }
  return {
    tables: db,
    query: directQuery
  }
}
module.exports = {
  connect: connect
}
