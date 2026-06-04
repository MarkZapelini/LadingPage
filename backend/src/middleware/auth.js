const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zcore-dev-secret';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authUser(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não informado.' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    if (decoded.role === 'admin') {
      return res.status(403).json({ erro: 'Use token de usuário.' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

function authAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token admin não informado.' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ erro: 'Acesso restrito ao admin.' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token admin inválido.' });
  }
}

function optionalUser(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.slice(7), JWT_SECRET);
      if (decoded.role !== 'admin') req.user = decoded;
    } catch { /* ignore */ }
  }
  next();
}

module.exports = { signToken, authUser, authAdmin, optionalUser, JWT_SECRET };
