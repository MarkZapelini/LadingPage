# Guia de Deploy - Z-Core

Este guia explica como fazer deploy do Z-Core em diferentes plataformas.

---

## Opção 1: Deploy na Vercel (Recomendado para Frontend + API)

### Passo a passo:

1. **Crie uma conta na Vercel** (https://vercel.com)
2. **Instale o Vercel CLI** (se precisar):
   ```bash
   npm i -g vercel
   ```
3. **Login no Vercel**:
   ```bash
   npm run vercel:login
   # Ou diretamente: npx vercel login
   ```
4. **Deploy para produção**:
   ```bash
   npm run vercel:deploy
   # Ou diretamente: npx vercel --prod
   ```

### Observações importantes:
- O arquivo `vercel.json` já está configurado para redirecionar `/api/*` para o backend e o resto para o frontend
- **Banco de dados SQLite**: A Vercel tem limitações para armazenamento persistente. Para produção, recomenda-se usar PostgreSQL/MySQL em vez de SQLite.

---

## Opção 2: Deploy com Docker (Recomendado para VPS/Cloud)

### Requisitos:
- Docker instalado (https://www.docker.com)
- Docker Compose instalado

### Passo a passo:

1. **Construir a imagem**:
   ```bash
   npm run docker:build
   ```
2. **Iniciar o container**:
   ```bash
   npm run docker:up
   ```
3. **Ver os logs**:
   ```bash
   npm run docker:logs
   ```
4. **Parar o container**:
   ```bash
   npm run docker:down
   ```

### Acesso:
- Loja: http://localhost:3000
- Admin: http://localhost:3000/admin/login-admin.html
- API: http://localhost:3000/api

---

## Opção 3: Deploy em VPS (DigitalOcean, AWS EC2, etc.)

1. **Conecte-se ao seu servidor via SSH**
2. **Instale Node.js e npm**
3. **Clone ou envie os arquivos do projeto para o servidor**
4. **Instale as dependências**:
   ```bash
   npm run install:backend
   ```
5. **Inicie o servidor**:
   ```bash
   npm start
   ```
6. **(Recomendado) Use PM2 para manter o servidor rodando**:
   ```bash
   npm i -g pm2
   pm2 start backend/server.js --name zcore
   pm2 save
   pm2 startup
   ```

---

## Configuração do .env

Crie um arquivo `.env` na pasta `backend` (use `.env.example` como modelo):

```env
PORT=3000
JWT_SECRET=sua-chave-secreta-aqui-mude-isso
ADMIN_USER=admin
ADMIN_PASS=sua-senha-admin-aqui
CORS_ORIGIN=*
```

---

## Contas Padrão:

- **Usuário Teste**: teste@zcore.com.br / 123456
- **Admin**: admin / admin123

---

## Dúvidas?
- Abra `frontend/index.html` para começar rapidamente
- Consulte o `README.md` para mais informações
