const express = require('express');
const { db, rowToUser } = require('../db/database');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.patch('/me', authUser, (req, res) => {
  const fields = ['nome', 'cpf', 'telefone', 'foto', 'cep', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado'];
  const sqlParts = [];
  const sqlVals = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      sqlParts.push(`${f} = ?`);
      sqlVals.push(req.body[f]);
    }
  }
  if (!sqlParts.length) return res.status(400).json({ erro: 'Nenhum campo para atualizar.' });
  sqlVals.push(req.user.id);
  db.prepare(`UPDATE users SET ${sqlParts.join(', ')} WHERE id = ?`).run(...sqlVals);
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ usuario: rowToUser(row) });
});

module.exports = router;
