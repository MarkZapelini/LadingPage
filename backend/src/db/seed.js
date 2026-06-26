require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('./database');
const bcrypt = require('bcryptjs');

const produtos = [
  { nome: 'MacBook Air M3', marca: 'Apple', cat: 'notebooks', preco: 10499, promo: 0, estoque: 15, desc: 'Chip M3, 8GB RAM, SSD 256GB, tela 13"', emoji: '💻', status: 'Ativo', avaliacao: 5, qtd: 324, foto: 'assets/images/products/macbook-air-m3.jpg' },
  { nome: 'Galaxy S24 Ultra', marca: 'Samsung', cat: 'smartphones', preco: 6799, promo: 8499, estoque: 8, desc: '256GB, 12GB RAM, câmera 200MP, 5G', emoji: '📱', status: 'Ativo', avaliacao: 5, qtd: 512, foto: 'assets/images/products/galaxy-s24-ultra.jpg' },
  { nome: 'Sony WH-1000XM5', marca: 'Sony', cat: 'audio', preco: 1799, promo: 2299, estoque: 25, desc: 'Fone over-ear, cancelamento de ruído, 30h', emoji: '🎧', status: 'Ativo', avaliacao: 4, qtd: 289, foto: 'assets/images/products/sony-wh-1000xm5.jpg' },
  { nome: 'Apple Watch Series 9', marca: 'Apple', cat: 'wearables', preco: 3299, promo: 0, estoque: 12, desc: 'GPS, 45mm, monitoramento de saúde 24h', emoji: '⌚', status: 'Destaque', avaliacao: 5, qtd: 198, foto: 'assets/images/products/apple-watch-series-9.jpg' },
  { nome: 'LG OLED 55"', marca: 'LG', cat: 'tvs', preco: 5099, promo: 5999, estoque: 5, desc: '4K, 120Hz, Dolby Vision, webOS 23', emoji: '📺', status: 'Ativo', avaliacao: 4, qtd: 145, foto: 'assets/images/products/lg-oled-55.jpg' },
  { nome: 'PlayStation 5 Slim', marca: 'Sony', cat: 'games', preco: 3999, promo: 0, estoque: 20, desc: '1TB SSD, controle DualSense, 4K 120fps', emoji: '🎮', status: 'Ativo', avaliacao: 5, qtd: 421, foto: 'assets/images/products/playstation-5-slim.jpg' }
].map((produto) => ({
  ...produto,
  fotos: [produto.foto]
}));

const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (nome, marca, cat, preco, promo, estoque, descricao, emoji, foto, fotos, status, avaliacao, qtd_avaliacoes)
    VALUES (@nome, @marca, @cat, @preco, @promo, @estoque, @desc, @emoji, @foto, @fotos, @status, @avaliacao, @qtd)
  `);
  const tx = db.transaction((items) => {
    for (const p of items) insert.run(p);
  });
  tx(produtos.map(p => ({
    nome: p.nome, marca: p.marca, cat: p.cat, preco: p.preco, promo: p.promo,
    estoque: p.estoque, desc: p.desc, emoji: p.emoji, foto: p.foto, fotos: JSON.stringify(p.fotos), status: p.status,
    avaliacao: p.avaliacao, qtd: p.qtd
  })));
  console.log('Seed: produtos padrão inseridos.');
}

const atualizarFotoProduto = db.prepare(`
  UPDATE products
  SET foto = ?, fotos = COALESCE(NULLIF(fotos, ''), ?)
  WHERE nome = ? AND (foto IS NULL OR foto = '' OR fotos IS NULL OR fotos = '')
`);

produtos.forEach((produto) => {
  atualizarFotoProduto.run(produto.foto, JSON.stringify(produto.fotos), produto.nome);
});

// Adiciona conta de teste
const countUsers = db.prepare('SELECT COUNT(*) as c FROM users WHERE email = ?').get('teste@zcore.com.br').c;
if (countUsers === 0) {
  const senhaHash = bcrypt.hashSync('123456', 10);
  db.prepare(`
    INSERT INTO users (nome, email, cpf, telefone, senha_hash)
    VALUES (?, ?, ?, ?, ?)
  `).run('Teste Z-Core', 'teste@zcore.com.br', '123.456.789-00', '(11) 99999-9999', senhaHash);
  console.log('Seed: conta de teste inserida (teste@zcore.com.br / 123456).');
}

// Adiciona conta admin no banco (baseada nas variáveis de ambiente)
const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const adminUser = String(process.env.ADMIN_USER || '').trim();
const adminPass = process.env.ADMIN_PASS;

if (adminEmail && adminUser && adminPass) {
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ? OR nome = ?').get(adminEmail, adminUser);
  if (!existingAdmin) {
    const senhaHashAdmin = bcrypt.hashSync(adminPass, 10);
    db.prepare(`
      INSERT INTO users (nome, email, senha_hash, role)
      VALUES (?, ?, ?, ?)
    `).run(adminUser, adminEmail, senhaHashAdmin, 'admin');
    console.log(`Seed: conta admin inserida (${adminUser}) com email ${adminEmail}`);
  } else if (existingAdmin.role !== 'admin') {
    const senhaHashAdmin = bcrypt.hashSync(adminPass, 10);
    db.prepare('UPDATE users SET role = ?, senha_hash = ? WHERE id = ?').run('admin', senhaHashAdmin, existingAdmin.id);
    console.log('Seed: usuário existente promovido para admin e senha atualizada.');
  } else {
    // Admin já existe
  }
}
