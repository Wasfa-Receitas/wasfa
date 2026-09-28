// ts/script.ts
// Marca este arquivo como um ES Module (escopo isolado, evita colisão de
// variáveis com outros arquivos carregados na mesma página).
export {};

const menuToggle = document.getElementById('menuToggle') as HTMLButtonElement | null;
const navMobile = document.querySelector('.nav-mobile') as HTMLElement | null;

if (menuToggle && navMobile) {
  const icon = menuToggle.querySelector('i') as HTMLElement | null;

  menuToggle.addEventListener('click', () => {
    navMobile.classList.toggle('active');

    if (icon) {
      if (icon.classList.contains('fa-bars')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }
  });
}

// Roleta de comida (carrossel de títulos da home)
const roleta = document.getElementById('roletaComidaContainer') as HTMLElement | null;
const indexTitle = document.getElementById('indexTitle') as HTMLElement | null;

const titulos: string[] = [
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

// Mensagem flutuante (toast) exibida ao favoritar/desfavoritar
let toastTimeout: number | undefined;

function mostrarToast(mensagem: string): void {
  let toast = document.getElementById('toast') as HTMLDivElement | null;

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = mensagem;
  toast.classList.add('show');

  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast?.classList.remove('show');
  }, 2500);
}

// Botões de favoritar
const coracoes = document.querySelectorAll<HTMLElement>('.favoritar');

coracoes.forEach((coracao) => {
  coracao.addEventListener('click', (e: MouseEvent) => {
    // O card da receita é um <a>, então impede que o clique no coração
    // navegue/recarregue a página.
    e.preventDefault();
    e.stopPropagation();

    const titulo =
      coracao.closest('.receita, .receita-page')?.querySelector('.receita-title')?.textContent?.trim() ?? 'Receita';

    if (coracao.classList.contains('fa-regular')) {
      coracao.classList.remove('fa-regular');
      coracao.classList.add('fa-solid');
      mostrarToast(`"${titulo}" foi adicionada aos favoritos!`);
    } else {
      coracao.classList.remove('fa-solid');
      coracao.classList.add('fa-regular');
      mostrarToast(`"${titulo}" foi removida dos favoritos.`);
    }
  });
});