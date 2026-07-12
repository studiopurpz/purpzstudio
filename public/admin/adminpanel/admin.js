fetch('/admin-check')
.then(res=>{

if(!res.ok){

window.location.href="/admin/admin-login.html"

}

})

console.log("Purpz Admin Panel Loaded");



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