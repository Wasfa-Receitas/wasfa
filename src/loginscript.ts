// ts/loginscript.ts
// Marca este arquivo como um ES Module (escopo isolado, evita colisão de
// variáveis com outros arquivos carregados na mesma página).
export {};

interface User {
  username: string;
  email: string;
  password: string;
}

const loginTab = document.getElementById('btn-login-tab') as HTMLButtonElement;
const signupTab = document.getElementById(
  'btn-signup-tab',
) as HTMLButtonElement;

const loginForm = document.getElementById('login-form') as HTMLFormElement;
const signupForm = document.getElementById('signup-form') as HTMLFormElement;

const logoutBtn = document.getElementById('btn-logout') as HTMLButtonElement;

// alternar abas
function showLogin(): void {
  loginForm.classList.add('active');
  signupForm.classList.remove('active');

  loginTab.classList.add('active');
  signupTab.classList.remove('active');
}

function showSignup(): void {
  signupForm.classList.add('active');
  loginForm.classList.remove('active');

  signupTab.classList.add('active');
  loginTab.classList.remove('active');
}

// clique nas abas
loginTab.addEventListener('click', showLogin);
signupTab.addEventListener('click', showSignup);

// criar conta
signupForm.addEventListener('submit', (e: SubmitEvent) => {
  e.preventDefault();

  const username = (document.getElementById('signup-name') as HTMLInputElement)
    .value;
  const email = (document.getElementById('signup-email') as HTMLInputElement)
    .value;
  const password = (
    document.getElementById('signup-password') as HTMLInputElement
  ).value;
  const passwordConfirm = (
    document.getElementById('signup-password-confirm') as HTMLInputElement
  ).value;

  if (password !== passwordConfirm) {
    alert('As senhas não conferem!');
    return;
  }

  if (localStorage.getItem(email)) {
    alert('Esse email já está cadastrado!');
    return;
  }

  const user: User = { username, email, password };

  localStorage.setItem(email, JSON.stringify(user));
  localStorage.setItem('loggedUser', username);

  alert('Conta criada com sucesso!');

  logoutBtn.style.display = 'inline-block';

  signupForm.reset();

  showLogin();
});

// login
loginForm.addEventListener('submit', (e: SubmitEvent) => {
  e.preventDefault();

  const email = (document.getElementById('login-email') as HTMLInputElement)
    .value;
  const password = (
    document.getElementById('login-password') as HTMLInputElement
  ).value;

  const raw = localStorage.getItem(email);
  const storedUser: User | null = raw ? (JSON.parse(raw) as User) : null;

  if (!storedUser) {
    alert('Usuário não encontrado!');
    return;
  }

  if (storedUser.password !== password) {
    alert('Senha incorreta!');
    return;
  }

  localStorage.setItem('loggedUser', storedUser.username);
  logoutBtn.style.display = 'inline-block';

  window.location.href = '../pages/perfil.html';
});

// logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('loggedUser');
  alert('Você saiu da conta!');
  logoutBtn.style.display = 'none';
  location.reload();
});

// checar login
if (localStorage.getItem('loggedUser')) {
  logoutBtn.style.display = 'inline-block';
}

// Obs: a lógica do menu mobile (menuToggle/navMobile) fica só em script.ts.
// login.html carrega os dois arquivos (script.js e loginscript.js), então
// declarar as mesmas variáveis aqui de novo causaria um erro de
// "identifier already declared" no navegador.
