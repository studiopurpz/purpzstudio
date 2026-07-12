



const buttons = document.querySelectorAll(".tab-btn");
const tabs = document.querySelectorAll(".tab-content");



buttons.forEach(button => {


button.addEventListener("click", ()=>{


const target = button.dataset.tab;



// usuwanie aktywności

buttons.forEach(btn=>{
btn.classList.remove("active");
});



tabs.forEach(tab=>{
tab.classList.remove("active");
});




// dodanie aktywności

button.classList.add("active");


document
.getElementById(target)
.classList.add("active");



});


});



async function loadStats(){

const res = await fetch('/api/admin/stats')

const data = await res.json()


document.getElementById(
"dashboardIncome"
).innerText =
data.income + " zł"



document.getElementById(
"dashboardOrders"
).innerText =
data.orders



document.getElementById(
"dashboardClients"
).innerText =
data.clients


}



async function loadBookings(){

const res =
await fetch('/api/admin/reservations')


const data =
await res.json()


const box =
document.getElementById(
"bookingList"
)


box.innerHTML=""


data.forEach(r=>{


box.innerHTML += `

<div class="booking">

<div>
${r.date}
</div>


<div>
${r.start} - ${r.end}
</div>


<div class="status paid">
Opłacone
</div>


</div>


`


})


}



async function loadClients(){


const res =
await fetch('/api/admin/clients')


const data =
await res.json()


const box =
document.getElementById(
"clientList"
)


box.innerHTML=""


data.forEach(c=>{


box.innerHTML += `

<div class="booking">


<div>
${c.name || "Brak"}
</div>


<div>
${c.email}
</div>


<div>
${c.phone || "-"}
</div>


<div>
${c.visits} wizyt
</div>


</div>


`


})


}




loadStats()

loadBookings()

loadClients()