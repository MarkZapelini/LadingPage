// Small helper to seed localStorage with test users for offline/dev usage
(function(){
  try {
    const existing = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const ensure = (u) => {
      if (!existing.find(x => x.email === u.email)) existing.push(u);
    };

    ensure({ id: 1001, nome: 'Teste Z-Core', email: 'teste@zcore.com.br', senha: '123456', pedidos: [] });
    ensure({ id: 1002, nome: 'Admin Local', email: 'admin@zcore.local', senha: 'admin123', role: 'admin', pedidos: [] });

    localStorage.setItem('usuarios', JSON.stringify(existing));

    // If no usuarioLogado, do not auto-login — just seed users so login works
    // But if there's a session with outdated shape, keep it.
  } catch (err) {
    console.error('seed-local-users error', err);
  }
})();
