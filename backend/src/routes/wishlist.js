const express = require('express');
const { db } = require('../db/database');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', authUser, (req, res) => {
  const rows = db.prepare('SELECT product_nome FROM wishlist WHERE user_id = ?').all(req.user.id);
  res.json(rows.map(r => r.product_nome));
});

router.put('/', authUser, (req, res) => {
  const items = req.body.items || req.body;
  if (!Array.isArray(items)) return res.status(400).json({ erro: 'Lista inválida.' });

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM wishlist WHERE user_id = ?').run(req.user.id);
    const insert = db.prepare('INSERT INTO wishlist (user_id, product_nome) VALUES (?, ?)');
    for (const nome of items) insert.run(req.user.id, nome);
  });
  tx();
  res.json({ ok: true });
});

module.exports = router;
