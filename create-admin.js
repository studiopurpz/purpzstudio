const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')


const db = new sqlite3.Database('./database.sqlite')


const username = "PURPZ"
const password = "Purpzadmin12!@"


bcrypt.hash(password,10,(err,hash)=>{


db.run(
"INSERT INTO admins(username,password) VALUES(?,?)",
[
username,
hash
],
(err)=>{

if(err){

console.log(err)

}else{

console.log("Admin dodany")

}

db.close()

})


})