# Vrum Oficina

Aplicação Express/EJS para receber solicitações de atendimento e gerenciar a operação da oficina com MySQL.

## Configuração local

1. Instale as dependências com `npm install`.
2. Crie `.env` com base em `.env.example` e preencha as credenciais do MySQL/Aiven. Não publique o `.env`.
3. Gere `SESSION_SECRET` com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
4. Execute `schema.sql` no banco configurado em `DB_NAME`. Para um banco existente baseado no esquema anterior, execute `migrations/002_customer_service_links.sql`; se ele ainda não tiver as tabelas de contas, execute primeiro `migrations/001_user_accounts.sql`.
5. Inicie com `npm start`. Clientes podem se cadastrar em `/cadastro` e entrar em `/login`; somente depois do login é possível enviar solicitações em `/servicos`.
6. Administradores podem se cadastrar em `/admin/cadastro` e entrar em `/admin/login`. O cadastro administrativo é público nesta versão escolar: qualquer visitante pode criar uma conta com acesso ao painel.

No Render, configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SESSION_SECRET` e `NODE_ENV=production` nas variáveis do serviço. Configure também `DB_SSL_CA_PATH` se for usar o certificado CA do Aiven. O Render fornece `PORT` automaticamente. Para validar o banco, use `npm run test:db` ou `/teste-db`.

## Fluxo operacional

O formulário autenticado cria uma solicitação pendente vinculada à conta do cliente, com marca, modelo, ano, placa e descrição do problema. O administrador pode confirmar ou corrigir os dados do veículo já preenchidos antes de processar o pedido. A operação vincula ou cria o cadastro do cliente, cria ou atualiza o veículo, registra o serviço com a descrição do problema e atualiza o status da solicitação dentro de uma transação. O painel mantém uma lista das solicitações processadas.
