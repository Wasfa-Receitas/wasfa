# Relatório de homologação — Wasfa

**Data:** 01/11/2026. **Conclusão:** critérios funcionais automatizados aprovados; revisão visual manual e pendências de segurança permanecem abertas. Não houve publicação em ambiente externo.

## Execução e evidências

Rodada final: **19:11:50 a 19:12:22, America/Sao_Paulo**, correspondente a 22:11:50–22:12:22 UTC. Windows, Node **v20.15.1**, MySQL **8.0.46**, tabelas InnoDB. A versão efetivamente testada está registrada, sem pressupor teste em outras versões.

Evidências finais: [pasta da rodada](evidencias/2026-11-01T22-11-50-505Z/) e [resumo com comandos, códigos de saída e horários](evidencias/2026-11-01T22-11-50-505Z/summary.json). A pasta anterior `2026-11-01T22-04-10-986Z` contém a rodada preliminar; a final adiciona auditorias, verifica explicitamente a criação pela procedure e alinha a URL embutida no build ao backend simulado.

| Verificação | Resultado real | Evidência |
| --- | --- | --- |
| Build NestJS | Aprovado, exit code 0 | [log](evidencias/2026-11-01T22-11-50-505Z/backend-build.log) |
| Build React/Vite | Aprovado, sete entradas HTML | [log](evidencias/2026-11-01T22-11-50-505Z/frontend-build.log) |
| Backend legado, Node test runner | 4 aprovados | [TAP](evidencias/2026-11-01T22-11-50-505Z/backend-node-tests.log) |
| Backend pesquisa, Jest/Supertest com Prisma substituído | 29 aprovados | [JSON](evidencias/2026-11-01T22-11-50-505Z/backend-jest.json) |
| Backend essencial, Jest/Supertest com MySQL real | 12 aprovados | [JSON](evidencias/2026-11-01T22-11-50-505Z/backend-essential-mysql.json) |
| Backend integrações MySQL preexistentes | 3 aprovados | [TAP](evidencias/2026-11-01T22-11-50-505Z/backend-legacy-mysql.log) |
| React, Vitest/Testing Library com HTTP simulado | 14 aprovados | [JSON](evidencias/2026-11-01T22-11-50-505Z/frontend-tests.json) |
| React com NestJS/MySQL real | 1 aprovado, somente leitura | [JSON](evidencias/2026-11-01T22-11-50-505Z/frontend-live.json) |
| Seis SQLs obrigatórios | Todos executados com sucesso em schema isolado | [validação e SHA-256](evidencias/2026-11-01T22-11-50-505Z/sql-validation.json), [saída SQL](evidencias/2026-11-01T22-11-50-505Z/sql-execution.log) |
| Produção simulada local | 9 verificações HTTP aprovadas | [JSON](evidencias/2026-11-01T22-11-50-505Z/production-http.json) |

**Total: 63 testes automatizados aprovados, zero falhas na rodada final.** Os 12 testes MySQL e o teste React live ficam ignorados nas respectivas suítes offline, mas foram executados separadamente na rodada online; não são contados duas vezes. As verificações SQL e os nove checks HTTP são adicionais a esse total.

## Funcionalidades aprovadas

- Cadastro retorna 201, grava Argon2id e não expõe senha ou hash; email duplicado retorna 409, inclusive com diferenças de maiúsculas e em teste de concorrência com provider substituído.
- Login válido retorna 200; credenciais incorretas retornam 401. `/auth/me` exige JWT válido. Tokens inválidos/expirados e usuários inexistentes são rejeitados nos testes HTTP.
- Pesquisa parcial por nome e ingrediente usa os dados MySQL. Banana retorna panqueca, vitamina e salada de frutas por ingrediente; por nome retorna panqueca e vitamina.
- Banana/aveia retorna três receitas sem duplicatas; panqueca e vitamina têm duas correspondências. Nome e ingredientes combinam com AND; paginação preserva ordenação.
- Detalhes retornam campos reais, ingredientes e quantidades. Receita inexistente retorna 404; parâmetros inválidos retornam 400; ausência de resultados retorna lista vazia.
- React envia cadastro/login, restaura sessão, remove token inválido, preserva token em falha de rede e apresenta erros. Pesquisa, cards com ID, paginação, carregamento, ausência de resultados e detalhes foram verificados por componentes.
- A pesquisa e a abertura do detalhe também passaram com HTTP real, do serviço React ao NestJS/MySQL. Esse teste não cria usuários.

## Validação dos scripts SQL

Executados: `schema.sql`, `inserts.sql`, `functions.sql`, `procedures.sql`, `views.sql`, `consultas.sql`.

Destino final: **`wasfa_homolog_1793571110510_4f3f8b`**. Somente CREATE DATABASE/USE foram redirecionados nas cópias em memória, preservando lógica e arquivos originais. Não houve recriação, exclusão ou alteração do banco `wasfa` usado pelo aplicativo. A rodada preliminar também deixou um schema próprio, registrado em seu relatório. Os schemas isolados foram mantidos para inspeção.

Resultados: quatro tabelas InnoDB; 3 usuários, 10 receitas, 20 ingredientes e 32 associações. A function retornou 3 ingredientes para a receita 1; a procedure de listagem retornou os três ingredientes; a procedure de cadastro criou uma receita dentro de transação e o rollback restaurou o total 10. As views retornaram 10 resumos e 32 associações. As cinco consultas de demonstração produziram resultados registrados no log.

A suíte Jest essencial usou a mesma transação MySQL real durante os casos, adaptando somente o ciclo de conexão do Prisma ao teste. Não simula resultados das tabelas. Os cadastros foram revertidos e a ausência do usuário após rollback foi conferida. AUTO_INCREMENT pode avançar no schema de teste.

## Produção simulada e limites da evidência

Backend compilado com NODE_ENV=production na porta 3101 e banco isolado; React compilado com URL da API nessa porta e servido por preview em 4175. As sete entradas HTML, o arquivo JavaScript e a resposta CORS da API retornaram sucesso. Os processos criados pelo executor foram encerrados; processos preexistentes não foram interrompidos.

Não foram executados deploy público, TLS, teste de carga, pentest ou revisão visual em navegador real. O teste React usa jsdom, inclusive na chamada HTTP real. Não se presume que esses testes comprovem layout responsivo ou comportamento visual; realizar VIS-01 antes da apresentação.

## Falhas e pendências

| Item | Situação e impacto |
| --- | --- |
| Falhas funcionais automatizadas | Nenhuma na rodada final. Nenhum bug funcional crítico foi reproduzido que exigisse alteração do código da aplicação. |
| Segurança das dependências do backend | Auditoria real: **31 avisos — 3 baixos, 21 moderados e 7 altos; nenhum crítico**. Inclui dependências de runtime e desenvolvimento. [Relatório](evidencias/2026-11-01T22-11-50-505Z/backend-audit.json). Revisão necessária antes de publicação real; não foi aplicado `npm audit fix --force`, que propõe mudanças incompatíveis. |
| Segurança das dependências do frontend | Zero avisos na [auditoria desta rodada](evidencias/2026-11-01T22-11-50-505Z/frontend-audit.json). Isso não equivale a ausência de qualquer vulnerabilidade da aplicação. |
| Revisão visual e acessibilidade manual | Pendente: desktop/celular, navegação por teclado e captura de telas. Não há screenshots inventadas. |
| Dados dos usuários SQL | `hash_exemplo_*` são marcadores; não permitem login. Criar conta nova na apresentação. |
| Reexecução dos SQLs | Inserts e rotinas não são idempotentes. A validação usa schema novo; não repetir sobre dados existentes sem planejamento. |
| Configuração MySQL | Nesta máquina, root permite criar rotinas. Outros servidores podem exigir permissões de criação de function/configuração de binary log; nenhuma política foi modificada. |
| Funcionalidades fora do escopo | Favoritos continuam locais; categorias/imagens/avaliações não existem no schema. Não há recuperação de senha, refresh/revogação de JWT ou limitação de tentativas. |

A aprovação aqui é **funcional e acadêmica nos critérios automatizados**, com as ressalvas acima; não é certificação de segurança para produção pública.

## Alterações nesta fase

- Criados `backend/scripts/validate-sql.cjs` e `backend/scripts/homologate.cjs`, com evidências, isolamento e encerramento apenas dos processos próprios.
- Criada suíte `backend/test/essential-mysql.spec.cjs`, com 12 casos Jest/Supertest reais e rollback.
- Adicionado `npm run homologate` no backend.
- Criados README principal, roteiro, documento de ambientes e este relatório; READMEs de backend/frontend apontam para a entrega.
- Registrados logs, JSONs e hashes nas duas pastas de evidências.
- Ajustada a configuração do executor para embutir a URL correta no build simulado e verificar a procedure de cadastro. São ajustes da infraestrutura de homologação; o código funcional, o schema Prisma e os seis scripts SQL não foram alterados.

## Reproduzir

Consulte o [README principal](../README.md) para instalação/configuração, o [roteiro com entrada/passos/resultado esperado](ROTEIRO_TESTES.md) e os [ambientes simulados](AMBIENTES.md). Com ambos os pacotes instalados, MySQL e backend/.env configurados:

```powershell
cd backend
npm run homologate
```

Cada execução cria uma pasta de evidências e um schema novos. Se qualquer build, teste, script SQL ou smoke falhar, o executor termina com código não zero; avisos da auditoria são registrados como pendências separadas e não mascarados como testes funcionais aprovados.
