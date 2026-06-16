import { useState, useEffect, useRef } from "react";

const categories = [
  { label: "Smartphones", count: 48, icon: "📱" },
  { label: "Notebooks", count: 32, icon: "💻" },
  { label: "Áudio", count: 56, icon: "🎧" },
  { label: "TVs", count: 24, icon: "📺" },
  { label: "Wearables", count: 19, icon: "⌚" },
  { label: "Games", count: 37, icon: "🎮" },
];

const words = ["transforma", "redefine", "eleva", "conecta"];

export default function HeroSection({ scrollToStore }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className="hero-root" ref={heroRef}>
      {/* HERO MAIN */}
      <section className="hero-main">
        <div
          className="orb orb-1"
          style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
        />
        <div
          className="orb orb-2"
          style={{ transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)` }}
        />

        {/* LEFT CONTENT */}
        <div className="hero-left">
          <div className="hero-badge">
            <div className="badge-dot">✦</div>
            <span>Nova coleção 2025</span>
          </div>

          <h1 className="hero-title">
            Tecnologia que<br />
            <span className="hero-title-line2">
              <span className={`word-rotate ${visible ? "show" : "hidden"}`}>
                {words[wordIndex]}
              </span>
              seu dia.
            </span>
          </h1>

          <p className="hero-sub">
            Os melhores eletrônicos com entrega rápida, garantia
            estendida e os preços mais competitivos do Brasil.
          </p>

          <div className="hero-actions">
            <button className="btn-primary-hero" onClick={scrollToStore}>
              Ver produtos
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-secondary-hero" onClick={scrollToStore}>
              ◆ Ofertas do dia
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <div className="stat-num">+4.800</div>
              <div className="stat-label">Clientes satisfeitos</div>
            </div>
            <div>
              <div className="stat-num">216</div>
              <div className="stat-label">Produtos disponíveis</div>
            </div>
            <div>
              <div className="stat-num">4.9★</div>
              <div className="stat-label">Avaliação média</div>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="hero-right">
          <div className="float-card float-card-1">
            <div className="float-label">Entrega estimada</div>
            <div className="float-val">Amanhã, 9h–12h</div>
            <span className="float-pill">Frete grátis ✓</span>
          </div>
          <div className="float-card float-card-2">
            <div className="float-label">Desconto ativo</div>
            <div className="float-val">−18% notebooks</div>
            <span className="float-pill">Válido hoje</span>
          </div>

          <div
            className="card-3d"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 0.03}deg) rotateX(${-mousePos.y * 0.03}deg)`,
            }}
          >
            <div className="card-orb-top" />
            <div className="card-label">Destaque da semana</div>

            <div className="product-display">
              <div className="product-icon-wrap">
                <div className="product-glow" />
                <svg
                  className="product-svg"
                  width="160"
                  height="120"
                  viewBox="0 0 160 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="10" y="10" width="140" height="88" rx="8" stroke="#9B6DFF" strokeWidth="3" fill="rgba(155,109,255,0.07)" />
                  <rect x="22" y="22" width="116" height="64" rx="4" fill="rgba(155,109,255,0.12)" stroke="rgba(155,109,255,0.3)" strokeWidth="1" />
                  <line x1="0" y1="104" x2="160" y2="104" stroke="#9B6DFF" strokeWidth="3" strokeLinecap="round" />
                  <rect x="60" y="104" width="40" height="6" rx="3" fill="rgba(155,109,255,0.4)" />
                  <circle cx="80" cy="54" r="18" fill="rgba(155,109,255,0.15)" stroke="rgba(155,109,255,0.5)" strokeWidth="1.5" />
                  <circle cx="80" cy="54" r="8" fill="#9B6DFF" />
                </svg>
              </div>
            </div>

            <div className="card-bottom">
              <div className="card-stat-badge">
                <div className="badge-icon">⭐</div>
                <div>
                  <div className="badge-num">+4.800</div>
                  <div className="badge-sub">clientes satisfeitos</div>
                </div>
              </div>
              <div className="card-tag">
                <span className="tag-pill">Em estoque</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* CATEGORIES */}
      <section className="categories-section">
        <div className="cat-header">
          <span className="cat-title">Categorias</span>
          <button onClick={scrollToStore} className="cat-link-btn" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
            Ver todas →
          </button>
        </div>
        <div className="cat-grid">
          {categories.map((c) => (
            <div className="cat-card" key={c.label}>
              <span className="cat-icon">{c.icon}</span>
              <div className="cat-name">{c.label}</div>
              <div className="cat-count">{c.count} produtos</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
