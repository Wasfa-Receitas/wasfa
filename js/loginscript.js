const loginTab = document.getElementById('btn-login-tab');
const signupTab = document.getElementById('btn-signup-tab');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

const logoutBtn = document.getElementById('btn-logout');


// alternar abas
function showLogin() {

    loginForm.classList.add('active');
    signupForm.classList.remove('active');

    loginTab.classList.add('active');
    signupTab.classList.remove('active');
}

function showSignup() {

    signupForm.classList.add('active');
    loginForm.classList.remove('active');

    signupTab.classList.add('active');
    loginTab.classList.remove('active');
}


// clique nas abas
loginTab.addEventListener('click', showLogin);
signupTab.addEventListener('click', showSignup);


// criar conta
signupForm.addEventListener('submit', function(e) {

    e.preventDefault();

    const username = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;

    if(password !== passwordConfirm){
        alert('As senhas não conferem!');
        return;
    }

    if(localStorage.getItem(email)){
        alert('Esse email já está cadastrado!');
        return;
    }

    const user = {
        username,
        email,
        password
    };

    localStorage.setItem(email, JSON.stringify(user));
    localStorage.setItem('loggedUser', username);

    alert('Conta criada com sucesso!');

    logoutBtn.style.display = 'inline-block';

    signupForm.reset();

    showLogin();
});


// login
loginForm.addEventListener('submit', function(e){

    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const storedUser = JSON.parse(localStorage.getItem(email));

    if(!storedUser){
        alert('Usuário não encontrado!');
        return;
    }

    if(storedUser.password !== password){
        alert('Senha incorreta!');
        return;
    }

    alert(`Bem-vindo(a), ${storedUser.username}!`);

    localStorage.setItem('loggedUser', storedUser.username);

    logoutBtn.style.display = 'inline-block';
});


// logout
logoutBtn.addEventListener('click', () => {

    localStorage.removeItem('loggedUser');

    alert('Você saiu da conta!');

    logoutBtn.style.display = 'none';

    location.reload();
});


// checar login
if(localStorage.getItem('loggedUser')){
    logoutBtn.style.display = 'inline-block';
}

const menuToggle = document.getElementById('menuToggle');
const navMobile = document.querySelector('.nav-mobile');
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