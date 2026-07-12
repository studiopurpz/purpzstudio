const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./database.sqlite')

db.run(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)
`, (err) => {

  if(err){
    console.error(err)
  } else {
    console.log("Tabela admins utworzona")
  }

  db.close()

})