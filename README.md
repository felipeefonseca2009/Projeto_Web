# Vrum Oficina

Aplicação Express/EJS para receber solicitações de atendimento e gerenciar a operação da oficina com MySQL.

## Configuração local

1. Instale as dependências com `npm install`.
2. Crie `.env` com base em `.env.example` e preencha as credenciais do MySQL/Aiven. Não publique o `.env`.
3. Gere `SESSION_SECRET` com `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
4. Execute `schema.sql` no banco configurado em `DB_NAME`.
5. Para criar o primeiro administrador, defina temporariamente `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` no ambiente e execute `npm run create-admin`. A senha deve ter entre 12 e 72 bytes; remova `ADMIN_PASSWORD` depois.
6. Inicie com `npm start` e acesse `/admin/login`.

No Render, configure também `SESSION_SECRET` e `NODE_ENV=production` nas variáveis do serviço. O Render fornece `PORT` automaticamente. Para validar o banco, use `npm run test:db` ou `/teste-db`.

## Fluxo operacional

O formulário público cria uma solicitação pendente. Um administrador cadastra mecânicos e processa a solicitação com e-mail, dados do veículo, preço, pagamento e mecânico. A operação cria ou reutiliza o cliente, cria ou reutiliza o veículo, registra o serviço e atualiza o status da solicitação dentro de uma transação.
