// ============================================================
// IDENTIDADE 5 — FOLHA VIVA
// Verde claro, fundo claro, ilustrações orgânicas de folhas.
// Tipografia manuscrita suave, sensação de caderno de campo.
// ============================================================

const id5Styles = {
  bg: '#f4f7ed',              // creme esverdeado
  bg2: '#e8efd9',
  surface: '#ffffff',
  surfaceSoft: '#fafbf2',
  ink: '#1e2e1a',             // verde muito escuro como tinta
  inkSoft: '#5a6b52',
  inkFaint: '#8a9a80',
  folha: '#6b9d50',           // verde folha
  folhaClara: '#a3c487',
  folhaEscura: '#3d5a2f',
  terra: '#a87a4a',
  agua: '#5a92b8',
  daime: '#b05a5a',
  linhaSoft: '#d8dfc8',
};

function Id5_FolhaViva() {
  const now = useLiveNow();
  const S = id5Styles;
  const duracaoMs = now - FEITIO_DATA.feitio.inicio;

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: `
        radial-gradient(ellipse at 10% 10%, ${S.folhaClara}30, transparent 40%),
        radial-gradient(circle at 95% 95%, ${S.terra}14, transparent 45%),
        ${S.bg}
      `,
      color: S.ink,
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      padding: '30px 40px',
      display: 'flex', flexDirection: 'column', gap: 22,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ilustração botânica decorativa */}
      <svg viewBox="0 0 300 400" style={{
        position: 'absolute', top: -30, right: -40, width: 280, height: 360,
        opacity: 0.09, pointerEvents: 'none',
      }}>
        <g stroke={S.folhaEscura} fill="none" strokeWidth="1.2" strokeLinecap="round">
          <path d="M 150 400 Q 150 300 140 220 T 120 80" />
          <path d="M 140 280 Q 120 270 100 270" />
          <path d="M 130 230 Q 150 215 170 220" />
          <path d="M 128 190 Q 110 175 95 180" />
          <path d="M 123 150 Q 140 135 160 140" />
          <path d="M 120 110 Q 105 95 95 100" />
        </g>
        <g fill={S.folha}>
          <ellipse cx="95" cy="267" rx="18" ry="9" transform="rotate(-20 95 267)" />
          <ellipse cx="175" cy="218" rx="20" ry="10" transform="rotate(25 175 218)" />
          <ellipse cx="90" cy="178" rx="16" ry="8" transform="rotate(-15 90 178)" />
          <ellipse cx="165" cy="138" rx="18" ry="9" transform="rotate(22 165 138)" />
          <ellipse cx="88" cy="100" rx="14" ry="7" transform="rotate(-18 88 100)" />
        </g>
      </svg>

      {/* Header */}
      <header style={{
        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 24,
        borderBottom: `1.5px solid ${S.linhaSoft}`, paddingBottom: 16, position: 'relative', zIndex: 1,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: S.folha, fontWeight: 500 }}>
            ✿ Caderno de Feitio · Casinha da Sede
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 48, fontWeight: 500, letterSpacing: '-0.025em', color: S.folhaEscura, lineHeight: 1 }}>
            {FEITIO_DATA.feitio.nome}
          </h1>
          <div style={{ marginTop: 8, fontSize: 15, color: S.inkSoft, fontStyle: 'italic' }}>
            com <strong style={{ color: S.ink, fontStyle: 'normal' }}>{FEITIO_DATA.feitio.feitor}</strong>
            <span style={{ margin: '0 10px', color: S.linhaSoft }}>&</span>
            <strong style={{ color: S.ink, fontStyle: 'normal' }}>{FEITIO_DATA.feitio.foguista}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.03em', color: S.folha, fontWeight: 500 }}>
            {fmtHora(now)}
          </div>
          <div style={{ fontSize: 12, color: S.inkSoft, letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase' }}>
            sexta · 17 abril
          </div>
          <div style={{ fontSize: 11, color: S.inkFaint, marginTop: 2, fontStyle: 'italic' }}>
            dia 2 · {fmtDuration(duracaoMs)} no fogo
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 28, flex: 1, position: 'relative', zIndex: 1 }}>
        <section>
          <H5 S={S}>Fornalha · panelas no fogo</H5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 16 }}>
            {Array.from({ length: FEITIO_DATA.fornalha.bocas }, (_, i) => i + 1).map(b => {
              const p = FEITIO_DATA.panelas.find(x => x.boca === b);
              return <Id5_Panela key={b} boca={b} panela={p} now={now} S={S} />;
            })}
          </div>
        </section>

        <section>
          <H5 S={S}>Tonéis · da colheita</H5>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FEITIO_DATA.toneis.map(t => <Id5_Tonel key={t.numero} tonel={t} S={S} />)}
          </div>
          <div style={{
            marginTop: 18, padding: 14,
            background: `linear-gradient(135deg, ${S.folhaClara}40, ${S.surfaceSoft})`,
            border: `1px solid ${S.folha}55`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.25em', color: S.folha, textTransform: 'uppercase' }}>Colheita total</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em', color: S.folhaEscura }}>
                {FEITIO_DATA.toneis.reduce((a,t) => a + t.volumeL, 0)}
              </span>
              <span style={{ fontSize: 14, color: S.inkSoft, fontStyle: 'italic' }}>litros</span>
            </div>
          </div>
        </section>
      </div>

      {/* Rodapé */}
      <footer style={{
        borderTop: `1.5px solid ${S.linhaSoft}`, paddingTop: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 13, position: 'relative', zIndex: 1,
      }}>
        <div style={{ color: S.inkSoft, fontStyle: 'italic' }}>
          <span style={{ color: S.folha, marginRight: 8 }}>✿</span>
          {FEITIO_DATA.eventos[0].texto}
          <span style={{ color: S.inkFaint, marginLeft: 10 }}>· {fmtHora(FEITIO_DATA.eventos[0].momento)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ padding: '9px 18px', background: 'transparent', color: S.inkSoft, border: `1.2px solid ${S.linhaSoft}`, borderRadius: 20, fontFamily: 'inherit', fontSize: 14, fontStyle: 'italic' }}>desfazer</button>
          <button style={{ padding: '9px 22px', background: S.folha, color: S.bg, border: 'none', borderRadius: 20, fontFamily: 'inherit', fontSize: 14, fontWeight: 500, letterSpacing: '0.03em' }}>✿ Nova panela</button>
        </div>
      </footer>
    </div>
  );
}

function H5({ S, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, borderBottom: `0.5px solid ${S.folhaClara}`, paddingBottom: 5 }}>
      <span style={{ color: S.folha, fontSize: 15 }}>❋</span>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500, color: S.folhaEscura, letterSpacing: '-0.01em' }}>{children}</h2>
    </div>
  );
}

function Id5_Panela({ boca, panela, now, S }) {
  if (!panela) {
    return (
      <div style={{
        minHeight: 200, borderRadius: 10,
        border: `1.5px dashed ${S.linhaSoft}`,
        background: S.surfaceSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
        color: S.inkFaint,
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Boca {boca}</div>
        <div style={{ fontSize: 28, color: S.linhaSoft }}>✿</div>
        <div style={{ fontSize: 13, fontStyle: 'italic' }}>plantar panela</div>
      </div>
    );
  }

  const tempoMs = now - panela.entradaFogoEm;
  const volPct = Math.min(100, (panela.volumeAtualL / 120) * 100);
  const metaPct = Math.min(100, (panela.metaTiragem / 120) * 100);
  const cor = panela.proxTiragem.tipo === 'daime' ? S.daime : panela.proxTiragem.tipo === 'cozimento' ? S.folha : S.terra;

  return (
    <article style={{
      minHeight: 200,
      background: S.surface,
      border: `1px solid ${S.linhaSoft}`,
      borderRadius: 10,
      padding: '13px 15px 14px',
      position: 'relative',
      boxShadow: `0 2px 0 ${S.linhaSoft}40`,
    }}>
      {/* Tag colorida no topo */}
      <div style={{
        position: 'absolute', top: -1, left: 14, right: 14, height: 3,
        background: `linear-gradient(90deg, ${cor}, ${cor}70)`, borderRadius: '0 0 3px 3px',
      }} />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 6, marginBottom: 10, borderBottom: `0.5px dashed ${S.linhaSoft}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: S.inkFaint }}>Boca {boca}</span>
          <span style={{ fontSize: 17, fontWeight: 500, color: S.folhaEscura, fontStyle: 'italic' }}>n.º {panela.numero}</span>
        </div>
        <span style={{ fontSize: 13, color: S.inkSoft, fontStyle: 'italic', fontVariantNumeric: 'tabular-nums' }}>
          {fmtDuration(tempoMs)}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: S.inkFaint, marginBottom: 2 }}>vai tirar</div>
        <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.025em', color: cor, fontStyle: 'italic' }}>
          {tiragemLabel(panela.proxTiragem)}
        </div>
        <div style={{ fontSize: 12, color: S.inkSoft, marginTop: 3, fontStyle: 'italic' }}>
          ↳ cozinhando com {conteudoLabel(panela.conteudo).toLowerCase()}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: S.inkFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>volume</span>
          <span>
            <span style={{ fontSize: 22, fontWeight: 500, color: S.folhaEscura }}>{panela.volumeAtualL}</span>
            <span style={{ fontSize: 11, color: S.inkFaint, marginLeft: 3, fontStyle: 'italic' }}>L</span>
          </span>
        </div>
        <div style={{ position: 'relative', height: 8, background: S.bg2, borderRadius: 4 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${volPct}%`, background: cor, borderRadius: 4 }} />
          <div style={{ position: 'absolute', top: -3, left: `calc(${metaPct}% - 1px)`, width: 2, height: 14, background: S.folhaEscura }} />
        </div>
        <div style={{ fontSize: 10, color: S.inkFaint, marginTop: 5, fontStyle: 'italic', textAlign: 'right' }}>
          meta em {panela.metaTiragem} L
        </div>
      </div>
    </article>
  );
}

function Id5_Tonel({ tonel, S }) {
  const pct = (tonel.volumeL / tonel.capacidadeL) * 100;
  const cor = tonel.tipo === 'daime' ? S.daime : tonel.tipo === 'agua_forte' ? S.terra : S.folha;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 12px', background: S.surfaceSoft, borderRadius: 6,
      border: `1px solid ${S.linhaSoft}`,
    }}>
      <div style={{ width: 22, height: 34, border: `1.2px solid ${cor}`, borderRadius: '2px 2px 6px 6px', position: 'relative', background: S.surface }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct}%`, background: cor, borderRadius: '0 0 5px 5px', opacity: 0.8 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: S.folhaEscura, fontStyle: 'italic' }}>{tonelLabel(tonel)}</div>
        <div style={{ fontSize: 10, color: S.inkFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>tonel {tonel.numero}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 20, fontWeight: 500, color: S.folhaEscura }}>{tonel.volumeL}</span>
        <span style={{ fontSize: 10, color: S.inkFaint, marginLeft: 2 }}>/{tonel.capacidadeL}</span>
      </div>
    </div>
  );
}

window.Id5_FolhaViva = Id5_FolhaViva;
