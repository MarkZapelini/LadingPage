import { useState, useEffect } from 'react';
import { initialProducts, categories } from './data';

export default function Store({ addToCart, id, onProductClick }) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('padrao');
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (id) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredProducts = products
    .filter(p => !filter || p.cat === filter)
    .sort((a, b) => {
      if (sort === 'preco-asc') return a.preco - b.preco;
      if (sort === 'preco-desc') return b.preco - a.preco;
      if (sort === 'nome-asc') return a.nome.localeCompare(b.nome);
      if (sort === 'nome-desc') return b.nome.localeCompare(a.nome);
      return 0;
    });

  return (
    <div className="store-container" id={id}>
      {/* CATEGORIES */}
      <section className="section categories-premium">
        <div className="section-header">
          <h2 className="cat-title-premium">Categorias</h2>
          <button className="ver-todos-premium" onClick={() => setFilter('')}>Ver todas →</button>
        </div>
        
        <div className="cat-grid-premium">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className={`cat-card-premium ${filter === cat.id ? 'active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              <span className="cat-icon-premium">{cat.icon}</span>
              <div className="cat-name-premium">{cat.label}</div>
              <div className="cat-count-premium">{cat.count} produtos</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* PRODUCTS */}
      <section className="section products-section">
        <div className="section-header">
          <h2 className="cat-title-premium">Mais vendidos</h2>
          <button className="ver-todos-premium" onClick={() => setFilter('')}>Ver todos →</button>
        </div>

        <div className="filtros-container-premium">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="filter-select">
            <option value="padrao">Ordenar por: Padrão</option>
            <option value="preco-asc">Preço: Menor para Maior</option>
            <option value="preco-desc">Preço: Maior para Menor</option>
            <option value="nome-asc">Nome: A-Z</option>
            <option value="nome-desc">Nome: Z-A</option>
          </select>
        </div>

        <div className="produtos-grid-premium">
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              className="produto-card-premium"
              onClick={() => onProductClick(p)}
              style={{ cursor: 'pointer' }}
            >
              <div className="produto-img-premium">
                {p.status === 'Destaque' && <span className="badge-novo-premium">NOVO</span>}
                <button 
                  className={`btn-wishlist-premium ${wishlist.includes(p.id) ? 'active' : ''}`}
                  onClick={() => toggleWishlist(p.id)}
                >
                  <i className="fa fa-heart"></i>
                </button>
                <div className="produto-emoji-premium">{p.emoji}</div>
              </div>
              
              <div className="produto-info-premium">
                <div className="produto-marca-premium">{p.marca}</div>
                <div className="produto-nome-premium">{p.nome}</div>
                <div className="produto-avaliacao-premium">
                  <span className="estrelas-premium">{'★'.repeat(p.avaliacao)}{'☆'.repeat(5 - p.avaliacao)}</span>
                  <span className="qtd-avaliacoes-premium">({p.qtdAvaliacoes})</span>
                </div>
                <div className="produto-desc-premium">{p.desc}</div>
                <div className="produto-footer-premium">
                  <div className="produto-preco-premium">R$ {p.preco.toLocaleString('pt-BR')}</div>
                  <button className="btn-add-premium" onClick={() => addToCart(p.nome)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
