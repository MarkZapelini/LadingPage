const express = require('express');
const mercadopago = require('mercadopago');
const router = express.Router();
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const VALID_STATUS = ['pendente', 'em_andamento', 'enviado', 'entregue', 'cancelado'];

function normalizeStatus(s) {
  if (!s) return 'pendente';
  const raw = String(s).toLowerCase().trim();
  if (raw === 'concluído' || raw === 'concluido') return 'entregue';
  if (raw === 'em andamento' || raw === 'pago' || raw === 'processando') return 'em_andamento';
  return VALID_STATUS.includes(raw) ? raw : 'pendente';
}

function getOrderById(id) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  const itens = JSON.parse(row.items_json || '[]');
  return {
    id: row.id,
    date: new Date(row.created_at).toLocaleDateString('pt-BR'),
    createdAt: row.created_at,
    itens,
    items: row.items_label || itens.map(i => i.nome).join(', '),
    total: row.total,
    status: row.status,
    cliente: row.cliente,
    clienteEmail: row.cliente_email,
    userId: row.user_id
  };
}

function updateOrderStatus(id, status) {
  const normalized = normalizeStatus(status);
  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(normalized, id);
  if (!result.changes) throw new Error('Pedido não encontrado');
  return getOrderById(id);
}

// Configurar Mercado Pago
if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  mercadopago.configure({
    access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
  });
}

// Criar preferência de pagamento Mercado Pago
router.post('/create-preference', authenticateToken, async (req, res) => {
  try {
    const { items, orderId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ erro: 'Nenhum item no carrinho' });
    }

    // Preparar items para Mercado Pago
    const preferenceItems = items.map(item => ({
      title: item.nome,
      unit_price: parseFloat(item.preco),
      quantity: item.quantidade,
      currency_id: 'BRL'
    }));

    // Criar preferência
    const preference = await mercadopago.preferences.create({
      items: preferenceItems,
      external_reference: orderId?.toString(),
      notification_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payments/webhook`,
      back_urls: {
        success: `${process.env.APP_URL || 'http://localhost:3000'}/pages/pedidos.html`,
        failure: `${process.env.APP_URL || 'http://localhost:3000'}/pages/checkout.html`,
        pending: `${process.env.APP_URL || 'http://localhost:3000'}/pages/pedidos.html`
      },
      auto_return: 'approved'
    });

    res.json({
      id: preference.body.id,
      init_point: preference.body.init_point,
      sandbox_init_point: preference.body.sandbox_init_point
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ erro: 'Falha ao criar preferência de pagamento' });
  }
});

// Webhook para receber notificações do Mercado Pago
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      const payment = await mercadopago.payment.get(paymentId);
      
      const orderId = payment.body.external_reference;
      
      if (orderId) {
        // Atualizar status do pedido com base no pagamento
        let status = 'pendente';
        switch (payment.body.status) {
          case 'approved':
            status = 'pago';
            break;
          case 'pending':
            status = 'pendente';
            break;
          case 'rejected':
            status = 'cancelado';
            break;
          case 'in_process':
            status = 'em_andamento';
            break;
        }
        
        await updateOrderStatus(parseInt(orderId), status);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Erro');
  }
});

module.exports = router;
