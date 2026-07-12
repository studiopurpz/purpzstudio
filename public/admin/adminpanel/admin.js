



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
${c.orders} zamówień
</div>


</div>


`


})


}




loadStats()

loadBookings()

loadClients()


async function loadReservations(){


const res = await fetch(
'/api/admin/reservations'
)


const reservations = await res.json()



const box =
document.getElementById(
"reservationList"
)



box.innerHTML = ""



if(reservations.length === 0){

box.innerHTML =
"<p>Brak rezerwacji</p>"

return

}



reservations.forEach(r=>{


box.innerHTML += `

<div class="booking">


<div>

<h3>
Studio nagrań
</h3>

<p>
${r.date}
</p>

</div>



<div>

${r.start} -
${r.end}

</div>



<div class="status paid">

Opłacone

</div>



<div class="countdown">

${getCountdown(r.date,r.start)}

</div>



</div>

`



})


}



function getCountdown(date,time){


const target =
new Date(
date+"T"+time
)


const now =
new Date()



const diff =
target-now



if(diff < 0){

return "Zakończone"

}



const hours =
Math.floor(
diff/(1000*60*60)
)



const days =
Math.floor(
hours/24
)



return days+" dni "+(hours%24)+"h"


}




loadReservations()


async function loadMixes(){


const res =
await fetch('/api/admin/mixes')


const mixes =
await res.json()



const box =
document.getElementById(
"mixList"
)



box.innerHTML=""



if(mixes.length===0){

box.innerHTML =
"<p>Brak zamówień mix/mastering</p>"

return

}



mixes.forEach(m=>{


box.innerHTML += `


<div class="mix-card">


<div>

<h3>
${m.name || "Klient"}
</h3>


<p>
${m.service}
</p>


<p>
${m.email}
</p>

</div>



<div>

Cena:
<br>

${m.price} zł

</div>



<div class="status ${m.status === 'opłacone' ? 'paid':'pending'}">

${m.status}

</div>



<div class="countdown">

${new Date(m.created_at).toLocaleDateString()}

</div>



</div>


`



})


}



loadMixes()


async function loadAllMixes(){


const res =
await fetch('/api/admin/mixes')


const mixes =
await res.json()



const box =
document.getElementById(
"allMixList"
)



box.innerHTML=""



if(mixes.length === 0){

box.innerHTML =
"<p>Brak zamówień Mix / Mastering</p>"

return

}



mixes.forEach(m=>{


box.innerHTML += `


<div class="mix-card">


<div>

<h3>
${m.name || "Brak imienia"}
</h3>


<p>
${m.email}
</p>


<p>
${m.phone || "Brak telefonu"}
</p>

</div>



<div>

${m.service}

</div>



<div>

Cena:
<br>

${m.price} zł

</div>



<div class="status ${m.status === 'opłacone' ? 'paid':'pending'}">

${m.status}

</div>



<div>

${new Date(m.created_at).toLocaleDateString()}

</div>



</div>


`


})


}



loadAllMixes()

