import { useState, useEffect, useRef } from "react";

const categories = [
  { label: "Smartphones", count: 48, emoji: "📱", color: "#7B3EFF" },
  { label: "Notebooks", count: 32, emoji: "💻", color: "#00C9A7" },
  { label: "Áudio", count: 56, emoji: "🎧", color: "#FF6B6B" },
  { label: "TVs", count: 24, emoji: "📺", color: "#FFB347" },
  { label: "Wearables", count: 19, emoji: "⌚", color: "#4ECDC4" },
  { label: "Games", count: 37, emoji: "🎮", color: "#A855F7" },
];

const products = [
  {
    id: 1,
    brand: "Apple",
    name: "MacBook Air M3",
    stars: 4,
    reviews: 334,
    desc: "Chip M3, 8GB RAM, SSD 256GB, tela 13\"",
    price: "R$ 10.499",
    old: "R$ 12.299",
    tag: null,
    emoji: "💻",
    accent: "#00C9A7",
    featured: false,
  },
  {
    id: 2,
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    stars: 5,
    reviews: 512,
    desc: "256GB, 12GB RAM, câmera 200MP, 5G",
    price: "R$ 6.799",
    old: "R$ 8.499",
    tag: "MAIS VENDIDO",
    emoji: "📱",
    accent: "#7B3EFF",
    featured: true,
  },
  {
    id: 3,
    brand: "Sony",
    name: "WH-1000XM5",
    stars: 5,
    reviews: 389,
    desc: "Fone over-ear, cancelamento de ruído, 30h",
    price: "R$ 1.799",
    old: "R$ 2.199",
    tag: null,
    emoji: "🎧",
    accent: "#FF6B6B",
    featured: false,
  },
  {
    id: 4,
    brand: "Apple",
    name: "Watch Series 9",
    stars: 4,
    reviews: 198,
    desc: "GPS, 45mm, monitoramento de saúde 24h",
    price: "R$ 3.299",
    old: null,
    tag: "NOVO",
    emoji: "⌚",
    accent: "#FFB347",
    featured: false,
  },
  {
    id: 5,
    brand: "LG",
    name: "OLED 55\"",
    stars: 5,
    reviews: 145,
    desc: "4K, 120Hz, Dolby Vision, webOS 23",
    price: "R$ 5.099",
    old: "R$ 6.800",
    tag: null,
    emoji: "📺",
    accent: "#4ECDC4",
    featured: false,
  },
  {
    id: 6,
    brand: "Sony",
    name: "PlayStation 5 Slim",
    stars: 5,
    reviews: 421,
    desc: "1TB SSD, controle DualSense, 4K 120fps",
    price: "R$ 3.999",
    old: "R$ 4.699",
    tag: "OFERTA",
    emoji: "🎮",
    accent: "#A855F7",
    featured: false,
  },
];

function useIntersection(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function ProductCard({ p, index }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef(null);
  const sectionRef = useRef(null);
  const visible = useIntersection(sectionRef);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    });
  };

  const tiltX = hovered ? (mousePos.y - 0.5) * -12 : 0;
  const tiltY = hovered ? (mousePos.x - 0.5) * 12 : 0;

  return (
    <div
      ref={sectionRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ${index * 0.1}s, transform 0.6s ${index * 0.1}s cubic-bezier(0.23,1,0.32,1)`,
      }}
    >
      <div
        ref={cardRef}
        className={`pcard ${p.featured ? "pcard--featured" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setMousePos({ x: 0.5, y: 0.5 }); }}
        onMouseMove={handleMouseMove}
        style={{
          "--accent": p.accent,
          transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) ${hovered ? "scale(1.02)" : "scale(1)"}`,
          transition: hovered ? "transform 0.1s" : "transform 0.5s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {/* Glow spotlight that follows cursor */}
        {hovered && (
          <div
            className="pcard__spotlight"
            style={{
              background: `radial-gradient(200px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${p.accent}22, transparent 70%)`,
            }}
          />
        )}

        {p.tag && <div className="pcard__tag">{p.tag}</div>}

        <button
          className={`pcard__like ${liked ? "pcard__like--active" : ""}`}
          onClick={() => setLiked(!liked)}
          aria-label="Favoritar"
        >
          {liked ? "♥" : "♡"}
        </button>

        <div className="pcard__img-area">
          <div className="pcard__emoji-bg" style={{ background: `${p.accent}18` }} />
          <div className="pcard__emoji" style={{ filter: `drop-shadow(0 0 24px ${p.accent}88)` }}>
            {p.emoji}
          </div>
        </div>

        <div className="pcard__info">
          <span className="pcard__brand">{p.brand}</span>
          <h3 className="pcard__name">{p.name}</h3>
          <div className="pcard__stars">
            {"★".repeat(p.stars)}{"☆".repeat(5 - p.stars)}
            <span className="pcard__reviews">({p.reviews})</span>
          </div>
          <p className="pcard__desc">{p.desc}</p>
        </div>

        <div className="pcard__footer">
          <div>
            {p.old && <div className="pcard__old">{p.old}</div>}
            <div className="pcard__price">{p.price}</div>
          </div>
          <button className="pcard__add" style={{ "--accent": p.accent }}>
            <span>+</span>
          </button>
        </div>

        {/* Bottom accent line */}
        <div className="pcard__line" style={{ background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)` }} />
      </div>
    </div>
  );
}

function CatCard({ c, index }) {
  const ref = useRef(null);
  const visible = useIntersection(ref);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      className={`ccat ${hovered ? "ccat--hov" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        "--acc": c.color,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.5s ${index * 0.07}s, transform 0.5s ${index * 0.07}s cubic-bezier(0.23,1,0.32,1)`,
      }}
    >
      <div className="ccat__icon">{c.emoji}</div>
      <div className="ccat__name">{c.label}</div>
      <div className="ccat__count">{c.count} produtos</div>
      <div className="ccat__bar" />
    </div>
  );
}

export default function StoreSection() {
  const [filter, setFilter] = useState("Todas");
  const [sort, setSort] = useState("Padrão");
  const titleRef = useRef(null);
  const titleVisible = useIntersection(titleRef);

  const filtered = filter === "Todas"
    ? products
    : products.filter(p => p.brand === filter || p.name.includes(filter));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; font-family: inherit; }

        .store-root {
          background: #080A0E;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          padding-bottom: 80px;
        }

        /* ---- CATEGORIES ---- */
        .cat-section { padding: 60px 60px 0; }
        .sec-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .sec-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 32px;
          letter-spacing: -1px;
          color: #fff;
        }
        .sec-link {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          display: flex; align-items: center; gap: 6px;
          transition: color 0.2s, gap 0.2s;
        }
        .sec-link:hover { color: #9B6DFF; gap: 10px; }

        .cat-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        .ccat {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 28px 16px 22px;
          text-align: center;
          cursor: pointer;
          overflow: hidden;
          transition: background 0.3s, border-color 0.3s, transform 0.3s cubic-bezier(0.23,1,0.32,1);
        }
        .ccat--hov {
          background: color-mix(in srgb, var(--acc) 10%, transparent);
          border-color: color-mix(in srgb, var(--acc) 35%, transparent);
          transform: translateY(-5px);
        }
        .ccat__icon {
          font-size: 32px;
          margin-bottom: 12px;
          display: block;
          transition: transform 0.4s cubic-bezier(0.23,1,0.32,1);
        }
        .ccat--hov .ccat__icon { transform: scale(1.18) rotate(-4deg); }
        .ccat__name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          margin-bottom: 4px;
        }
        .ccat__count { font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 0.3px; }
        .ccat__bar {
          position: absolute;
          bottom: 0; left: 20%; right: 20%;
          height: 2px;
          background: var(--acc);
          border-radius: 2px 2px 0 0;
          transform: scaleX(0);
          transition: transform 0.35s cubic-bezier(0.23,1,0.32,1);
        }
        .ccat--hov .ccat__bar { transform: scaleX(1); }

        /* ---- DIVIDER ---- */
        .store-divider {
          height: 1px;
          margin: 56px 60px 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent);
        }

        /* ---- PRODUCTS ---- */
        .prod-section { padding: 56px 60px 0; }

        .prod-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
        }
        .ctrl-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 9px 16px;
          border-radius: 100px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          appearance: none;
          padding-right: 32px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }
        .ctrl-select:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        .ctrl-pill {
          display: flex;
          gap: 6px;
        }
        .ctrl-pill button {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.45);
          font-size: 12px;
          padding: 8px 16px;
          border-radius: 100px;
          transition: all 0.2s;
        }
        .ctrl-pill button.active {
          background: rgba(123,62,255,0.18);
          border-color: rgba(123,62,255,0.5);
          color: #C4A8FF;
        }
        .ctrl-pill button:hover:not(.active) {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        /* PRODUCT GRID */
        .prod-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 32px;
        }

        /* PRODUCT CARD */
        .pcard {
          position: relative;
          background: linear-gradient(160deg, #10121E, #0C0E17);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          will-change: transform;
        }
        .pcard--featured {
          border-color: rgba(123,62,255,0.4);
          box-shadow: 0 0 40px rgba(123,62,255,0.12), inset 0 0 40px rgba(123,62,255,0.04);
        }
        .pcard__spotlight {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          transition: opacity 0.3s;
        }

        .pcard__tag {
          position: absolute;
          top: 16px; left: 16px;
          z-index: 3;
          background: var(--accent);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
        }

        .pcard__like {
          position: absolute;
          top: 14px; right: 14px;
          z-index: 3;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          width: 34px; height: 34px;
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s;
          backdrop-filter: blur(8px);
        }
        .pcard__like--active { color: #FF6B6B; border-color: rgba(255,107,107,0.5); background: rgba(255,107,107,0.12); }
        .pcard__like:hover { transform: scale(1.15); }

        .pcard__img-area {
          position: relative;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 2;
        }
        .pcard__emoji-bg {
          position: absolute;
          width: 120px; height: 120px;
          border-radius: 50%;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1);
        }
        .pcard:hover .pcard__emoji-bg { transform: translate(-50%, -50%) scale(1.3); }
        .pcard__emoji {
          font-size: 64px;
          position: relative;
          z-index: 1;
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1);
          animation: floatEmoji 4s ease-in-out infinite;
        }
        .pcard:hover .pcard__emoji { transform: scale(1.12) rotate(-6deg); animation-play-state: paused; }

        @keyframes floatEmoji {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .pcard__info {
          padding: 20px 20px 12px;
          z-index: 2;
          flex: 1;
        }
        .pcard__brand {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--accent);
          display: block;
          margin-bottom: 6px;
        }
        .pcard__name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .pcard__stars {
          color: #FFB347;
          font-size: 12px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pcard__reviews { color: rgba(255,255,255,0.3); font-size: 11px; }
        .pcard__desc {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          line-height: 1.5;
        }

        .pcard__footer {
          padding: 16px 20px 20px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          z-index: 2;
        }
        .pcard__old {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-decoration: line-through;
          margin-bottom: 2px;
        }
        .pcard__price {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 22px;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .pcard__add {
          width: 42px; height: 42px;
          background: var(--accent);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-size: 22px;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s, box-shadow 0.3s, filter 0.3s;
          box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent);
          flex-shrink: 0;
        }
        .pcard__add:hover {
          transform: scale(1.12) rotate(90deg);
          filter: brightness(1.2);
          box-shadow: 0 0 35px color-mix(in srgb, var(--accent) 65%, transparent);
        }

        .pcard__line {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .pcard:hover .pcard__line { opacity: 1; }

        /* LOAD MORE */
        .load-more {
          display: flex;
          justify-content: center;
          margin-top: 48px;
        }
        .load-more-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 14px 32px;
          border-radius: 100px;
          transition: all 0.3s;
        }
        .load-more-btn:hover {
          border-color: rgba(155,109,255,0.5);
          color: #C4A8FF;
          background: rgba(123,62,255,0.08);
          gap: 14px;
        }

        @media (max-width: 1100px) {
          .prod-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 800px) {
          .cat-section, .prod-section { padding-left: 20px; padding-right: 20px; }
          .store-divider { margin: 40px 20px 0; }
          .cat-grid { grid-template-columns: repeat(3, 1fr); }
          .prod-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .prod-grid { grid-template-columns: 1fr; }
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="store-root">

        {/* ── CATEGORIES ── */}
        <section className="cat-section">
          <div className="sec-header">
            <h2 className="sec-title">Categorias</h2>
            <a href="#" className="sec-link">Ver todas →</a>
          </div>
          <div className="cat-grid">
            {categories.map((c, i) => <CatCard key={c.label} c={c} index={i} />)}
          </div>
        </section>

        <div className="store-divider" />

        {/* ── PRODUCTS ── */}
        <section className="prod-section">
          <div className="sec-header" ref={titleRef} style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s, transform 0.6s",
          }}>
            <h2 className="sec-title">Mais vendidos</h2>
            <a href="#" className="sec-link">Ver todos →</a>
          </div>

          <div className="prod-controls">
            <select
              className="ctrl-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option>Todas as categorias</option>
              <option>Apple</option>
              <option>Samsung</option>
              <option>Sony</option>
              <option>LG</option>
            </select>
            <select
              className="ctrl-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option>Ordenar por: Padrão</option>
              <option>Menor preço</option>
              <option>Maior preço</option>
              <option>Mais avaliados</option>
            </select>
            <div className="ctrl-pill">
              {["Todas", "Novidades", "Ofertas"].map(f => (
                <button
                  key={f}
                  className={filter === f ? "active" : ""}
                  onClick={() => setFilter(f)}
                >{f}</button>
              ))}
            </div>
          </div>

          <div className="prod-grid">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} />
            ))}
          </div>

          <div className="load-more">
            <button className="load-more-btn">
              Ver mais produtos →
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
