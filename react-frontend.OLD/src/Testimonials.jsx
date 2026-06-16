import React, { useEffect, useRef } from 'react';

const Testimonials = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');

    .volt-testimonials {
      background-color: #080A0E;
      color: #FFFFFF;
      font-family: 'DM Sans', sans-serif;
      padding: 100px 20px;
      overflow: hidden;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .metrics {
      display: flex;
      gap: 40px;
      margin-bottom: 60px;
      justify-content: flex-start;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 30px;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
    }

    .metric-value {
      font-family: 'Syne', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #00C9A7;
    }

    .metric-label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .testimonials-layout {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 30px;
    }

    .testimonial-card {
      position: relative;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 40px;
      transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      overflow: hidden;
    }

    .testimonial-card::before {
      content: '"';
      position: absolute;
      top: -20px;
      right: 20px;
      font-family: 'Syne', sans-serif;
      font-size: 180px;
      color: #7B3EFF;
      opacity: 0.1;
      line-height: 1;
      pointer-events: none;
    }

    .testimonial-card:hover {
      transform: translateY(-5px);
      border-color: #7B3EFF;
      box-shadow: 0 0 30px rgba(123, 62, 255, 0.15);
    }

    .main-card {
      grid-row: span 2;
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* Shimmer effect for main card */
    .main-card::after {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 50%; height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(123, 62, 255, 0.05),
        transparent
      );
      transform: skewX(-25deg);
      animation: shimmer 6s infinite;
    }

    @keyframes shimmer {
      0% { left: -100%; }
      30% { left: 200%; }
      100% { left: 200%; }
    }

    .stacked-cards {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 25px;
    }

    .avatar {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      background: linear-gradient(135deg, #7B3EFF, #00C9A7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-size: 18px;
    }

    .author-info h4 {
      font-family: 'Syne', sans-serif;
      font-size: 18px;
      margin: 0;
    }

    .verified-tag {
      font-size: 12px;
      color: #00C9A7;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .testimonial-text {
      font-size: 18px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.8);
      position: relative;
      z-index: 1;
    }

    .main-card .testimonial-text {
      font-size: 24px;
      font-weight: 500;
    }

    /* Animations */
    .reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .delay-1 { transition-delay: 0.1s; }
    .delay-2 { transition-delay: 0.3s; }
    .delay-3 { transition-delay: 0.5s; }

    @media (max-width: 992px) {
      .testimonials-layout {
        grid-template-columns: 1fr;
      }
      .main-card {
        grid-row: auto;
        padding: 40px;
      }
    }
  `;

  return (
    <section className="volt-testimonials" ref={sectionRef}>
      <style>{styles}</style>
      <div className="container">
        <div className="metrics reveal">
          <div className="metric-item">
            <span className="metric-value">4.9★</span>
            <span className="metric-label">Avaliação média</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">1.200+</span>
            <span className="metric-label">Avaliações</span>
          </div>
          <div className="metric-item">
            <span className="metric-value">98%</span>
            <span className="metric-label">Satisfeitos</span>
          </div>
        </div>

        <div className="testimonials-layout">
          <div className="testimonial-card main-card reveal delay-1">
            <div className="card-header">
              <div className="avatar">JS</div>
              <div className="author-info">
                <h4>Juliano Silva</h4>
                <div className="verified-tag">Compra verificada ✓</div>
              </div>
            </div>
            <p className="testimonial-text">
              "A experiência com a Z-Core superou todas as expectativas. O acabamento dos produtos é impecável e a performance redefine o que eu entendia por hardware high-end."
            </p>
          </div>

          <div className="stacked-cards">
            <div className="testimonial-card reveal delay-2">
              <div className="card-header">
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #00C9A7, #7B3EFF)' }}>AM</div>
                <div className="author-info">
                  <h4>Ana Martins</h4>
                  <div className="verified-tag">Compra verificada ✓</div>
                </div>
              </div>
              <p className="testimonial-text">
                "Entrega ultra rápida e suporte técnico extremamente qualificado. Voltarei a comprar com certeza."
              </p>
            </div>

            <div className="testimonial-card reveal delay-3">
              <div className="card-header">
                <div className="avatar">PR</div>
                <div className="author-info">
                  <h4>Paulo Ricardo</h4>
                  <div className="verified-tag">Compra verificada ✓</div>
                </div>
              </div>
              <p className="testimonial-text">
                "Design minimalista e tecnologia de ponta. Exatamente o que eu buscava para o meu setup profissional."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
