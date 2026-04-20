// ============================================================
// IDENTIDADE 2 — HERBÁRIO ESCURO
// Verde mata profundo, aquarela, botânico.
// Sensação: caderno de campo de um botânico-feitor na floresta.
// ============================================================

const id2Styles = {
  bg: '#1a241c',              // verde muito escuro
  bg2: '#232e25',
  bg3: '#2c3a2e',
  surface: '#27322a',
  ink: '#e8e0cc',             // papel envelhecido sobre verde
  inkSoft: '#c4bda3',
  inkFaint: '#8a8c76',
  folha: '#6a9d5a',           // verde folha viva
  folhaClara: '#9dc88a',
  folhaEscura: '#3d5a38',
  linha: '#3f4e3a',
  dourado: '#c49a4a',
  daime: '#b84a4a',
  agua: '#6a9dc4',
  terra: '#9a7a4a',
};

function Id2_Herbario() {
  const now = useLiveNow();
  const S = id2Styles;
  const duracaoMs = now - FEITIO_DATA.feitio.inicio;

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: `
        radial-gradient(ellipse at 80% 0%, ${S.folha}22, transparent 55%),
        radial-gradient(circle at 10% 95%, ${S.dourado}14, transparent 50%),
        ${S.bg}
      `,
      color: S.ink,
      fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
      padding: '30px 40px',
      display: 'flex', flexDirection: 'column', gap: 24,
      position: 'relative',
    }}>
      {/* Galhos decorativos */}
      <svg viewBox="0 0 400 300" style={{ position: 'absolute', top: 0, right: 0, width: 320, height: 240, opacity: 0.08, pointerEvents: 'none' }}>
        <g stroke={S.folhaClara} fill="none" strokeWidth="0.8">
          <path d="M 380 20 Q 300 40 240 90 T 120 180" />
          <path d="M 320 40 Q 290 70 260 100" />
          <path d="M 280 70 Q 250 95 225 130" />
          <path d="M 220 120 Q 190 145 170 180" />
        </g>
        <g fill={S.folhaClara}>
          {[[320,40],[295,72],[270,95],[245,125],[220,120],[200,150],[175,170]].map(([x,y],i) => (
            <ellipse key={i} cx={x} cy={y} rx="6" ry="12" transform={`rotate(${i*30} ${x} ${y})`} />
          ))}
        </g>
      </svg>

      {/* Header */}
      <header style={{
        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 24,
        borderBottom: `1px solid ${S.linha}`, paddingBottom: 18, position: 'relative', zIndex: 1,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: S.folhaClara, fontWeight: 500 }}>
            ☙ Herbário do Feitio · Folha 02
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 50, fontWeight: 500, letterSpacing: '-0.025em', color: S.ink, lineHeight: 1, fontStyle: 'italic' }}>
            {FEITIO_DATA.feitio.nome}
          </h1>
          <div style={{ marginTop: 10, fontSize: 15, color: S.inkSoft }}>
            <em style={{ color: S.inkFaint }}>feitor</em> <strong style={{ color: S.ink }}>{FEITIO_DATA.feitio.feitor}</strong>
            <span style={{ margin: '0 10px', color: S.linha }}>✢</span>
            <em style={{ color: S.inkFaint }}>foguista</em> <strong style={{ color: S.ink }}>{FEITIO_DATA.feitio.foguista}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.03em', color: S.folhaClara, fontWeight: 500, fontStyle: 'italic' }}>
            {fmtHora(now)}
          </div>
          <div style={{ fontSize: 13, color: S.inkSoft, letterSpacing: '0.1em', marginTop: 4, textTransform: 'uppercase' }}>
            dia 2 · 17 abr
          </div>
          <div style={{ fontSize: 12, color: S.inkFaint, marginTop: 2, fontStyle: 'italic' }}>
            fogo aceso há {fmtDuration(duracaoMs)}
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, flex: 1, position: 'relative', zIndex: 1 }}>
        {/* Fornalha */}
        <section>
          <H2 S={S}>Fornalha · panelas ao fogo</H2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 18 }}>
            {Array.from({ length: FEITIO_DATA.fornalha.bocas }, (_, i) => i + 1).map(b => {
              const p = FEITIO_DATA.panelas.find(x => x.boca === b);
              return <Id2_Panela key={b} boca={b} panela={p} now={now} S={S} />;
            })}
          </div>
        </section>

        {/* Tonéis */}
        <section>
          <H2 S={S}>Tonéis · colheita</H2>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FEITIO_DATA.toneis.map(t => <Id2_Tonel key={t.numero} tonel={t} S={S} />)}
          </div>
          <div style={{
            marginTop: 20, padding: 16,
            background: `linear-gradient(135deg, ${S.folhaEscura}60, ${S.bg3})`,
            borderRadius: 4,
            border: `1px solid ${S.folhaEscura}`,
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.25em', color: S.folhaClara, textTransform: 'uppercase' }}>Colheita total</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 46, fontWeight: 500, letterSpacing: '-0.03em', color: S.ink, fontStyle: 'italic' }}>
                {FEITIO_DATA.toneis.reduce((a, t) => a + t.volumeL, 0)}
              </span>
              <span style={{ fontSize: 14, color: S.inkSoft, fontStyle: 'italic' }}>litros guardados</span>
            </div>
          </div>
        </section>
      </div>

      {/* Rodapé */}
      <footer style={{
        borderTop: `1px solid ${S.linha}`, paddingTop: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        fontSize: 13, position: 'relative', zIndex: 1,
      }}>
        <div style={{ color: S.inkSoft, fontStyle: 'italic' }}>
          <span style={{ color: S.folhaClara, marginRight: 8 }}>✎</span>
          {FEITIO_DATA.eventos[0].texto}
          <span style={{ color: S.inkFaint, marginLeft: 10 }}>· {fmtHora(FEITIO_DATA.eventos[0].momento)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ padding: '9px 18px', background: 'transparent', color: S.inkSoft, border: `1px solid ${S.linha}`, borderRadius: 2, fontFamily: 'inherit', fontSize: 14, fontStyle: 'italic' }}>desfazer</button>
          <button style={{ padding: '9px 22px', background: S.folha, color: S.bg, border: 'none', borderRadius: 2, fontFamily: 'inherit', fontSize: 14, fontWeight: 500, letterSpacing: '0.04em' }}>☙ Nova panela</button>
        </div>
      </footer>
    </div>
  );
}

function H2({ S, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, borderBottom: `0.5px dashed ${S.linha}`, paddingBottom: 6 }}>
      <span style={{ color: S.folha, fontSize: 18 }}>❦</span>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', color: S.ink, fontStyle: 'italic' }}>{children}</h2>
    </div>
  );
}

function Id2_Panela({ boca, panela, now, S }) {
  if (!panela) {
    return (
      <div style={{
        minHeight: 220, borderRadius: 4,
        border: `1.5px dashed ${S.linha}`,
        background: `${S.bg2}60`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10,
        color: S.inkFaint,
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Boca {boca}</div>
        <div style={{ fontSize: 40, color: S.linha, fontStyle: 'italic' }}>+</div>
        <div style={{ fontSize: 13, fontStyle: 'italic' }}>plantar nova panela</div>
      </div>
    );
  }

  const tempoMs = now - panela.entradaFogoEm;
  const volPct = Math.min(100, (panela.volumeAtualL / 120) * 100);
  const metaPct = Math.min(100, (panela.metaTiragem / 120) * 100);
  const cor = panela.proxTiragem.tipo === 'daime' ? S.daime : panela.proxTiragem.tipo === 'cozimento' ? S.folhaClara : S.dourado;

  return (
    <article style={{
      minHeight: 220,
      background: `linear-gradient(180deg, ${S.surface}, ${S.bg2})`,
      border: `1px solid ${S.linha}`,
      borderRadius: 4,
      padding: '14px 16px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Aquarela de fundo */}
      <div style={{
        position: 'absolute', bottom: -20, left: -20, width: 160, height: 100,
        background: `radial-gradient(ellipse, ${cor}25, transparent 70%)`,
        filter: 'blur(12px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `0.5px dashed ${S.linha}`, paddingBottom: 8, marginBottom: 12, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: S.inkFaint }}>Boca {boca}</span>
          <span style={{ fontSize: 18, fontWeight: 500, color: S.folhaClara, fontStyle: 'italic' }}>n.º {panela.numero}</span>
        </div>
        <span style={{ fontSize: 13, color: S.inkSoft, fontStyle: 'italic', letterSpacing: '0.05em' }}>{fmtDuration(tempoMs)}</span>
      </div>

      <div style={{ marginBottom: 14, position: 'relative' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: S.inkFaint, marginBottom: 2 }}>vai tirar</div>
        <div style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.025em', color: cor, fontStyle: 'italic' }}>
          {tiragemLabel(panela.proxTiragem)}
        </div>
        <div style={{ fontSize: 13, color: S.inkSoft, marginTop: 4, fontStyle: 'italic' }}>
          ↝ cozinhando com {conteudoLabel(panela.conteudo).toLowerCase()}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: S.inkFaint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>volume</span>
          <span>
            <span style={{ fontSize: 22, fontWeight: 500, color: S.ink }}>{panela.volumeAtualL}</span>
            <span style={{ fontSize: 11, color: S.inkFaint, marginLeft: 3, fontStyle: 'italic' }}>L</span>
          </span>
        </div>
        <div style={{ position: 'relative', height: 6, background: S.bg3, borderRadius: 3 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${volPct}%`, background: `linear-gradient(90deg, ${cor}90, ${cor})`, borderRadius: 3 }} />
          <div style={{ position: 'absolute', top: -4, left: `calc(${metaPct}% - 1px)`, width: 2, height: 14, background: S.dourado }} />
        </div>
        <div style={{ fontSize: 11, color: S.inkFaint, marginTop: 6, fontStyle: 'italic', textAlign: 'right' }}>
          meta ↦ {panela.metaTiragem} L
        </div>
      </div>
    </article>
  );
}

function Id2_Tonel({ tonel, S }) {
  const pct = (tonel.volumeL / tonel.capacidadeL) * 100;
  const cor = tonel.tipo === 'daime' ? S.daime : tonel.tipo === 'agua_forte' ? S.dourado : S.folhaClara;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: `${S.bg2}` }}>
      <div style={{ width: 22, height: 34, border: `1.2px solid ${cor}`, borderRadius: '2px 2px 6px 6px', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct}%`, background: cor, borderRadius: '0 0 5px 5px', opacity: 0.8 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: S.ink, fontStyle: 'italic' }}>{tonelLabel(tonel)}</div>
        <div style={{ fontSize: 11, color: S.inkFaint }}>tonel n.º {tonel.numero}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 20, fontWeight: 500, color: S.ink, fontStyle: 'italic' }}>{tonel.volumeL}</span>
        <span style={{ fontSize: 10, color: S.inkFaint, marginLeft: 2 }}>/{tonel.capacidadeL} L</span>
      </div>
    </div>
  );
}

window.Id2_Herbario = Id2_Herbario;
