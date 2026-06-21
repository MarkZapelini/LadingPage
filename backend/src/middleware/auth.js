const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zcore-dev-secret';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function readBearerToken(header) {
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authenticateToken(req, res, next) {
  const token = readBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ erro: 'Token não informado.' });
  }

  try {
    const decoded = verifyToken(token);
    req.auth = decoded;
    if (decoded.role === 'admin') req.admin = decoded;
    else req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

function authUser(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.auth.role === 'admin') {
      return res.status(403).json({ erro: 'Use token de usuário.' });
    }
    next();
  });
}

function authAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.auth.role !== 'admin') {
      return res.status(403).json({ erro: 'Acesso restrito ao admin.' });
    }
    next();
  });
}

function optionalUser(req, res, next) {
  const token = readBearerToken(req.headers.authorization);
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded.role !== 'admin') req.user = decoded;
    } catch { /* ignore */ }
  }
  next();
}

module.exports = { signToken, authenticateToken, authUser, authAdmin, optionalUser, JWT_SECRET };
