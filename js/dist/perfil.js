const nome = localStorage.getItem('loggedUser');
if (!nome) {
    // Quem não está logado volta para a tela de login.
    window.location.href = './login.html';
}
else {
    const nomeEl = document.getElementById('perfilNome');
    const avatarEl = document.getElementById('perfilAvatar');
    if (nomeEl)
        nomeEl.textContent = nome;
    if (avatarEl)
        avatarEl.textContent = nome.charAt(0).toUpperCase();
}
// Todos os botões/links "Sair" (navbar, menu mobile e o do topo do perfil)
document.querySelectorAll('.js-logout').forEach((botao) => {
    botao.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedUser');
        window.location.href = './login.html';
    });
});
export {};
