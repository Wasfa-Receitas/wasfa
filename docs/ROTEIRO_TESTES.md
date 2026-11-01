# Roteiro de testes — Wasfa

Use ambiente de homologação separado. Não registre senha real nem JWT em evidências. Os IDs da massa inicial valem somente no schema novo criado pelos scripts.

| ID | Entrada | Passos | Resultado esperado |
| --- | --- | --- | --- |
| SQL-01 | Seis arquivos de `database/` | Executar `npm run homologate`; conferir `sql-validation.json` e log | Seis scripts sem erro; SHA-256 dos originais registrado; 4 tabelas, 3 usuários, 10 receitas, 20 ingredientes, 32 relações |
| SQL-02 | Receita 1 | Consultar function, procedures e views pelo executor | Function retorna 3; procedure lista 3 ingredientes; views têm 10 e 32 linhas; cadastro de receita em transação é revertido |
| AUT-01 | Nome, email único, senha de 8–128 caracteres | Abrir Criar conta; preencher; confirmar senha; enviar | API 201; perfil do usuário; senha somente como hash no banco, ausente da resposta |
| AUT-02 | Email já cadastrado, com diferença de maiúsculas | Repetir cadastro | 409, sem nova conta |
| AUT-03 | Email e senha válidos | Sair; entrar novamente | 200; JWT; perfil com nome do MySQL |
| AUT-04 | Senha incorreta ou email inexistente | Enviar login | 401 e mesma mensagem genérica de credenciais inválidas |
| AUT-05 | JWT válido / ausente / expirado | Consultar `/auth/me` | 200 para válido; 401 para os demais; nenhum hash ou senha |
| AUT-06 | Senhas de confirmação diferentes | Preencher cadastro React e enviar | Erro local sem chamada ao cadastro |
| AUT-07 | JWT em sessionStorage | Recarregar página de perfil | Aguarda `/auth/me`; restaura usuário; não grava senha no navegador |
| AUT-08 | Token válido e servidor indisponível | Simular falha HTTP no teste de componentes; repetir | Erro e opção Tentar novamente; token preservado em falha de rede |
| REC-01 | `/recipes?page=1&limit=2` | Solicitar listagem no schema inicial | 200, duas receitas e total 10 |
| REC-02 | `name=banana` | Buscar por nome | Panqueca de banana e Vitamina de banana |
| REC-03 | `ingredients=banana` | Buscar por ingrediente | Três receitas: panqueca, vitamina e salada de frutas |
| REC-04 | `ingredients=banana,aveia` | Buscar por vários termos | Três receitas sem duplicatas; panqueca/vitamina primeiro com 2 correspondências |
| REC-05 | `name=panqueca&ingredients=aveia` | Combinar os campos e enviar | Uma receita: Panqueca de banana |
| REC-06 | `name=nao-existe-9784` | Buscar por nome sem correspondência | 200, `items: []`, total 0; React exibe ausência de resultados |
| REC-07 | `/recipes/1` | Abrir card correspondente | Nome, tempo, dificuldade, preparo e três ingredientes com quantidades |
| REC-08 | `/recipes/2147483647` e URL React sem ID | Abrir detalhe inexistente / sem seleção | API 404; mensagem React; sem exibir receita simulada |
| REC-09 | `page=0`, `limit=101`, ID `abc`, parâmetros extras | Enviar URLs inválidas | 400; nenhuma consulta de pesquisa com parâmetros inválidos |
| REC-10 | Termos com `%`, `_`, aspas e texto SQL | Executar suíte Jest | Tratados como dados parametrizados/literais, sem alterar a consulta |
| REC-11 | ` Banana, , aveia,banana, ` | Enviar pesquisa | Normalização e deduplicação; mesmo ranking da REC-04 |
| REC-12 | Página 2, limite 1 | Buscar banana/aveia e avançar | Segundo item do ranking; filtros mantidos |
| UI-01 | Pesquisa combinada no React | Executar `npm run test:live` | Componentes consultam NestJS/MySQL e abrem detalhe pelo ID real |
| UI-02 | Rede indisponível | Executar testes de componentes e clicar Tentar novamente | Carregamento, erro e recuperação sem dados simulados |
| BLD-01 | Código atual | Executar build NestJS e Vite | Compilação sem erro e sete entradas HTML no dist React |
| PRD-01 | Processos locais em 3101/4175 | Executar homologação e verificar production-http.json | Sete HTML e JS com HTTP 200; API 200 e header CORS correto |
| VIS-01 | Desktop e celular reais | Abrir home, login, lista, detalhes e menu móvel; navegar por teclado | Sem sobreposição, campos legíveis e navegação funcional; registrar capturas manualmente |

Os casos AUT/REC têm cobertura por Jest/Supertest, testes legados e/ou testes de componentes, conforme relatórios. VIS-01 é uma revisão manual pendente; um teste em jsdom não comprova layout visual. PRD-01 é smoke local de build, não deploy público ou teste de carga.
