const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db, rowToUser } = require('../db/database');
const { signToken, authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { nome, email, cpf, telefone, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ erro: 'E-mail já cadastrado.' });

  const hash = bcrypt.hashSync(senha, 10);
  const result = db.prepare(`
    INSERT INTO users (nome, email, cpf, telefone, senha_hash)
    VALUES (?, ?, ?, ?, ?)
  `).run(nome, email.toLowerCase(), cpf || '', telefone || '', hash);

  const user = rowToUser(db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid));
  const token = signToken({ id: user.id, email: user.email, role: 'user' });
  res.status(201).json({ token, usuario: user });
});

router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!row || !row.senha_hash || !bcrypt.compareSync(senha, row.senha_hash)) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  }

  const user = rowToUser(row);
  const token = signToken({ id: user.id, email: user.email, role: 'user' });
  res.json({ token, usuario: user });
});

router.post('/google', (req, res) => {
  const { uid, nome, email, foto } = req.body;
  if (!uid || !email) return res.status(400).json({ erro: 'Dados do Google incompletos.' });

  let row = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(uid, email.toLowerCase());
  if (!row) {
    const result = db.prepare(`
      INSERT INTO users (nome, email, foto, google_id) VALUES (?, ?, ?, ?)
    `).run(nome || 'Usuário Google', email.toLowerCase(), foto || null, uid);
    row = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  } else if (!row.google_id) {
    db.prepare('UPDATE users SET google_id = ?, foto = COALESCE(?, foto), nome = COALESCE(?, nome) WHERE id = ?')
      .run(uid, foto, nome, row.id);
    row = db.prepare('SELECT * FROM users WHERE id = ?').get(row.id);
  }

  const user = rowToUser(row);
  const token = signToken({ id: user.id, email: user.email, role: 'user' });
  res.json({ token, usuario: user });
});

router.post('/admin/login', (req, res) => {
  const { usuario, senha } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';
  if (usuario !== adminUser || senha !== adminPass) {
    return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
  }
  const token = signToken({ usuario: adminUser, role: 'admin' });
  res.json({ token, admin: { usuario: adminUser, logado: true } });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ erro: 'Informe o e-mail.' });
  const row = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (!row) return res.status(404).json({ erro: 'E-mail não cadastrado.' });

  const token = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 3600000).toISOString();
  db.prepare('INSERT OR REPLACE INTO reset_tokens (token, email, expires_at) VALUES (?, ?, ?)')
    .run(token, email.toLowerCase(), expires);

  res.json({ ok: true, token, resetLink: `/reset-password.html?token=${token}&email=${encodeURIComponent(email)}` });
});

router.post('/reset-password', (req, res) => {
  const { token, email, senha } = req.body;
  if (!token || !email || !senha) return res.status(400).json({ erro: 'Dados incompletos.' });

  const row = db.prepare('SELECT * FROM reset_tokens WHERE token = ? AND email = ?').get(token, email.toLowerCase());
  if (!row || new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ erro: 'Link inválido ou expirado.' });
  }

  const hash = bcrypt.hashSync(senha, 10);
  db.prepare('UPDATE users SET senha_hash = ? WHERE email = ?').run(hash, email.toLowerCase());
  db.prepare('DELETE FROM reset_tokens WHERE token = ?').run(token);
  res.json({ ok: true });
});

router.get('/me', authUser, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json({ usuario: rowToUser(row) });
});

module.exports = router;
