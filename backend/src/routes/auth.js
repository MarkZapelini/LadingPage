const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db, rowToUser } = require('../db/database');
const { signToken, authUser } = require('../middleware/auth');

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeText(value) {
  return String(value || '').trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/register', (req, res) => {
  const { nome, email, cpf, telefone, senha } = req.body;
  const cleanNome = sanitizeText(nome);
  const cleanEmail = normalizeEmail(email);

  if (!cleanNome || !cleanEmail || !senha) {
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
  }
  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }
  if (String(senha).length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (exists) return res.status(409).json({ erro: 'E-mail já cadastrado.' });

  const hash = bcrypt.hashSync(senha, 10);
  const result = db.prepare(`
    INSERT INTO users (nome, email, cpf, telefone, senha_hash)
    VALUES (?, ?, ?, ?, ?)
  `).run(cleanNome, cleanEmail, sanitizeText(cpf), sanitizeText(telefone), hash);

  const user = rowToUser(db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid));
  const token = signToken({ id: user.id, email: user.email, role: user.role || 'user' });
  res.status(201).json({ token, usuario: user });
});

router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

  const cleanEmail = normalizeEmail(email);
  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
  if (!row || !row.senha_hash || !bcrypt.compareSync(senha, row.senha_hash)) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  }

  const user = rowToUser(row);
  const token = signToken({ id: user.id, email: user.email, role: user.role || 'user' });
  res.json({ token, usuario: user });
});

router.post('/google', (req, res) => {
  const { uid, nome, email, foto } = req.body;
  const cleanEmail = normalizeEmail(email);
  if (!uid || !cleanEmail) return res.status(400).json({ erro: 'Dados do Google incompletos.' });

  let row = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(uid, cleanEmail);
  if (!row) {
    const result = db.prepare(`
      INSERT INTO users (nome, email, foto, google_id) VALUES (?, ?, ?, ?)
    `).run(sanitizeText(nome) || 'Usuário Google', cleanEmail, foto || null, uid);
    row = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  } else if (!row.google_id) {
    db.prepare('UPDATE users SET google_id = ?, foto = COALESCE(?, foto), nome = COALESCE(?, nome) WHERE id = ?')
      .run(uid, foto, sanitizeText(nome) || null, row.id);
    row = db.prepare('SELECT * FROM users WHERE id = ?').get(row.id);
  }

  const user = rowToUser(row);
  const token = signToken({ id: user.id, email: user.email, role: user.role || 'user' });
  res.json({ token, usuario: user });
});

router.post('/admin/login', (req, res) => {
  const { usuario, senha } = req.body;
  const cleanUsuario = sanitizeText(usuario);
  if (!cleanUsuario || !senha) {
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });
  }

  const adminRow = db.prepare(`
    SELECT * FROM users
    WHERE role = 'admin' AND (LOWER(nome) = LOWER(?) OR LOWER(email) = LOWER(?))
  `).get(cleanUsuario, cleanUsuario);

  if (adminRow && adminRow.senha_hash && bcrypt.compareSync(senha, adminRow.senha_hash)) {
    const token = signToken({ id: adminRow.id, email: adminRow.email, role: 'admin', usuario: adminRow.nome });
    return res.json({
      token,
      admin: {
        id: adminRow.id,
        usuario: adminRow.nome,
        email: adminRow.email,
        role: 'admin',
        logado: true
      }
    });
  }

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';
  if (cleanUsuario !== adminUser && cleanUsuario.toLowerCase() !== String(process.env.ADMIN_EMAIL || '').toLowerCase()) {
    return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
  }
  if (senha !== adminPass) {
    return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
  }
  const token = signToken({ usuario: adminUser, role: 'admin' });
  res.json({ token, admin: { usuario: adminUser, email: process.env.ADMIN_EMAIL || '', role: 'admin', logado: true } });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ erro: 'Informe o e-mail.' });
  const cleanEmail = normalizeEmail(email);
  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }

  const row = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (!row) {
    return res.json({ ok: true, message: 'Se o e-mail estiver cadastrado, o link de recuperação será gerado.' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 3600000).toISOString();
  db.prepare('INSERT OR REPLACE INTO reset_tokens (token, email, expires_at) VALUES (?, ?, ?)')
    .run(token, cleanEmail, expires);

  res.json({
    ok: true,
    token,
    resetLink: `/pages/reset-password.html?token=${token}&email=${encodeURIComponent(cleanEmail)}`,
    message: 'Se o e-mail estiver cadastrado, o link de recuperação será gerado.'
  });
});

router.post('/reset-password', (req, res) => {
  const { token, email, senha } = req.body;
  if (!token || !email || !senha) return res.status(400).json({ erro: 'Dados incompletos.' });
  if (String(senha).length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const cleanEmail = normalizeEmail(email);

  const row = db.prepare('SELECT * FROM reset_tokens WHERE token = ? AND email = ?').get(token, cleanEmail);
  if (!row || new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ erro: 'Link inválido ou expirado.' });
  }

  const hash = bcrypt.hashSync(senha, 10);
  db.prepare('UPDATE users SET senha_hash = ? WHERE email = ?').run(hash, cleanEmail);
  db.prepare('DELETE FROM reset_tokens WHERE email = ?').run(cleanEmail);
  res.json({ ok: true });
});

router.get('/me', authUser, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json({ usuario: rowToUser(row) });
});

module.exports = router;
