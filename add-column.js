const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./database.sqlite")


db.serialize(()=>{

db.run(`
ALTER TABLE orders ADD COLUMN start_date TEXT
`)

db.run(`
ALTER TABLE orders ADD COLUMN start_hour TEXT
`)

db.run(`
ALTER TABLE orders ADD COLUMN end_date TEXT
`)

db.run(`
ALTER TABLE orders ADD COLUMN end_hour TEXT
`)

})


db.close(()=>console.log("Dodano kolumny"))