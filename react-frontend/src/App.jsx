import { useState, useEffect } from 'react'
import './App.css'
import Pagamentos from './Pagamentos'
import HeroSection from './HeroSection'
import Store from './Store'
import Checkout from './Checkout'
import { initialProducts } from './data'

function App() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zcore-theme') || 'dark'
  })

  const [view, setView] = useState('loja') // 'loja' | 'pagamentos' | 'checkout'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const savedCart = localStorage.getItem('cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [theme])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (nome) => {
    const prod = initialProducts.find(p => p.nome === nome)
    if (!prod) return;
    
    const existing = cart.find(item => item.nome === nome)
    
    if (existing) {
      setCart(cart.map(item => 
        item.nome === nome ? { ...item, qtd: item.qtd + 1 } : item
      ))
    } else {
      setCart([...cart, { nome, preco: prod.preco, emoji: prod.emoji, qtd: 1 }])
    }
    
    showToast(`✓ ${nome} adicionado ao carrinho!`)
  }

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const changeQty = (index, delta) => {
    const newCart = [...cart]
    newCart[index].qtd += delta
    if (newCart[index].qtd <= 0) {
      removeFromCart(index)
    } else {
      setCart(newCart)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('zcore-theme', nextTheme)
  }

  const totalItems = cart.reduce((sum, item) => sum + item.qtd, 0)
  const totalPrice = cart.reduce((sum, item) => sum + (item.preco * item.qtd), 0)

  return (
    <div className="app">
      <nav className="nav">
        <div className="logo" onClick={() => setView('loja')} style={{ cursor: 'pointer' }}>Z-Core</div>
        <div className="nav-actions">
          <button onClick={() => setView(view === 'loja' ? 'pagamentos' : 'loja')} className="btn-nav">
            {view === 'loja' ? '💳 Pagamentos' : '🏠 Loja'}
          </button>
          <button onClick={toggleTheme} className="btn-theme">
            <i className={`fa ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <button onClick={() => setCartOpen(true)} className="btn-cart">
            <i className="fa fa-shopping-cart"></i>
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
        </div>
      </nav>

      {view === 'loja' ? (
        <>
          <HeroSection />
          <Store addToCart={addToCart} />
        </>
      ) : view === 'pagamentos' ? (
        <div style={{ marginTop: '2rem' }}>
          <Pagamentos />
        </div>
      ) : (
        <Checkout 
          cart={cart} 
          totalPrice={totalPrice} 
          onBack={() => setView('loja')} 
        />
      )}

      {cartOpen && (
        <div className="cart-modal-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Seu Carrinho</h3>
              <button onClick={() => setCartOpen(false)} className="cart-close">×</button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <i className="fa fa-shopping-cart"></i> Seu carrinho está vazio
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="cart-item-emoji">{item.emoji}</div>
                    <div className="cart-item-info">
                      <div className="cart-item-nome">{item.nome}</div>
                      <div className="cart-item-preco">R$ {item.preco}</div>
                    </div>
                    <div className="cart-item-qtd">
                      <button onClick={() => changeQty(index, -1)}><i className="fa fa-minus"></i></button>
                      <span>{item.qtd}</span>
                      <button onClick={() => changeQty(index, 1)}><i className="fa fa-plus"></i></button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeFromCart(index)}>
                      <i className="fa fa-trash-alt"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <strong>R$ {totalPrice}</strong>
                </div>
                <button 
                  className="btn-checkout" 
                  onClick={() => {
                    setCartOpen(false);
                    setView('checkout');
                  }}
                >
                  Finalizar Compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
