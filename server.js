require('dotenv').config()

const express = require('express')
const app = express()

const stripe = require('stripe')(process.env.STRIPE_KEY)

const cors = require('cors')
const path = require('path')
const fs = require('fs')

const bodyParser = require('body-parser')

const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const session = require('express-session')


const RES_FILE = path.join(__dirname,'reservations.json')

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET



// =========================
// MIDDLEWARE
// =========================


app.use(cors())


app.use(session({

secret:"PURPZ_SECRET_KEY",

resave:false,

saveUninitialized:false

}))



app.use(express.static(
path.join(__dirname,'public')
))



console.log(
"Stripe:",
process.env.STRIPE_KEY ? "OK" : "BRAK"
)



// =========================
// SQLITE
// =========================


const db = new sqlite3.Database(
'./database.sqlite'
)



// ADMINI

db.run(`

CREATE TABLE IF NOT EXISTS admins(

id INTEGER PRIMARY KEY AUTOINCREMENT,

username TEXT UNIQUE NOT NULL,

password TEXT NOT NULL

)

`)



// ZAMÓWIENIA / KLIENCI


db.run(`
CREATE TABLE IF NOT EXISTS orders (

id INTEGER PRIMARY KEY AUTOINCREMENT,

name TEXT,
email TEXT,
phone TEXT,

service TEXT,

price INTEGER,

status TEXT DEFAULT 'oczekuje',

stripe_id TEXT,

start_date TEXT,
start_hour TEXT,

end_date TEXT,
end_hour TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`)

function addColumn(column){

db.run(
`ALTER TABLE orders ADD COLUMN ${column} TEXT`,
(err)=>{

if(err && !err.message.includes("duplicate column")){
console.log(err)
}

})

}


addColumn("stripe_id")
addColumn("start_date")
addColumn("start_hour")
addColumn("end_date")
addColumn("end_hour")



// =========================
// FUNKCJE POMOCNICZE
// =========================



function createOrder(data){

return new Promise((resolve,reject)=>{


db.run(

`

INSERT INTO orders

(
name,
email,
phone,
service,
price,
status,
stripe_id,
start_date,
start_hour,
end_date,
end_hour
)

VALUES(?,?,?,?,?,?,?,?,?,?,?)

`,

[

data.name,
data.email,
data.phone,
data.service,
data.price

],


function(err){


if(err){

console.log(err)

reject(err)

}

else{

resolve(this.lastID)

}


}


)


})

}





function readReservations(){

try{


if(!fs.existsSync(RES_FILE))
return {}


const data =
fs.readFileSync(
RES_FILE,
'utf8'
)


if(!data)
return {}


return JSON.parse(data)


}catch(err){


console.log(err)

return {}

}


}




function saveReservations(data){

fs.writeFileSync(

RES_FILE,

JSON.stringify(
data,
null,
2
)

)

}

// =========================
// ADMIN LOGIN
// =========================


app.post('/admin-login', express.json(), (req,res)=>{


const {
username,
password

}=req.body



db.get(

"SELECT * FROM admins WHERE username=?",

[username],

async(err,user)=>{


if(err){

console.log(err)

return res.json({
success:false
})

}



if(!user){

console.log("Nie znaleziono admina")

return res.json({
success:false
})

}



const match =
await bcrypt.compare(
password,
user.password
)



if(match){


req.session.admin=true


return res.json({

success:true

})


}



res.json({

success:false

})



}

)


})





function requireAdmin(req,res,next){


if(req.session.admin){

next()

}else{


res.redirect(
'/admin/admin-login.html'
)


}


}



app.get(
'/admin/adminpanel.html',
requireAdmin,
(req,res)=>{


res.sendFile(

path.join(
__dirname,
'public',
'admin',
'adminpanel.html'

)

)


}

)



app.get('/admin-logout',(req,res)=>{


req.session.destroy(()=>{


res.redirect(
'/admin/admin-login.html'
)


})


})





// =========================
// REZERWACJE API
// =========================



app.get(
'/api/reservations',
(req,res)=>{


res.json(
readReservations()
)


})





// =========================
// WYNAJEM STUDIA
// =========================



app.post(
'/create-checkout-session',
express.json(),

async(req,res)=>{


const { 
name,
email,
phone,
startDate,
startHour,
endDate,
endHour,
totalPrice,
service
} = req.body




try{


const orderId =
await createOrder({

name,
email,
phone,

service:
"Wynajem studia",

price:
totalPrice


})




const session =
await stripe.checkout.sessions.create({



payment_method_types:[

'card',
'blik'

],


mode:'payment',



line_items:[{

price_data:{


currency:'pln',


product_data:{


name:
`Studio ${startDate} ${startHour}-${endHour}`


},


unit_amount:
totalPrice


},


quantity:1


}],




success_url:

'https://purpzstudio.pl/success.html',



cancel_url:

'https://purpzstudio.pl/cancel.html',




metadata: {

name,
email,
phone,

service,

startDate,
startHour,
endDate,
endHour,

price: totalPrice

}



})



res.json({

url:
session.url

})




}catch(err){


console.log(err)

res.status(500).json({

error:
err.message

})


}



})






// =========================
// PAKIETY
// =========================



app.post(

'/create-package-checkout',

express.json(),


async(req,res)=>{


const {
name,
price,
clientName,
email,
phone,
service
}=req.body





try{


const orderId =
await createOrder({

name,

email,

phone,


service:
`Pakiet ${packageName}`,


price


})




const session =
await stripe.checkout.sessions.create({



payment_method_types:[

'card',
'blik'

],



mode:'payment',




line_items:[{


price_data:{


currency:'pln',


product_data:{


name:
`Pakiet ${packageName}`


},


unit_amount:
price



},



quantity:1


}],




success_url:

'https://purpzstudio.pl/success.html',



cancel_url:

'https://purpzstudio.pl/cancel.html',




metadata: {

type:"package",

name:clientName,

email,

phone,

service,

product:name,

price

}



})



res.json({

url:
session.url

})



}catch(err){


console.log(err)

res.status(500).json({

error:err.message

})


}



})







// =========================
// MIX / MASTERING
// =========================



app.post(

'/create-mix-checkout',

express.json(),


async(req,res)=>{


const {

name,

email,

phone,

drive,

tracks,

service,

express,

reference,

description,

totalPrice

}=req.body






try{


const orderId =
await createOrder({


name,

email,

phone,


service:
"Mix / Mastering",


price:
totalPrice


})





const session =
await stripe.checkout.sessions.create({



payment_method_types:[

'card',
'blik'

],


mode:'payment',



line_items:[{

price_data:{


currency:'pln',



product_data:{


name:
`${service} ${tracks}`


},


unit_amount:
totalPrice


},


quantity:1


}],




success_url:

'https://purpzstudio.pl/success.html',



cancel_url:

'https://purpzstudio.pl/cancel.html',




metadata: {

name,

email,

phone,

service,

product:"Mix Mastering",

tracks,

express,

drive,

reference,

description,

price:totalPrice

}


})




res.json({

url:
session.url

})





}catch(err){


console.log(err)

res.status(500).json({

error:
err.message

})


}



})

// =========================
// STRIPE WEBHOOK
// =========================


app.post(
'/webhook',
bodyParser.raw({
type:'application/json'
}),

(req,res)=>{


const sig =
req.headers['stripe-signature']


let event



try{


event =
stripe.webhooks.constructEvent(
req.body,
sig,
WEBHOOK_SECRET
)



}catch(err){


console.log(
"Webhook Error:",
err.message
)


return res.status(400).send(
`Webhook Error: ${err.message}`
)


}




if(event.type === 'checkout.session.completed'){


const session = event.data.object

const data = session.metadata



db.run(

`

INSERT INTO orders

(
name,
email,
phone,
service,
price,
status,
stripe_id,
start_date,
start_hour,
end_date,
end_hour
)

VALUES(?,?,?,?,?,?,?,?,?,?,?)

`,

[
data.name || "",

data.email || "",

data.phone || "",

data.service || data.product || "",

Number(data.price) / 100,

"opłacone",

session.id,

data.startDate || "",

data.startHour || "",

data.endDate || "",

data.endHour || ""

],


(err)=>{

if(err){

console.log(
"Błąd zapisu zamówienia:",
err
)

}else{

console.log(
"Zapisano zamówienie klienta"
)

}

}


)






// jeżeli to rezerwacja studia


if(
data.startDate
){



const {

startDate,

startHour,

endDate,

endHour


}=data




const reservations =
readReservations()



let start =
new Date(
startDate+"T"+startHour
)


let end =
new Date(
endDate+"T"+endHour
)




if(end<=start){

end =
new Date(
start.getTime()
+
60*60*1000
)

}




while(start<end){



const date =
start.toISOString()
.split('T')[0]



const hStart =
start.getHours()
.toString()
.padStart(2,'0')
+
":00"



const next =
new Date(
start.getTime()
+
60*60*1000
)



const hEnd =
next.getHours()
.toString()
.padStart(2,'0')
+
":00"




if(!reservations[date])

reservations[date]=[]




reservations[date].push({

start:hStart,

end:hEnd

})



start=next



}




saveReservations(
reservations
)



console.log(
"Zapisano rezerwację:",
session.id
)



}



console.log(
"Płatność zakończona:",
session.id
)



}



res.json({
received:true
})



})







// =========================
// ADMIN API
// =========================



// wszystkie zamówienia

app.get(
'/api/admin/orders',

requireAdmin,

(req,res)=>{


db.all(

`

SELECT *

FROM orders

ORDER BY created_at DESC

`,

[],

(err,rows)=>{


if(err){

return res.status(500).json(err)

}


res.json(rows)


}


)


})







// statystyki


app.get(

'/api/admin/stats',

requireAdmin,

(req,res)=>{


db.get(

`

SELECT

COUNT(*) as orders,

SUM(price) as income,

COUNT(DISTINCT email) as clients

FROM orders

WHERE status='opłacone'

`,

[],

(err,row)=>{


if(err){

return res.status(500).json(err)

}



res.json({

orders:
row.orders || 0,


income:
row.income || 0,


clients:
row.clients || 0


})


}



)



}

)






// =========================
// START SERVERA
// =========================



const PORT =
process.env.PORT || 4242



app.listen(

PORT,

()=>{

console.log(
`Server running on port ${PORT}`
)

}

)