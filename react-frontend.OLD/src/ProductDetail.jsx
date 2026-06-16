import React, { useState } from 'react';

export default function ProductDetail({ product, onBack, addToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product.nome);
    }
  };

  const precoFinal = product.promo && product.promo < product.preco ? product.promo : product.preco;
  const temDesconto = product.promo && product.promo < product.preco;

  return (
    <div className="product-detail-view animate-fade-in">
      <div className="checkout-container">
        <button onClick={onBack} className="back-link">
          <i className="fas fa-arrow-left"></i> Voltar para a loja
        </button>
        
        <div className="product-page-grid">
          {/* Imagem do Produto */}
          <div className="product-image-section">
            <div className="product-main-image">
              <span className="product-emoji">{product.emoji || '📦'}</span>
            </div>
          </div>
          
          {/* Detalhes do Produto */}
          <div className="product-details-section">
            <div className="product-badges">
              {product.status === 'Destaque' && <span className="badge-novo">LANÇAMENTO</span>}
              {temDesconto && (
                <span className="badge-off">
                  -{Math.round((1 - product.promo / product.preco) * 100)}%
                </span>
              )}
            </div>
            
            <div className="product-brand">{product.marca || 'Z-Core'}</div>
            <h1 className="product-title">{product.nome}</h1>
            
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(product.avaliacao || 5)}{'☆'.repeat(5 - (product.avaliacao || 5))}
              </div>
              <span className="rating-count">({product.qtdAvaliacoes || 0} avaliações)</span>
            </div>
            
            <div className="product-price-section">
              {temDesconto && (
                <div className="product-price-old">
                  R$ {product.preco.toLocaleString('pt-BR')}
                </div>
              )}
              <div className="product-price">
                R$ {precoFinal.toLocaleString('pt-BR')}
              </div>
            </div>
            
            <p className="product-description">
              {product.desc || 'Este produto de alta tecnologia foi projetado para oferecer a melhor experiência possível, combinando performance, design e inovação.'}
            </p>
            
            <div className="product-stock">
              <i className="fas fa-check-circle"></i> Estoque disponível: {product.estoque} unidades
            </div>
            
            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <i className="fas fa-minus"></i>
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.estoque, q + 1))}>
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              <button className="btn-add-cart" onClick={handleAddToCart}>
                <i className="fas fa-shopping-bag"></i> Adicionar ao Carrinho
              </button>
            </div>
            
            <div className="product-info">
              <div className="info-item">
                <i className="fas fa-shipping-fast"></i>
                <div>
                  <strong>Frete Grátis</strong>
                  <span>Compras acima de R$ 299</span>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-shield-alt"></i>
                <div>
                  <strong>Garantia</strong>
                  <span>12 meses de garantia</span>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-undo"></i>
                <div>
                  <strong>Troca Fácil</strong>
                  <span>30 dias para trocar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
