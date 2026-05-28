menuToggle = document.getElementById('menuToggle');
navMobile = document.querySelector('.nav-mobile');
const icon = menuToggle.querySelector("i");

menuToggle.addEventListener('click', () => {
  navMobile.classList.toggle('active');

  if(icon.classList.contains("fa-bars")){

        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");

    }else{

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    }
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

coracao = document.querySelectorAll('.favoritar');

coracao.addEventListener('click', () => {
    if(coracao.classList.contains("fa-regular")){

        coracao.classList.remove("fa-regular");
        coracao.classList.add("fa-solid");
    }else{

        coracao.classList.remove("fa-solid");
        coracao.classList.add("fa-regular");
    }
});