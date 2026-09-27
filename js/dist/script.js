const menuToggle = document.getElementById('menuToggle');
const navMobile = document.querySelector('.nav-mobile');
if (menuToggle && navMobile) {
    const icon = menuToggle.querySelector('i');
    menuToggle.addEventListener('click', () => {
        navMobile.classList.toggle('active');
        if (icon) {
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            }
            else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        }
    });
}
// Roleta de comida (carrossel de títulos da home)
const roleta = document.getElementById('roletaComidaContainer');
const indexTitle = document.getElementById('indexTitle');
const titulos = [
    'ALMOÇO E JANTAR',
    'SOBREMESA',
    'REFRESCO',
    'LANCHINHO',
];
if (roleta && indexTitle) {
    let grau = 0;
    let index = 0;
    setInterval(() => {
        grau -= 90;
        roleta.style.transform = `rotate(${grau}deg)`;
        index++;
        if (index >= titulos.length) {
            index = 0;
        }
        indexTitle.textContent = titulos[index];
    }, 6000);
}
// Botões de favoritar (corrigido: era um NodeList tratado como elemento único)
const coracoes = document.querySelectorAll('.favoritar');
coracoes.forEach((coracao) => {
    coracao.addEventListener('click', () => {
        if (coracao.classList.contains('fa-regular')) {
            coracao.classList.remove('fa-regular');
            coracao.classList.add('fa-solid');
        }
        else {
            coracao.classList.remove('fa-solid');
            coracao.classList.add('fa-regular');
        }
    });
});
export {};
