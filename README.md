# Wasfa

Aplicação de receitas com **React, NestJS, Prisma e MySQL 8**.

## Requisitos

- Node.js 22.12+ e npm
- MySQL 8 com InnoDB
- Cliente MySQL no terminal para executar os scripts SQL

## Executar o projeto

### 1. Preparar o banco

Se o banco `wasfa` ainda não existir, execute os seis scripts na ordem abaixo, a partir de `database/`:

```sql
SOURCE schema.sql;
SOURCE inserts.sql;
SOURCE functions.sql;
SOURCE procedures.sql;
SOURCE views.sql;
SOURCE consultas.sql;
```

**Atenção:** os scripts de inserts e rotinas não devem ser repetidos indiscriminadamente em um banco já populado.

### 2. Iniciar a API

No terminal, a partir da raiz do projeto:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Configure o arquivo `.env`:

```dotenv
DATABASE_URL="mysql://USUARIO:SENHA@127.0.0.1:3306/wasfa?connect_timeout=5"
PORT=3000
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
JWT_SECRET="SUA_CHAVE_ALEATORIA"
JWT_EXPIRES_IN=3600
```

Gere uma chave JWT localmente:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

Depois, com o banco disponível:

```powershell
npm run db:introspect
npm run prisma:validate
npm run prisma:generate
npm run start:dev
```

API: http://localhost:3000

### 3. Iniciar o frontend

Em outro terminal:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Confira se `VITE_API_URL=http://localhost:3000` está definido em `.env.local`. Acesse o endereço informado pelo Vite, normalmente http://localhost:5173.

## Funcionalidades

- Cadastro e login com senha protegida por Argon2id e autenticação JWT.
- Pesquisa de receitas por nome e ingredientes.
- Filtros combinados e paginação.
- Visualização dos detalhes e ingredientes das receitas.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastro |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Dados do usuário autenticado |
| GET | `/recipes` | Pesquisa e listagem de receitas |
| GET | `/recipes/:id` | Detalhes de uma receita |
| GET | `/health` | Verificação da API |
| GET | `/health/db` | Verificação da conexão com o banco |

Para rotas protegidas, envie `Authorization: Bearer <JWT>`.

## Testes e build

Backend:

```powershell
cd backend
npm test
npm run build
```

Frontend:

```powershell
cd frontend
npm test
npm run build
```

A homologação completa pode ser executada em `backend/`:

```powershell
npm run homologate
```

## Estrutura

- `frontend/`: interface React.
- `backend/`: API NestJS, autenticação e acesso ao banco.
- `database/`: scripts SQL.
- `docs/`: roteiro, ambientes e evidências de homologação.

## Documentação complementar

- [Roteiro de testes](docs/ROTEIRO_TESTES.md)
- [Ambientes](docs/AMBIENTES.md)
- [Relatório de homologação](docs/RELATORIO_HOMOLOGACAO.md)
- [Instruções do backend](backend/README.md)
- [Instruções do frontend](frontend/README.md)
