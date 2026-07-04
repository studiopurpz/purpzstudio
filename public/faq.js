document.querySelectorAll(".faq-question").forEach(item => {
  item.addEventListener("click", () => {
    const parent = item.parentElement;

    parent.classList.toggle("active");
  });
});