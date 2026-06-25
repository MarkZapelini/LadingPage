const express = require('express');
const { db } = require('../db/database');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authUser, (req, res) => {
  const rows = db.prepare('SELECT * FROM cart_items WHERE user_id = ?').all(req.user.id);
  res.json(rows.map(r => ({
    nome: r.nome,
    preco: r.preco,
    emoji: r.emoji,
    quantidade: r.quantidade,
    productId: r.product_id
  })));
});

router.put('/', authUser, (req, res) => {
  const items = req.body.items || req.body;
  if (!Array.isArray(items)) return res.status(400).json({ erro: 'Lista de itens inválida.' });

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    const insert = db.prepare(`
      INSERT INTO cart_items (user_id, product_id, nome, preco, emoji, quantidade)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const item of items) {
      const prod = db.prepare('SELECT id FROM products WHERE nome = ?').get(item.nome);
      insert.run(req.user.id, prod?.id || null, item.nome, item.preco, item.emoji || '📦', item.quantidade || 1);
    }
  });
  tx();
  res.json({ ok: true });
});

router.delete('/', authUser, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

module.exports = router;
