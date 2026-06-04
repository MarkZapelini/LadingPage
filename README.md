# Z-Core — Loja de Eletrônicos

Loja virtual de eletrônicos com vitrine, carrinho, checkout, área do cliente e painel administrativo.

O projeto possui **front-end** (HTML/CSS/JS) e **back-end** (Node.js + Express + SQLite) com API REST. O front-end usa a API quando o servidor está rodando; se estiver offline, continua funcionando com `localStorage` (modo legado).

> **Slogan:** Tecnologia que transforma seu dia.

---

## Índice

- [Como executar o projeto](#como-executar-o-projeto)
- [API REST (backend)](#api-rest-backend)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Páginas do site](#páginas-do-site)
- [Loja — guia do cliente](#loja--guia-do-cliente)
- [Painel administrativo](#painel-administrativo)
- [Modo claro e escuro](#modo-claro-e-escuro)
- [Onde os dados ficam salvos](#onde-os-dados-ficam-salvos)
- [Tecnologias](#tecnologias)
- [Observações importantes](#observações-importantes)

---

## Como executar o projeto

### Modo completo (recomendado) — com backend

Requisitos: [Node.js](https://nodejs.org/) 18+ e npm.

**Opção 1: Via npm (Recomendado)**

```powershell
# Na raiz do projeto
npm run install:backend  # Instala dependências do backend
npm start                # Inicia o servidor na porta 3000
```

Acesse:
- Loja: http://localhost:3000/index.html
- Admin: http://localhost:3000/admin/login-admin.html

**Opção 2: Via PowerShell (Porta 8080)**

Se preferir rodar apenas o frontend em um servidor simples sem Node.js (limitado):

```powershell
# Na raiz do projeto
powershell -ExecutionPolicy Bypass -File scripts/start-server-porta8080.ps1
```

Acesse: http://localhost:8080/index.html

### Modo só front-end (sem backend)

1. Abra `frontend/index.html` diretamente no navegador ou use **Live Server**.
2. Dados ficam no `localStorage` do navegador.

---

## API REST (backend)

Base URL: `http://localhost:3000/api`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status da API |
| POST | `/auth/register` | Cadastro |
| POST | `/auth/login` | Login cliente |
| POST | `/auth/google` | Login Google (após Firebase no client) |
| POST | `/auth/admin/login` | Login admin |
| POST | `/auth/forgot-password` | Token de recuperação |
| POST | `/auth/reset-password` | Nova senha |
| GET | `/products` | Listar produtos |
| POST/PUT/DELETE | `/products` | CRUD admin (token admin) |
| POST | `/orders` | Criar pedido (cliente logado) |
| POST | `/orders/guest` | Pedido vitrine admin |
| GET | `/orders/me` | Pedidos do cliente |
| GET | `/orders` | Todos pedidos (admin) |
| GET | `/orders/stats` | Dashboard de vendas |
| PATCH | `/orders/:id/status` | Alterar status |
| GET/PUT/DELETE | `/cart` | Carrinho do usuário |
| GET/PUT | `/wishlist` | Lista de desejos |
| PATCH | `/users/me` | Atualizar perfil |

**Variáveis de ambiente** (`backend/.env`):

```env
PORT=3000
JWT_SECRET=sua-chave-secreta
ADMIN_USER=admin
ADMIN_PASS=admin123
```

**Banco de dados:** SQLite em `backend/data/zcore.db` (criado automaticamente; 6 produtos padrão no primeiro start).

---

## Estrutura de pastas

```
LadingPage/
├── README.md                 ← Esta documentação
├── package.json              ← Scripts npm na raiz
├── docs/                     ← Documentação adicional (Changelog, Guias)
├── scripts/                  ← Scripts utilitários (Servidores, Automação)
├── frontend/                 ← Código do Front-end (HTML/CSS/JS)
│   ├── index.html            ← Página inicial da loja
│   ├── pages/                ← Demais páginas da loja
│   ├── admin/                ← Painel administrativo
│   ├── css/                  ← Estilos globais
│   ├── js/                   ← Lógica e integração API
│   └── assets/               ← Imagens e recursos
├── backend/                  ← Código do Back-end (Node.js/Express)
│   ├── server.js             ← Servidor principal
│   └── src/                  ← Rotas, DB e middlewares
└── react-frontend/           ← Versão experimental em React
```

> A pasta `backend/ADMIN/User` é legado — **não usar**. Use `frontend/admin.html`.

---

## Páginas do site

| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Início | `INDEX.HTML` | Vitrine, categorias, busca, carrinho e wishlist |
| Login | `login.html` | Entrada com e-mail/senha ou Google |
| Cadastro | `cadastro.html` | Criação de conta |
| Checkout | `CHECKOUT.HTML` | Endereço, pagamento e confirmação do pedido |
| Meus pedidos | `pedidos.html` | Histórico do usuário logado |
| Meu perfil | `perfil.html` | Dados pessoais editáveis |
| Recuperar senha | `reset-password.html` | Nova senha via link por e-mail |
| Login admin | `login-admin.html` | Acesso ao painel administrativo |
| Painel admin | `admin.html` | Gestão de produtos e pedidos |

---

## Loja — guia do cliente

### Navegar e comprar

1. Abra **`INDEX.HTML`**.
2. Use a **busca**, **filtros** ou **categorias** para encontrar produtos.
3. Clique em **+** para adicionar ao carrinho ou no **coração** para a wishlist.
4. Abra o **carrinho** e clique em **Finalizar Compra**.
5. Preencha o checkout em **`CHECKOUT.HTML`** e confirme o pedido.

### Criar conta

1. Acesse **Cadastre-se** (`cadastro.html`).
2. Preencha nome, e-mail, CPF, telefone e senha.
3. Após o cadastro, você será redirecionado para a loja já logado.

### Entrar na conta

**E-mail e senha**

1. Acesse **Entrar** (`login.html`).
2. Informe o e-mail e a senha cadastrados.

**Google**

- Na tela de login ou cadastro, use **Entrar com Google** (requer Firebase configurado e domínio autorizado).

### Recuperar senha

1. Em `login.html`, clique em **Recuperar**.
2. Informe o e-mail cadastrado.
3. Um link será enviado (via EmailJS, se configurado) ou exibido no console em ambiente de teste.
4. Abra o link e defina a nova senha em `reset-password.html`.

### Meus pedidos e perfil

- Com a conta logada, use **Meus Pedidos** e **Meu Perfil** no menu superior.
- Pedidos feitos no checkout aparecem em `pedidos.html` e também no painel admin.

---

## Painel administrativo

### Credenciais padrão

| Campo | Valor |
|-------|--------|
| **Usuário** | `admin` |
| **Senha** | `admin123` |

> O login é **sensível a maiúsculas/minúsculas**. Use `admin` em minúsculas, não `Admin`.

### Como acessar (passo a passo)

1. Abra no navegador: **`frontend/login-admin.html`**
2. Digite:
   - Usuário: `admin`
   - Senha: `admin123`
3. Clique em **Entrar no Painel**.
4. Você será redirecionado para **`admin.html`**.

**URLs diretas (após login):**

- Login: `frontend/login-admin.html`
- Painel: `frontend/admin.html`

Se tentar abrir `admin.html` sem estar logado, o sistema redireciona automaticamente para a tela de login.

### Sair do painel

No painel admin, clique em **Sair** na barra superior. A sessão é removida do navegador.

### O que o admin pode fazer

| Seção | Função |
|-------|--------|
| **Dashboard** | Resumo: total de produtos, receita, pedidos e estoque baixo |
| **Produtos** | Listar, buscar, editar e excluir produtos |
| **Adicionar Produto** | Nome, categoria, preço, promoção, estoque, foto, status |
| **Vitrine & Checkout** | Simular vendas e finalizar pedidos pelo painel |
| **Pedidos** | Ver pedidos confirmados (loja + checkout do cliente) |

**Status do produto**

- **Ativo** — visível na loja (com estoque > 0).
- **Rascunho** — oculto na vitrine.
- **Destaque** — exibe badge "NOVO" na loja.

Produtos salvos no admin aparecem na página inicial (`INDEX.HTML`) após recarregar a página.

---

## Modo claro e escuro

- Botão com ícone de **sol** ou **lua** na barra de navegação (e nas telas de login admin / recuperar senha).
- A preferência fica salva em `localStorage` com a chave `zcore-theme` (`light` ou `dark`).
- Funciona em todas as páginas da loja e no painel admin.

---

## Onde os dados ficam salvos

**Com backend ativo:** SQLite (`backend/data/zcore.db`) é a fonte da verdade. Tokens JWT ficam no `localStorage` (`zcore_token`, `zcore_admin_token`).

**Sem backend:** fallback no **navegador** (`localStorage`):

| Chave | Conteúdo |
|-------|----------|
| `adminProducts` | Catálogo de produtos (loja + admin) |
| `adminOrders` | Pedidos do sistema |
| `usuarios` | Contas de clientes (e-mail/senha em texto — ver observações) |
| `usuarioLogado` | Sessão do cliente atual |
| `adminLogado` | Sessão do administrador |
| `cart` | Carrinho de compras |
| `wishlist` | Lista de desejos |
| `resetTokens` | Tokens de recuperação de senha |
| `zcore-theme` | Tema claro ou escuro |
| `adminProfile` | Nome/foto do admin no painel |

**Firebase (parcial):** usuários Google e pedidos podem ser gravados no Firestore; a vitrine principal ainda lê produtos do `localStorage`.

---

## Tecnologias

| Tipo | Uso |
|------|-----|
| HTML5 / CSS3 / JavaScript | Front-end |
| Node.js + Express | API REST |
| SQLite (better-sqlite3) | Banco de dados |
| JWT + bcrypt | Autenticação |
| Font Awesome / Tabler Icons | Ícones |
| Firebase (opcional) | Login Google no client |
| EmailJS (opcional) | E-mail de recuperação de senha |
| Google Fonts | Syne e DM Sans |

---

## Observações importantes

1. **Produção:** use o backend em um VPS/Railway/Render e sirva o front-end pela mesma origem ou configure CORS.
2. **Modo legado:** sem `npm start`, o site ainda funciona só com `localStorage` (senhas em texto no browser).
3. **Admin:** altere `ADMIN_USER` e `ADMIN_PASS` no `.env` e `JWT_SECRET` antes de publicar.
4. **Arquivos em MAIÚSCULAS:** `INDEX.HTML` e `CHECKOUT.HTML` podem exigir atenção em servidores Linux (case-sensitive).
5. **Categorias no admin:** ao cadastrar produtos, prefira alinhar categorias com os filtros da loja (`smartphones`, `notebooks`, `audio`, `tvs`, `wearables`, `games`) para os filtros funcionarem corretamente.

---

## Objetivo do projeto

Criar uma plataforma moderna de e-commerce focada em eletrônicos, com experiência rápida e intuitiva: vitrine, carrinho, conta do cliente, checkout e gestão administrativa em um único repositório front-end.

---

**Z-Core Eletrônicos** — © 2025
