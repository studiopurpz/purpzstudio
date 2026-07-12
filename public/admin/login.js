document.getElementById("loginBtn").onclick=async()=>{


const username =
document.getElementById("username").value


const password =
document.getElementById("password").value



const res = await fetch(
"/admin-login",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

username,
password

})

})


const data = await res.json()


if(data.success){

window.location.href="/admin.html"

}else{

document.getElementById("error").innerText=
"Zły login lub hasło"

}


}

const loginBtn = document.getElementById("loginBtn")


loginBtn.onclick = async()=>{


const username =
document.getElementById("username").value


const password =
document.getElementById("password").value



const response = await fetch("/admin-login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

username,
password

})

})


const data = await response.json()



if(data.success){

window.location.href="/admin/adminpanel/adminpanel.html"

}

else{

document.getElementById("error").innerText =
"Nieprawidłowy login lub hasło"

}


}


document.getElementById("logout").onclick=async()=>{

await fetch("/admin-logout")

window.location.href="/admin/admin-login.html"

}