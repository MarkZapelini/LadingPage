import React, { useState } from 'react';

const Checkout = ({ cart, totalPrice, onBack }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    pagamento: 'pix'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Pedido confirmado! Em breve você receberá os detalhes no seu e-mail.');
    // Aqui iria a lógica de integração com backend
  };

  return (
    <div className="checkout-view animate-fade-in">
      <div className="checkout-container">
        <header className="checkout-header">
          <button onClick={onBack} className="btn-back">
            <i className="fa fa-arrow-left"></i> Voltar à loja
          </button>
          <h1 className="checkout-title-premium">Finalizar Compra</h1>
          <p className="checkout-subtitle">Sua tecnologia high-end está a um passo de você.</p>
        </header>

        <div className="checkout-grid-premium">
          <form className="checkout-form-premium" onSubmit={handleSubmit}>
            {/* Step 1: Dados Pessoais */}
            <div className="form-card-premium">
              <div className="card-header-premium">
                <span className="step-number">01</span>
                <h3>Dados Pessoais</h3>
              </div>
              <div className="form-row-premium">
                <div className="form-group-premium full">
                  <label>Nome Completo</label>
                  <input 
                    type="text" 
                    name="nome" 
                    placeholder="Ex: Juliano Silva" 
                    value={formData.nome} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label>E-mail</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="seu@email.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group-premium">
                  <label>Telefone</label>
                  <input 
                    type="text" 
                    name="telefone" 
                    placeholder="(11) 99999-9999" 
                    value={formData.telefone} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Endereço */}
            <div className="form-card-premium">
              <div className="card-header-premium">
                <span className="step-number">02</span>
                <h3>Endereço de Entrega</h3>
              </div>
              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label>CEP</label>
                  <div className="input-with-button">
                    <input 
                      type="text" 
                      name="cep" 
                      placeholder="00000-000" 
                      value={formData.cep} 
                      onChange={handleChange} 
                    />
                    <button type="button" className="btn-small-premium">Buscar</button>
                  </div>
                </div>
                <div className="form-group-premium full">
                  <label>Logradouro</label>
                  <input 
                    type="text" 
                    name="rua" 
                    placeholder="Rua, Avenida, etc." 
                    value={formData.rua} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div className="form-row-premium">
                <div className="form-group-premium">
                  <label>Número</label>
                  <input 
                    type="text" 
                    name="numero" 
                    placeholder="123" 
                    value={formData.numero} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-group-premium">
                  <label>Bairro</label>
                  <input 
                    type="text" 
                    name="bairro" 
                    placeholder="Seu bairro" 
                    value={formData.bairro} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Pagamento */}
            <div className="form-card-premium">
              <div className="card-header-premium">
                <span className="step-number">03</span>
                <h3>Pagamento</h3>
              </div>
              <div className="payment-options-premium">
                <label className={`pay-option ${formData.pagamento === 'pix' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="pagamento" 
                    value="pix" 
                    checked={formData.pagamento === 'pix'} 
                    onChange={handleChange} 
                  />
                  <div className="pay-icon">💠</div>
                  <div className="pay-text">
                    <strong>Pix</strong>
                    <span>10% OFF</span>
                  </div>
                </label>
                <label className={`pay-option ${formData.pagamento === 'cartao' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="pagamento" 
                    value="cartao" 
                    checked={formData.pagamento === 'cartao'} 
                    onChange={handleChange} 
                  />
                  <div className="pay-icon">💳</div>
                  <div className="pay-text">
                    <strong>Cartão</strong>
                    <span>Até 12x</span>
                  </div>
                </label>
                <label className={`pay-option ${formData.pagamento === 'boleto' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="pagamento" 
                    value="boleto" 
                    checked={formData.pagamento === 'boleto'} 
                    onChange={handleChange} 
                  />
                  <div className="pay-icon">🧾</div>
                  <div className="pay-text">
                    <strong>Boleto</strong>
                    <span>3 dias úteis</span>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-finalizar-premium">
              Finalizar Pedido Segura
              <i className="fa fa-shield"></i>
            </button>
          </form>

          {/* Sidebar: Resumo */}
          <aside className="checkout-summary-premium">
            <div className="summary-card-premium sticky-summary">
              <h3>Resumo do Pedido</h3>
              <div className="summary-items-list">
                {cart.map((item, i) => (
                  <div key={i} className="summary-item-premium">
                    <span className="item-emoji-premium">{item.emoji}</span>
                    <div className="item-details-premium">
                      <div className="item-name-premium">{item.nome}</div>
                      <div className="item-meta-premium">Qtd: {item.qtd}</div>
                    </div>
                    <span className="item-price-premium">
                      R$ {(item.preco * item.qtd).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-totals-premium">
                <div className="total-row-premium">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toLocaleString('pt-BR')}</span>
                </div>
                <div className="total-row-premium">
                  <span>Frete</span>
                  <span className="free-shipping-premium">Grátis</span>
                </div>
                <div className="total-main-premium">
                  <span>Total</span>
                  <strong>R$ {totalPrice.toLocaleString('pt-BR')}</strong>
                </div>
              </div>

              <div className="secure-badge-premium">
                <i className="fa fa-lock"></i>
                Ambiente 100% Seguro
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
