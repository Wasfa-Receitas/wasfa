# Wasfa — backend (fase 5: pesquisa MySQL)

NestJS 10, TypeScript e Prisma 6.19, compatíveis com Node 20.15+. Pacote independente do frontend. Implementa autenticação e pesquisa de receitas exclusivamente no MySQL existente, sem alterações no schema, nos scripts SQL ou no React. Não utiliza API de receitas, serviços externos ou inteligência artificial.

## Instalação

No PowerShell, a partir da raiz do repositório:

```powershell
cd .\backend
npm ci
npm run prisma:generate
Copy-Item .env.example .env
```

Preencha `.env` localmente com a conexão do MySQL existente. O exemplo contém apenas marcadores, não credenciais válidas. Codifique caracteres especiais do usuário/senha na URL. Não coloque variáveis do banco no frontend. Execute os comandos seguintes dentro de `backend/`.

Não sobrescreva um `.env` já configurado. Defina `JWT_SECRET` com uma chave aleatória de pelo menos 32 bytes e `JWT_EXPIRES_IN` em segundos (padrão 3600; permitido de 60 a 86400). Para gerar uma chave localmente:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

Copie o resultado para `JWT_SECRET` no `.env`. Não compartilhe a chave. O servidor recusa inicialização sem uma chave válida. O `.env.example` deixa essa variável vazia intencionalmente.

## Banco existente e introspecção

Os seis scripts em `../database/` permanecem obrigatórios e não são substituídos pelo Prisma. Se o banco já foi criado, não execute novamente os inserts. Para uma base nova, execute no cliente MySQL `schema.sql`, depois `inserts.sql`, e então `functions.sql`, `procedures.sql`, `views.sql`; `consultas.sql` contém consultas de demonstração. Esses comandos não são executados automaticamente pelo backend.

O arquivo `prisma/schema.prisma` foi obtido por introspecção do MySQL local, schema `wasfa`, confirmando as quatro tabelas dos scripts. Para atualizar o mapeamento após alterações SQL, com o banco acessível e `.env` preenchido:

```powershell
npm run db:introspect
npm run prisma:validate
npm run prisma:generate
npm run build
```

`db:introspect` executa `prisma db pull`: lê o banco e atualiza o arquivo local, sem modificar tabelas ou dados. Confira o diff, especialmente nomes de FKs, índices e ações referenciais. Não use `db push`, `migrate dev` ou reset sobre esse banco como parte desta fase. Nenhuma migration é executada na inicialização.

## Execução e testes

```powershell
npm run start:dev
```

Ou:

```powershell
npm run build
npm start
```

```powershell
npm test
npm run test:mysql
npm run prisma:validate
```

`npm test` compila e executa os testes HTTP existentes e a suíte Jest de pesquisa, com o provider de banco substituído e uma chave JWT exclusiva de teste. Verifica rotas, consulta, CORS, DTOs, cadastro, hash Argon2id, login, duplicidade concorrente, tokens inválidos/expirados e erros 503. Build e esses testes não precisam de banco online. O build agora compila sem regenerar a DLL Prisma: execute `npm run prisma:generate` após instalação ou alteração do schema, com o backend parado. `prisma:validate` precisa de uma DATABASE_URL sintaticamente válida, mas não abre conexão.

`npm run test:mysql` exige MySQL real e `.env` completo. Além das consultas de leitura, testa cadastro, duplicidade, login e `/auth/me` em uma transação revertida ao final, inclusive em falha. Nenhum usuário de teste é mantido, mas o contador AUTO_INCREMENT pode avançar. Requer tabelas transacionais (InnoDB).

## Endpoints

| Rota | Resultado |
| --- | --- |
| `GET /health` | 200: `{"status":"ok","service":"wasfa-backend"}`; verifica o processo HTTP, sem consultar MySQL |
| `GET /health/db` | Executa `SELECT 1`; 200 com `{"status":"ok","database":"up"}` ou 503 |
| `GET /receitas` | Lê no máximo 20 receitas, por `id_receita` crescente; retorna array com `id_receita`, `nome`, `tempo_preparo`, `dificuldade`; 503 em falha de banco |
| `POST /auth/register` | 201: usuário público e JWT; 400: entrada inválida; 409: email duplicado; 503: banco indisponível |
| `POST /auth/login` | 200: usuário público e JWT; 400: entrada inválida; 401: credenciais inválidas; 503: banco indisponível |
| `GET /auth/me` | 200: usuário público; 401: token ausente, inválido, expirado ou usuário removido; 503: banco indisponível |

Não há prefixo `/api`. O endpoint legado `/receitas` mantém seu array de até 20 receitas. As rotas de autenticação expõem somente `id_usuario`, `nome` e `email` do usuário; nenhuma resposta inclui senha ou hash. `/health/db` confirma conexão, mas somente as rotas de receitas confirmam acesso à tabela de receitas.

## Pesquisa de receitas exclusivamente no MySQL

Rotas públicas, sem JWT obrigatório:

| Endpoint | Comportamento |
| --- | --- |
| `GET /recipes` ou `/recipes/` | Lista paginada; filtros `name` e `ingredients` opcionais |
| `GET /recipes/:id` | Detalhes com ingredientes e quantidades; 404 se não existir |

```http
GET /recipes
GET /recipes?name=bolo
GET /recipes?ingredients=banana
GET /recipes?ingredients=banana,aveia
GET /recipes?name=bolo&ingredients=banana
GET /recipes?ingredients=banana,aveia&page=2&limit=1
GET /recipes/1
```

Formato de listagem (exemplo baseado nos dados iniciais; a base real pode variar):

```json
{
  "items": [{
    "id_receita": 1,
    "nome": "Panqueca de banana",
    "modo_preparo": "Amasse a banana, misture com ovo e aveia e doure na frigideira.",
    "tempo_preparo": 15,
    "dificuldade": "Facil",
    "matched_ingredients": 2
  }],
  "total": 2,
  "page": 1,
  "limit": 1
}
```

`matched_ingredients` é uma contagem calculada dos termos pesquisados encontrados, não uma coluna nova. Sem filtro de ingredientes vale zero. `total` conta todas as receitas filtradas antes da paginação; sem resultados retorna `items: []` e `total: 0`. Uma página além do total retorna `items: []` mantendo o total real.

Nome e ingredientes usam correspondência parcial literal (`LIKE` parametrizado, escapando `%`, `_` e `!`). A sensibilidade a maiúsculas e acentos segue a collation do MySQL existente; os scripts não a definem. Não há alteração de collation nesta fase.

Ingredientes são separados por vírgulas, aparados, convertidos para minúsculas e deduplicados; termos vazios são ignorados. Basta um termo corresponder. Cada termo soma no máximo um ponto por receita, mesmo se encontrar vários ingredientes. A consulta usa `EXISTS` entre `receita_ingredientes` e `ingredientes`, sem duplicar linhas de receitas. Primeiro ordena pela pontuação decrescente, depois por ID crescente, e só então aplica paginação. Nome e ingredientes são combinados com AND. Contagem e página usam transação de leitura RepeatableRead.

Parâmetros: `page` inteiro de 1 a 100000 (padrão 1); `limit` inteiro de 1 a 100 (padrão 10); `name` até 100 caracteres; até 20 ingredientes distintos com até 100 caracteres cada. Parâmetros extras, arrays/repetições de parâmetros e valores inválidos retornam 400. Nome vazio ou ingredientes contendo somente espaços/vírgulas não aplicam filtros.

Detalhes retornam `id_receita`, `nome`, `modo_preparo`, `tempo_preparo`, `dificuldade` e `ingredientes: [{id_ingrediente, nome, quantidade}]`. Uma receita sem associações retorna ingredientes vazios. Não há descrição no schema; esse campo é omitido. ID inválido retorna 400; inexistente, 404; falha de banco, 503 sem detalhes internos.

Não foram criados índices ou tabelas. Buscas com `%termo%` podem exigir varredura em bases grandes; os limites de entrada e a paginação restringem a resposta, mas não eliminam esse custo.

Testes específicos:

```powershell
npm run test:recipes
npm run test:recipes:mysql
```

O primeiro executa Jest com mocks do Prisma e HTTP real do NestJS. O segundo verifica filtros, relevância, paginação, detalhes e ausência de duplicatas contra o MySQL real, somente com leituras. Requer os dados iniciais de banana e aveia para a asserção de múltiplas correspondências. A suíte legada `test:mysql` continua incluindo os testes transacionais de autenticação descritos acima.

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/health/db
Invoke-RestMethod http://localhost:3000/receitas
```

Conexão é aberta sob demanda: o servidor pode iniciar mesmo com MySQL indisponível. Requisições ao banco retornam erro genérico, sem credenciais na resposta. Configure `PORT` (padrão 3000) e `CORS_ORIGINS` com origens separadas por vírgula. O padrão permite localhost e 127.0.0.1 na porta 5173. Se Vite usar outra porta ou `preview` (normalmente 4173), acrescente sua origem. CORS autoriza GET, POST, HEAD e OPTIONS, com headers Content-Type e Authorization; não substitui autenticação.

## Exemplos de autenticação

Valores entre `<...>` são marcadores, não credenciais ou tokens reais.

```http
POST /auth/register
Content-Type: application/json

{"nome":"Maria","email":"maria@example.com","senha":"<SENHA_ESCOLHIDA>"}
```

Resposta `201` (login retorna o mesmo formato com status `200`):

```json
{
  "usuario": {"id_usuario": 4, "nome": "Maria", "email": "maria@example.com"},
  "accessToken": "<JWT_RETORNADO>",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

```http
POST /auth/login
Content-Type: application/json

{"email":"maria@example.com","senha":"<SENHA_ESCOLHIDA>"}
```

```http
GET /auth/me
Authorization: Bearer <JWT_RETORNADO>
```

Resposta `200` de `/auth/me`:

```json
{"id_usuario":4,"nome":"Maria","email":"maria@example.com"}
```

Credenciais incorretas retornam sempre `401`, tanto para email inexistente quanto senha incorreta:

```json
{"message":"Credenciais inválidas.","error":"Unauthorized","statusCode":401}
```

Email duplicado retorna `409`; dados inválidos retornam `400` com uma lista de mensagens. Campos extras são rejeitados. Nome é obrigatório, aparado e limitado a 100 caracteres; email é aparado, convertido para minúsculas, validado e limitado a 150; senha de cadastro tem 8 a 128 caracteres e é preservada sem trim. Login aceita senha não vazia até 128 caracteres.

Senhas são armazenadas como Argon2id em `usuarios.senha` (VARCHAR(255)), com salt aleatório e parâmetros memoryCost=19456 KiB, timeCost=2 e parallelism=1. A restrição UNIQUE existente protege o cadastro inclusive em concorrência. JWT usa HS256, issuer `wasfa-backend`, audience `wasfa`, `sub` com o ID, e expiração obrigatória. `/auth/me` consulta o usuário novamente. Não existe refresh token ou revogação nesta fase; logout no futuro cliente não invalidará tokens já emitidos. Use HTTPS na publicação.

## Compatibilidade com os scripts

- As quatro tabelas, os tipos e a chave composta são representáveis no Prisma. `quantidade` continua texto; `usuarios` permanece sem relações.
- Procedures e function não são métodos gerados do Prisma Client. Views não são necessárias às leituras desta fase. Todos permanecem no MySQL e nos scripts originais.
- Inserts dependem de IDs iniciais e não são idempotentes; functions/procedures também falham se recriadas sem remoção prévia.
- Senhas `hash_exemplo_*` são marcadores, não hashes utilizáveis: login desses registros retorna 401. Cadastros novos usam Argon2id; senhas antigas em texto puro não são aceitas ou migradas automaticamente.
- Schema SQL não define charset, collation ou engine. Confirme no servidor o suporte a FKs e os padrões efetivos; `db pull` deve refletir o banco real.
- Categoria, imagem, notas, favoritos e autoria não existem no banco. Esta fase não cria esses campos.
- Prisma 6 foi fixado para compatibilidade com o Node instalado. Não atualizar para Prisma 7 sem revisar requisitos, configuração e adaptador.

Referências: [introspecção Prisma](https://www.prisma.io/docs/orm/prisma-schema/introspection), [NestJS](https://docs.nestjs.com/first-steps).

## Verificação realizada em 01/11/2026

- Introspecção real: quatro models no schema `wasfa`, sem alteração do banco.
- Schema validado, cliente gerado e TypeScript compilado.
- Testes HTTP com provider substituído: configuração, rotas, CORS e falhas de conexão.
- Teste HTTP com MySQL real: três rotas aprovadas; 11 receitas retornadas. A base possui dados além dos dez registros iniciais do script, o que não impede a leitura.
- Fase 3: build e quatro testes HTTP/configuração aprovados; dois testes com MySQL real aprovados, incluindo cadastro, hash, duplicidade, login e acesso protegido em transação revertida.
- Fase 5: build aprovado; 29 testes Jest de pesquisa e quatro testes existentes aprovados. Integração de pesquisa aprovada sobre 11 receitas reais, validando listagem, filtros, relevância, paginação, detalhes e parâmetros, sem escrita no banco.
- No Windows, se `prisma generate` retornar EPERM ao renomear `query_engine-windows.dll.node`, um processo está usando o cliente. Encerre o backend antes de regenerar. Nesta validação, o teste MySQL foi executado com `node --test test/mysql.test.cjs` sobre o build já aprovado, pois a DLL estava em uso.
- `npm audit` após tentativa de correções compatíveis registra 12 avisos (5 moderados, 7 altos), incluindo dependências do NestJS e da CLI Prisma. A correção sugerida envolve mudanças de versões principais ou downgrade do Prisma; não foi aplicado `--force`. Atualização e revisão dessas dependências continuam pendentes antes de publicação em produção.
- Na instalação do Jest da fase 5, o npm informou 31 avisos no conjunto completo de dependências (1 baixo, 23 moderados, 7 altos), incluindo ferramentas de desenvolvimento. A revisão dessas dependências continua pendente; não foram aplicadas atualizações forçadas.
