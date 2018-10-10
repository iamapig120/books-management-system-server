// 引入 mysql 库
const mysql = require('mysql')
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth = 1) {
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

function connect(
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
      get: (obj, prop0) => {
        if (!obj[prop0]) {
          obj[prop0] = {
            /**
             * Get方法，参数为两个对象，key为列名，value为值，第二个参数可选
             * @param {Object} [params] 一个对象，key为列名，value为值
             * @param {Object} [orderBy] 依照什么排序，key为列名，value为是否ASC升序，false为DESC降序，true则为ASC升序
             */
            select: (params = {}, orderBy = {}) => {
              const paramsLength = Object.keys(params).length
              const orderKeys = Object.keys(orderBy)
              const orderByLength = orderKeys.length
              if (!obj[prop0]._getString[paramsLength][orderByLength]) {
                obj[prop0]._getString[paramsLength][orderByLength] = (() => {
                  let returnString = 'SELECT * FROM ??'
                  if (paramsLength > 0) {
                    returnString += ' WHERE'
                    for (let i = 0; i < paramsLength - 1; i++) {
                      returnString += ' ??=? AND'
                    }
                    returnString += ' ??=?'
                  }
                  if (orderByLength > 0) {
                    returnString += ' ORDER BY'
                    for (let i = 0; i < orderByLength - 1; i++) {
                      returnString += ' ?'
                      returnString += orderKeys[i] ? ' ASC,' : ' DESC,'
                    }
                    returnString += ' ?'
                    returnString += orderKeys[i] ? ' ASC' : ' DESC'
                  }
                  return returnString
                })()
              }
              return new Promise((resolve, reject) => {
                pool.query(
                  obj[prop0]._getString[paramsLength][orderByLength],
                  [
                    prop0,
                    ...(() => Object.entries(params).flat())(),
                    ...orderKeys
                  ],
                  (err, result, fields) => {
                    if (err) {
                      reject(err)
                    }
                    resolve(result)
                  }
                )
              })
            },
            _getString: new Proxy(
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
            get: (...p) => obj[prop0].select(...p),
            /**
             * @param {Array[String|number|null]} params 所有新行的参数，按照表顺序传入
             */
            insert: (params = throwIfMissing()) => {
              const paramsLength = params.length
              if (!obj[prop0]._insertString[paramsLength]) {
                obj[prop0]._insertString[paramsLength] = (() => {
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
                  obj[prop0]._insertString[paramsLength],
                  [prop0, ...params],
                  (err, result, fields) => {
                    if (err) {
                      reject(err)
                    }
                    resolve(result)
                  }
                )
              })
            },
            _insertString: {},
            /**
             * @param {Object} params1 键值对1，用于表明要更新的内容
             * @param {Object} params2 键值对2，用于查找对应的行
             */
            update: (params1 = throwIfMissing(), [params2]) => {
              const params1Length = Object.keys(params1).length
              const params2Length = Object.keys(params2).length
              if (!obj[prop0]._updateString[params1Length][params2Length]) {
                obj[prop0]._updateString[params1Length][
                  params2Length
                ] = (() => {
                  let returnString = 'UPDATE ?? SET'
                  for (let i = 0; i < params1Length - 1; i++) {
                    returnString += ' ??=? ,'
                  }
                  returnString += ' ??=? WHERE'
                  for (let i = 0; i < params2Length - 1; i++) {
                    returnString += ' ??=? AND'
                  }
                  returnString += ' ??=?'
                  return returnString
                })()
              }
              return new Promise((resolve, reject) => {
                pool.query(
                  obj[prop0]._updateString[params1Length][params2Length],
                  [
                    prop0,
                    ...(() => Object.entries(params1).flat())(),
                    ...(() => Object.entries(params2).flat())()
                  ],
                  (err, result, fields) => {
                    console.log(
                      obj[prop0]._updateString[params1Length][params2Length]
                    )
                    console.log([
                      prop0,
                      ...(() => Object.entries(params1).flat())(),
                      ...(() => Object.entries(params2).flat())()
                    ])
                    if (err) {
                      reject(err)
                    }
                    resolve(result)
                  }
                )
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
              const paramsLength = Object.keys(params).length
              if (!obj[prop0]._deleteString[paramsLength]) {
                obj[prop0]._deleteString[paramsLength] = (() => {
                  let returnString = 'DELETE FROM ??'
                  if (paramsLength > 0) {
                    returnString += ' WHERE'
                    for (let i = 0; i < paramsLength - 1; i++) {
                      returnString += ' ??=? AND'
                    }
                    returnString += ' ??=?'
                  }
                  return returnString
                })()
              }
              const confirmFun = () =>
                new Promise((resolve, reject) => {
                  pool.query(
                    obj[prop0]._deleteString[paramsLength],
                    [
                      prop0,
                      ...(() => Object.entries(params).flat())(),
                      ...orderKeys
                    ],
                    (err, result, fields) => {
                      if (err) {
                        reject(err)
                      }
                      resolve(result)
                    }
                  )
                })
              if (paramsLength > 0) {
                return confirmFun()
              } else {
                return { confirm: () => confirmFun() }
              }
            },
            _deleteString: {}
            /**
             * 直接执行查询，表名并不会起到任何作用
             * @param {string} sqlStr 要进行填充的SQL语句
             * @param {Array<string|null|number>} params 一个数组，按顺序包含SQL语句的所有的参数
             * @return {Promise<any>} 返回一个Promise对象
             */
            //query: directQuery
          }
        }
        return Object.freeze(obj[prop0])
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
      reject0 => {
        pool.query(sqlStr, params, (err, result, fields) => {
          if (err) {
            reject(err)
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
