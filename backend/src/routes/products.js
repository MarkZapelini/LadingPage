const express = require('express');
const { db, rowToProduct } = require('../db/database');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { cat, search, status } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (cat) { sql += ' AND cat = ?'; params.push(cat); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (search) {
    sql += ' AND (nome LIKE ? OR marca LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY id ASC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(rowToProduct));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json(rowToProduct(row));
});

function serializeFotos(p) {
  const fotos = Array.isArray(p.fotos) ? p.fotos.filter(Boolean) : (p.foto ? [p.foto] : []);
  return { fotosJson: JSON.stringify(fotos), fotoPrincipal: fotos[0] || null };
}

router.post('/', authAdmin, (req, res) => {
  const p = req.body;
  if (!p.nome || !p.cat || p.preco == null) {
    return res.status(400).json({ erro: 'Nome, categoria e preço são obrigatórios.' });
  }
  const { fotosJson, fotoPrincipal } = serializeFotos(p);
  const result = db.prepare(`
    INSERT INTO products (nome, marca, cat, preco, promo, estoque, sku, descricao, emoji, foto, fotos, status, avaliacao, qtd_avaliacoes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    p.nome, p.marca || '', p.cat, p.preco, p.promo || 0, p.estoque || 0,
    p.sku || '', p.desc || p.descricao || '', p.emoji || '📦', fotoPrincipal, fotosJson,
    p.status || 'Ativo', p.avaliacao || 5, p.qtdAvaliacoes || 0
  );
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToProduct(row));
});

router.put('/:id', authAdmin, (req, res) => {
  const p = req.body;
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ erro: 'Produto não encontrado.' });

  const { fotosJson, fotoPrincipal } = serializeFotos(p);
  db.prepare(`
    UPDATE products SET nome=?, marca=?, cat=?, preco=?, promo=?, estoque=?, sku=?,
    descricao=?, emoji=?, foto=?, fotos=?, status=?, avaliacao=?, qtd_avaliacoes=?
    WHERE id=?
  `).run(
    p.nome, p.marca || '', p.cat, p.preco, p.promo || 0, p.estoque || 0,
    p.sku || '', p.desc || p.descricao || '', p.emoji || '📦', fotoPrincipal, fotosJson,
    p.status || 'Ativo', p.avaliacao || 5, p.qtdAvaliacoes || 0, req.params.id
  );
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(rowToProduct(row));
});

router.delete('/:id', authAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json({ ok: true });
});

module.exports = router;
