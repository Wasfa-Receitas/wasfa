# Wasfa — backend (fase 2)

NestJS 10, TypeScript e Prisma 6.19, compatíveis com Node 20.15+. Pacote independente do frontend. Não implementa autenticação, cadastro, pesquisa ou escrita no banco.

## Instalação

No PowerShell, a partir da raiz do repositório:

```powershell
cd .\wasfa\backend
npm ci
Copy-Item .env.example .env
```

Preencha `.env` localmente com a conexão do MySQL existente. O exemplo contém apenas marcadores, não credenciais válidas. Codifique caracteres especiais do usuário/senha na URL. Não coloque variáveis do banco no frontend. Execute os comandos seguintes dentro de `backend/`.

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

`npm test` gera o cliente, compila e executa testes HTTP com o provider de banco substituído. Verifica rotas, consulta, CORS e erros 503, mas não comprova integração com MySQL real. Build e testes não precisam de banco online. `prisma:validate` precisa de uma DATABASE_URL sintaticamente válida, mas não abre conexão.

`npm run test:mysql` exige o MySQL real configurado e valida as três rotas usando consultas de leitura, sem inserir, atualizar ou excluir dados.

## Endpoints

| Rota | Resultado |
| --- | --- |
| `GET /health` | 200: `{"status":"ok","service":"wasfa-backend"}`; verifica o processo HTTP, sem consultar MySQL |
| `GET /health/db` | Executa `SELECT 1`; 200 com `{"status":"ok","database":"up"}` ou 503 |
| `GET /receitas` | Lê no máximo 20 receitas, por `id_receita` crescente; retorna array com `id_receita`, `nome`, `tempo_preparo`, `dificuldade`; 503 em falha de banco |

Não há prefixo `/api`, filtros ou paginação nesta fase. Uma tabela vazia retorna `[]`. Nenhuma rota expõe usuários ou senhas. `/health/db` confirma conexão, mas somente `/receitas` confirma acesso à tabela.

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/health/db
Invoke-RestMethod http://localhost:3000/receitas
```

Conexão é aberta sob demanda: o servidor pode iniciar mesmo com MySQL indisponível. Requisições ao banco retornam erro genérico, sem credenciais na resposta. Configure `PORT` (padrão 3000) e `CORS_ORIGINS` com origens separadas por vírgula. O padrão permite localhost e 127.0.0.1 na porta 5173. Se Vite usar outra porta ou `preview` (normalmente 4173), acrescente sua origem. CORS autoriza GET, HEAD e OPTIONS; não é autenticação.

## Compatibilidade com os scripts

- As quatro tabelas, os tipos e a chave composta são representáveis no Prisma. `quantidade` continua texto; `usuarios` permanece sem relações.
- Procedures e function não são métodos gerados do Prisma Client. Views não são necessárias às leituras desta fase. Todos permanecem no MySQL e nos scripts originais.
- Inserts dependem de IDs iniciais e não são idempotentes; functions/procedures também falham se recriadas sem remoção prévia.
- Senhas `hash_exemplo_*` são marcadores, não hashes utilizáveis. Autenticação fica para outra fase.
- Schema SQL não define charset, collation ou engine. Confirme no servidor o suporte a FKs e os padrões efetivos; `db pull` deve refletir o banco real.
- Categoria, imagem, notas, favoritos e autoria não existem no banco. Esta fase não cria esses campos.
- Prisma 6 foi fixado para compatibilidade com o Node instalado. Não atualizar para Prisma 7 sem revisar requisitos, configuração e adaptador.

Referências: [introspecção Prisma](https://www.prisma.io/docs/orm/prisma-schema/introspection), [NestJS](https://docs.nestjs.com/first-steps).

## Verificação realizada em 01/11/2026

- Introspecção real: quatro models no schema `wasfa`, sem alteração do banco.
- Schema validado, cliente gerado e TypeScript compilado.
- Testes HTTP com provider substituído: configuração, rotas, CORS e falhas de conexão.
- Teste HTTP com MySQL real: três rotas aprovadas; 11 receitas retornadas. A base possui dados além dos dez registros iniciais do script, o que não impede a leitura.
- `npm audit` após tentativa de correções compatíveis registra 12 avisos (5 moderados, 7 altos), incluindo dependências do NestJS e da CLI Prisma. A correção sugerida envolve mudanças de versões principais ou downgrade do Prisma; não foi aplicado `--force`. Atualização e revisão dessas dependências continuam pendentes antes de publicação em produção.
