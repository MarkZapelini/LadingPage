# Pendencias Para Producao - Z-Core

Atualizado em: 2026-06-20

Este arquivo resume o que ainda falta ajustar antes de considerar o projeto pronto para uso online com mais seguranca e previsibilidade.

## Prioridade Alta

### 1. Ajustar ambiente de producao

- Corrigir `docker-compose.yml` para remover `ADMIN_PASS=admin123`.
- Adicionar `ADMIN_EMAIL` no ambiente Docker.
- Definir `JWT_SECRET` forte e exclusivo por ambiente.
- Restringir `CORS_ORIGIN` para o dominio real do site.
- Confirmar `APP_URL` com a URL publica correta.

### 2. Corrigir documentacao insegura/desatualizada

- Atualizar `README.md` para parar de indicar `admin123` como credencial padrao.
- Atualizar `DEPLOY.md` para refletir o modelo atual de autenticacao do admin.
- Atualizar `backend/.env.example` com exemplos seguros para producao.

### 3. Revisar persistencia para producao

- Evitar SQLite como solucao principal em deploy serverless.
- Definir se a producao vai usar VPS/Docker com volume persistente ou migrar para banco externo.
- Validar backup real do banco e estrategia de restauracao.

### 4. Fechar fluxo real de pagamento

- Corrigir o mapeamento de status no webhook de pagamento.
- Revisar o que deve acontecer quando o Mercado Pago retorna `approved`, `pending`, `rejected` e `in_process`.
- Validar retorno para `pedidos.html` e `checkout.html` em ambiente publicado.
- Testar `notification_url` com `APP_URL` real.

## Prioridade Media

### 5. Validar fluxo completo de compra

- Testar cadastro.
- Testar login.
- Testar recuperacao de senha.
- Testar adicionar ao carrinho.
- Testar checkout.
- Testar criacao de pedido.
- Testar redirecionamento para pagamento.
- Testar atualizacao de status do pedido apos webhook.

### 6. Revisar admin em ambiente publicado

- Confirmar login admin com backend online.
- Confirmar criacao, edicao e exclusao de produtos pela API.
- Confirmar atualizacao de status dos pedidos pela API.
- Validar comportamento quando a API cair.

### 7. Revisar arquivos de apoio publicados

- Decidir se as paginas de teste abaixo devem continuar acessiveis:
- `frontend/pages/criar-conta-teste.html`
- `frontend/pages/logar-automaticamente.html`
- `frontend/pages/diagnostico.html`

## Prioridade Baixa

### 8. Padronizacao final

- Padronizar uso de tema entre `zcore-theme` e `zcore_theme`.
- Reduzir logs de debug ainda existentes em login e cadastro.
- Fazer limpeza final de arquivos legados e utilitarios de teste que nao devem ir para producao.

## Configuracoes Que Precisam Existir Em Producao

No backend:

- `PORT`
- `JWT_SECRET`
- `ADMIN_USER`
- `ADMIN_PASS`
- `ADMIN_EMAIL`
- `CORS_ORIGIN`
- `APP_URL`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`

## Recomendacao De Publicacao

Hoje o projeto esta mais proximo de um MVP pronto, mas antes de vender como loja online em operacao real ainda vale concluir:

1. Ambiente seguro.
2. Pagamento validado ponta a ponta.
3. Banco/persistencia definidos para producao.
4. Documentacao alinhada com o estado atual do codigo.

## Checklist Rapido

- [ ] Remover credenciais inseguras de exemplos e compose
- [ ] Configurar `.env` real de producao
- [ ] Corrigir webhook/status de pagamento
- [ ] Validar fluxo completo de compra
- [ ] Validar painel admin online
- [ ] Definir persistencia real
- [ ] Revisar paginas de teste publicadas
- [ ] Atualizar documentacao final
