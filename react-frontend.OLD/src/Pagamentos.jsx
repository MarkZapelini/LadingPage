// =============================================================
//  Pagamentos.jsx — Página de Configuração de Pagamentos
//  Compatível com React 18+ e Tailwind CSS (ou CSS puro via style)
//  Não tem dependências externas além do React.
// =============================================================

import { useState } from "react";

// ─── Dados iniciais dos métodos de pagamento ─────────────────
// Cada objeto representa um método. Adicione ou remova itens
// aqui para expandir a lista sem mexer no JSX.
const METODOS_INICIAIS = [
  {
    id: "pix",
    nome: "Pix",
    descricao: "Aprovação instantânea — taxa 0% — liquidação imediata",
    icone: "💠",
    ativo: true,
    cor: "#dcfce7",        // fundo do ícone (verde claro)
    corTexto: "#166534",   // cor do ícone
    campos: [
      { label: "Chave Pix", type: "text", placeholder: "CPF, CNPJ, e-mail ou aleatória" },
      { label: "Banco recebedor", type: "select", opcoes: ["Mercado Pago", "PagSeguro", "Inter"] },
      { label: "Expiração do QR Code", type: "select", opcoes: ["30 minutos", "1 hora", "24 horas"] },
      { label: "Desconto para Pix (%)", type: "number", placeholder: "0" },
    ],
  },
  {
    id: "credito",
    nome: "Cartão de crédito",
    descricao: "Visa, Mastercard, Elo, Hipercard — parcelável",
    icone: "💳",
    ativo: true,
    cor: "#dbeafe",
    corTexto: "#1e40af",
    campos: [
      { label: "Parcelamento máximo", type: "select", opcoes: ["1x","2x","3x","6x","12x","18x"] },
      { label: "Parcela mínima (R$)", type: "number", placeholder: "10.00" },
      { label: "Juros a partir de", type: "select", opcoes: ["Sem juros em todas","A partir de 4x","A partir de 7x"] },
      { label: "Captura", type: "select", opcoes: ["Automática", "Manual"] },
    ],
  },
  {
    id: "boleto",
    nome: "Boleto bancário",
    descricao: "Liquidação em 1–3 dias úteis após pagamento",
    icone: "🧾",
    ativo: true,
    cor: "#fef9c3",
    corTexto: "#854d0e",
    campos: [
      { label: "Vencimento (dias)", type: "number", placeholder: "3" },
      { label: "Instrução no boleto", type: "text", placeholder: "Não receber após o vencimento" },
      { label: "Multa por atraso (%)", type: "number", placeholder: "2" },
      { label: "Juros por dia (%)", type: "number", placeholder: "0.033" },
    ],
  },
  {
    id: "wallet",
    nome: "Carteira digital",
    descricao: "Apple Pay, Google Pay — requer HTTPS e certificado válido",
    icone: "👛",
    ativo: false,
    cor: "#f3f4f6",
    corTexto: "#6b7280",
    campos: [
      { label: "Merchant ID (Apple Pay)", type: "text", placeholder: "merchant.com.suaLoja" },
      { label: "Google Pay Environment", type: "select", opcoes: ["Sandbox", "Production"] },
    ],
  },
];

// ─── Subcomponente: Toggle switch ────────────────────────────
// Props:
//   ativo  → boolean: estado atual do toggle
//   onChange → função chamada ao clicar
function Toggle({ ativo, onChange }) {
  return (
    <button
      onClick={onChange}
      aria-label="Ativar/desativar método"
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: ativo ? "#22c55e" : "#d1d5db",
        position: "relative",
        flexShrink: 0,
        transition: "background .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: ativo ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .2s",
        }}
      />
    </button>
  );
}

// ─── Subcomponente: Badge de status ──────────────────────────
function Badge({ ativo }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "3px 10px",
        borderRadius: 999,
        fontWeight: 500,
        background: ativo ? "#dcfce7" : "#f3f4f6",
        color: ativo ? "#166534" : "#6b7280",
      }}
    >
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

// ─── Subcomponente: Campo de formulário dinâmico ─────────────
// Renderiza <input> ou <select> dependendo de campo.type
function Campo({ campo }) {
  if (campo.type === "select") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 12, color: "#6b7280" }}>{campo.label}</label>
        <select style={estilos.input}>
          {campo.opcoes.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, color: "#6b7280" }}>{campo.label}</label>
      <input type={campo.type} placeholder={campo.placeholder} style={estilos.input} />
    </div>
  );
}

// ─── Subcomponente: Card de método ───────────────────────────
// Contém o toggle, badge, botão de configuração e painel
// expansível com os campos daquele método.
function MetodoCard({ metodo, onToggle }) {
  // Estado local: painel de config aberto ou fechado
  const [aberto, setAberto] = useState(false);

  return (
    <div
      style={{
        ...estilos.card,
        opacity: metodo.ativo ? 1 : 0.55,
        transition: "opacity .2s",
      }}
    >
      {/* Linha principal do card */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>

        {/* Ícone colorido */}
        <div
          style={{
            width: 40, height: 40,
            borderRadius: 8,
            background: metodo.cor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}
        >
          {metodo.icone}
        </div>

        {/* Nome e descrição */}
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 500, fontSize: 15, margin: 0 }}>{metodo.nome}</p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>{metodo.descricao}</p>
        </div>

        {/* Badge, toggle e botão de configuração */}
        <Badge ativo={metodo.ativo} />
        <Toggle ativo={metodo.ativo} onChange={onToggle} />
        <button style={estilos.btnSecundario} onClick={() => setAberto(!aberto)}>
          ⚙ Config.
        </button>
      </div>

      {/* Painel de configuração expansível */}
      {aberto && (
        <div
          style={{
            borderTop: "0.5px solid #e5e7eb",
            marginTop: 12,
            paddingTop: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {metodo.campos.map((c) => (
            <Campo key={c.label} campo={c} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Subcomponente: Aba Gateway ──────────────────────────────
// Formulário de credenciais do provedor de pagamento.
// As chaves de API ficam aqui — nunca exponha no front-end em produção!
function AbaGateway() {
  const [testando, setTestando] = useState(false);
  const [status, setStatus] = useState("conectado"); // "conectado" | "erro" | "testando"

  function testarConexao() {
    setTestando(true);
    setStatus("testando");
    // Simulação — substitua por fetch real à sua API
    setTimeout(() => {
      setTestando(false);
      setStatus("conectado");
    }, 1500);
  }

  const corStatus = { conectado: "#166534", erro: "#991b1b", testando: "#92400e" };
  const textoStatus = { conectado: "✔ Integração verificada", erro: "✖ Falha na conexão", testando: "⏳ Testando..." };

  return (
    <div style={estilos.card}>
      <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 1rem" }}>Gateway de pagamento ativo</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#6b7280" }}>Provedor</label>
          <select style={estilos.input}>
            {["Mercado Pago","PagSeguro","Stripe","Asaas","Pagar.me"].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#6b7280" }}>Ambiente</label>
          <select style={estilos.input}>
            <option>Produção</option>
            <option>Sandbox (testes)</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#6b7280" }}>Public Key</label>
          <input type="text" placeholder="APP_USR-xxxxxxxx-xxxx" style={estilos.input} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, color: "#6b7280" }}>Access Token</label>
          <input type="password" placeholder="••••••••••••••••" style={estilos.input} />
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"0.5px solid #e5e7eb", paddingTop:"1rem" }}>
        <span style={{ fontSize: 13, color: corStatus[status] }}>{textoStatus[status]}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={estilos.btnSecundario} onClick={testarConexao} disabled={testando}>
            🔄 Testar conexão
          </button>
          <button style={estilos.btnPrimario}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponente: Aba Taxas ─────────────────────────────────
// Permite configurar taxa fixa (R$) e percentual (%) por método.
function AbaTaxas() {
  const linhas = [
    { nome: "Pix",              icone: "💠", fixo: "R$ 0,00",  perc: "0%"    },
    { nome: "Cartão de crédito",icone: "💳", fixo: "R$ 0,39",  perc: "2.99%" },
    { nome: "Boleto",           icone: "🧾", fixo: "R$ 3,49",  perc: "0%"    },
  ];
  return (
    <div style={estilos.card}>
      <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 1rem" }}>Configuração de taxas</p>

      {/* Cabeçalho da tabela */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:12, paddingBottom:8, borderBottom:"0.5px solid #e5e7eb", marginBottom:4 }}>
        {["Método","Taxa fixa","Taxa %"].map(h=>(
          <span key={h} style={{ fontSize:12, fontWeight:500, color:"#6b7280" }}>{h}</span>
        ))}
      </div>

      {/* Linhas */}
      {linhas.map((l) => (
        <div key={l.nome} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:12, padding:"10px 0", borderBottom:"0.5px solid #f3f4f6", alignItems:"center" }}>
          <span style={{ fontSize:14 }}>{l.icone} {l.nome}</span>
          <input type="text" defaultValue={l.fixo} style={estilos.input} />
          <input type="text" defaultValue={l.perc} style={estilos.input} />
        </div>
      ))}

      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"1rem" }}>
        <button style={estilos.btnPrimario}>Salvar taxas</button>
      </div>
    </div>
  );
}

// ─── Componente principal: Pagamentos ────────────────────────
export default function Pagamentos() {
  // Estado dos métodos (lista completa com ativo/inativo)
  const [metodos, setMetodos] = useState(METODOS_INICIAIS);

  // Aba ativa: "metodos" | "gateway" | "taxas"
  const [aba, setAba] = useState("metodos");

  // Alterna ativo/inativo de um método pelo id
  function toggleMetodo(id) {
    setMetodos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ativo: !m.ativo } : m))
    );
  }

  const ativos = metodos.filter((m) => m.ativo).length;

  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 780, margin: "0 auto" }}>

      {/* ── Cabeçalho + navegação de abas ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:500, margin:0 }}>Métodos de pagamento</h1>
          <p style={{ fontSize:13, color:"#6b7280", margin:"4px 0 0" }}>
            Ative, configure e personalize cada método aceito na loja.
          </p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {["metodos","gateway","taxas"].map((t) => (
            <button
              key={t}
              onClick={() => setAba(t)}
              style={{
                ...estilos.tabBtn,
                ...(aba === t ? estilos.tabBtnAtivo : {}),
              }}
            >
              {{ metodos:"Métodos", gateway:"Gateway", taxas:"Taxas" }[t]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards de métricas ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))", gap:10 }}>
        {[
          { label:"Métodos ativos",   valor: ativos },
          { label:"Gateway",          valor:"Mercado Pago" },
          { label:"Parcelamento máx.",valor:"12x" },
          { label:"Status",           valor:"✔ Conectado", cor:"#166534" },
        ].map((c) => (
          <div key={c.label} style={estilos.metricCard}>
            <p style={{ fontSize:12, color:"#6b7280", margin:"0 0 4px" }}>{c.label}</p>
            <p style={{ fontSize: typeof c.valor === "number" ? 24 : 15, fontWeight:500, margin:0, color: c.cor || "inherit" }}>
              {c.valor}
            </p>
          </div>
        ))}
      </div>

      {/* ── Conteúdo da aba ── */}
      {aba === "metodos" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {metodos.map((m) => (
            <MetodoCard
              key={m.id}
              metodo={m}
              onToggle={() => toggleMetodo(m.id)}
            />
          ))}
        </div>
      )}

      {aba === "gateway" && <AbaGateway />}
      {aba === "taxas"   && <AbaTaxas />}

    </div>
  );
}

// ─── Estilos compartilhados ───────────────────────────────────
// Centralizados aqui para fácil customização.
const estilos = {
  card: {
    background: "#fff",
    border: "0.5px solid #e5e7eb",
    borderRadius: 12,
    padding: "1rem 1.25rem",
  },
  metricCard: {
    background: "#f9fafb",
    borderRadius: 8,
    padding: "1rem",
    textAlign: "center",
  },
  input: {
    fontSize: 13,
    padding: "6px 10px",
    borderRadius: 6,
    border: "0.5px solid #d1d5db",
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
  },
  btnPrimario: {
    fontSize: 13,
    padding: "6px 16px",
    borderRadius: 6,
    border: "0.5px solid #6b7280",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
  btnSecundario: {
    fontSize: 12,
    padding: "5px 12px",
    borderRadius: 6,
    border: "0.5px solid #d1d5db",
    background: "transparent",
    cursor: "pointer",
  },
  tabBtn: {
    background: "none",
    border: "none",
    fontSize: 13,
    color: "#6b7280",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
  },
  tabBtnAtivo: {
    background: "#f3f4f6",
    color: "#111827",
    fontWeight: 500,
  },
};
