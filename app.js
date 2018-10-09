const DB = require('./dbcon')
const connect = DB.connect
const db = DB.database
connect({
  host: 'localhost',
  user: 'root',
  password: 'Iamapig120',
  database: 'library',
  charset: 'utf8',
  waitForConnections: true,
  connectionLimit: 0xff,
  queueLimit: 0
})
const res1 = db.users.select({
  id: 4,
  name: 'handle'
})
const res2 = db.users.get({
  password: 'pass2'
})
const res3 = db.users.get({
  id: 7
})
;(async () => {
  console.log(
    'Res: ' +
      JSON.stringify(await res1) +
      '\nRes: ' +
      JSON.stringify(await res2) +
      '\nRes: ' +
      JSON.stringify(await res3)
  )
})()
// db.users.delete().confirm()
// db.users.update({ name: 'handle3', password: 'pass5' }, { id: 7 })