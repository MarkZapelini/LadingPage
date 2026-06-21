# Z-Core — Loja de Eletrônicos

Loja virtual de eletrônicos com vitrine, carrinho, checkout, área do cliente e painel administrativo.

Este repositório inclui:
- `frontend/`: HTML/CSS/JS da loja e painel admin.
- `backend/`: API Node.js + Express + SQLite.
- `docs/`, `DEPLOY.md`: instruções de deploy e documentação extra.

---

## Resumo rápido

- `npm run install:backend`
- `npm start`
- Loja: `http://localhost:3000/index.html`
- Admin: `http://localhost:3000/admin/login-admin.html`

Se quiser apenas testar rapidamente, abra `frontend/index.html` no navegador e use o fallback de `localStorage`.

---

## Credenciais de teste

- Cliente: `teste@zcore.com.br` / `123456`
- Admin: `admin@zcore.local` / `admin123`

---

## Estrutura principal

- `frontend/`
  - `index.html`
  - `pages/` — login, cadastro, checkout, perfil, pedidos, etc.
  - `admin/` — painel administrativo
  - `css/`, `js/`, `assets/`
- `backend/`
  - `server.js`
  - `src/` — rotas, DB, middlewares
  - `data/` — SQLite criado em runtime
- `DEPLOY.md` — deploy em Vercel, Docker e VPS
- `docs/` — documentação adicional

---

## Como executar

### Com backend (recomendado)

Requisitos: Node.js 18+ e npm.

```powershell
npm run install:backend
npm start
```

### Sem backend

Abra `frontend/index.html` diretamente no navegador ou use um servidor local simples.

---

## Variáveis de ambiente

Crie `backend/.env` com:

```env
PORT=3000
JWT_SECRET=uma-chave-segura
ADMIN_USER=admin
ADMIN_PASS=admin123
ADMIN_EMAIL=admin@zcore.local
CORS_ORIGIN=*
```

---

## Nota sobre deploy

Para instruções completas de deploy, use `DEPLOY.md`.

---

## Observações

- O backend grava dados em SQLite em `backend/data/zcore.db`.
- O modo sem backend funciona, mas usa `localStorage` e não é adequado para produção.
- Em servidores Linux, nomes de arquivo maiúsculos podem ser sensíveis.
- Segue o login e senha para a cessar a conta no site do " PAINEL ADMIN" Email admin@zcore.local, Usurario admin , senha: admin123
---



**Z-Core Eletrônicos** — © 2025
