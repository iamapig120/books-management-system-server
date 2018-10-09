// 引入 mysql2 库
const mysql = require('mysql')
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   database: 'library'
//   charset:'utf8',
// })
// 建立一个连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Iamapig120',
  database: 'library',
  charset: 'utf8',
  waitForConnections: true,
  connectionLimit: 63,
  queueLimit: 0
})

const db = new Proxy(
  {},
  {
    get: (obj, prop0) => {
      if (!obj[prop0]) {
        obj[prop0] = new Proxy(
          {
            remove: id => {
              return new Promise((resolve, reject) => {
                pool.query('DELETE FROM ?? WHERE id = ?', [prop0, id]),
                  (err, results, fields) => {
                    if (err) {
                      //reject(err)
                      throw err
                      return
                    }
                    resolve(results)
                    //console.log('Deled: ' + results.changedRows + ' Rows')
                  }
              })
            }
          },
          {
            get: (obj, prop1) => {
              if (!obj[prop1]) {
                obj[prop1] = prop2 => {
                  return new Promise((resolve, reject) =>
                    pool.query(
                      `SELECT * FROM ?? WHERE ?? = ?`,
                      [prop0,prop1,prop2],
                      (err, results) => {
                        if (err) {
                          reject(err)
                          throw err
                          return
                        }
                        resolve(results)
                      }
                    )
                  )
                }
              }
              return obj[prop1]
            },
            set: (obj, prop1, value) => {}
          }
        )
      }
      return obj[prop0]
    },
    set: (obj, prop, value) => {
      return false
    }
  }
)
db.users.name('handle').then(v => {
  if (v.length > 0) {
    console.log('Res:' + JSON.stringify(v))
  } else {
    console.warn('No Results.')
  }
})
db.users.password('pass2').then(v => {
  if (v.length > 0) {
    console.log('Res:' + JSON.stringify(v))
  } else {
    console.warn('No Results.')
  }
})
db.users.password('pass3').then(v => {
  if (v.length > 0) {
    console.log('Res:' + JSON.stringify(v))
  } else {
    console.warn('No Results.')
  }
})
// db.users.remove('3').then(v=>{
//   console.log('Removed: ' + v.changedRows + ' rows')
// })