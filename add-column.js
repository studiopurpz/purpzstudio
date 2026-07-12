const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./database.sqlite")


db.run(`
ALTER TABLE orders 
ADD COLUMN stripe_id TEXT
`, (err)=>{

if(err){
    console.log(err)
}else{
    console.log("Dodano stripe_id")
}

db.close()

})