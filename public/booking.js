const calendar = document.getElementById("calendar")
const monthYear = document.getElementById("monthYear")
const panel = document.getElementById("dayInfoPanel")
const title = document.getElementById("selectedDateTitle")
const list = document.getElementById("reservedHoursList")

const startDateInput = document.getElementById("startDate")
const endDateInput = document.getElementById("endDate")
const startHourSelect = document.getElementById("startHour")
const endHourSelect = document.getElementById("endHour")
const priceDisplay = document.getElementById("price")
const reserveBtn = document.getElementById("reserveBtn")
const promoCodeInput = document.getElementById("promoCode")


let currentDate = new Date()
let reservations = {}
let discount = 0


const hours=[]

for(let h=0; h<24; h++){
    hours.push(
        h.toString().padStart(2,"0")+":00"
    )
}


const months=[
"Styczeń","Luty","Marzec","Kwiecień",
"Maj","Czerwiec","Lipiec","Sierpień",
"Wrzesień","Październik","Listopad","Grudzień"
]


function formatDate(date){

const y=date.getFullYear()
const m=(date.getMonth()+1).toString().padStart(2,"0")
const d=date.getDate().toString().padStart(2,"0")

return `${y}-${m}-${d}`

}



function getDayStatus(dateStr){

const dayReservations = reservations[dateStr]

if(!dayReservations || dayReservations.length===0)
return "free"


if(
dayReservations.length===1 &&
dayReservations[0].start==="00:00" &&
dayReservations[0].end==="24:00"
)
return "full"


return "partial"

}



function isHourReserved(dateStr,hour){

const dayReservations = reservations[dateStr]

if(!dayReservations)
return false


for(const r of dayReservations){

const start =
parseInt(r.start.split(":")[0])

const end =
parseInt(r.end.split(":")[0])

const current =
parseInt(hour.split(":")[0])


if(current>=start && current<end)
return true

}

return false

}





async function renderCalendar(){

calendar.innerHTML=""


try{

const res = await fetch('/api/reservations')

reservations = await res.json()


}catch(err){

console.log(
"Nie pobrano rezerwacji",
err
)

}



const year=currentDate.getFullYear()
const month=currentDate.getMonth()


monthYear.innerText =
`${months[month]} ${year}`



const firstDay =
new Date(year,month,1)


let startDay =
firstDay.getDay()


if(startDay===0)
startDay=7



const days =
new Date(year,month+1,0).getDate()



for(let i=1;i<startDay;i++){

calendar.appendChild(
document.createElement("div")
)

}




for(let day=1;day<=days;day++){


const date =
new Date(year,month,day)


const dateStr =
formatDate(date)



const div =
document.createElement("div")


div.className="day"

div.innerText=day



const now=new Date()

const diff =
(date-now)/(1000*60*60)



if(diff<48){

div.classList.add(
"disabled-day"
)


}else{


const status =
getDayStatus(dateStr)



if(status==="free")
div.classList.add(
"fully-free"
)


if(status==="partial")
div.classList.add(
"partially-booked"
)


if(status==="full")
div.classList.add(
"fully-booked"
)



div.onclick=()=>{


showDayInfo(dateStr)


startDateInput.value=dateStr

endDateInput.value=dateStr


calculatePrice()


}


}



calendar.appendChild(div)


}


}






function showDayInfo(dateStr){

title.innerText=dateStr

list.innerHTML=""


const dayReservations =
reservations[dateStr]



if(!dayReservations){


list.innerHTML=
"Wszystkie godziny wolne"


}else{


list.innerHTML=
"<b>Zarezerwowane:</b><br><br>"



dayReservations.forEach(r=>{


const div =
document.createElement("div")


div.className=
"reserved-block"


div.innerText =
`${r.start} - ${r.end}`


list.appendChild(div)


})


}


panel.classList.remove("hidden")


fillHourSelects(dateStr)


}






function fillHourSelects(date){

startHourSelect.innerHTML=""
endHourSelect.innerHTML=""


hours.forEach(h=>{


let a=document.createElement("option")

a.value=h

a.innerText=h


if(date && isHourReserved(date,h))
a.disabled=true



startHourSelect.appendChild(a)




let b=document.createElement("option")


b.value=h

b.innerText=h


if(date && isHourReserved(date,h))
b.disabled=true



endHourSelect.appendChild(b)



})


}


// ===============================
// LICZENIE CENY STUDIO
// ===============================


function calculatePrice(){

const sDate=startDateInput.value
const sHour=startHourSelect.value
const eDate=endDateInput.value
const eHour=endHourSelect.value


if(!sDate || !sHour || !eDate || !eHour)
return



let start =
new Date(sDate+"T"+sHour)


let end =
new Date(eDate+"T"+eHour)



if(end<=start){

end =
new Date(
end.getTime()+60*60*1000
)

}



let total=0

let current =
new Date(start)



while(current<end){


const day =
current.getDay()


const hour =
current.getHours()



let rate=0



if(day===0 || day===6){

rate =
(hour>=6 && hour<23)
?100
:120


}else{


rate =
(hour>=6 && hour<23)
?80
:100

}



total+=rate


current =
new Date(
current.getTime()+60*60*1000
)



}



const code =
promoCodeInput.value.trim()



if(code==="WAKACJE26")
discount=30

else
discount=0



total =
Math.round(
total*(1-discount/100)
)



priceDisplay.innerText=total



}





[startDateInput,endDateInput,startHourSelect,endHourSelect]
.forEach(el=>{


el.addEventListener(
"change",
calculatePrice
)


})


promoCodeInput.addEventListener(
"input",
calculatePrice
)





// ===============================
// REZERWACJA STUDIO STRIPE
// ===============================


reserveBtn.onclick = async()=>{


const clientName =
document.getElementById("clientName")?.value


const clientEmail =
document.getElementById("clientEmail")?.value


const clientPhone =
document.getElementById("clientPhone")?.value



if(!clientName || !clientEmail || !clientPhone){

alert(
"Uzupełnij dane kontaktowe"
)

return

}




const body={


name:clientName,

email:clientEmail,

phone:clientPhone,


startDate:startDateInput.value,

startHour:startHourSelect.value,


endDate:endDateInput.value,

endHour:endHourSelect.value,


totalPrice:
parseInt(priceDisplay.innerText)*100,


service:
"Wynajem studia"


}



try{


const res =
await fetch(
"https://purpzstudio.pl/create-checkout-session",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},


body:
JSON.stringify(body)


})


const data =
await res.json()


window.location.href=data.url



}catch(err){

console.error(err)

alert(
"Błąd płatności"
)

}



}





// ===============================
// PAKIETY
// ===============================



document.querySelectorAll(
".package-checkout-btn"
)
.forEach(btn=>{


btn.addEventListener(
"click",
async()=>{



const name =
btn.dataset.name


const price =
parseInt(btn.dataset.price)



const clientName =
document.getElementById(
"packageName"
)?.value



const email =
document.getElementById(
"packageEmail"
)?.value



const phone =
document.getElementById(
"packagePhone"
)?.value




if(!clientName || !email || !phone){

alert(
"Wpisz dane kontaktowe"
)

return

}





try{


const res =
await fetch(
"https://purpzstudio.pl/create-package-checkout",
{


method:"POST",

headers:{
"Content-Type":"application/json"
},


body:
JSON.stringify({

name,

price:price*100,


clientName,

email,

phone,


service:
"Pakiet "+name


})


})


const data =
await res.json()


window.location.href=data.url



}catch(err){

console.error(err)

alert(
"Błąd płatności"
)


}



})


})






// ===============================
// MIX MASTERING
// ===============================



const trackCount =
document.getElementById("trackCount")


const serviceType =
document.getElementById("serviceType")


const mixPromo =
document.getElementById("mixPromo")


const mixPrice =
document.getElementById("mixPrice")


const expressService =
document.getElementById("expressService")





function calculateMixPrice(){


let total =
parseInt(trackCount.value)
+
parseInt(serviceType.value)



if(expressService.checked){

total+=150

}



if(
mixPromo.value.trim()
==="WAKACJE26"
){

total =
Math.round(
total*0.70
)

}



mixPrice.innerText=total



}



trackCount?.addEventListener(
"change",
calculateMixPrice
)


serviceType?.addEventListener(
"change",
calculateMixPrice
)


mixPromo?.addEventListener(
"input",
calculateMixPrice
)


expressService?.addEventListener(
"change",
calculateMixPrice
)



calculateMixPrice()





document
.getElementById("mixCheckoutBtn")
?.addEventListener(
"click",
async()=>{


const name =
document.getElementById("mixName")?.value


const phone =
document.getElementById("mixPhone")?.value


const email =
document.getElementById("mixEmail").value


const drive =
document.getElementById("mixDrive").value



if(!name || !phone || !email || !drive){

alert(
"Uzupełnij wszystkie dane"
)

return

}





const res =
await fetch(
"https://purpzstudio.pl/create-mix-checkout",
{


method:"POST",

headers:{
"Content-Type":"application/json"
},


body:
JSON.stringify({


name,

phone,

email,


drive,


tracks:
trackCount.options[
trackCount.selectedIndex
].text,


service:
serviceType.options[
serviceType.selectedIndex
].text,


express:
expressService.checked
?"TAK"
:"NIE",



reference:
document.getElementById(
"referenceTrack"
).value,



description:
document.getElementById(
"projectDescription"
).value,



totalPrice:
parseInt(mixPrice.innerText)*100



})


})


const data =
await res.json()


window.location.href=data.url



})






// ===============================
// KALENDARZ
// ===============================



document
.getElementById("prevMonth")
.onclick=()=>{

currentDate.setMonth(
currentDate.getMonth()-1
)

renderCalendar()

}



document
.getElementById("nextMonth")
.onclick=()=>{


currentDate.setMonth(
currentDate.getMonth()+1
)


renderCalendar()


}




fillHourSelects()

renderCalendar()