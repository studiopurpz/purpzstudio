const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./database.sqlite")


db.all(
"SELECT * FROM orders",
[],
(err,rows)=>{

if(err){
console.log(err)
return
}


console.log(rows)

}
)