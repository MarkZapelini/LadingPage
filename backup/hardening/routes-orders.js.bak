const express = require('express');
const { db, nextOrderId } = require('../db/database');
const { authUser, authAdmin } = require('../middleware/auth');

const router = express.Router();

const VALID_STATUS = ['pendente', 'em_andamento', 'enviado', 'entregue', 'cancelado'];

function normalizeStatus(s) {
  if (!s) return 'pendente';
  const raw = String(s).toLowerCase().trim();
  if (raw === 'concluído' || raw === 'concluido') return 'entregue';
  if (raw === 'em andamento' || raw === 'pago' || raw === 'processando') return 'em_andamento';
  return VALID_STATUS.includes(raw) ? raw : 'pendente';
}

function rowToOrder(row) {
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

function createOrder({ userId, cliente, clienteEmail, itens, status }) {
  if (!itens || !itens.length) throw new Error('Carrinho vazio');

  const tx = db.transaction(() => {
    for (const item of itens) {
      const prod = db.prepare('SELECT id, estoque, nome FROM products WHERE nome = ?').get(item.nome);
      if (!prod) throw new Error(`Produto não encontrado: ${item.nome}`);
      const qtd = item.quantidade || item.qty || 1;
      if (prod.estoque < qtd) throw new Error(`Estoque insuficiente: ${item.nome}`);
    }

    const orderId = nextOrderId();
    const total = itens.reduce((s, i) => s + (i.preco || i.price) * (i.quantidade || i.qty || 1), 0);
    const itemsLabel = itens.map(i => i.nome).join(', ');
    const normalized = itens.map(i => ({
      nome: i.nome,
      preco: i.preco || i.price,
      emoji: i.emoji || '📦',
      quantidade: i.quantidade || i.qty || 1
    }));

    db.prepare(`
      INSERT INTO orders (id, user_id, cliente, cliente_email, items_json, items_label, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, userId || null, cliente, clienteEmail || '', JSON.stringify(normalized), itemsLabel, total, normalizeStatus(status || 'pendente'));

    for (const item of normalized) {
      db.prepare('UPDATE products SET estoque = MAX(0, estoque - ?) WHERE nome = ?')
        .run(item.quantidade, item.nome);
    }

    if (userId) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    }

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  });

  return rowToOrder(tx());
}

router.post('/', authUser, (req, res) => {
  try {
    const user = db.prepare('SELECT nome, email FROM users WHERE id = ?').get(req.user.id);
    const order = createOrder({
      userId: req.user.id,
      cliente: user.nome,
      clienteEmail: user.email,
      itens: req.body.itens,
      status: 'pendente'
    });
    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

router.post('/guest', authAdmin, (req, res) => {
  try {
    const { cliente, clienteEmail, itens } = req.body;
    if (!cliente) return res.status(400).json({ erro: 'Informe o nome do cliente.' });
    const order = createOrder({ cliente, clienteEmail, itens, status: 'pendente' });
    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

router.get('/me', authUser, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows.map(rowToOrder));
});

router.get('/stats', authAdmin, (req, res) => {
  const rows = db.prepare('SELECT status, COUNT(*) as count, SUM(total) as revenue FROM orders GROUP BY status').all();
  const stats = { total: 0, pendente: 0, em_andamento: 0, enviado: 0, entregue: 0, cancelado: 0, receita: 0 };
  rows.forEach(r => {
    const s = normalizeStatus(r.status);
    stats[s] = (stats[s] || 0) + r.count;
    stats.total += r.count;
    if (s !== 'cancelado') stats.receita += r.revenue || 0;
  });
  stats.andamento = stats.em_andamento + stats.enviado;
  stats.concluido = stats.entregue;
  res.json(stats);
});

router.get('/', authAdmin, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM orders ORDER BY created_at DESC';
  let rows = db.prepare(sql).all();
  if (status && status !== 'todos') {
    rows = rows.filter(r => normalizeStatus(r.status) === status);
  }
  res.json(rows.map(rowToOrder));
});

router.patch('/:id/status', authAdmin, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUS.includes(normalizeStatus(status))) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }
  const normalized = normalizeStatus(status);
  const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(normalized, req.params.id);
  if (!result.changes) return res.status(404).json({ erro: 'Pedido não encontrado.' });
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(rowToOrder(row));
});

module.exports = router;
