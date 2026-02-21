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

let currentDate = new Date()
let reservations = {} // tu wczytamy z backendu

// godziny 0-23
const hours=[]
for(let h=0;h<24;h++) hours.push(h.toString().padStart(2,"0")+":00")

const months=[
"Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec",
"Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"
]

function formatDate(date){
  const y=date.getFullYear()
  const m=(date.getMonth()+1).toString().padStart(2,"0")
  const d=date.getDate().toString().padStart(2,"0")
  return `${y}-${m}-${d}`
}

// status dnia dla kolorowania
function getDayStatus(dateStr){
  const dayReservations = reservations[dateStr]
  if(!dayReservations || dayReservations.length===0) return "free"
  if(dayReservations.length===1 && dayReservations[0].start==="00:00" && dayReservations[0].end==="24:00") return "full"
  return "partial"
}

// render kalendarza
async function renderCalendar(){
  calendar.innerHTML=""
  
  try{
    const res = await fetch('/api/reservations')
    reservations = await res.json()
  }catch(err){
    console.log("Nie udało się pobrać rezerwacji z backendu", err)
  }

  const year=currentDate.getFullYear()
  const month=currentDate.getMonth()
  monthYear.innerText=`${months[month]} ${year}`

  const firstDay=new Date(year,month,1)
  let startDay=firstDay.getDay()
  if(startDay===0) startDay=7
  const daysInMonth=new Date(year,month+1,0).getDate()

  for(let i=1;i<startDay;i++) calendar.appendChild(document.createElement("div"))

  for(let day=1;day<=daysInMonth;day++){
    const date=new Date(year,month,day)
    const dateStr=formatDate(date)
    const div=document.createElement("div")
    div.className="day"
    div.innerText=day

    const status=getDayStatus(dateStr)
    if(status==="free") div.classList.add("fully-free")
    if(status==="partial") div.classList.add("partially-booked")
    if(status==="full") div.classList.add("fully-booked")

    div.onclick=()=>showDayInfo(dateStr)
    calendar.appendChild(div)
  }
}

// pokaz panel z zajętymi godzinami
function showDayInfo(dateStr){
  title.innerText=dateStr
  list.innerHTML=""
  const dayReservations=reservations[dateStr]

  if(!dayReservations || dayReservations.length===0){
    list.innerHTML='<div class="free-text">W tym dniu wszystkie godziny są wolne</div>'
  } else {
    list.innerHTML="<b>Zarezerwowane godziny:</b><br><br>"
    dayReservations.forEach(h=>{
  const div = document.createElement("div")
  div.className = "reserved-block"

  // obliczamy godzinę końcową jako +1h
  const startHour = h
  const [hourStr, minute] = h.split(":")
  const endHour = (parseInt(hourStr)+1).toString().padStart(2,'0') + ":" + minute

  div.innerText = `${startHour} – ${endHour}`
  list.appendChild(div)
})
  }
  panel.classList.remove("hidden")
}

// wypełnienie selectów godzin
function fillHourSelects(){
  startHourSelect.innerHTML=""
  endHourSelect.innerHTML=""
  hours.forEach(h=>{
    const opt1=document.createElement("option")
    opt1.value=h; opt1.innerText=h
    startHourSelect.appendChild(opt1)

    const opt2=document.createElement("option")
    opt2.value=h; opt2.innerText=h
    endHourSelect.appendChild(opt2)
  })
}

// obliczanie ceny
function calculatePrice(){
  const sDate=startDateInput.value
  const sHour=startHourSelect.value
  const eDate=endDateInput.value
  const eHour=endHourSelect.value
  if(!sDate||!sHour||!eDate||!eHour) return

  let start=new Date(sDate+"T"+sHour)
  let end=new Date(eDate+"T"+eHour)
  if(end<=start) end=new Date(end.getTime()+60*60*1000) // min 1h

  let total=0
  let current=new Date(start)
  while(current<end){
    const day=current.getDay()
    const hour=current.getHours()
    let rate=0
    if(day===0||day===6){
      rate=(hour>=6 && hour<23)?100:120
    } else {
      rate=(hour>=6 && hour<23)?2:100
    }
    total+=rate
    current=new Date(current.getTime()+60*60*1000)
  }
  priceDisplay.innerText=total
}

// eventy reservation panel
[startDateInput,endDateInput,startHourSelect,endHourSelect].forEach(el=>el.addEventListener("change",calculatePrice))

reserveBtn.onclick = async () => {
  const sDate = startDateInput.value
  const eDate = endDateInput.value
  const sHour = startHourSelect.value
  const eHour = endHourSelect.value
  const totalPrice = parseInt(priceDisplay.innerText)

  if(!sDate||!eDate||!sHour||!eHour){
    alert("Wybierz daty i godziny")
    return
  }

  let start = new Date(sDate+"T"+sHour)
  let end = new Date(eDate+"T"+eHour)
  if(end<=start) {alert("Minimalna rezerwacja to 1 godzina"); return}

  try {
    const res = await fetch('https://purpzstudio.pl/create-checkout-session', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        startDate:sDate,
        startHour:sHour,
        endDate:eDate,
        endHour:eHour,
        totalPrice: totalPrice*100 // w groszach
      })
    })
    const data = await res.json()
    window.location.href = data.url
  } catch(err){
    console.error(err)
    alert('Błąd przy tworzeniu płatności')
  }
}

// strzałki miesiąca
document.getElementById("prevMonth").onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()-1)
  renderCalendar()
}
document.getElementById("nextMonth").onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()+1)
  renderCalendar()
}

fillHourSelects()
renderCalendar()