# Wasfa — frontend React integrado

React + Vite consome o backend NestJS e as receitas do MySQL. O visual, componentes compartilhados e as URLs HTML foram mantidos. Não utiliza APIs externas de receitas.

## Executar

A partir da raiz do repositório, configure e inicie o backend em um terminal:

```powershell
cd backend
npm ci
# Configure .env conforme backend/README.md, se ainda não existir.
npm run start:dev
```

Em outro terminal:

```powershell
cd frontend
npm ci
# Copie somente se não houver configuração local:
Copy-Item .env.example .env.local
npm run dev
```

`VITE_API_URL=http://localhost:3000` aponta para a raiz do backend, sem `/api`. O padrão em desenvolvimento é localhost:3000. Reinicie o Vite após alterar o arquivo. Variáveis VITE são públicas: nunca coloque senha do MySQL ou JWT_SECRET nelas.

O backend precisa permitir a origem do frontend em `CORS_ORIGINS`. Para a porta 5173, a configuração existente atende; se o Vite escolher outra porta, adicione essa origem. Para `npm run preview`, acrescente `http://localhost:4173` (ou a origem efetivamente usada). Não foram alteradas as configurações do backend nesta fase.

## Build e publicação

```powershell
npm run build
npm run preview
```

Publique o diretório `dist/`. Configure `VITE_API_URL` com a URL pública HTTPS do backend **antes do build**, e configure CORS no NestJS para o domínio publicado. Vite gera as sete entradas HTML existentes; detalhes usam `/pages/receita.html?id=<id>`.

## Integração

- `src/services/api.js`: centraliza URL, JSON, Bearer, erros e cancelamento de requisições.
- Login e cadastro usam `/auth/login` e `/auth/register`; o contexto restaura o usuário por `/auth/me`.
- Somente o JWT é guardado em sessionStorage, durante a sessão da aba. Senhas são enviadas ao backend e não são persistidas no navegador. Contas antigas do protótipo, identificadas por email e campos username/email/password, são removidas do localStorage na inicialização. Contas do protótipo não são migradas ao MySQL.
- Token inválido/expirado é removido quando a API retorna 401. Falhas de rede preservam o token e mostram erro com opção de repetir. O perfil espera a validação da sessão antes de redirecionar. Logout limpa a sessão da aba; o backend não possui revogação de JWT.
- A listagem usa `/recipes` com `name`, `ingredients`, `page` e `limit`. O campo antigo `q` na URL continua aceito como nome. A pesquisa é enviada pelo formulário; mudar os filtros reinicia a página. Ingredientes são separados por vírgula, com normalização e relevância calculadas pelo backend.
- Cards usam os IDs e nomes reais e abrem `/recipes/:id` na página de detalhes. Estados de carregamento, erro, ID ausente, 404 e ausência de resultados estão implementados.
- Nenhuma página importa `src/data/recipes.js`; o arquivo histórico permanece sem uso.

Exemplos:

```text
/pages/receitas.html?name=banana
/pages/receitas.html?ingredients=banana,aveia
/pages/receitas.html?name=banana&ingredients=aveia
/pages/receita.html?id=1
```

## Limites dos dados atuais

O MySQL não possui categoria, imagem, avaliação, selo, descrição ou porções. A interface omite esses dados e usa um ícone neutro no lugar da imagem. `CategoryFilters.jsx` permanece disponível no projeto, mas não é exibido na listagem, pois a API não oferece esse filtro. Não foram inferidas categorias ou usadas receitas simuladas como fallback.

Favoritos continuam locais, sem sincronização com a conta/backend. A chave `wasfa:mysql:favorites` evita associar favoritos do catálogo simulado aos novos IDs MySQL. Atalhos do perfil marcados “Em breve” continuam como estavam.

## Testes e verificação

```powershell
npm test
# Com backend e MySQL acessíveis e os dados iniciais de banana/aveia:
npm run test:live
```

- 14 testes de componentes/contexto/serviço com HTTP simulado: login, cadastro, confirmação, duplicidade, credenciais inválidas, restauração, expiração, falha de rede, pesquisa combinada, paginação, links e detalhes.
- 1 teste com HTTP real do frontend para NestJS/MySQL: pesquisa combinada e detalhes a partir do ID do card, somente leitura. Não cria usuários.
- O teste real é ignorado na suíte padrão, que funciona sem servidor. Testes de cadastro/login com MySQL real e rollback permanecem no backend (`npm run test:mysql`).
- Build de produção verificado. A verificação de componentes usa jsdom; não substitui uma revisão visual manual no navegador.

Recomendado Node 20.19+ ou 22.12+, conforme documentação original do projeto.
