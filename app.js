const dbcon = require('./dbcon')
const dbInstance = dbcon.connect({
  host: 'localhost',
  user: 'root',
  password: 'Iamapig120',
  database: 'library'
})
const tables = dbInstance.tables
const res1 = tables.users.select({
  id: 4,
  name: 'handle'
})
const res2 = tables.users.get({
  password: 'pass2'
})
const res3 = tables.users.get({
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
