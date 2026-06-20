    // --- CONFIGURAÇÃO DO FIREBASE ---
    const firebaseConfig = {
      apiKey: "AIzaSyA7gHgpS2dBrIa2dJamylsg9DUdgOHt3Sk",
      authDomain: "pg-de-vendas.firebaseapp.com",
      databaseURL: "https://pg-de-vendas-default-rtdb.firebaseio.com",
      projectId: "pg-de-vendas",
      storageBucket: "pg-de-vendas.firebasestorage.app",
      messagingSenderId: "803403474499",
      appId: "1:803403474499:web:e729b5b49b75dfa4cd16f6",
      measurementId: "G-5LPWHGFWK5"
    };
  
    // Inicializa o Firebase
    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(firebaseConfig);
      var auth = firebase.auth();
      var db = firebase.firestore();
    }
    
    // === FUNÇÕES DO FIRESTORE ===
    async function salvarUsuarioFirestore(usuario) {
      if (typeof db === 'undefined') return;
      try {
        await db.collection('usuarios').doc(usuario.id.toString()).set(usuario);
      } catch (error) { console.error('Firestore Error:', error); }
    }
    
    async function salvarPedidoFirestore(pedido, usuarioId) {
      if (typeof db === 'undefined') return;
      try {
        await db.collection('pedidos').doc(pedido.id.toString()).set({
          ...pedido,
          usuarioId: usuarioId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) { console.error('Firestore Error:', error); }
    }
  
    // Login com Google
    window.loginGoogle = function() {
      if (typeof firebase === 'undefined') return;
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(async (result) => {
          const user = result.user;
          const usuarioGoogle = {
            id: user.uid,
            nome: user.displayName,
            email: user.email,
            foto: user.photoURL,
            pedidos: []
          };
  
          let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
          let usuarioExistente = usuarios.find(u => u.email === usuarioGoogle.email);
          if (!usuarioExistente) {
            usuarios.push(usuarioGoogle);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            salvarUsuarioFirestore(usuarioGoogle);
          }
          localStorage.setItem('usuarioLogado', JSON.stringify(usuarioExistente || usuarioGoogle));
          mostrarToast('✅ Login com Google realizado!');
          verificarLogin();
        })
        .catch((error) => { console.error('Login Error:', error); });
    }
  
    let cart = JSON.parse(localStorage.getItem('zcore_cart') || '[]');
    let wishlist = JSON.parse(localStorage.getItem('zcore_wishlist') || '[]');
    
    const produtosPadrao = [
      { id: 1, nome: 'MacBook Air M3', marca: 'Apple', cat: 'notebooks', preco: 10499, promo: null, estoque: 15, desc: 'Chip M3, 8GB RAM, SSD 256GB, tela 13"', emoji: '💻', status: 'Ativo', avaliacao: 5, qtdAvaliacoes: 324 },
      { id: 2, nome: 'Galaxy S24 Ultra', marca: 'Samsung', cat: 'smartphones', preco: 6799, promo: 8499, estoque: 8, desc: '256GB, 12GB RAM, câmera 200MP, 5G', emoji: '📱', status: 'Ativo', avaliacao: 5, qtdAvaliacoes: 512 },
      { id: 3, nome: 'Sony WH-1000XM5', marca: 'Sony', cat: 'audio', preco: 1799, promo: 2299, estoque: 25, desc: 'Fone over-ear, cancelamento de ruído, 30h', emoji: '🎧', status: 'Ativo', avaliacao: 4, qtdAvaliacoes: 289 },
      { id: 4, nome: 'Apple Watch Series 9', marca: 'Apple', cat: 'wearables', preco: 3299, promo: null, estoque: 12, desc: 'GPS, 45mm, monitoramento de saúde 24h', emoji: '⌚', status: 'Destaque', avaliacao: 5, qtdAvaliacoes: 198 },
      { id: 5, nome: 'LG OLED 55"', marca: 'LG', cat: 'tvs', preco: 5099, promo: 5999, estoque: 5, desc: '4K, 120Hz, Dolby Vision, webOS 23', emoji: '📺', status: 'Ativo', avaliacao: 4, qtdAvaliacoes: 145 },
      { id: 6, nome: 'PlayStation 5 Slim', marca: 'Sony', cat: 'games', preco: 3999, promo: null, estoque: 20, desc: '1TB SSD, controle DualSense, 4K 120fps', emoji: '🎮', status: 'Ativo', avaliacao: 5, qtdAvaliacoes: 421 }
    ];
    
    let adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    if (adminProducts.length === 0) {
      adminProducts = [...produtosPadrao];
      localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    }

    const categoriesList = [
      { id: 'smartphones', label: 'Smartphones', icon: '📱', count: 48 },
      { id: 'notebooks', label: 'Notebooks', icon: '💻', count: 32 },
      { id: 'audio', label: 'Áudio', icon: '🎧', count: 56 },
      { id: 'tvs', label: 'TVs', icon: '📺', count: 24 },
      { id: 'wearables', label: 'Wearables', icon: '⌚', count: 19 },
      { id: 'games', label: 'Games', icon: '🎮', count: 37 },
    ];
  
    function buildStore() {
      const app = document.getElementById('store-app');
      if (!app) return;
      try {
        app.innerHTML = `
          <section class="cat-section section">
            <div class="section-header-premium">
              <div class="badge-dot">✦</div>
              <h2 class="sec-title">Explorar Categorias</h2>
              <p class="sec-subtitle">Navegue por nossa seleção premium de tecnologia</p>
            </div>
            <div class="cat-grid" id="cat-grid"></div>
          </section>
          <div class="store-divider"></div>
          <section class="prod-section section" id="produtos">
            <div class="section-header-premium">
              <div class="badge-dot">✦</div>
              <h2 class="sec-title">Mais Vendidos</h2>
              <p class="sec-subtitle">Os dispositivos mais desejados da coleção 2025</p>
            </div>
            <div class="prod-controls">
              <select class="ctrl-select" id="filtroCategoria" onchange="aplicarFiltros()">
                <option value="">Todas as categorias</option>
                ${categoriesList.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
              </select>
              <select class="ctrl-select" id="ordenarPor" onchange="aplicarFiltros()">
                <option value="padrao">Ordenar por: Padrão</option>
                <option value="preco-asc">Menor preço</option>
                <option value="preco-desc">Maior preço</option>
              </select>
              <div class="ctrl-pill">
                <button class="active" onclick="filtrarStatus(event, '')">Coleção Completa</button>
                <button onclick="filtrarStatus(event, 'Destaque')">Lançamentos</button>
              </div>
            </div>
            <div class="prod-grid" id="produtosGrid"></div>
          </section>
        `;
        
        const catGrid = document.getElementById('cat-grid');
        if (catGrid) {
          categoriesList.forEach(c => {
            const el = document.createElement('div');
            el.className = 'ccat';
            el.onclick = () => selecionarCategoria(c.id);
            el.innerHTML = `
              <span class="ccat__icon">${c.icon}</span>
              <div class="ccat__name">${c.label}</div>
              <div class="ccat__count">${c.count} produtos</div>
              <div class="ccat__bar"></div>
            `;
            catGrid.appendChild(el);
          });
        }
        renderizarProdutos();
      } catch (err) {
        console.error("Erro ao construir a loja:", err);
      }
    }
  
    function renderizarProdutos() {
      const grid = document.getElementById('produtosGrid');
      if (!grid) return;
      const cat = document.getElementById('filtroCategoria')?.value || '';
      const statusFiltro = window._statusFiltro || '';
      
      let filtered = adminProducts.filter(p => p.status !== 'Rascunho');
      if (cat) filtered = filtered.filter(p => p.cat === cat || p.categoria?.toLowerCase().includes(cat));
      if (statusFiltro) filtered = filtered.filter(p => p.status === statusFiltro);

      grid.innerHTML = filtered.map(p => `
        <div class="pcard-wrap">
          <div class="pcard" onclick="cliqueProduto('${p.nome}')">
            <div class="pcard__spotlight"></div>
            <div class="pcard__img-area">
              ${p.foto ? `<img src="${p.foto}" alt="${p.nome}" class="pcard__img">` : `<div class="pcard__emoji">${p.emoji || '📦'}</div>`}
            </div>
            <div class="pcard__info">
              <span class="pcard__brand">${p.marca || 'Z-Core'}</span>
              <h3 class="pcard__name">${p.nome}</h3>
              <div class="pcard__price">R$ ${p.preco.toLocaleString('pt-BR')}</div>
            </div>
            <button class="pcard__add" onclick="event.stopPropagation(); addCarrinho('${p.nome}')">+</button>
          </div>
        </div>
      `).join('');
    }
  
    window.filtrarStatus = (e, s) => {
      window._statusFiltro = s;
      document.querySelectorAll('.ctrl-pill button').forEach(b => b.classList.toggle('active', b.textContent.includes(s || 'Coleção')));
      renderizarProdutos();
    };

    window.aplicarFiltros = renderizarProdutos;
    window.selecionarCategoria = (id) => { document.getElementById('filtroCategoria').value = id; renderizarProdutos(); };
    window.cliqueProduto = (n) => { const p = adminProducts.find(x => x.nome === n); if(p) window.location.href = `pages/produto.html?id=${p.id}`; };

    window.addCarrinho = function(nome) {
      try {
        const p = adminProducts.find(x => x.nome === nome);
        if (!p) throw new Error("Produto não encontrado: " + nome);
        const exists = cart.find(i => i.nome === nome);
        if (exists) exists.quantidade++;
        else cart.push({ nome, preco: p.preco, emoji: p.emoji, quantidade: 1 });
        localStorage.setItem('zcore_cart', JSON.stringify(cart));
        atualizarCarrinho();
        mostrarToast('✓ Adicionado ao carrinho');
      } catch (err) {
        console.error("Erro ao adicionar ao carrinho:", err);
        mostrarToast('❌ Erro ao adicionar produto', 'erro');
      }
    };

    window.atualizarCarrinho = function() {
      const count = cart.reduce((s, i) => s + i.quantidade, 0);
      const el = document.getElementById('cartCount');
      if (el) el.textContent = count;
      
      const cartItemsDiv = document.getElementById('cartItems');
      const cartEmpty = document.getElementById('cartEmpty');
      const cartFooter = document.getElementById('cartFooter');
      const cartTotal = document.getElementById('cartTotal');
      
      if (!cartItemsDiv) return;

      if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartFooter.style.display = 'none';
        cartItemsDiv.innerHTML = '';
      } else {
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';
        
        let total = 0;
        cartItemsDiv.innerHTML = cart.map((item, index) => {
          total += item.preco * item.quantidade;
          return `
            <div class="cart-item">
              <div class="cart-item-emoji">${item.emoji}</div>
              <div class="cart-item-info">
                <div class="cart-item-nome">${item.nome}</div>
                <div class="cart-item-preco">R$ ${item.preco.toLocaleString('pt-BR')}</div>
              </div>
              <div class="cart-item-qtd">
                <button onclick="alterarQuantidade(${index}, -1)"><i class="fas fa-minus"></i></button>
                <span>${item.quantidade}</span>
                <button onclick="alterarQuantidade(${index}, 1)"><i class="fas fa-plus"></i></button>
              </div>
              <button class="cart-item-remove" onclick="removerItem(${index})"><i class="fas fa-trash"></i></button>
            </div>
          `;
        }).join('');
        cartTotal.textContent = 'R$ ' + total.toLocaleString('pt-BR');
      }
    };

    window.abrirCarrinho = () => document.getElementById('cartModal')?.classList.add('show');
    window.fecharCarrinho = () => document.getElementById('cartModal')?.classList.remove('show');
    window.alterarQuantidade = (idx, delta) => {
      cart[idx].quantidade += delta;
      if (cart[idx].quantidade <= 0) cart.splice(idx, 1);
      localStorage.setItem('zcore_cart', JSON.stringify(cart));
      atualizarCarrinho();
    };
    window.removerItem = (idx) => {
      cart.splice(idx, 1);
      localStorage.setItem('zcore_cart', JSON.stringify(cart));
      atualizarCarrinho();
    };
    window.finalizarCompra = () => { window.location.href = 'pages/checkout.html'; };

    window.mostrarToast = function(m) {
      const t = document.getElementById('toast');
      if (t) { t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
    };

    window.verificarLogin = function() {
      const user = JSON.parse(localStorage.getItem('usuarioLogado'));
      const auth = document.getElementById('authButtons');
      const logged = document.getElementById('userLogged');
      const adminLink = document.getElementById('adminLink');
      if (user && logged) {
        auth.style.display = 'none';
        logged.style.display = 'flex';
        document.getElementById('userName').textContent = user.nome.split(' ')[0];
        if (adminLink) {
          adminLink.style.display = (user.role === 'admin') ? 'flex' : 'none';
        }
      } else {
        if (auth) auth.style.display = 'flex';
        if (logged) logged.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
      }
    };

    window.scrollToSection = (e, id) => { if(e) e.preventDefault(); document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); };

    window.onload = () => {
    buildStore();
    atualizarCarrinho();
    verificarLogin();

    // Word Rotate Logic
    const words = ['transforma', 'eleva', 'evolui', 'define', 'conecta'];
    let wordIndex = 0;
    const el = document.getElementById('wordRotate');
    if (el) {
      setInterval(() => {
        el.style.opacity = '0';
        setTimeout(() => {
          wordIndex = (wordIndex + 1) % words.length;
          el.textContent = words[wordIndex];
          el.style.opacity = '1';
        }, 500);
      }, 3000);
    }
  };
