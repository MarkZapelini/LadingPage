(function (global) {
  const STORAGE = {
    userToken: 'zcore_token',
    adminToken: 'zcore_admin_token',
    usuario: 'usuarioLogado',
    admin: 'adminLogado'
  };

  function getBaseUrl() {
    if (global.ZCORE_API_URL) return global.ZCORE_API_URL.replace(/\/$/, '');
    if (location.protocol === 'file:') return 'http://localhost:3000';
    return '';
  }

  async function request(path, options = {}) {
    const url = getBaseUrl() + path;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = options.admin ? localStorage.getItem(STORAGE.adminToken) : localStorage.getItem(STORAGE.userToken);
    if (token) headers.Authorization = 'Bearer ' + token;

    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
    return data;
  }

  async function health() {
    try {
      await request('/api/health');
      return true;
    } catch {
      return false;
    }
  }

  const api = {
    STORAGE,
    health,
    get online() { return api._online; },
    _online: false,

    async init() {
      api._online = await health();
      return api._online;
    },

    // Auth
    register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    loginGoogle: (body) => request('/api/auth/google', { method: 'POST', body: JSON.stringify(body) }),
    loginAdmin: (body) => request('/api/auth/admin/login', { method: 'POST', body: JSON.stringify(body) }),
    forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (body) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => request('/api/auth/me'),

    saveSession(data) {
      if (data.token) localStorage.setItem(STORAGE.userToken, data.token);
      if (data.usuario) localStorage.setItem(STORAGE.usuario, JSON.stringify(data.usuario));
    },
    saveAdminSession(data) {
      if (data.token) localStorage.setItem(STORAGE.adminToken, data.token);
      if (data.admin) localStorage.setItem(STORAGE.admin, JSON.stringify(data.admin));
    },
    logout() {
      localStorage.removeItem(STORAGE.userToken);
      localStorage.removeItem(STORAGE.usuario);
    },
    logoutAdmin() {
      localStorage.removeItem(STORAGE.adminToken);
      localStorage.removeItem(STORAGE.admin);
    },
    isLoggedIn() {
      return !!(localStorage.getItem(STORAGE.userToken) && localStorage.getItem(STORAGE.usuario));
    },
    isAdminLoggedIn() {
      return !!localStorage.getItem(STORAGE.adminToken);
    },

    // Products
    getProducts: (params) => {
      const q = new URLSearchParams(params || {}).toString();
      return request('/api/products' + (q ? '?' + q : ''));
    },
    createProduct: (p) => request('/api/products', { method: 'POST', body: JSON.stringify(p), admin: true }),
    updateProduct: (id, p) => request('/api/products/' + id, { method: 'PUT', body: JSON.stringify(p), admin: true }),
    deleteProduct: (id) => request('/api/products/' + id, { method: 'DELETE', admin: true }),

    // Orders
    createOrder: (itens) => request('/api/orders', { method: 'POST', body: JSON.stringify({ itens }), admin: false }),
    createGuestOrder: (body) => request('/api/orders/guest', { method: 'POST', body: JSON.stringify(body), admin: true }),
    getMyOrders: () => request('/api/orders/me'),
    getOrders: (status) => request('/api/orders' + (status ? '?status=' + status : ''), { admin: true }),
    getOrderStats: () => request('/api/orders/stats', { admin: true }),
    updateOrderStatus: (id, status) => request('/api/orders/' + encodeURIComponent(id) + '/status', { method: 'PATCH', body: JSON.stringify({ status }), admin: true }),

    // Cart & wishlist
    getCart: () => request('/api/cart'),
    saveCart: (items) => request('/api/cart', { method: 'PUT', body: JSON.stringify({ items }) }),
    clearCart: () => request('/api/cart', { method: 'DELETE' }),
    getWishlist: () => request('/api/wishlist'),
    saveWishlist: (items) => request('/api/wishlist', { method: 'PUT', body: JSON.stringify({ items }) }),

    // Profile
    updateProfile: (body) => request('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) })
  };

  global.ZCoreAPI = api;
})(window);
