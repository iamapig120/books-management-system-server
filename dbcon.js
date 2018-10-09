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
 * 一个连接池
 * @type {Pool}
 */
let pool

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
           * @param {Object} params 一个对象，key为列名，value为值
           * @param {Object} orderBy 依照什么排序，key为列名，value为是否ASC升序，false为DESC降序，true则为ASC升序
           */
          get: (params = {}, orderBy = {}) => {
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
          select: (...p) => obj[prop0].get(...p),
          /**
           * @param {Array[String|number|null]} params 所有新行的参数，按照表顺序传入
           */
          insert: (...params) => {
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
          update: (params1, params2) => {
            const params1Length = Object.keys(params1).length
            const params2Length = Object.keys(params2).length
            if (!obj[prop0]._updateString[params1Length][params2Length]) {
              obj[prop0]._updateString[params1Length][params2Length] = (() => {
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
           * @param {Object} params 一个对象，key为列名，value为值
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
        }
      }
      return Object.freeze(obj[prop0])
    },
    set: (obj, prop, value) => {
      return false
    }
  }
)
const connect = p => {pool = mysql.createPool(p)}
module.exports = {
  connect: connect,
  database: db
}
