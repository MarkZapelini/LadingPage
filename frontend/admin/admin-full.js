// ========================================
// Z-CORE ADMIN - JAVASCRIPT
// ========================================

// Dados Globais
let produtos = [];
let pedidos = [];
let usuarios = [];
let perfil = {
    nome: 'Admin',
    avatar: 'AD',
    cor: '#A020F0',
    foto: null
};
let editandoProdutoId = null;
let produtoParaExcluir = null;
let produtoFoto = null; // Foto do produto atual

// Produtos Padrão
const produtosPadrao = [
    { id: 1, nome: 'MacBook Air M3', desc: 'Notebook Apple com chip M3', categoria: '💻 Notebooks', marca: 'Apple', preco: 11499, promo: null, estoque: 15, status: 'Destaque', emoji: '💻' },
    { id: 2, nome: 'Galaxy S24 Ultra', desc: 'Smartphone Samsung premium', categoria: '📱 Smartphones', marca: 'Samsung', preco: 6799, promo: 5999, estoque: 20, status: 'Ativo', emoji: '📱' },
    { id: 3, nome: 'Sony WH-1000XM5', desc: 'Fones de ouvido com cancelamento de ruído', categoria: '🎧 Headphones', marca: 'Sony', preco: 2499, promo: null, estoque: 8, status: 'Ativo', emoji: '🎧' },
    { id: 4, nome: 'PlayStation 5 Slim', desc: 'Console Sony de última geração', categoria: '🎮 Games', marca: 'Sony', preco: 3699, promo: null, estoque: 5, status: 'Destaque', emoji: '🎮' },
    { id: 5, nome: 'Apple Watch Series 9', desc: 'Relógio inteligente Apple', categoria: '⌚ Smartwatches', marca: 'Apple', preco: 3299, promo: null, estoque: 12, status: 'Ativo', emoji: '⌚' },
    { id: 6, nome: 'LG OLED 55"', desc: 'Smart TV OLED 4K', categoria: '📺 TVs', marca: 'LG', preco: 4499, promo: 3999, estoque: 3, status: 'Ativo', emoji: '📺' }
];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    carregarDados();
    inicializarEventos();
    renderizarTudo();
});

// Verificar Login
function verificarLogin() {
    if (!localStorage.getItem('adminLogado')) {
        window.location.href = 'login-admin.html';
    }
}

// Carregar Dados do LocalStorage
function carregarDados() {
    const savedProds = localStorage.getItem('adminProducts');
    const savedOrders = localStorage.getItem('adminOrders');
    const savedUsers = localStorage.getItem('usuarios');
    const savedProfile = localStorage.getItem('adminProfile');
    const savedTheme = localStorage.getItem('zcore-theme');

    produtos = savedProds ? JSON.parse(savedProds) : [...produtosPadrao];
    pedidos = savedOrders ? JSON.parse(savedOrders) : [];
    usuarios = savedUsers ? JSON.parse(savedUsers) : [];
    perfil = savedProfile ? JSON.parse(savedProfile) : perfil;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// Salvar Dados
function salvarDados() {
    localStorage.setItem('adminProducts', JSON.stringify(produtos));
    localStorage.setItem('adminOrders', JSON.stringify(pedidos));
}

// Inicializar Eventos
function inicializarEventos() {
    // Navegação Sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            if (page) navegarPara(page);
        });
    });

    // Menu Toggle (Mobile)
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });

    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTema);

    // Logout
    document.getElementById('btnLogout').addEventListener('click', fazerLogout);

    // Botão Novo Produto (na página de produtos
    document.getElementById('btnAddProduto').addEventListener('click', () => abrirFormProduto());

    // Form Produto
    document.getElementById('formProduto').addEventListener('submit', salvarProduto);
    document.getElementById('btnCancelar').addEventListener('click', () => navegarPara('produtos'));

    // Preview listeners
    const camposPreview = ['fNome', 'fCategoria', 'fMarca', 'fPreco', 'fPromo', 'fEstoque', 'fDesc', 'fStatus', 'fEmoji'];
    camposPreview.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', atualizarPreview);
            campo.addEventListener('change', atualizarPreview);
        }
    });

    // Upload listeners
    const uploadArea = document.getElementById('uploadArea');
    const fFoto = document.getElementById('fFoto');
    const removeFotoBtn = document.getElementById('removeFoto');

    if (uploadArea) {
        // Clique para abrir seletor de arquivo
        uploadArea.addEventListener('click', () => fFoto.click());

        // Drag e Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                processarArquivo(e.dataTransfer.files[0]);
            }
        });
    }

    if (fFoto) {
        fFoto.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processarArquivo(e.target.files[0]);
            }
        });
    }

    if (removeFotoBtn) {
        removeFotoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            produtoFoto = null;
            resetarUpload();
            atualizarPreview();
        });
    }
}

function processarArquivo(file) {
    if (!file.type.startsWith('image/')) {
        mostrarToast('Por favor, selecione uma imagem válida!', true);
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
        mostrarToast('A imagem deve ter no máximo 5MB!', true);
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        produtoFoto = e.target.result;
        mostrarFotoUpload(produtoFoto);
        atualizarPreview();
    };
    reader.readAsDataURL(file);

    // Search
    document.getElementById('searchProduto').addEventListener('input', (e) => filtrarProdutos(e.target.value));

    // Filter Chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filtrarPedidos(chip.getAttribute('data-filter'));
        });
    });

    // Perfil
    document.getElementById('adminProfile').addEventListener('click', abrirModalPerfil);
    document.getElementById('closeProfileModal').addEventListener('click', fecharModalPerfil);
    document.getElementById('btnCancelarPerfil').addEventListener('click', fecharModalPerfil);
    document.getElementById('formPerfil').addEventListener('submit', salvarPerfil);
    document.getElementById('btnSelecionarFoto').addEventListener('click', () => document.getElementById('fotoInput').click());
    document.getElementById('fotoInput').addEventListener('change', handleFotoPerfil);
    document.getElementById('btnRemoverFoto').addEventListener('click', removerFotoPerfil);

    // Delete Modal
    document.getElementById('closeDeleteModal').addEventListener('click', fecharModalDelete);
    document.getElementById('btnCancelarDelete').addEventListener('click', fecharModalDelete);
    document.getElementById('btnConfirmarDelete').addEventListener('click', confirmarExclusao);

    // Close Modal on Overlay Click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
            }
        });
    });
}

// ========================================
// NAVEGAÇÃO
// ========================================
function navegarPara(page) {
    // Atualizar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });

    // Atualizar página
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    // Atualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'produtos': 'Produtos',
        'categorias': 'Categorias',
        'estoque': 'Estoque',
        'pedidos': 'Pedidos',
        'cupons': 'Cupons',
        'carrinhos': 'Carrinhos Abandonados',
        'clientes': 'Clientes',
        'avaliacoes': 'Avaliações',
        'faturamento': 'Faturamento',
        'relatorios': 'Relatórios',
        'pagamentos': 'Pagamentos',
        'fretes': 'Fretes',
        'usuarios': 'Usuários',
        'config-loja': 'Configurações da Loja',
        'form-produto': 'Adicionar Produto'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

    // Fechar sidebar no mobile
    document.querySelector('.sidebar').classList.remove('open');
}

function goToPage(page) {
    navegarPara(page);
}

// ========================================
// TEMA
// ========================================
function toggleTema() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('zcore-theme', next);
}

// ========================================
// RENDERIZAÇÃO
// ========================================
function renderizarTudo() {
    atualizarPerfilUI();
    renderizarDashboard();
    renderizarProdutos();
    renderizarEstoque();
    renderizarPedidos();
    renderizarClientes();
}

function atualizarPerfilUI() {
    const avatarEl = document.getElementById('adminAvatar');
    const nameEl = document.getElementById('adminName');
    const previewEl = document.getElementById('avatarPreview');
    const pNome = document.getElementById('pNome');
    const pAvatar = document.getElementById('pAvatar');
    const pCor = document.getElementById('pCor');

    if (perfil.foto) {
        avatarEl.style.backgroundImage = `url(${perfil.foto})`;
        avatarEl.textContent = '';
        previewEl.style.backgroundImage = `url(${perfil.foto})`;
        previewEl.textContent = '';
    } else {
        avatarEl.style.backgroundImage = '';
        avatarEl.textContent = perfil.avatar;
        avatarEl.style.backgroundColor = perfil.cor;
        previewEl.style.backgroundImage = '';
        previewEl.textContent = perfil.avatar;
        previewEl.style.backgroundColor = perfil.cor;
    }

    nameEl.textContent = perfil.nome;
    pNome.value = perfil.nome;
    pAvatar.value = perfil.avatar;
    pCor.value = perfil.cor;
}

function renderizarDashboard() {
    // Stats
    document.getElementById('statTotalProdutos').textContent = produtos.length;
    document.getElementById('statPedidos').textContent = pedidos.length;
    document.getElementById('statClientes').textContent = usuarios.length;
    document.querySelector('.badge-count').textContent = produtos.length;

    const receita = pedidos
        .filter(p => (p.status || '').toLowerCase() !== 'cancelado')
        .reduce((sum, p) => sum + (p.total || 0), 0);
    document.getElementById('statReceita').textContent = formatarMoeda(receita);

    // Pedidos Recentes
    const recentPedidos = pedidos.slice(0, 5);
    const tbodyPedidos = document.getElementById('recentPedidos');
    if (recentPedidos.length === 0) {
        tbodyPedidos.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum pedido</td></tr>';
    } else {
        tbodyPedidos.innerHTML = recentPedidos.map(p => {
            const pedidoId = typeof p.id === 'string' && p.id.startsWith('#') ? p.id : `#${p.id}`;
            const cliente = p.nome || p.cliente || 'Cliente';
            const status = p.status || 'Pendente';
            return `
                <tr>
                    <td>${pedidoId}</td>
                    <td>${cliente}</td>
                    <td class="price">${formatarMoeda(p.total || 0)}</td>
                    <td><span class="badge ${getBadgeClass(status)}">${status}</span></td>
                </tr>
            `;
        }).join('');
    }

    // Produtos Recentes
    const recentProds = produtos.slice(0, 5);
    const tbodyProds = document.getElementById('recentProdutos');
    tbodyProds.innerHTML = recentProds.map(p => `
        <tr>
            <td>
                <div class="produto-info">
                    <div class="produto-thumb">${p.foto ? `<img src="${p.foto}" alt="${p.nome}">` : (p.emoji || '📦')}</div>
                    <div class="produto-nome">${p.nome}</div>
                </div>
            </td>
            <td>${p.categoria || ''}</td>
            <td class="price">${formatarMoeda(p.promo || p.preco)}</td>
            <td>${p.estoque}</td>
            <td><span class="badge ${p.status === 'Destaque' || p.status === 'Ativo' ? 'badge-green' : 'badge-red'}">${p.status || 'Ativo'}</span></td>
        </tr>
    `).join('');

    // Status Bars
    renderizarStatusBars();
}

function renderizarStatusBars() {
    const barsEl = document.getElementById('statusBars');
    if (pedidos.length === 0) {
        barsEl.innerHTML = '<div class="placeholder">Sem pedidos ainda</div>';
        return;
    }

    const total = pedidos.length;
    const pendente = pedidos.filter(p => (p.status || '').toLowerCase() === 'pendente').length;
    const pago = pedidos.filter(p => (p.status || '').toLowerCase() === 'pago').length;
    const concluido = pedidos.filter(p => ['concluído', 'concluido'].includes((p.status || '').toLowerCase())).length;
    const cancelado = pedidos.filter(p => (p.status || '').toLowerCase() === 'cancelado').length;

    barsEl.innerHTML = `
        <div class="status-bar-row">
            <div class="status-bar-head">
                <strong>Concluídos</strong>
                <span>${concluido} pedido(s)</span>
            </div>
            <div class="status-bar-track">
                <div class="status-bar-fill green" style="width: ${(concluido / total) * 100}%"></div>
            </div>
        </div>
        <div class="status-bar-row">
            <div class="status-bar-head">
                <strong>Pagos</strong>
                <span>${pago} pedido(s)</span>
            </div>
            <div class="status-bar-track">
                <div class="status-bar-fill blue" style="width: ${(pago / total) * 100}%"></div>
            </div>
        </div>
        <div class="status-bar-row">
            <div class="status-bar-head">
                <strong>Pendentes</strong>
                <span>${pendente} pedido(s)</span>
            </div>
            <div class="status-bar-track">
                <div class="status-bar-fill amber" style="width: ${(pendente / total) * 100}%"></div>
            </div>
        </div>
        <div class="status-bar-row">
            <div class="status-bar-head">
                <strong>Cancelados</strong>
                <span>${cancelado} pedido(s)</span>
            </div>
            <div class="status-bar-track">
                <div class="status-bar-fill red" style="width: ${(cancelado / total) * 100}%"></div>
            </div>
        </div>
    `;
}

function renderizarProdutos(lista = produtos) {
    const tbody = document.getElementById('produtosTbody');
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum produto</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(p => `
        <tr>
            <td>
                <div class="produto-info">
                    <div class="produto-thumb">${p.foto ? `<img src="${p.foto}" alt="${p.nome}">` : (p.emoji || '📦')}</div>
                    <div class="produto-nome">${p.nome}</div>
                </div>
            </td>
            <td>${p.categoria || ''}</td>
            <td class="price">${formatarMoeda(p.promo || p.preco)}</td>
            <td>${p.estoque}</td>
            <td><span class="badge ${p.status === 'Destaque' || p.status === 'Ativo' ? 'badge-green' : 'badge-red'}">${p.status || 'Ativo'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="icon-btn" onclick="editarProduto(${p.id})" title="Editar">
                        <i class="ti ti-pencil"></i>
                    </button>
                    <button class="icon-btn danger" onclick="abrirModalDelete(${p.id}, '${p.nome}')" title="Excluir">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderizarEstoque() {
    const tbody = document.getElementById('estoqueTbody');
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum produto</td></tr>';
        return;
    }

    tbody.innerHTML = produtos.map(p => {
        let status = 'Ok';
        let badge = 'badge-green';
        if (p.estoque <= 3) {
            status = 'Crítico';
            badge = 'badge-red';
        } else if (p.estoque <= 10) {
            status = 'Baixo';
            badge = 'badge-amber';
        }

        return `
            <tr>
                <td>
                    <div class="produto-info">
                        <div class="produto-thumb">${p.emoji || '📦'}</div>
                        <div class="produto-nome">${p.nome}</div>
                    </div>
                </td>
                <td>${p.categoria || ''}</td>
                <td>${p.estoque}</td>
                <td><span class="badge ${badge}">${status}</span></td>
                <td>
                    <button class="icon-btn" onclick="editarProduto(${p.id})" title="Ajustar Estoque">
                        <i class="ti ti-pencil"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderizarPedidos(lista = pedidos) {
    const tbody = document.getElementById('pedidosTbody');
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum pedido</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(p => {
        const pedidoId = typeof p.id === 'string' && p.id.startsWith('#') ? p.id : `#${p.id}`;
        const data = p.data || p.date || '';
        const cliente = p.nome || p.cliente || 'Cliente';
        const status = p.status || 'Pendente';

        return `
            <tr>
                <td>${pedidoId}</td>
                <td>${data}</td>
                <td>${cliente}</td>
                <td class="price">${formatarMoeda(p.total || 0)}</td>
                <td>
                    <select class="status-select" onchange="alterarStatusPedido('${p.id}', this.value)">
                        <option value="Pendente" ${status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Pago" ${status === 'Pago' ? 'selected' : ''}>Pago</option>
                        <option value="Concluído" ${status === 'Concluído' || status === 'Concluido' ? 'selected' : ''}>Concluído</option>
                        <option value="Cancelado" ${status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td>
                    <button class="icon-btn" onclick="alert('Detalhes do pedido ${pedidoId}')" title="Ver Detalhes">
                        <i class="ti ti-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderizarClientes() {
    const tbody = document.getElementById('clientesTbody');
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum cliente</td></tr>';
        return;
    }

    tbody.innerHTML = usuarios.map(u => {
        const pedidosUsuario = pedidos.filter(p => p.email === u.email);
        const totalGasto = pedidosUsuario.reduce((sum, p) => sum + (p.total || 0), 0);

        return `
            <tr>
                <td>${u.nome || u.email}</td>
                <td>${u.email || ''}</td>
                <td>${u.telefone || ''}</td>
                <td>${pedidosUsuario.length}</td>
                <td class="price">${formatarMoeda(totalGasto)}</td>
            </tr>
        `;
    }).join('');
}

// ========================================
// PRODUTOS
// ========================================
function abrirFormProduto(id = null) {
    editandoProdutoId = id;
    const formTitle = document.getElementById('formProdutoTitle');
    const form = document.getElementById('formProduto');

    produtoFoto = null;

    if (id) {
        const produto = produtos.find(p => p.id === id);
        if (produto) {
            formTitle.textContent = 'Editar Produto';
            document.getElementById('fNome').value = produto.nome || '';
            document.getElementById('fCategoria').value = produto.categoria || '📱 Smartphones';
            document.getElementById('fMarca').value = produto.marca || '';
            document.getElementById('fPreco').value = produto.preco || '';
            document.getElementById('fPromo').value = produto.promo || '';
            document.getElementById('fEstoque').value = produto.estoque || '';
            document.getElementById('fDesc').value = produto.desc || '';
            document.getElementById('fStatus').value = produto.status || 'Ativo';
            document.getElementById('fEmoji').value = produto.emoji || '📦';

            if (produto.foto) {
                produtoFoto = produto.foto;
                mostrarFotoUpload(produto.foto);
            } else {
                resetarUpload();
            }
        }
    } else {
        formTitle.textContent = 'Adicionar Produto';
        form.reset();
        document.getElementById('fStatus').value = 'Ativo';
        document.getElementById('fEmoji').value = '📦';
        resetarUpload();
    }

    atualizarPreview();
    navegarPara('form-produto');
}

function resetarUpload() {
    produtoFoto = null;
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('uploadPreview').style.display = 'none';
}

function mostrarFotoUpload(base64) {
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'inline-block';
    document.getElementById('uploadedImage').src = base64;
}

function atualizarPreview() {
    // Pegar valores do formulário
    const nome = document.getElementById('fNome').value || 'Nome do Produto';
    const categoria = document.getElementById('fCategoria').value || 'Categoria';
    const marca = document.getElementById('fMarca').value;
    const preco = parseFloat(document.getElementById('fPreco').value) || 0;
    const promo = parseFloat(document.getElementById('fPromo').value) || 0;
    const estoque = parseInt(document.getElementById('fEstoque').value) || 0;
    const desc = document.getElementById('fDesc').value || 'Descrição do produto aparecerá aqui';
    const status = document.getElementById('fStatus').value;
    const emoji = document.getElementById('fEmoji').value || '📦';

    // Atualizar preview de imagem/emoji
    if (produtoFoto) {
        document.getElementById('previewEmoji').style.display = 'none';
        document.getElementById('previewImage').style.display = 'block';
        document.getElementById('previewImage').src = produtoFoto;
    } else {
        document.getElementById('previewImage').style.display = 'none';
        document.getElementById('previewEmoji').style.display = 'inline-block';
        document.getElementById('previewEmoji').textContent = emoji;
    }

    document.getElementById('previewCategoria').textContent = categoria;
    document.getElementById('previewNome').textContent = nome;
    
    if (marca) {
        document.getElementById('previewMarca').style.display = 'block';
        document.getElementById('previewMarca').textContent = marca;
    } else {
        document.getElementById('previewMarca').style.display = 'none';
    }

    // Preços
    if (promo > 0 && promo < preco) {
        document.getElementById('previewPromo').style.display = 'inline-block';
        document.getElementById('previewPromo').textContent = formatarMoeda(preco);
        document.getElementById('previewPreco').textContent = formatarMoeda(promo);
    } else {
        document.getElementById('previewPromo').style.display = 'none';
        document.getElementById('previewPreco').textContent = formatarMoeda(preco);
    }

    document.getElementById('previewDesc').textContent = desc;
    document.getElementById('previewEstoque').textContent = `${estoque} unidade${estoque !== 1 ? 's' : ''} em estoque`;

    // Badge Destaque
    if (status === 'Destaque') {
        document.getElementById('previewBadge').style.display = 'block';
    } else {
        document.getElementById('previewBadge').style.display = 'none';
    }
}

function editarProduto(id) {
    abrirFormProduto(id);
}

function salvarProduto(e) {
    e.preventDefault();

    const nome = document.getElementById('fNome').value.trim();
    const categoria = document.getElementById('fCategoria').value;
    const marca = document.getElementById('fMarca').value.trim();
    const preco = parseFloat(document.getElementById('fPreco').value);
    const promo = document.getElementById('fPromo').value ? parseFloat(document.getElementById('fPromo').value) : null;
    const estoque = parseInt(document.getElementById('fEstoque').value);
    const desc = document.getElementById('fDesc').value.trim();
    const status = document.getElementById('fStatus').value;
    const emoji = document.getElementById('fEmoji').value.trim();

    if (!nome || isNaN(preco) || isNaN(estoque)) {
        mostrarToast('Preencha os campos obrigatórios!', true);
        return;
    }

    if (editandoProdutoId) {
        const index = produtos.findIndex(p => p.id === editandoProdutoId);
        produtos[index] = { ...produtos[index], nome, categoria, marca, preco, promo, estoque, desc, status, emoji, foto: produtoFoto };
        mostrarToast('Produto atualizado com sucesso!');
    } else {
        const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
        produtos.push({ id: novoId, nome, categoria, marca, preco, promo, estoque, desc, status, emoji, foto: produtoFoto });
        mostrarToast('Produto criado com sucesso!');
    }

    salvarDados();
    renderizarTudo();
    navegarPara('produtos');
}

function filtrarProdutos(termo) {
    const filtrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(termo.toLowerCase()) ||
        (p.categoria || '').toLowerCase().includes(termo.toLowerCase())
    );
    renderizarProdutos(filtrados);
}

function abrirModalDelete(id, nome) {
    produtoParaExcluir = id;
    document.getElementById('deleteProdutoNome').textContent = nome;
    document.getElementById('deleteModal').classList.add('open');
}

function fecharModalDelete() {
    produtoParaExcluir = null;
    document.getElementById('deleteModal').classList.remove('open');
}

function confirmarExclusao() {
    if (produtoParaExcluir) {
        produtos = produtos.filter(p => p.id !== produtoParaExcluir);
        salvarDados();
        renderizarTudo();
        mostrarToast('Produto excluído com sucesso!');
    }
    fecharModalDelete();
}

// ========================================
// PEDIDOS
// ========================================
function filtrarPedidos(filtro) {
    if (filtro === 'todos') {
        renderizarPedidos();
    } else {
        const filtrados = pedidos.filter(p => (p.status || '').toLowerCase() === filtro.toLowerCase());
        renderizarPedidos(filtrados);
    }
}

function alterarStatusPedido(id, status) {
    // Encontrar por ID (suporta string e number)
    const index = pedidos.findIndex(p => String(p.id) === String(id));
    if (index !== -1) {
        pedidos[index].status = status;
        salvarDados();
        renderizarTudo();
        mostrarToast('Status atualizado!');
    }
}

// ========================================
// PERFIL
// ========================================
function abrirModalPerfil() {
    document.getElementById('profileModal').classList.add('open');
}

function fecharModalPerfil() {
    document.getElementById('profileModal').classList.remove('open');
}

function handleFotoPerfil(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            perfil.foto = event.target.result;
            atualizarPerfilUI();
        };
        reader.readAsDataURL(file);
    }
}

function removerFotoPerfil() {
    perfil.foto = null;
    atualizarPerfilUI();
}

function salvarPerfil(e) {
    e.preventDefault();
    perfil.nome = document.getElementById('pNome').value.trim() || 'Admin';
    perfil.avatar = (document.getElementById('pAvatar').value.trim() || 'AD').toUpperCase().substring(0, 3);
    perfil.cor = document.getElementById('pCor').value;
    localStorage.setItem('adminProfile', JSON.stringify(perfil));
    atualizarPerfilUI();
    fecharModalPerfil();
    mostrarToast('Perfil atualizado com sucesso!');
}

// ========================================
// UTILITÁRIOS
// ========================================
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

function getBadgeClass(status) {
    const s = (status || '').toLowerCase();
    if (s === 'pago' || s === 'concluído' || s === 'concluido') return 'badge-green';
    if (s === 'pendente' || s === 'em andamento') return 'badge-amber';
    if (s === 'cancelado') return 'badge-red';
    return 'badge-purple';
}

function mostrarToast(texto, erro = false) {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('i');
    const textEl = document.getElementById('toastText');

    textEl.textContent = texto;
    
    if (erro) {
        icon.className = 'ti ti-x';
        toast.style.backgroundColor = 'var(--red)';
    } else {
        icon.className = 'ti ti-check';
        toast.style.backgroundColor = 'var(--sidebar-bg)';
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========================================
// LOGOUT
// ========================================
function fazerLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('adminLogado');
        mostrarToast('Logout realizado com sucesso!');
        setTimeout(() => {
            window.location.href = 'login-admin.html';
        }, 800);
    }
}