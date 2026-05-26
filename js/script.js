menuToggle = document.getElementById('menuToggle');
navMobile = document.querySelector('.nav-mobile');

menuToggle.addEventListener('click', () => {
  navMobile.classList.toggle('active');
});