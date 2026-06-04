require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { db } = require('./database');

const produtos = [
  { nome: 'MacBook Air M3', marca: 'Apple', cat: 'notebooks', preco: 10499, promo: 0, estoque: 15, desc: 'Chip M3, 8GB RAM, SSD 256GB, tela 13"', emoji: '💻', status: 'Ativo', avaliacao: 5, qtd: 324 },
  { nome: 'Galaxy S24 Ultra', marca: 'Samsung', cat: 'smartphones', preco: 6799, promo: 8499, estoque: 8, desc: '256GB, 12GB RAM, câmera 200MP, 5G', emoji: '📱', status: 'Ativo', avaliacao: 5, qtd: 512 },
  { nome: 'Sony WH-1000XM5', marca: 'Sony', cat: 'audio', preco: 1799, promo: 2299, estoque: 25, desc: 'Fone over-ear, cancelamento de ruído, 30h', emoji: '🎧', status: 'Ativo', avaliacao: 4, qtd: 289 },
  { nome: 'Apple Watch Series 9', marca: 'Apple', cat: 'wearables', preco: 3299, promo: 0, estoque: 12, desc: 'GPS, 45mm, monitoramento de saúde 24h', emoji: '⌚', status: 'Destaque', avaliacao: 5, qtd: 198 },
  { nome: 'LG OLED 55"', marca: 'LG', cat: 'tvs', preco: 5099, promo: 5999, estoque: 5, desc: '4K, 120Hz, Dolby Vision, webOS 23', emoji: '📺', status: 'Ativo', avaliacao: 4, qtd: 145 },
  { nome: 'PlayStation 5 Slim', marca: 'Sony', cat: 'games', preco: 3999, promo: 0, estoque: 20, desc: '1TB SSD, controle DualSense, 4K 120fps', emoji: '🎮', status: 'Ativo', avaliacao: 5, qtd: 421 }
];

const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (nome, marca, cat, preco, promo, estoque, descricao, emoji, status, avaliacao, qtd_avaliacoes)
    VALUES (@nome, @marca, @cat, @preco, @promo, @estoque, @desc, @emoji, @status, @avaliacao, @qtd)
  `);
  const tx = db.transaction((items) => {
    for (const p of items) insert.run(p);
  });
  tx(produtos.map(p => ({
    nome: p.nome, marca: p.marca, cat: p.cat, preco: p.preco, promo: p.promo,
    estoque: p.estoque, desc: p.desc, emoji: p.emoji, status: p.status,
    avaliacao: p.avaliacao, qtd: p.qtd
  })));
  console.log('Seed: produtos padrão inseridos.');
}
