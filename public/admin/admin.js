async function loadAdmin(){

const res = await fetch('/api/admin/bookings')

const bookings = await res.json()


document.getElementById("bookingCount")
.innerText = bookings.length


const table=document.getElementById("bookingTable")

bookings.forEach(b=>{

table.innerHTML += `

<tr>

<td>${b.date}</td>

<td>${b.start} - ${b.end}</td>

<td>
Opłacone
</td>

</tr>

`

})


}


loadAdmin()