menuToggle = document.getElementById('menuToggle');
navMobile = document.querySelector('.nav-mobile');

menuToggle.addEventListener('click', () => {
  navMobile.classList.toggle('active');
});

roleta = document.getElementById('roletaComidaContainer');
indexTitle = document.getElementById('indexTitle');

const titulos = [
  "ALMOÇO E JANTAR",
  "SOBREMESA",
  "REFRESCO",
  "LANCHINHO",
]
let grau = 0;
let index = 0;
setInterval(() => {

    grau -= 90;

    roleta.style.transform = `rotate(${grau}deg)`;

    index++;

    if(index >= titulos.length){
        index = 0;
    }

    indexTitle.textContent = titulos[index];

}, 6000);