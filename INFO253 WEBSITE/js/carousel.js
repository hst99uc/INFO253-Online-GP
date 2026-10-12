const carousel = document.getElementById("carousel");
const slides = carousel.querySelectorAll(".carousel-slide");

let currentIndex = 0;

setInterval(() => {
    slides[currentIndex].classList.remove("active");

    currentIndex++;

    if (currentIndex >= slides.length) {
        currentIndex = 0;
    }

    slides[currentIndex].classList.add("active");

}, 10000);