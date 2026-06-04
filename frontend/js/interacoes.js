  // === CONFIGURAÇÃO DO FIREBASE ===
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
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // === FUNÇÕES DO FIRESTORE ===
  // Salvar usuário no Firestore
  async function salvarUsuarioFirestore(usuario) {
    try {
      await db.collection('usuarios').doc(usuario.id.toString()).set(usuario);
      console.log('✅ Usuário salvo no Firestore!');
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error);
    }
  }
  
  // Salvar pedido no Firestore
  async function salvarPedidoFirestore(pedido, usuarioId) {
    try {
      await db.collection('pedidos').doc(pedido.id.toString()).set({
        ...pedido,
        usuarioId: usuarioId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Pedido salvo no Firestore!');
    } catch (error) {
      console.error('❌ Erro ao salvar pedido:', error);
    }
  }
  
  // Obter usuário do Firestore
  async function getUsuarioFirestore(email) {
    try {
      const snapshot = await db.collection('usuarios').where('email', '==', email).get();
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return null;
    }
  }

  // Login com Google
  function loginGoogle() {
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

        if (typeof ZCoreAPI !== 'undefined' && ZCoreAPI._online) {
          try {
            const data = await ZCoreAPI.loginGoogle({
              uid: user.uid,
              nome: user.displayName,
              email: user.email,
              foto: user.photoURL
            });
            ZCoreAPI.saveSession(data);
            mostrarToast('✅ Login com Google realizado com sucesso!');
            verificarLogin();
            return;
          } catch (e) {
            console.warn('API Google login:', e.message);
          }
        }

        let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        let usuarioExistente = usuarios.find(u => u.email === usuarioGoogle.email);
        if (!usuarioExistente) {
          usuarios.push(usuarioGoogle);
          localStorage.setItem('usuarios', JSON.stringify(usuarios));
          salvarUsuarioFirestore(usuarioGoogle);
        }
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioExistente || usuarioGoogle));
        mostrarToast('✅ Login com Google realizado com sucesso!');
        verificarLogin();
      })
      .catch((error) => {
        console.error('Erro no login:', error);
        mostrarToast('❌ Erro ao fazer login com Google!', 'erro');
      });
  }

  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  // Produtos padrão (fallback)
  const produtosPadrao = [
    { id: 1, nome: 'MacBook Air M3', marca: 'Apple', cat: 'notebooks', preco: 10499, promo: null, estoque: 15, desc: 'Chip M3, 8GB RAM, SSD 256GB, tela 13"', emoji: '💻', status: 'Ativo', avaliacao: 5, qtdAvaliacoes: 324 },
    { id: 2, nome: 'Galaxy S24 Ultra', marca: 'Samsung', cat: 'smartphones', preco: 6799, promo: 8499, estoque: 8, desc: '256GB, 12GB RAM, câmera 200MP, 5G', emoji: '📱', status: 'Ativo', avaliacao: 5, qtdAvaliacoes: 512 },
    { id: 3, nome: 'Sony WH-1000XM5', marca: 'Sony', cat: 'audio', preco: 1799, promo: 2299, estoque: 25, desc: 'Fone over-ear, cancelamento de ruído, 30h', emoji: '🎧', status: 'Ativo', avaliacao: 4, qtdAvaliacoes: 289 },
    { id: 4, nome: 'Apple Watch Series 9', marca: 'Apple', cat: 'wearables', preco: 3299, promo: null, estoque: 12, desc: 'GPS, 45mm, monitoramento de saúde 24h', emoji: '⌚', status: 'Destaque', avaliacao: 5, qtdAvaliacoes: 198 },
    { id: 5, nome: 'LG OLED 55"', marca: 'LG', cat: 'tvs', preco: 5099, promo: 5999, estoque: 5, desc: '4K, 120Hz, Dolby Vision, webOS 23', emoji: '📺', status: 'Ativo', avaliacao: 4, qtdAvaliacoes: 145 },
    { id: 6, nome: 'PlayStation 5 Slim', marca: 'Sony', cat: 'games', preco: 3999, promo: null, estoque: 20, desc: '1TB SSD, controle DualSense, 4K 120fps', emoji: '🎮', status: 'Ativo', avaliacao: 5, qtdAvaliacoes: 421 }
  ];
  
  // Obter produtos do localStorage (adminProducts) ou usar padrões
  let adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
  // Convert admin structure to site structure
  adminProducts = adminProducts.map(p => ({
    ...p,
    cat: p.cat || (p.categoria ? p.categoria.split(' ')[1].toLowerCase() : 'outros')
  }));
  if (adminProducts.length === 0) {
    adminProducts = [...produtosPadrao];
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
  }
  
  const galleryIndices = {};

  function obterFotosProduto(p) {
    if (p.fotos && Array.isArray(p.fotos) && p.fotos.length) return p.fotos.filter(Boolean);
    if (p.foto) return [p.foto];
    return [];
  }

  function renderGaleriaProduto(p) {
    const fotos = obterFotosProduto(p);
    const id = p.id;
    if (galleryIndices[id] === undefined) galleryIndices[id] = 0;
    if (galleryIndices[id] >= fotos.length) galleryIndices[id] = 0;

    if (!fotos.length) {
      return '<span class="gallery-emoji" style="font-size:72px">' + (p.emoji || '📦') + '</span>';
    }

    const idx = galleryIndices[id];
    const slides = fotos.map(function(src, i) {
      return '<div class="produto-gallery-slide' + (i === idx ? ' active' : '') + '" data-slide="' + i + '">' +
        '<img src="' + src + '" alt="' + p.nome.replace(/"/g, '&quot;') + '">' +
      '</div>';
    }).join('');

    if (fotos.length === 1) {
      return '<div class="produto-gallery" data-product-id="' + id + '">' + slides + '</div>';
    }

    const dots = fotos.map(function(_, i) {
      return '<button type="button" class="gallery-dot' + (i === idx ? ' active' : '') + '" onclick="event.stopPropagation();irParaFotoProduto(' + id + ',' + i + ')"></button>';
    }).join('');

    return '<div class="produto-gallery" data-product-id="' + id + '">' + slides +
      '<span class="gallery-counter">' + (idx + 1) + ' / ' + fotos.length + '</span>' +
      '<button type="button" class="gallery-nav gallery-prev" onclick="event.stopPropagation();slideFotoProduto(' + id + ',-1)" aria-label="Foto anterior"><i class="fas fa-chevron-left"></i></button>' +
      '<button type="button" class="gallery-nav gallery-next" onclick="event.stopPropagation();slideFotoProduto(' + id + ',1)" aria-label="Próxima foto"><i class="fas fa-chevron-right"></i></button>' +
      '<div class="gallery-dots">' + dots + '</div>' +
    '</div>';
  }

  function atualizarGaleriaCard(productId) {
    const gallery = document.querySelector('.produto-gallery[data-product-id="' + productId + '"]');
    if (!gallery) return;
    const idx = galleryIndices[productId] || 0;
    gallery.querySelectorAll('.produto-gallery-slide').forEach(function(s, i) {
      s.classList.toggle('active', i === idx);
    });
    const counter = gallery.querySelector('.gallery-counter');
    if (counter) {
      const total = gallery.querySelectorAll('.produto-gallery-slide').length;
      counter.textContent = (idx + 1) + ' / ' + total;
    }
    gallery.querySelectorAll('.gallery-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  window.slideFotoProduto = function(productId, delta) {
    const p = adminProducts.find(function(x) { return x.id === productId; });
    if (!p) return;
    const fotos = obterFotosProduto(p);
    if (fotos.length <= 1) return;
    const cur = galleryIndices[productId] || 0;
    galleryIndices[productId] = (cur + delta + fotos.length) % fotos.length;
    atualizarGaleriaCard(productId);
  };

  window.irParaFotoProduto = function(productId, index) {
    galleryIndices[productId] = index;
    atualizarGaleriaCard(productId);
  };

  // Criar objeto produtos para compatibilidade com funções antigas
  const produtos = {};
  adminProducts.forEach(p => {
    const precoFinal = p.promo && p.promo < p.preco ? p.promo : p.preco;
    produtos[p.nome] = {
      preco: precoFinal,
      emoji: p.emoji || '📦'
    };
  });

  // Função para renderizar produtos dinamicamente no INDEX.HTML
  function renderizarProdutos() {
    const grid = document.getElementById('produtosGrid');
    if (!grid) return;
    
    const produtosAtivos = adminProducts.filter(p => p.status !== 'Rascunho' && p.estoque > 0);
    
    if (produtosAtivos.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted)"><i class="fas fa-box-open" style="font-size:48px;display:block;margin-bottom:12px"></i><div style="font-size:16px;font-weight:600;color:var(--text)">Nenhum produto disponível</div><div style="font-size:14px">Adicione produtos no painel Admin</div></div>';
      return;
    }
    
    grid.innerHTML = produtosAtivos.map(p => {
      const precoFinal = p.promo && p.promo < p.preco ? p.promo : p.preco;
      const temPromocao = p.promo && p.promo < p.preco;
      const estrelas = '★'.repeat(Math.min(5, p.avaliacao || 5)) + '☆'.repeat(Math.max(0, 5 - (p.avaliacao || 5)));
      
      return `
        <div class="produto-card" data-nome="${p.nome}" data-categoria="${p.cat}" data-preco="${precoFinal}">
          <div class="produto-img" style="overflow:hidden">
            ${p.status === 'Destaque' ? '<span class="badge-novo">NOVO</span>' : ''}
            ${temPromocao ? '<span class="badge-off">−' + Math.round((1 - p.promo/p.preco)*100) + '%</span>' : ''}
            <button class="btn-wishlist-card" onclick="toggleWishlist('${p.nome}')"><i class="fas fa-heart"></i></button>
            ${renderGaleriaProduto(p)}
          </div>
          <div class="produto-info">
            <div class="produto-marca">${p.marca || ''}</div>
            <div class="produto-nome">${p.nome}</div>
            <div class="produto-avaliacao">
              <span class="estrelas">${estrelas}</span>
              <span class="qtd-avaliacoes">(${p.qtdAvaliacoes || 0})</span>
            </div>
            <div class="produto-desc">${p.desc || ''}</div>
            <div class="produto-footer">
              <div>
                ${temPromocao ? '<div class="produto-preco-old">R$ ' + p.preco.toLocaleString('pt-BR') + '</div>' : ''}
                <div class="produto-preco">R$ ${precoFinal.toLocaleString('pt-BR')}</div>
              </div>
              <button class="btn-add" onclick="addCarrinho('${p.nome}')">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Atualizar wishlist após renderizar
    atualizarWishlist();
  }

  function addCarrinho(nomeProduto) {
    const produto = produtos[nomeProduto];
    const adminProduto = adminProducts.find(p => p.nome === nomeProduto);
    const itemExistente = cart.find(item => item.nome === nomeProduto);
    
    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      const newItem = {
        nome: nomeProduto,
        preco: produto.preco,
        emoji: produto.emoji,
        quantidade: 1
      };
      if (adminProduto) {
        newItem.id = adminProduto.id;
        newItem.foto = adminProduto.foto;
      }
      cart.push(newItem);
    }
    
    atualizarCarrinho();
    showToast('✓ ' + nomeProduto + ' adicionado ao carrinho!');
  }

  function addWishlistToCart(nomeProduto) {
    addCarrinho(nomeProduto);
    removerWishlist(nomeProduto);
    abrirCarrinho();
  }

  function removerItem(index) {
    cart.splice(index, 1);
    atualizarCarrinho();
  }

  function alterarQuantidade(index, delta) {
    cart[index].quantidade += delta;
    if (cart[index].quantidade <= 0) {
      removerItem(index);
    } else {
      atualizarCarrinho();
    }
  }

  async function syncCartToApi() {
    if (typeof ZCoreAPI === 'undefined' || !ZCoreAPI._online || !ZCoreAPI.isLoggedIn()) return;
    try {
      await ZCoreAPI.saveCart(cart);
    } catch (e) {
      console.warn('Sync carrinho:', e.message);
    }
  }

  function atualizarCarrinho() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
    document.getElementById('cartCount').textContent = totalItems;
    localStorage.setItem('cart', JSON.stringify(cart));
    syncCartToApi();
    
    const cartItemsDiv = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
      cartEmpty.style.display = 'block';
      cartFooter.style.display = 'none';
      cartItemsDiv.innerHTML = '';
    } else {
      cartEmpty.style.display = 'none';
      cartFooter.style.display = 'block';
      
      let html = '';
      let total = 0;
      
      cart.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        
        const itemVisual = item.foto 
          ? `<div class="cart-item-img"><img src="${item.foto}" alt="${item.nome}"></div>`
          : `<div class="cart-item-emoji">${item.emoji}</div>`;
        
        html += `
          <div class="cart-item">
            ${itemVisual}
            <div class="cart-item-info">
              <div class="cart-item-nome">${item.nome}</div>
              <div class="cart-item-preco">R$ ${item.preco.toLocaleString('pt-BR')}</div>
            </div>
            <div class="cart-item-qtd">
              <button onclick="alterarQuantidade(${index}, -1)"><i class="fas fa-minus"></i></button>
              <span>${item.quantidade}</span>
              <button onclick="alterarQuantidade(${index}, 1)"><i class="fas fa-plus"></i></button>
            </div>
            <button class="cart-item-remove" onclick="removerItem(${index})" title="Remover item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
      });
      
      cartItemsDiv.innerHTML = html;
      cartTotal.textContent = 'R$ ' + total.toLocaleString('pt-BR');
    }
  }

  function abrirCarrinho() {
    document.getElementById('cartModal').classList.add('show');
  }

  function fecharCarrinho() {
    document.getElementById('cartModal').classList.remove('show');
  }

  function finalizarCompra() {
    if (cart.length === 0) return;
    fecharCarrinho();
    window.location.href = 'pages/checkout.html';
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  function mostrarToast(msg, tipo = 'sucesso') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast';
    if (tipo === 'erro') t.classList.add('erro');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  // === WISHLIST FUNCTIONS ===
  function toggleWishlist(nomeProduto) {
    const index = wishlist.findIndex(item => item === nomeProduto);
    if (index > -1) {
      wishlist.splice(index, 1);
      mostrarToast('💔 ' + nomeProduto + ' removido da lista de desejos!');
    } else {
      wishlist.push(nomeProduto);
      mostrarToast('❤️ ' + nomeProduto + ' adicionado à lista de desejos!');
    }
    atualizarWishlist();
  }

  function removerWishlist(nomeProduto) {
    const index = wishlist.findIndex(item => item === nomeProduto);
    if (index > -1) {
      wishlist.splice(index, 1);
      atualizarWishlist();
    }
  }

  function addWishlistToCart(nomeProduto) {
    addCarrinho(nomeProduto);
    removerWishlist(nomeProduto);
    abrirCarrinho();
  }

  async function syncWishlistToApi() {
    if (typeof ZCoreAPI === 'undefined' || !ZCoreAPI._online || !ZCoreAPI.isLoggedIn()) return;
    try {
      await ZCoreAPI.saveWishlist(wishlist);
    } catch (e) {
      console.warn('Sync wishlist:', e.message);
    }
  }

  function atualizarWishlist() {
    document.getElementById('wishlistCount').textContent = wishlist.length;
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    syncWishlistToApi();
    
    const wishlistItemsDiv = document.getElementById('wishlistItems');
    const wishlistEmpty = document.getElementById('wishlistEmpty');
    
    document.querySelectorAll('.btn-wishlist-card').forEach(btn => {
      try {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr) {
          const match = onclickAttr.match(/'([^']+)'/);
          if (match && match[1]) {
            const nome = match[1];
            if (wishlist.includes(nome)) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          }
        }
      } catch (e) {
        console.error('Erro ao atualizar botão wishlist:', e);
      }
    });
    
    if (wishlist.length === 0) {
      wishlistEmpty.style.display = 'block';
      wishlistItemsDiv.innerHTML = '';
      wishlistItemsDiv.appendChild(wishlistEmpty);
    } else {
      wishlistEmpty.style.display = 'none';
      
      let html = '';
      wishlist.forEach(nome => {
        const produtoAdmin = adminProducts.find(p => p.nome === nome);
        if (produtoAdmin) {
          const preco = produtoAdmin.promo && produtoAdmin.promo < produtoAdmin.preco ? produtoAdmin.promo : produtoAdmin.preco;
          const itemVisual = produtoAdmin.foto 
            ? `<div class="wishlist-item-img"><img src="${produtoAdmin.foto}" alt="${nome}"></div>`
            : `<div class="wishlist-item-emoji">${produtoAdmin.emoji || '<i class="fas fa-box"></i>'}</div>`;
          html += `
            <div class="wishlist-item">
              ${itemVisual}
              <div class="wishlist-item-info">
                <div class="wishlist-item-nome">${nome}</div>
                <div class="wishlist-item-preco">R$ ${preco.toLocaleString('pt-BR')}</div>
              </div>
              <button class="wishlist-item-add" onclick="addWishlistToCart('${nome}')"><i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho</button>
              <button class="wishlist-item-remove" onclick="removerWishlist('${nome}')"><i class="fas fa-times"></i></button>
            </div>
          `;
        }
      });
      
      wishlistItemsDiv.innerHTML = html;
    }
  }

  function abrirWishlist() {
    document.getElementById('wishlistModal').classList.add('show');
  }

  function fecharWishlist() {
    document.getElementById('wishlistModal').classList.remove('show');
  }

  function buscarProdutos() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const produtos = document.querySelectorAll('.produto-card');
    
    produtos.forEach(produto => {
      const nome = produto.querySelector('.produto-nome').textContent.toLowerCase();
      const marca = (produto.querySelector('.produto-marca')?.textContent || '').toLowerCase();
      
      if (nome.includes(termo) || marca.includes(termo)) {
        produto.style.display = 'block';
      } else {
        produto.style.display = 'none';
      }
    });
  }

  async function aplicarFiltros() {
    await sincronizarAdminProducts();
    renderizarProdutos();
    
    const categoria = document.getElementById('filtroCategoria').value;
    const ordenar = document.getElementById('ordenarPor').value;
    const grid = document.getElementById('produtosGrid');
    let cards = Array.from(grid.querySelectorAll('.produto-card'));
    
    cards.forEach(card => {
      const cardCategoria = card.getAttribute('data-categoria');
      if (categoria && cardCategoria !== categoria) {
        card.style.display = 'none';
      } else {
        card.style.display = 'block';
      }
    });
    
    if (ordenar !== 'padrao') {
      let visibleCards = cards.filter(card => card.style.display !== 'none');
      
      visibleCards.sort((a, b) => {
        const precoA = parseInt(a.getAttribute('data-preco'));
        const precoB = parseInt(b.getAttribute('data-preco'));
        const nomeA = a.querySelector('.produto-nome').textContent.toLowerCase();
        const nomeB = b.querySelector('.produto-nome').textContent.toLowerCase();
        
        switch(ordenar) {
          case 'preco-asc':
            return precoA - precoB;
          case 'preco-desc':
            return precoB - precoA;
          case 'nome-asc':
            return nomeA.localeCompare(nomeB);
          case 'nome-desc':
            return nomeB.localeCompare(nomeA);
          default:
            return 0;
        }
      });
      
      visibleCards.forEach(card => grid.appendChild(card));
    }
  }

  function verificarLogin() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const authButtons = document.getElementById('authButtons');
    const userLogged = document.getElementById('userLogged');
    
    if (usuarioLogado) {
      authButtons.style.display = 'none';
      userLogged.style.display = 'flex';
      document.getElementById('userName').textContent = usuarioLogado.nome.split(' ')[0];
      document.getElementById('userAvatar').textContent = usuarioLogado.nome[0].toUpperCase();
    } else {
      authButtons.style.display = 'flex';
      userLogged.style.display = 'none';
    }
  }

  function fazerLogout() {
    if (typeof ZCoreAPI !== 'undefined') ZCoreAPI.logout();
    localStorage.removeItem('usuarioLogado');
    verificarLogin();
    mostrarToast('✅ Você saiu da sua conta!');
  }

  function scrollToSection(e, sectionId) {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function selecionarCategoria(e, categoria) {
    e.preventDefault();
    document.getElementById('filtroCategoria').value = categoria;
    aplicarFiltros();
    scrollToSection(e, 'produtos');
  }

  function verTodasCategorias(e) {
    e.preventDefault();
    document.getElementById('filtroCategoria').value = '';
    aplicarFiltros();
    mostrarToast('✅ Exibindo todas as categorias!');
  }

  function cliqueProduto(nomeProduto) {
    const produto = adminProducts.find(p => p.nome === nomeProduto);
    if (produto) {
      window.location.href = 'pages/produto.html?id=' + produto.id;
    }
  }

  function inscreverNewsletter(e) {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    mostrarToast('✅ Obrigado por se inscrever!');
    document.getElementById('newsletterEmail').value = '';
  }

  function rebuildProdutosMap() {
    Object.keys(produtos).forEach(key => delete produtos[key]);
    adminProducts.forEach(p => {
      const precoFinal = p.promo && p.promo < p.preco ? p.promo : p.preco;
      produtos[p.nome] = { preco: precoFinal, emoji: p.emoji || '📦' };
    });
  }

  async function sincronizarAdminProducts() {
    if (typeof ZCoreAPI !== 'undefined') {
      await ZCoreAPI.init();
      if (ZCoreAPI._online) {
        try {
          const apiProducts = await ZCoreAPI.getProducts();
          const localStored = JSON.parse(localStorage.getItem('adminProducts') || '[]');
          const apiIds = new Set(apiProducts.map(function(p) { return p.id; }));
          const localOnly = localStored.filter(function(p) { return !apiIds.has(p.id); });
          adminProducts = apiProducts.concat(localOnly);
          adminProducts.forEach(function(p) {
            if (!p.fotos || !p.fotos.length) p.fotos = p.foto ? [p.foto] : [];
          });
          localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
          rebuildProdutosMap();
          return;
        } catch (e) {
          console.warn('API produtos:', e.message);
        }
      }
    }
    adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    adminProducts.forEach(function(p) {
      if (!p.fotos || !p.fotos.length) p.fotos = p.foto ? [p.foto] : [];
    });
    if (adminProducts.length === 0) {
      adminProducts = [...produtosPadrao];
      localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    }
    rebuildProdutosMap();
  }

  async function loadUserCartWishlist() {
    if (typeof ZCoreAPI === 'undefined' || !ZCoreAPI._online || !ZCoreAPI.isLoggedIn()) return;
    try {
      const apiCart = await ZCoreAPI.getCart();
      if (apiCart && apiCart.length) cart = apiCart;
      const apiWish = await ZCoreAPI.getWishlist();
      if (apiWish && apiWish.length) wishlist = apiWish;
    } catch (e) {
      console.warn('Load cart/wishlist:', e.message);
    }
  }

  window.onload = async function() {
    await sincronizarAdminProducts();
    await loadUserCartWishlist();
    renderizarProdutos();
    atualizarCarrinho();
    atualizarWishlist();
    verificarLogin();
    
    // Adicionar eventos aos botões de adicionar ao carrinho para feedback visual
    document.body.addEventListener('click', function(e) {
      if (e.target.closest('.btn-add')) {
        const btn = e.target.closest('.btn-add');
        btn.style.transform = 'scale(0.8)';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
        }, 100);
      }
    });
    
    // Adicionar eventos aos cards de produtos
    document.body.addEventListener('click', function(e) {
      if (e.target.closest('.produto-card') && !e.target.closest('.btn-add') && !e.target.closest('.btn-wishlist-card')) {
        const card = e.target.closest('.produto-card');
        const nome = card.getAttribute('data-nome');
        cliqueProduto(nome);
      }
    });
  };
