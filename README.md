# Wasfa — entrega acadêmica

Aplicação de receitas com React + Vite, NestJS e MySQL. Cadastro/login usam Argon2id e JWT. Pesquisa por nome e ingredientes e detalhes usam exclusivamente o MySQL. 

## Estrutura

- `frontend/`: aplicação React, entradas HTML, estilos e imagens.
- `backend/`: NestJS, Prisma, autenticação, pesquisa e testes.
- `database/`: seis scripts SQL obrigatórios, preservados.
- `docs/`: roteiro, ambientes, relatório e evidências reais de homologação.

## Requisitos

Node.js 22.12+ recomendado para a entrega (os testes desta máquina também registram a versão efetivamente usada), npm e MySQL 8 com InnoDB. Para validar automaticamente os scripts, instale o cliente `mysql`; no Windows o executor usa `C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe`. Para outro local defina `MYSQL_BIN` com o caminho do executável.

## 1. Criar o banco uma única vez

Se o banco `wasfa` já existe com os dados, prossiga para a configuração. Para uma base nova, abra o cliente MySQL a partir de `database/`:

```powershell
cd database
mysql -u root -p
```

Dentro do cliente:

```sql
SOURCE schema.sql;
SOURCE inserts.sql;
SOURCE functions.sql;
SOURCE procedures.sql;
SOURCE views.sql;
SOURCE consultas.sql;
```

Os inserts dependem de banco novo com IDs iniciais. Inserts e criação de rotinas não são idempotentes; não repita indiscriminadamente sobre um banco populado. Os usuários de exemplo têm marcadores `hash_exemplo_*`, não senhas utilizáveis: cadastre um novo usuário pela aplicação. Contas locais do protótipo antigo não são contas MySQL.

## 2. Configurar o backend

Em um terminal, a partir da raiz:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Não sobrescreva um `.env` já configurado. Preencha localmente:

```dotenv
DATABASE_URL="mysql://USUARIO:SENHA@127.0.0.1:3306/wasfa?connect_timeout=5"
PORT=3000
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
JWT_SECRET="<CHAVE_ALEATORIA_LOCAL>"
JWT_EXPIRES_IN=3600
```

Codifique caracteres especiais de usuário/senha na URL. Gere a chave JWT localmente, sem compartilhá-la:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

Confirme o banco existente e gere o cliente Prisma com o backend parado:

```powershell
npm run db:introspect
npm run prisma:validate
npm run prisma:generate
npm run start:dev
```

A introspecção lê o banco e atualiza o mapeamento local; não executa migrations. Não use `db push` ou reset como instalação deste projeto. A API inicia por padrão em `http://localhost:3000`.

## 3. Configurar o React

Em outro terminal, a partir da raiz:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Não sobrescreva configuração existente. `VITE_API_URL=http://localhost:3000` define a raiz da API, sem `/api`. Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`. Se mudar a porta, permita sua origem em `CORS_ORIGINS` no backend e reinicie os processos. Variáveis VITE são públicas: não coloque nelas credenciais do banco nem a chave JWT.

## Funcionalidades e endpoints

| Método/rota | Uso |
| --- | --- |
| `GET /health` | Processo HTTP disponível |
| `GET /health/db` | Conectividade MySQL |
| `POST /auth/register` | `{ nome, email, senha }`; cadastro 201, email duplicado 409 |
| `POST /auth/login` | `{ email, senha }`; login 200, credenciais inválidas 401 |
| `GET /auth/me` | Usuário público, exige `Authorization: Bearer <JWT>` |
| `GET /recipes?name=banana` | Pesquisa parcial por nome |
| `GET /recipes?ingredients=banana,aveia` | Busca por qualquer ingrediente, ordenada por correspondências |
| `GET /recipes?name=banana&ingredients=aveia&page=1&limit=10` | Filtros combinados e paginação |
| `GET /recipes/:id` | Receita e ingredientes com quantidades; 404 se não existir |
| `GET /receitas` | Endpoint legado preservado |

A listagem pública retorna `{ items, total, page, limit }`; detalhes usam apenas campos existentes. A página React de detalhes é `/pages/receita.html?id=<id>`. JWT fica em sessionStorage; senhas não são persistidas no navegador. Logout limpa a sessão da aba, sem revogação no servidor.

## Testes e builds individuais

No backend:

```powershell
npm test
npm run test:mysql
npm run test:recipes:mysql
npm run build
npm start
```

Os testes MySQL legados precisam dos dados iniciais. Os de autenticação usam rollback; o contador AUTO_INCREMENT pode avançar. Não execute testes contra um banco de produção real.

No frontend:

```powershell
npm test
npm run test:live
npm run build
npm run preview
```

O teste live exige a API acessível e os dados de banana/aveia; não escreve no banco. Preview normalmente usa a porta 4173, que precisa ser permitida no CORS. Builds Vite incorporam a URL da API definida no momento da compilação.

## Homologação reproduzível e evidências

Com dependências instaladas nos dois diretórios e `.env` do backend configurado:

```powershell
cd backend
npm run homologate
```

O executor cria um schema `wasfa_homolog_<identificador>`, executa cópias em memória dos seis scripts com somente CREATE DATABASE/USE redirecionados e verifica tabelas, dados, function, procedures e views. Os originais não são editados. O banco `wasfa` do aplicativo permanece intacto. É preciso um usuário com permissões de criar banco, tabelas, views e rotinas para essa validação.

Executa builds, testes existentes, Jest/Supertest com MySQL real e React, e inicia processos temporários próprios nas portas **3101 e 4175** para smoke de produção local. Essas portas devem estar livres. O build React dessa simulação aponta para `http://127.0.0.1:3101`; para voltar a outra configuração, gere novo build com a URL desejada. O executor encerra somente os processos que criou e mantém o schema isolado para inspeção.

Cada execução grava logs, relatórios JSON e resumo com códigos de saída em `docs/evidencias/<data-UTC>/`. Não publica os arquivos `.env`, senhas, hashes de usuários ou tokens. O teste Jest essencial executa cadastro/login e pesquisas no banco real dentro de uma transação revertida; não é um mock de resultados do MySQL.

Consulte [roteiro de testes](docs/ROTEIRO_TESTES.md), [ambientes simulados](docs/AMBIENTES.md) e [relatório de homologação](docs/RELATORIO_HOMOLOGACAO.md). Instruções específicas também estão em [backend/README.md](backend/README.md) e [frontend/README.md](frontend/README.md).

## Limites conhecidos

Não há imagens/categorias/notas/porções no schema. Cards exibem ícone neutro e campos reais; filtro por categoria não é exibido. Favoritos permanecem locais, sem vínculo com a conta. Perfil mantém atalhos “Em breve”. Não há recuperação de senha, refresh token, revogação ou limitação de tentativas de login. As verificações automatizadas de React usam jsdom; revisão visual em navegador e deploy externo não foram presumidos como aprovados. As pendências de segurança e execução estão detalhadas no relatório.
