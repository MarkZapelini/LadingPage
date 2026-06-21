const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'zcore.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    marca TEXT DEFAULT '',
    cat TEXT NOT NULL,
    preco REAL NOT NULL,
    promo REAL DEFAULT 0,
    estoque INTEGER DEFAULT 0,
    sku TEXT DEFAULT '',
    descricao TEXT DEFAULT '',
    emoji TEXT DEFAULT '📦',
    foto TEXT,
    status TEXT DEFAULT 'Ativo',
    avaliacao INTEGER DEFAULT 5,
    qtd_avaliacoes INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cpf TEXT DEFAULT '',
    telefone TEXT DEFAULT '',
    senha_hash TEXT,
    foto TEXT,
    google_id TEXT UNIQUE,
    cep TEXT DEFAULT '',
    rua TEXT DEFAULT '',
    numero TEXT DEFAULT '',
    complemento TEXT DEFAULT '',
    bairro TEXT DEFAULT '',
    cidade TEXT DEFAULT '',
    estado TEXT DEFAULT '',
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    cliente TEXT NOT NULL,
    cliente_email TEXT DEFAULT '',
    items_json TEXT NOT NULL,
    items_label TEXT DEFAULT '',
    total REAL NOT NULL,
    status TEXT DEFAULT 'pendente',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    emoji TEXT DEFAULT '📦',
    quantidade INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, nome)
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_nome TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_nome)
  );

  CREATE TABLE IF NOT EXISTS reset_tokens (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_counter (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    last_num INTEGER DEFAULT 1000
  );

  INSERT OR IGNORE INTO order_counter (id, last_num) VALUES (1, 1000);
`);

const productCols = db.prepare('PRAGMA table_info(products)').all();
if (!productCols.some(c => c.name === 'fotos')) {
  db.exec('ALTER TABLE products ADD COLUMN fotos TEXT');
  const comFoto = db.prepare('SELECT id, foto FROM products WHERE foto IS NOT NULL AND foto != ""').all();
  const upd = db.prepare('UPDATE products SET fotos = ? WHERE id = ?');
  comFoto.forEach(r => upd.run(JSON.stringify([r.foto]), r.id));
}

function parseProductFotos(row) {
  let fotos = [];
  if (row.fotos) {
    try {
      const parsed = JSON.parse(row.fotos);
      if (Array.isArray(parsed)) fotos = parsed.filter(Boolean);
    } catch { /* ignore */ }
  }
  if (!fotos.length && row.foto) fotos = [row.foto];
  return fotos;
}

function rowToProduct(row) {
  if (!row) return null;
  const fotos = parseProductFotos(row);
  return {
    id: row.id,
    nome: row.nome,
    marca: row.marca,
    cat: row.cat,
    preco: row.preco,
    promo: row.promo || null,
    estoque: row.estoque,
    sku: row.sku,
    desc: row.descricao,
    emoji: row.emoji,
    fotos,
    foto: fotos[0] || null,
    status: row.status,
    avaliacao: row.avaliacao,
    qtdAvaliacoes: row.qtd_avaliacoes
  };
}

function rowToUser(row, includePrivate = false) {
  if (!row) return null;
  const user = {
    id: row.id,
    nome: row.nome,
    email: row.email,
    cpf: row.cpf,
    telefone: row.telefone,
    foto: row.foto,
    cep: row.cep,
    rua: row.rua,
    numero: row.numero,
    complemento: row.complemento,
    bairro: row.bairro,
    cidade: row.cidade,
    estado: row.estado,
    role: row.role || 'user',
    pedidos: []
  };
  if (includePrivate) user.senha_hash = row.senha_hash;
  return user;
}

function nextOrderId() {
  const row = db.prepare('SELECT last_num FROM order_counter WHERE id = 1').get();
  const num = row.last_num + 1;
  db.prepare('UPDATE order_counter SET last_num = ? WHERE id = 1').run(num);
  return '#' + num;
}

module.exports = { db, rowToProduct, rowToUser, nextOrderId };
