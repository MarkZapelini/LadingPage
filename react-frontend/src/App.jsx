import { useState, useEffect } from 'react'
import './App.css'
import Pagamentos from './Pagamentos'
import HeroSection from './HeroSection'

const produtos = {
  "Z-Core Básico": { emoji: "🎮", preco: 49 },
  "Z-Core Plus": { emoji: "⚡", preco: 99 },
  "Z-Core Premium": { emoji: "👑", preco: 199 },
  "Z-Core Ultra": { emoji: "🚀", preco: 399 },
  "Z-Core VIP": { emoji: "💎", preco: 599 }
}

function App() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zcore-theme') || 'dark'
  })

  const [view, setView] = useState('loja') // 'loja' | 'pagamentos'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const savedCart = localStorage.getItem('cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [theme])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (nome) => {
    const prod = produtos[nome]
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

          <section className="produtos">
            <h2>Nossos Produtos</h2>
            <div className="produtos-grid">
              {Object.entries(produtos).map(([nome, prod]) => (
                <div key={nome} className="produto-card">
                  <div className="produto-emoji">{prod.emoji}</div>
                  <h3>{nome}</h3>
                  <p className="preco">R$ {prod.preco}</p>
                  <button onClick={() => addToCart(nome)} className="btn-add">
                    Adicionar ao Carrinho
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <Pagamentos />
        </div>
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
                <button className="btn-checkout">Finalizar Compra</button>
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
