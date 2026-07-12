const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./database.sqlite')

db.all(
  'SELECT id, username FROM admins',
  [],
  (err, rows) => {

    if(err){
      console.error(err)
    } else {
      console.log(rows)
    }

    db.close()

  }
)