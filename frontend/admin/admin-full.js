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
let adminApiOnline = false;
const storeConfigStorageKey = 'zcore-store-settings';
const storeConfigDefaults = {
    logo: null,
    name: 'Z-Core Eletrônicos',
    slogan: 'Premium tech. Zero ruído.',
    primaryColor: '#7C3AED',
    supportEmail: 'suporte@z-core.com.br',
    whatsapp: '+55 48 9999-0000',
    whatsappActive: true,
    cnpj: '00.000.000/0001-00',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    maintenance: false,
    reviewsActive: true,
    showStock: true,
    theme: 'dark',
    themeSwitch: true,
    metaTitle: 'Z-Core | Premium Tech',
    metaDesc: 'Eletrônicos premium com entrega rápida. Smartphones, notebooks e acessórios selecionados.',
    storeUrl: 'z-core.com.br',
    redirectWww: true,
    autoSitemap: true,
    freeShippingActive: true,
    freeShippingMin: '150',
    taxRegime: 'Simples Nacional',
    taxRate: '12%',
    emailOrder: 'pedidos@z-core.com.br',
    emailShipment: 'envios@z-core.com.br',
    emailMarket: 'marketing@z-core.com.br',
    gaToggle: false,
    fbPixelToggle: false,
    cookiesToggle: true
};

function podeUsarFallbackAdminLocal() {
    const host = window.location.hostname;
    return window.location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1';
}

// Produtos Padrão
const produtosPadrao = [
    { id: 1, nome: 'MacBook Air M3', desc: 'Notebook Apple com chip M3', categoria: '💻 Notebooks', marca: 'Apple', preco: 11499, promo: null, estoque: 15, status: 'Destaque', emoji: '💻', foto: 'assets/images/products/macbook-air-m3.jpg' },
    { id: 2, nome: 'Galaxy S24 Ultra', desc: 'Smartphone Samsung premium', categoria: '📱 Smartphones', marca: 'Samsung', preco: 6799, promo: 5999, estoque: 20, status: 'Ativo', emoji: '📱', foto: 'assets/images/products/galaxy-s24-ultra.jpg' },
    { id: 3, nome: 'Sony WH-1000XM5', desc: 'Fones de ouvido com cancelamento de ruído', categoria: '🎧 Headphones', marca: 'Sony', preco: 2499, promo: null, estoque: 8, status: 'Ativo', emoji: '🎧', foto: 'assets/images/products/sony-wh-1000xm5.jpg' },
    { id: 4, nome: 'PlayStation 5 Slim', desc: 'Console Sony de última geração', categoria: '🎮 Games', marca: 'Sony', preco: 3699, promo: null, estoque: 5, status: 'Destaque', emoji: '🎮', foto: 'assets/images/products/playstation-5-slim.jpg' },
    { id: 5, nome: 'Apple Watch Series 9', desc: 'Relógio inteligente Apple', categoria: '⌚ Smartwatches', marca: 'Apple', preco: 3299, promo: null, estoque: 12, status: 'Ativo', emoji: '⌚', foto: 'assets/images/products/apple-watch-series-9.jpg' },
    { id: 6, nome: 'LG OLED 55"', desc: 'Smart TV OLED 4K', categoria: '📺 TVs', marca: 'LG', preco: 4499, promo: 3999, estoque: 3, status: 'Ativo', emoji: '📺', foto: 'assets/images/products/lg-oled-55.jpg' }
].map((produto) => ({
    ...produto,
    fotos: produto.foto ? [produto.foto] : []
}));

const CATEGORIA_MAP = {
    '📱 Smartphones': { cat: 'smartphones', emoji: '📱' },
    '💻 Notebooks': { cat: 'notebooks', emoji: '💻' },
    '🎧 Headphones': { cat: 'audio', emoji: '🎧' },
    '📺 TVs': { cat: 'tvs', emoji: '📺' },
    '⌚ Smartwatches': { cat: 'wearables', emoji: '⌚' },
    '🎮 Games': { cat: 'games', emoji: '🎮' },
    '🔌 Acessórios': { cat: 'acessorios', emoji: '🔌' }
};

const CAT_TO_CATEGORIA = Object.fromEntries(
    Object.entries(CATEGORIA_MAP).map(([label, value]) => [value.cat, { label, emoji: value.emoji }])
);

function categoriaToApi(label) {
    return CATEGORIA_MAP[label]?.cat || 'acessorios';
}

function categoriaToUi(cat) {
    return CAT_TO_CATEGORIA[String(cat || '').toLowerCase()]?.label || '🔌 Acessórios';
}

function emojiCategoria(cat) {
    return CAT_TO_CATEGORIA[String(cat || '').toLowerCase()]?.emoji || '📦';
}

function resolverFotoProduto(caminho) {
    if (!caminho || /^(https?:|data:|blob:|file:|\/)/i.test(caminho)) return caminho;
    return `../${caminho.replace(/^\.?\//, '')}`;
}

function enriquecerProdutosComPadrao(lista) {
    return (lista || []).map((produto) => {
        const padrao = produtosPadrao.find((item) => String(item.id) === String(produto.id) || item.nome === produto.nome);
        if (!padrao) return produto;

        const foto = produto.foto || padrao.foto || null;
        const fotos = Array.isArray(produto.fotos) && produto.fotos.length ? produto.fotos : (foto ? [foto] : (padrao.fotos || []));

        return {
            ...padrao,
            ...produto,
            foto,
            fotos
        };
    });
}

function normalizarStatusPedido(status) {
    const raw = String(status || '').toLowerCase().trim();
    if (!raw) return 'pendente';
    if (raw === 'pago' || raw === 'em andamento' || raw === 'em_andamento' || raw === 'processando') return 'em_andamento';
    if (raw === 'concluído' || raw === 'concluido') return 'entregue';
    return raw;
}

function statusPedidoParaLabel(status) {
    switch (normalizarStatusPedido(status)) {
        case 'pendente': return 'Pendente';
        case 'em_andamento': return 'Em andamento';
        case 'enviado': return 'Enviado';
        case 'entregue': return 'Concluído';
        case 'cancelado': return 'Cancelado';
        default: return 'Pendente';
    }
}

function filtroPedidoParaStatus(filtro) {
    switch (String(filtro || '').toLowerCase()) {
        case 'pendente': return 'pendente';
        case 'pago':
        case 'em andamento':
        case 'em_andamento': return 'em_andamento';
        case 'concluído':
        case 'concluido': return 'entregue';
        case 'cancelado': return 'cancelado';
        default: return 'todos';
    }
}

function normalizarProdutoAdmin(produto) {
    const cat = produto.cat || categoriaToApi(produto.categoria || '');
    const categoria = produto.categoria || categoriaToUi(cat);
    const foto = produto.foto || (Array.isArray(produto.fotos) ? produto.fotos[0] : null) || null;

    return {
        id: produto.id,
        nome: produto.nome || '',
        desc: produto.desc || produto.descricao || '',
        categoria,
        cat,
        marca: produto.marca || '',
        preco: Number(produto.preco || 0),
        promo: produto.promo ? Number(produto.promo) : null,
        estoque: Number(produto.estoque || 0),
        status: produto.status || 'Ativo',
        emoji: produto.emoji || emojiCategoria(cat),
        foto,
        fotos: produto.fotos || (foto ? [foto] : [])
    };
}

function normalizarPedidoAdmin(pedido) {
    return {
        ...pedido,
        data: pedido.data || pedido.date || '',
        nome: pedido.nome || pedido.cliente || 'Cliente',
        email: pedido.email || pedido.clienteEmail || '',
        status: normalizarStatusPedido(pedido.status),
        total: Number(pedido.total || 0)
    };
}

function construirUsuarios(pedidosAtuais, usuariosBase) {
    const mapa = new Map();

    (usuariosBase || []).forEach(usuario => {
        const chave = String(usuario.email || '').toLowerCase();
        if (chave) mapa.set(chave, { ...usuario });
    });

    (pedidosAtuais || []).forEach(pedido => {
        const email = String(pedido.email || pedido.clienteEmail || '').toLowerCase();
        if (!email) return;
        const atual = mapa.get(email) || {};
        mapa.set(email, {
            nome: pedido.nome || pedido.cliente || atual.nome || email,
            email,
            telefone: atual.telefone || '',
            ...atual
        });
    });

    return Array.from(mapa.values());
}

function salvarCacheAdmin() {
    localStorage.setItem('adminProducts', JSON.stringify(produtos));
    localStorage.setItem('adminOrders', JSON.stringify(pedidos));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

async function sincronizarDadosBackend() {
    if (!adminApiOnline || typeof ZCoreAPI === 'undefined') return;

    const resultados = await Promise.allSettled([
        ZCoreAPI.getProducts(),
        ZCoreAPI.getOrders()
    ]);

    if (resultados[0].status === 'fulfilled') {
        produtos = resultados[0].value.map(normalizarProdutoAdmin);
    }

    if (resultados[1].status === 'fulfilled') {
        pedidos = resultados[1].value.map(normalizarPedidoAdmin);
    }

    usuarios = construirUsuarios(pedidos, usuarios);
    salvarCacheAdmin();
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const acessoLiberado = await verificarLogin();
    if (!acessoLiberado) return;
    await carregarDados();
    inicializarEventos();
    inicializarConfigLoja();
    renderizarTudo();
});

// Verificar Login
async function verificarLogin() {
    if (typeof ZCoreAPI !== 'undefined') {
        try {
            await ZCoreAPI.init();
            if (ZCoreAPI._online) {
                if (!ZCoreAPI.isAdminLoggedIn()) {
                    window.location.href = 'login-admin.html';
                    return false;
                }
                adminApiOnline = true;
                return true;
            }
        } catch (error) {
            console.warn('Falha ao validar sessão admin online:', error);
        }
    }

    if (!podeUsarFallbackAdminLocal() || !localStorage.getItem('adminLogado')) {
        window.location.href = 'login-admin.html';
        return false;
    }

    return true;
}

// Carregar Dados do LocalStorage
async function carregarDados() {
    const savedProds = localStorage.getItem('adminProducts');
    const savedOrders = localStorage.getItem('adminOrders');
    const savedUsers = localStorage.getItem('usuarios');
    const savedProfile = localStorage.getItem('adminProfile');
    const savedPayments = localStorage.getItem('zcore-payments');

    produtos = savedProds
        ? enriquecerProdutosComPadrao(JSON.parse(savedProds)).map(normalizarProdutoAdmin)
        : [...produtosPadrao].map(normalizarProdutoAdmin);
    pedidos = savedOrders ? JSON.parse(savedOrders).map(normalizarPedidoAdmin) : [];
    usuarios = savedUsers ? JSON.parse(savedUsers) : [];
    perfil = savedProfile ? JSON.parse(savedProfile) : perfil;
    
    if (savedPayments) {
        configurarInterfacePagamentos(JSON.parse(savedPayments));
    }

    if (adminApiOnline) {
        try {
            await sincronizarDadosBackend();
        } catch (error) {
            console.warn('Falha ao sincronizar admin com backend:', error);
            adminApiOnline = false;
        }
    }

    usuarios = construirUsuarios(pedidos, usuarios);

    document.documentElement.setAttribute('data-theme', 'dark');
}

// Salvar Dados
function salvarDados() {
    salvarCacheAdmin();
    salvarConfigPagamentos();
}

function salvarConfigPagamentos() {
    const config = {
        pix: {
            ativo: document.getElementById('toggle-pix').classList.contains('on'),
            chave: document.querySelector('#cfg-pix input').value,
            banco: document.querySelector('#cfg-pix select').value
        },
        credito: {
            ativo: document.getElementById('toggle-credito').classList.contains('on'),
            parcelamento: document.querySelector('#cfg-credito select:nth-of-type(1)').value,
            juros: document.querySelector('#cfg-credito select:nth-of-type(2)').value
        },
        boleto: {
            ativo: document.getElementById('toggle-boleto').classList.contains('on'),
            vencimento: document.querySelector('#cfg-boleto input').value,
            instrucoes: document.querySelector('#cfg-boleto input:nth-of-type(2)')?.value || ''
        },
        html: {
            ativo: document.getElementById('toggle-html').classList.contains('on'),
            codigo: document.querySelector('#cfg-html textarea').value
        }
    };
    localStorage.setItem('zcore-payments', JSON.stringify(config));
}

function obterStoreConfig() {
    const raw = localStorage.getItem(storeConfigStorageKey);
    return raw ? { ...storeConfigDefaults, ...JSON.parse(raw) } : { ...storeConfigDefaults };
}

function salvarStoreConfig(config) {
    localStorage.setItem(storeConfigStorageKey, JSON.stringify(config));
}

function atualizarMetaCounter() {
    const metaDesc = document.getElementById('metaDesc');
    const metaDescCounter = document.getElementById('metaDescCounter');
    if (!metaDesc || !metaDescCounter) return;
    const len = metaDesc.value.length;
    metaDescCounter.textContent = `${len}/160`;
    metaDescCounter.style.color = len > 150 ? 'var(--amber)' : '';
    if (len >= 160) metaDescCounter.style.color = 'var(--red)';
}

function updateFreeShippingRow() {
    const freeShippingToggle = document.getElementById('freeShippingToggle');
    const freeShippingValueRow = document.getElementById('freeShippingValueRow');
    if (!freeShippingToggle || !freeShippingValueRow) return;
    const active = freeShippingToggle.checked;
    freeShippingValueRow.style.opacity = active ? '1' : '0.5';
    freeShippingValueRow.querySelector('input').disabled = !active;
}

function carregarConfigLoja() {
    const config = obterStoreConfig();
    const logoPreview = document.getElementById('logoPreview');
    const logoRemove = document.getElementById('logoRemove');

    if (logoPreview) {
        if (config.logo) {
            logoPreview.innerHTML = `<img src="${config.logo}" alt="Logo da loja" />`;
            if (logoRemove) logoRemove.style.display = 'inline-flex';
        } else {
            logoPreview.innerHTML = 'Z';
            if (logoRemove) logoRemove.style.display = 'none';
        }
    }

    document.getElementById('storeName').value = config.name;
    document.getElementById('storeSlogan').value = config.slogan;
    document.getElementById('colorHex').value = config.primaryColor;
    document.getElementById('colorPicker').value = config.primaryColor.toLowerCase();
    document.getElementById('colorSwatch').style.background = config.primaryColor;
    document.getElementById('supportEmail').value = config.supportEmail;
    document.getElementById('whatsapp').value = config.whatsapp;
    document.getElementById('whatsappActive').checked = config.whatsappActive;
    document.getElementById('cnpj').value = config.cnpj;
    document.getElementById('currency').value = config.currency;
    document.getElementById('timezone').value = config.timezone;
    document.getElementById('maintenanceToggle').checked = config.maintenance;
    document.getElementById('reviewsActive').checked = config.reviewsActive;
    document.getElementById('showStock').checked = config.showStock;
    document.querySelectorAll('.theme-option').forEach(option => {
        const input = option.querySelector('input');
        if (input && input.value === config.theme) {
            option.classList.add('active');
            input.checked = true;
        } else if (input) {
            option.classList.remove('active');
            input.checked = false;
        }
    });
    document.getElementById('themeSwitch').checked = config.themeSwitch;
    document.getElementById('metaTitle').value = config.metaTitle;
    document.getElementById('metaDesc').value = config.metaDesc;
    document.getElementById('storeUrl').value = config.storeUrl;
    document.getElementById('redirectWww').checked = config.redirectWww;
    document.getElementById('autoSitemap').checked = config.autoSitemap;
    document.getElementById('freeShippingToggle').checked = config.freeShippingActive;
    document.getElementById('freeShippingMin').value = config.freeShippingMin;
    document.getElementById('taxRegime').value = config.taxRegime;
    document.getElementById('taxRate').value = config.taxRate;
    document.getElementById('emailOrder').value = config.emailOrder;
    document.getElementById('emailShipment').value = config.emailShipment;
    document.getElementById('emailMarket').value = config.emailMarket;
    document.getElementById('gaToggle').checked = config.gaToggle;
    document.getElementById('fbPixelToggle').checked = config.fbPixelToggle;
    document.getElementById('cookiesToggle').checked = config.cookiesToggle;
    atualizarMetaCounter();
    updateFreeShippingRow();
}

function inicializarConfigLoja() {
    const navItems = document.querySelectorAll('#page-config-loja .settings-nav__item');
    const sections = document.querySelectorAll('#page-config-loja .settings-section');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            sections.forEach(section => section.classList.remove('active'));
            const target = document.getElementById(`section-${this.dataset.section}`);
            if (target) target.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    const saveBtn = document.getElementById('saveBtn');
    const discardBtn = document.getElementById('discardBtn');
    const saveHint = document.getElementById('saveHint');

    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            const config = {
                logo: document.getElementById('logoPreview').querySelector('img')?.src || null,
                name: document.getElementById('storeName').value.trim(),
                slogan: document.getElementById('storeSlogan').value.trim(),
                primaryColor: document.getElementById('colorHex').value.trim() || '#7C3AED',
                supportEmail: document.getElementById('supportEmail').value.trim(),
                whatsapp: document.getElementById('whatsapp').value.trim(),
                whatsappActive: document.getElementById('whatsappActive').checked,
                cnpj: document.getElementById('cnpj').value.trim(),
                currency: document.getElementById('currency').value,
                timezone: document.getElementById('timezone').value,
                maintenance: document.getElementById('maintenanceToggle').checked,
                reviewsActive: document.getElementById('reviewsActive').checked,
                showStock: document.getElementById('showStock').checked,
                theme: document.querySelector('#page-config-loja .theme-option.active input')?.value || 'dark',
                themeSwitch: document.getElementById('themeSwitch').checked,
                metaTitle: document.getElementById('metaTitle').value.trim(),
                metaDesc: document.getElementById('metaDesc').value.trim(),
                storeUrl: document.getElementById('storeUrl').value.trim(),
                redirectWww: document.getElementById('redirectWww').checked,
                autoSitemap: document.getElementById('autoSitemap').checked,
                freeShippingActive: document.getElementById('freeShippingToggle').checked,
                freeShippingMin: document.getElementById('freeShippingMin').value.trim(),
                taxRegime: document.getElementById('taxRegime').value,
                taxRate: document.getElementById('taxRate').value.trim(),
                emailOrder: document.getElementById('emailOrder').value.trim(),
                emailShipment: document.getElementById('emailShipment').value.trim(),
                emailMarket: document.getElementById('emailMarket').value.trim(),
                gaToggle: document.getElementById('gaToggle').checked,
                fbPixelToggle: document.getElementById('fbPixelToggle').checked,
                cookiesToggle: document.getElementById('cookiesToggle').checked
            };
            salvarStoreConfig(config);
            saveBtn.textContent = 'Salvando...';
            saveBtn.disabled = true;

            setTimeout(function () {
                saveBtn.textContent = 'Salvar alterações';
                saveBtn.disabled = false;
                if (saveHint) {
                    saveHint.textContent = 'Salvo agora mesmo';
                    saveHint.classList.add('saved');
                    setTimeout(function () {
                        saveHint.textContent = '';
                        saveHint.classList.remove('saved');
                    }, 4000);
                }
                mostrarToast('Configurações salvas com sucesso');
            }, 600);
        });
    }

    if (discardBtn) {
        discardBtn.addEventListener('click', function () {
            carregarConfigLoja();
            mostrarToast('Alterações descartadas', true);
        });
    }

    const logoInput = document.getElementById('logoInput');
    const logoPreview = document.getElementById('logoPreview');
    const logoRemove = document.getElementById('logoRemove');

    if (logoInput && logoPreview) {
        logoInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                mostrarToast('Selecione um arquivo de imagem válido', true);
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo da loja" />`;
                if (logoRemove) logoRemove.style.display = 'inline-flex';
            };
            reader.readAsDataURL(file);
        });
    }

    if (logoRemove && logoPreview) {
        logoRemove.addEventListener('click', function () {
            logoPreview.innerHTML = 'Z';
            logoRemove.style.display = 'none';
            if (logoInput) logoInput.value = '';
        });
    }

    const colorSwatch = document.getElementById('colorSwatch');
    const colorHex = document.getElementById('colorHex');
    const colorPicker = document.getElementById('colorPicker');

    if (colorSwatch && colorHex && colorPicker) {
        colorSwatch.addEventListener('click', function () {
            colorPicker.click();
        });
        colorPicker.addEventListener('input', function () {
            const hex = this.value.toUpperCase();
            colorSwatch.style.background = hex;
            colorHex.value = hex;
        });
        colorHex.addEventListener('input', function () {
            let val = this.value.trim();
            if (!val.startsWith('#')) val = `#${val}`;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                colorSwatch.style.background = val;
                colorPicker.value = val.toLowerCase();
            }
        });
        colorHex.addEventListener('blur', function () {
            let val = this.value.trim().toUpperCase();
            if (!val.startsWith('#')) val = `#${val}`;
            if (!/^#[0-9A-Fa-f]{6}$/.test(val)) {
                this.value = colorPicker.value.toUpperCase();
                mostrarToast('Cor inválida. Use o formato #RRGGBB', true);
            } else {
                this.value = val;
                colorSwatch.style.background = val;
                colorPicker.value = val.toLowerCase();
            }
        });
    }

    const metaDesc = document.getElementById('metaDesc');
    if (metaDesc) {
        metaDesc.addEventListener('input', atualizarMetaCounter);
    }

    const freeShippingToggle = document.getElementById('freeShippingToggle');
    if (freeShippingToggle) {
        freeShippingToggle.addEventListener('change', updateFreeShippingRow);
    }

    const maintenanceToggle = document.getElementById('maintenanceToggle');
    if (maintenanceToggle) {
        maintenanceToggle.addEventListener('change', function () {
            if (this.checked) {
                mostrarToast('Modo manutenção ativado — loja oculta para visitantes', true);
            } else {
                mostrarToast('Modo manutenção desativado — loja visível novamente');
            }
        });
    }

    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function () {
            let v = this.value.replace(/\D/g, '').substring(0, 14);
            if (v.length > 12) {
                v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
            } else if (v.length > 8) {
                v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4');
            } else if (v.length > 5) {
                v = v.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3');
            } else if (v.length > 2) {
                v = v.replace(/^(\d{2})(\d+)$/, '$1.$2');
            }
            this.value = v;
        });
    }

    const themeOptions = document.querySelectorAll('#page-config-loja .theme-option');
    themeOptions.forEach(function (option) {
        option.addEventListener('click', function () {
            themeOptions.forEach(function (o) { o.classList.remove('active'); });
            this.classList.add('active');
            const input = this.querySelector('input');
            if (input) input.checked = true;
        });
    });

    const resetStoreSettings = document.getElementById('resetStoreSettings');
    if (resetStoreSettings) {
        resetStoreSettings.addEventListener('click', function () {
            if (confirm('Resetar configurações da loja para os padrões?')) {
                salvarStoreConfig({ ...storeConfigDefaults });
                carregarConfigLoja();
                mostrarToast('Configurações resetadas', true);
            }
        });
    }

    const disableStoreBtn = document.getElementById('disableStoreBtn');
    if (disableStoreBtn) {
        disableStoreBtn.addEventListener('click', function () {
            if (confirm('Desativar a loja permanentemente?')) {
                document.getElementById('maintenanceToggle').checked = true;
                updateFreeShippingRow();
                mostrarToast('Desativando a loja...', true);
            }
        });
    }

    carregarConfigLoja();
}

function configurarInterfacePagamentos(config) {
    if (!config) return;
    
    // Pix
    const pixToggle = document.getElementById('toggle-pix');
    const pixBadge = document.getElementById('badge-pix');
    if (config.pix) {
        if (config.pix.ativo) {
            pixToggle.classList.add('on');
            pixBadge.classList.add('active');
            pixBadge.textContent = 'Ativo';
        } else {
            pixToggle.classList.remove('on');
            pixBadge.classList.remove('active');
            pixBadge.textContent = 'Inativo';
        }
        document.querySelector('#cfg-pix input').value = config.pix.chave || '';
        document.querySelector('#cfg-pix select').value = config.pix.banco || 'Mercado Pago';
    }

    // Crédito
    const credToggle = document.getElementById('toggle-credito');
    const credBadge = document.getElementById('badge-credito');
    if (config.credito) {
        if (config.credito.ativo) {
            credToggle.classList.add('on');
            credBadge.classList.add('active');
            credBadge.textContent = 'Ativo';
        } else {
            credToggle.classList.remove('on');
            credBadge.classList.remove('active');
            credBadge.textContent = 'Inativo';
        }
        document.querySelector('#cfg-credito select:nth-of-type(1)').value = config.credito.parcelamento || '12x';
        document.querySelector('#cfg-credito select:nth-of-type(2)').value = config.credito.juros || 'Sem juros';
    }

    // Boleto
    const bolToggle = document.getElementById('toggle-boleto');
    const bolBadge = document.getElementById('badge-boleto');
    if (config.boleto) {
        if (config.boleto.ativo) {
            bolToggle.classList.add('on');
            bolBadge.classList.add('active');
            bolBadge.textContent = 'Ativo';
        } else {
            bolToggle.classList.remove('on');
            bolBadge.classList.remove('active');
            bolBadge.textContent = 'Inativo';
        }
        document.querySelector('#cfg-boleto input').value = config.boleto.vencimento || '3';
    }

    // HTML
    const htmlToggle = document.getElementById('toggle-html');
    const htmlBadge = document.getElementById('badge-html');
    if (config.html) {
        if (config.html.ativo) {
            htmlToggle.classList.add('on');
            htmlBadge.classList.add('active');
            htmlBadge.textContent = 'Ativo';
        } else {
            htmlToggle.classList.remove('on');
            htmlBadge.classList.remove('active');
            htmlBadge.textContent = 'Inativo';
        }
        document.querySelector('#cfg-html textarea').value = config.html.codigo || '';
    }

    atualizarContagemAtivos();
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
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTema);
    }

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

    // Search
    const searchInput = document.getElementById('searchProduto');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filtrarProdutos(e.target.value));
    }

    // Filter Chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filtrarPedidos(chip.getAttribute('data-filter'));
        });
    });

    // Perfil
    const adminProfile = document.getElementById('adminProfile');
    if (adminProfile) adminProfile.addEventListener('click', abrirModalPerfil);
    
    const closeProfileModal = document.getElementById('closeProfileModal');
    if (closeProfileModal) closeProfileModal.addEventListener('click', fecharModalPerfil);
    
    const btnCancelarPerfil = document.getElementById('btnCancelarPerfil');
    if (btnCancelarPerfil) btnCancelarPerfil.addEventListener('click', fecharModalPerfil);
    
    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) formPerfil.addEventListener('submit', salvarPerfil);
    
    const btnSelecionarFoto = document.getElementById('btnSelecionarFoto');
    if (btnSelecionarFoto) btnSelecionarFoto.addEventListener('click', () => document.getElementById('fotoInput').click());
    
    const fotoInput = document.getElementById('fotoInput');
    if (fotoInput) fotoInput.addEventListener('change', handleFotoPerfil);
    
    const btnRemoverFoto = document.getElementById('btnRemoverFoto');
    if (btnRemoverFoto) btnRemoverFoto.addEventListener('click', removerFotoPerfil);

    // Delete Modal
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    if (closeDeleteModal) closeDeleteModal.addEventListener('click', fecharModalDelete);
    
    const btnCancelarDelete = document.getElementById('btnCancelarDelete');
    if (btnCancelarDelete) btnCancelarDelete.addEventListener('click', fecharModalDelete);
    
    const btnConfirmarDelete = document.getElementById('btnConfirmarDelete');
    if (btnConfirmarDelete) btnConfirmarDelete.addEventListener('click', confirmarExclusao);

    // Close Modal on Overlay Click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
            }
        });
    });
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
    localStorage.setItem('zcore_theme', next);
    localStorage.removeItem('zcore-theme');
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
    const receita = pedidos
        .filter(p => normalizarStatusPedido(p.status) !== 'cancelado')
        .reduce((sum, p) => sum + (p.total || 0), 0);

    document.getElementById('statTotalProdutos').textContent = produtos.length;
    document.getElementById('statPedidos').textContent = pedidos.length;
    document.getElementById('statClientes').textContent = usuarios.length;
    
    // Atualizar badges na sidebar
    const productsBadge = document.querySelector('.nav-item[data-page="produtos"] .badge-count');
    if (productsBadge) productsBadge.textContent = produtos.length;
    
    const ordersBadge = document.querySelector('.nav-item[data-page="pedidos"] .badge-count');
    if (ordersBadge) ordersBadge.textContent = pedidos.length;

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
            const status = statusPedidoParaLabel(p.status);
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
                    <div class="produto-thumb">${p.foto ? `<img src="${resolverFotoProduto(p.foto)}" alt="${p.nome}">` : (p.emoji || '📦')}</div>
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
    const pendente = pedidos.filter(p => normalizarStatusPedido(p.status) === 'pendente').length;
    const andamento = pedidos.filter(p => ['em_andamento', 'enviado'].includes(normalizarStatusPedido(p.status))).length;
    const concluido = pedidos.filter(p => normalizarStatusPedido(p.status) === 'entregue').length;
    const cancelado = pedidos.filter(p => normalizarStatusPedido(p.status) === 'cancelado').length;

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
                <strong>Em andamento</strong>
                <span>${andamento} pedido(s)</span>
            </div>
            <div class="status-bar-track">
                <div class="status-bar-fill blue" style="width: ${(andamento / total) * 100}%"></div>
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
                    <div class="produto-thumb">${p.foto ? `<img src="${resolverFotoProduto(p.foto)}" alt="${p.nome}">` : (p.emoji || '📦')}</div>
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
        const status = statusPedidoParaLabel(p.status);
        const statusValue = normalizarStatusPedido(p.status);

        return `
            <tr>
                <td>${pedidoId}</td>
                <td>${data}</td>
                <td>${cliente}</td>
                <td class="price">${formatarMoeda(p.total || 0)}</td>
                <td>
                    <select class="status-select" onchange="alterarStatusPedido('${p.id}', this.value)">
                        <option value="pendente" ${statusValue === 'pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="em_andamento" ${statusValue === 'em_andamento' ? 'selected' : ''}>Em andamento</option>
                        <option value="enviado" ${statusValue === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="entregue" ${statusValue === 'entregue' ? 'selected' : ''}>Concluído</option>
                        <option value="cancelado" ${statusValue === 'cancelado' ? 'selected' : ''}>Cancelado</option>
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
        const pedidosUsuario = pedidos.filter(p => (p.email || p.clienteEmail || '') === u.email);
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
            document.getElementById('fCategoria').value = produto.categoria || categoriaToUi(produto.cat) || '📱 Smartphones';
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
    document.getElementById('uploadedImage').src = resolverFotoProduto(base64);
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
        document.getElementById('previewImage').src = resolverFotoProduto(produtoFoto);
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

async function salvarProduto(e) {
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

    const payload = {
        nome,
        cat: categoriaToApi(categoria),
        marca,
        preco,
        promo: promo || 0,
        estoque,
        desc,
        status,
        emoji: emoji || emojiCategoria(categoriaToApi(categoria)),
        fotos: produtoFoto ? [produtoFoto] : []
    };

    if (adminApiOnline && typeof ZCoreAPI !== 'undefined') {
        try {
            const salvo = editandoProdutoId
                ? await ZCoreAPI.updateProduct(editandoProdutoId, payload)
                : await ZCoreAPI.createProduct(payload);
            const produtoNormalizado = normalizarProdutoAdmin(salvo);

            if (editandoProdutoId) {
                const index = produtos.findIndex(p => p.id === editandoProdutoId);
                if (index !== -1) produtos[index] = produtoNormalizado;
            } else {
                produtos.push(produtoNormalizado);
            }
            mostrarToast(editandoProdutoId ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
        } catch (error) {
            mostrarToast(error.message || 'Falha ao salvar produto no backend.', true);
            return;
        }
    } else if (editandoProdutoId) {
        const index = produtos.findIndex(p => p.id === editandoProdutoId);
        produtos[index] = { ...produtos[index], nome, categoria, cat: payload.cat, marca, preco, promo, estoque, desc, status, emoji, foto: produtoFoto };
        mostrarToast('Produto atualizado com sucesso!');
    } else {
        const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => Number(p.id) || 0)) + 1 : 1;
        produtos.push({ id: novoId, nome, categoria, cat: payload.cat, marca, preco, promo, estoque, desc, status, emoji, foto: produtoFoto });
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

async function confirmarExclusao() {
    if (produtoParaExcluir) {
        if (adminApiOnline && typeof ZCoreAPI !== 'undefined') {
            try {
                await ZCoreAPI.deleteProduct(produtoParaExcluir);
            } catch (error) {
                mostrarToast(error.message || 'Falha ao excluir produto no backend.', true);
                fecharModalDelete();
                return;
            }
        }
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
    const filtroNormalizado = filtroPedidoParaStatus(filtro);
    if (filtroNormalizado === 'todos') {
        renderizarPedidos();
    } else {
        const filtrados = pedidos.filter(p => normalizarStatusPedido(p.status) === filtroNormalizado);
        renderizarPedidos(filtrados);
    }
}

async function alterarStatusPedido(id, status) {
    // Encontrar por ID (suporta string e number)
    const index = pedidos.findIndex(p => String(p.id) === String(id));
    if (index !== -1) {
        if (adminApiOnline && typeof ZCoreAPI !== 'undefined') {
            try {
                const atualizado = await ZCoreAPI.updateOrderStatus(id, status);
                pedidos[index] = normalizarPedidoAdmin(atualizado);
            } catch (error) {
                mostrarToast(error.message || 'Falha ao atualizar status do pedido.', true);
                renderizarPedidos();
                return;
            }
        } else {
            pedidos[index].status = normalizarStatusPedido(status);
        }

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
// PAGAMENTOS
// ========================================
function showPaymentTab(tab) {
    document.querySelectorAll('.pay-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tab)) btn.classList.add('active');
    });
    document.querySelectorAll('.pay-view').forEach(view => {
        view.classList.remove('active');
    });
    const target = document.getElementById(`pay-view-${tab}`);
    if (target) target.classList.add('active');
}

function togglePaymentMethod(method) {
    const toggle = document.getElementById(`toggle-${method}`);
    const badge = document.getElementById(`badge-${method}`);
    
    if (toggle.classList.contains('on')) {
        toggle.classList.remove('on');
        badge.classList.remove('active');
        badge.textContent = 'Inativo';
    } else {
        toggle.classList.add('on');
        badge.classList.add('active');
        badge.textContent = 'Ativo';
    }
    atualizarContagemAtivos();
    salvarConfigPagamentos();
}

function togglePaymentCfg(id) {
    const panel = document.getElementById(id);
    panel.classList.toggle('open');
}

function atualizarContagemAtivos() {
    const ativos = document.querySelectorAll('.pay-badge.active').length;
    document.getElementById('count-ativos').textContent = ativos;
}

// ========================================
// UTILITÁRIOS
// ========================================
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

function getBadgeClass(status) {
    const s = normalizarStatusPedido(status);
    if (s === 'entregue') return 'badge-green';
    if (s === 'pendente' || s === 'em_andamento' || s === 'enviado') return 'badge-amber';
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
        if (typeof ZCoreAPI !== 'undefined') {
            ZCoreAPI.logoutAdmin();
        }
        localStorage.removeItem('adminLogado');
        mostrarToast('Logout realizado com sucesso!');
        setTimeout(() => {
            window.location.href = 'login-admin.html';
        }, 800);
    }
}
