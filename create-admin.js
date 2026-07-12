const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')

const db = new sqlite3.Database('./database.sqlite')

bcrypt.hash('Purpzadmin12!@',10,(err,hash)=>{

  db.run(
    'INSERT INTO admins(username,password) VALUES(?,?)',
    ['PURPZ',hash],
    (err)=>{
      if(err){
        console.log(err)
      }else{
        console.log('Admin utworzony')
      }
      db.close()
    }
  )

})