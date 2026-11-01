# Ambientes de homologação e produção simulada

## Desenvolvimento

Backend na porta 3000, React na 5173 e schema `wasfa`. Arquivos locais: `backend/.env` e `frontend/.env.local`, ambos ignorados pelo Git. O backend guarda DATABASE_URL e JWT_SECRET; o frontend conhece apenas VITE_API_URL. Não compartilhe arquivos de ambiente reais.

## Homologação automatizada

`cd backend; npm run homologate` usa a conexão configurada para criar um schema novo com identificador único. Somente o destino CREATE DATABASE/USE muda nas cópias em memória dos SQLs. Hashes SHA-256 comprovam os arquivos utilizados. Não são executados `db push`, migrations, reset ou exclusões do banco original.

Os testes existentes com mocks não exigem MySQL; os testes de integração apontam para o schema novo. A suíte Jest/Supertest essencial usa consultas reais, transação externa e rollback para não manter usuários. O schema isolado é mantido para auditoria. AUTO_INCREMENT pode avançar mesmo após rollback.

Requer MySQL com InnoDB, cliente mysql e permissões de criação de schema, tabelas, rotinas e views. Caso o servidor restrinja criação de function por configuração de binary log/permissões, a validação falha e registra o erro: o executor não altera políticas do servidor para contornar a restrição.

## Produção simulada local

| Configuração | Valor do executor |
| --- | --- |
| Backend | Build NestJS, `NODE_ENV=production`, porta 3101 |
| Banco | Schema exclusivo de homologação |
| CORS | `http://127.0.0.1:4175` |
| React | Build com `VITE_API_URL=http://127.0.0.1:3101` |
| Servidor estático de verificação | `vite preview`, porta 4175, strictPort |
| JWT | Chave local já configurada, não exposta nos relatórios |

O executor verifica HTTP das sete entradas HTML, arquivo JS e resposta CORS da API; também roda o teste de componentes com HTTP real. Encerra os processos que criou. Isso não equivale a deploy em hospedagem, navegador real, TLS, teste de carga ou validação de múltiplos usuários.

Para uma simulação manual, configure essas variáveis em arquivos locais ou no ambiente, execute build/start no backend e build/preview no frontend. O Vite incorpora a URL da API no build; alterar a variável depois exige reconstrução.

## Produção futura

Defina domínio HTTPS da API em VITE_API_URL antes do build, origem HTTPS do site em CORS_ORIGINS e chave JWT aleatória fora do repositório. Sirva dist por um servidor estático apropriado, com as URLs HTML preservadas; `vite preview` é apenas a ferramenta usada no smoke local. Use usuário MySQL com permissões mínimas para a aplicação e usuário separado para instalar/validar SQL. Não use as credenciais administrativas de homologação em publicação real.

Antes de publicar: revisar os avisos de dependências do backend, realizar VIS-01, definir limitação de tentativas de login, política de sessão e monitoramento. Essas ações não foram simuladas como concluídas.
