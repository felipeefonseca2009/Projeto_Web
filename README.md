# Vrum Oficina

Aplicação Express/EJS para receber solicitações de atendimento e gerenciar a operação da oficina com MySQL.

## Configuração local

1. Instale as dependências com `npm install`.
2. Crie `.env` com base em `.env.example` e preencha as credenciais do MySQL/Aiven. Não publique o `.env`.
3. Gere `SESSION_SECRET` com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
4. Execute `schema.sql` no banco configurado em `DB_NAME`. Se o banco já tinha as tabelas antigas, execute também `migrations/001_user_accounts.sql`.
5. Inicie com `npm start`. Clientes podem se cadastrar em `/cadastro` e entrar em `/login`; somente depois do login é possível enviar solicitações em `/servicos`.
6. Administradores podem se cadastrar em `/admin/cadastro` e entrar em `/admin/login`. O cadastro administrativo é público nesta versão escolar: qualquer visitante pode criar uma conta com acesso ao painel.

No Render, configure também `SESSION_SECRET` e `NODE_ENV=production` nas variáveis do serviço. O Render fornece `PORT` automaticamente. Para validar o banco, use `npm run test:db` ou `/teste-db`.

## Fluxo operacional

O formulário autenticado cria uma solicitação pendente vinculada à conta do cliente. Um administrador cadastra mecânicos e processa a solicitação com e-mail, dados do veículo, preço, pagamento e mecânico. A operação cria ou reutiliza o cliente, cria ou reutiliza o veículo, registra o serviço e atualiza o status da solicitação dentro de uma transação.
