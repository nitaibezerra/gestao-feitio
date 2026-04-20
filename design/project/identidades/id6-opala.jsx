// ============================================================
// IDENTIDADE 6 — OPALA (com variantes)
// Iridescente e etéreo: reflexos de nácar.
// 3 variantes: Dia, Noite, Saturada.
// ============================================================

const OPALA_PALETAS = {
  dia: {
    nome: 'Dia',
    // claro, equilibrado, refinado
    bg: '#f4f7fb',
    bg2: '#e8eef6',
    surface: '#ffffff',
    ink: '#1d2432',
    inkSoft: '#525b70',
    inkFaint: '#95a0b5',
    azul: '#6a97d0',
    verde: '#7cba9a',
    rosa: '#d098ac',
    dourado: '#d4b070',
    linhaSoft: '#e2e8f1',
    // intensidade dos gradientes de fundo (alpha hex)
    auroraAlpha: { azul: '3a', verde: '34', rosa: '2c', dourado: '22' },
    // glow de botões/cards
    glowStrength: 0.25,
    isDark: false,
  },
  noite: {
    nome: 'Noite',
    // escuro, profundidade de vidro azul
    bg: '#0d1220',
    bg2: '#141a2c',
    surface: '#171e32',
    ink: '#eef1f8',
    inkSoft: '#9aa3bb',
    inkFaint: '#5a6179',
    azul: '#7fb3e8',
    verde: '#84d0b0',
    rosa: '#e8a8c0',
    dourado: '#e8c680',
    linhaSoft: '#262e46',
    auroraAlpha: { azul: '48', verde: '38', rosa: '30', dourado: '26' },
    glowStrength: 0.55,
    isDark: true,
  },
  saturada: {
    nome: 'Saturada',
    // azul + verde dominantes, iridescência mais presente
    bg: '#eff5fb',
    bg2: '#dce9f5',
    surface: '#ffffff',
    ink: '#14243a',
    inkSoft: '#435273',
    inkFaint: '#8496b4',
    azul: '#3d7cc0',
    verde: '#44b088',
    rosa: '#c67a94',
    dourado: '#d4a050',
    linhaSoft: '#d2dfee',
    auroraAlpha: { azul: '55', verde: '4a', rosa: '38', dourado: '2a' },
    glowStrength: 0.4,
    isDark: false,
  },
};

function Id6_Opala({ variante = 'dia' }) {
  const now = useLiveNow();
  const S = OPALA_PALETAS[variante] || OPALA_PALETAS.dia;
  const duracaoMs = now - FEITIO_DATA.feitio.inicio;

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: `
        radial-gradient(ellipse 60% 45% at 12% 18%, ${S.azul}${S.auroraAlpha.azul}, transparent 60%),
        radial-gradient(ellipse 55% 40% at 88% 8%, ${S.verde}${S.auroraAlpha.verde}, transparent 60%),
        radial-gradient(ellipse 50% 40% at 75% 92%, ${S.rosa}${S.auroraAlpha.rosa}, transparent 55%),
        radial-gradient(ellipse 45% 35% at 8% 88%, ${S.dourado}${S.auroraAlpha.dourado}, transparent 55%),
        ${S.bg}
      `,
      color: S.ink,
      fontFamily: "'Fraunces', 'Cormorant Garamond', Georgia, serif",
      padding: '38px 48px 32px',
      display: 'flex', flexDirection: 'column', gap: 26,
    }}>
      {/* Header */}
      <header style={{
        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 24,
      }}>
        <div>
          <div style={{
            fontSize: 11, letterSpacing: '0.38em', textTransform: 'uppercase',
            color: S.azul, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <OpalaOrbe S={S} size={14} />
            Feitio · Casinha da Sede
          </div>
          <h1 style={{
            margin: '8px 0 0', fontSize: 60, fontWeight: 400, letterSpacing: '-0.035em', lineHeight: 1,
            background: `linear-gradient(108deg, ${S.azul}, ${S.verde} 35%, ${S.rosa} 70%, ${S.ink} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', color: 'transparent',
            textShadow: S.isDark ? `0 0 40px ${S.azul}44` : 'none',
          }}>
            {FEITIO_DATA.feitio.nome}
          </h1>
          <div style={{ marginTop: 12, fontSize: 15.5, color: S.inkSoft, fontStyle: 'italic' }}>
            feitor <strong style={{ color: S.ink, fontStyle: 'normal' }}>{FEITIO_DATA.feitio.feitor}</strong>
            <span style={{ margin: '0 12px', color: S.linhaSoft }}>◦</span>
            foguista <strong style={{ color: S.ink, fontStyle: 'normal' }}>{FEITIO_DATA.feitio.foguista}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 88, lineHeight: 0.88, letterSpacing: '-0.04em', fontWeight: 300,
            background: `linear-gradient(135deg, ${S.azul}, ${S.rosa} 70%, ${S.dourado})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', color: 'transparent',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {fmtHora(now)}
          </div>
          <div style={{ fontSize: 12, color: S.inkSoft, letterSpacing: '0.22em', marginTop: 4, textTransform: 'uppercase' }}>
            dia 2 · {fmtDuration(duracaoMs)}
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 30, flex: 1 }}>
        <section>
          <H6 S={S}>Fornalha</H6>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 18 }}>
            {Array.from({ length: FEITIO_DATA.fornalha.bocas }, (_, i) => i + 1).map(b => {
              const p = FEITIO_DATA.panelas.find(x => x.boca === b);
              return <Id6_Panela key={b} boca={b} panela={p} now={now} S={S} />;
            })}
          </div>
        </section>

        <section>
          <H6 S={S}>Tonéis</H6>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FEITIO_DATA.toneis.map(t => <Id6_Tonel key={t.numero} tonel={t} S={S} />)}
          </div>
          <div style={{
            marginTop: 20, padding: 18,
            background: S.surface,
            border: `1px solid ${S.linhaSoft}`, borderRadius: 16,
            boxShadow: S.isDark
              ? `0 8px 32px ${S.azul}28, inset 0 1px 0 ${S.azul}18`
              : `0 10px 30px ${S.azul}1a, 0 2px 8px ${S.rosa}12`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0,
              background: `linear-gradient(125deg, ${S.azul}14, ${S.verde}12 45%, ${S.rosa}12 75%, transparent)`,
              pointerEvents: 'none' }} />
            {/* linha iridescente fina topo */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${S.azul}, ${S.verde}, ${S.rosa}, transparent)` }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.32em', color: S.azul, textTransform: 'uppercase', fontWeight: 500 }}>
                total guardado
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <span style={{
                  fontSize: 54, fontWeight: 300, letterSpacing: '-0.035em',
                  background: `linear-gradient(135deg, ${S.azul}, ${S.verde})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', color: 'transparent',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {FEITIO_DATA.toneis.reduce((a,t) => a + t.volumeL, 0)}
                </span>
                <span style={{ fontSize: 15, color: S.inkSoft, fontStyle: 'italic' }}>litros</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Rodapé */}
      <footer style={{
        borderTop: `1px solid ${S.linhaSoft}`, paddingTop: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5,
      }}>
        <div style={{ color: S.inkSoft, fontStyle: 'italic' }}>
          <span style={{ color: S.azul, marginRight: 8 }}>◌</span>
          {FEITIO_DATA.eventos[0].texto}
          <span style={{ color: S.inkFaint, marginLeft: 10 }}>· {fmtHora(FEITIO_DATA.eventos[0].momento)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            padding: '10px 20px', background: 'transparent', color: S.inkSoft,
            border: `1px solid ${S.linhaSoft}`, borderRadius: 999,
            fontFamily: 'inherit', fontSize: 14, fontStyle: 'italic', cursor: 'pointer',
          }}>desfazer</button>
          <button style={{
            padding: '10px 26px', color: S.isDark ? S.bg : '#fff', border: 'none', borderRadius: 999,
            background: `linear-gradient(110deg, ${S.azul}, ${S.verde} 55%, ${S.rosa})`,
            fontFamily: 'inherit', fontSize: 14, fontWeight: 500, letterSpacing: '0.03em',
            boxShadow: `0 6px 22px ${S.azul}${Math.round(S.glowStrength * 100).toString(16).padStart(2,'0')}, 0 2px 6px ${S.rosa}33`,
            cursor: 'pointer',
          }}>◌ Nova panela</button>
        </div>
      </footer>
    </div>
  );
}

function OpalaOrbe({ S, size = 12 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: `conic-gradient(from 0deg, ${S.azul}, ${S.verde}, ${S.rosa}, ${S.dourado}, ${S.azul})`,
      boxShadow: `0 0 8px ${S.azul}88`,
      flexShrink: 0,
    }} />
  );
}

function H6({ S, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingBottom: 6 }}>
      <OpalaOrbe S={S} size={11} />
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 400, color: S.ink, letterSpacing: '-0.02em' }}>{children}</h2>
    </div>
  );
}

function Id6_Panela({ boca, panela, now, S }) {
  if (!panela) {
    return (
      <div style={{
        minHeight: 220, borderRadius: 18,
        border: `1px dashed ${S.linhaSoft}`,
        background: S.isDark ? `${S.surface}60` : `${S.surface}a0`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10,
        color: S.inkFaint,
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase' }}>Boca {boca}</div>
        <div style={{ fontSize: 30, color: S.linhaSoft }}>◌</div>
        <div style={{ fontSize: 13, fontStyle: 'italic' }}>nova panela</div>
      </div>
    );
  }

  const tempoMs = now - panela.entradaFogoEm;
  const volPct = Math.min(100, (panela.volumeAtualL / 120) * 100);
  const metaPct = Math.min(100, (panela.metaTiragem / 120) * 100);
  const tipo = panela.proxTiragem.tipo;
  const corA = tipo === 'daime' ? S.rosa : tipo === 'cozimento' ? S.azul : S.dourado;
  const corB = tipo === 'daime' ? S.dourado : tipo === 'cozimento' ? S.verde : S.rosa;
  const corC = tipo === 'daime' ? S.azul : tipo === 'cozimento' ? S.rosa : S.verde;

  return (
    <article style={{
      minHeight: 220,
      background: S.surface,
      border: `1px solid ${S.linhaSoft}`,
      borderRadius: 18,
      padding: '16px 18px 18px',
      position: 'relative', overflow: 'hidden',
      boxShadow: S.isDark
        ? `0 2px 10px ${corA}28, 0 16px 40px ${corB}18, inset 0 1px 0 ${corA}22`
        : `0 2px 10px ${corA}14, 0 16px 40px ${corB}10`,
    }}>
      {/* Reflexo iridescente topo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80,
        background: `linear-gradient(170deg, ${corA}22, ${corB}10 60%, transparent)`, pointerEvents: 'none' }} />
      {/* fio iridescente borda superior */}
      <div style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 1,
        background: `linear-gradient(90deg, transparent, ${corA}, ${corB}, ${corC}, transparent)` }} />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: S.inkFaint, fontWeight: 500 }}>Boca {boca}</span>
          <span style={{ fontSize: 18, fontWeight: 500, color: S.ink, letterSpacing: '-0.015em' }}>nº {panela.numero}</span>
        </div>
        <span style={{ fontSize: 13, color: S.inkSoft, fontVariantNumeric: 'tabular-nums', fontStyle: 'italic' }}>
          {fmtDuration(tempoMs)}
        </span>
      </div>

      <div style={{ marginBottom: 16, position: 'relative' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase', color: S.inkFaint, marginBottom: 3, fontWeight: 500 }}>vai tirar</div>
        <div style={{
          fontSize: 34, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.028em',
          background: `linear-gradient(108deg, ${corA}, ${corB} 60%, ${corC})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', color: 'transparent',
        }}>
          {tiragemLabel(panela.proxTiragem)}
        </div>
        <div style={{ fontSize: 12.5, color: S.inkSoft, marginTop: 5, fontStyle: 'italic' }}>
          com {conteudoLabel(panela.conteudo).toLowerCase()}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: S.inkFaint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>volume</span>
          <span>
            <span style={{ fontSize: 24, fontWeight: 500, color: S.ink, letterSpacing: '-0.015em' }}>{panela.volumeAtualL}</span>
            <span style={{ fontSize: 11, color: S.inkFaint, marginLeft: 3, fontStyle: 'italic' }}>L</span>
          </span>
        </div>
        <div style={{ position: 'relative', height: 7, background: S.bg2, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%', width: `${volPct}%`,
            background: `linear-gradient(90deg, ${corA}, ${corB}, ${corC})`, borderRadius: 4,
            boxShadow: `0 0 8px ${corA}66`,
          }} />
          <div style={{ position: 'absolute', top: -2, left: `calc(${metaPct}% - 1px)`, width: 2, height: 11, background: S.ink, borderRadius: 1 }} />
        </div>
        <div style={{ fontSize: 10.5, color: S.inkFaint, marginTop: 5, fontStyle: 'italic', textAlign: 'right' }}>
          meta em {panela.metaTiragem} L
        </div>
      </div>
    </article>
  );
}

function Id6_Tonel({ tonel, S }) {
  const pct = (tonel.volumeL / tonel.capacidadeL) * 100;
  const tipo = tonel.tipo;
  const corA = tipo === 'daime' ? S.rosa : tipo === 'agua_forte' ? S.dourado : S.azul;
  const corB = tipo === 'daime' ? S.dourado : tipo === 'agua_forte' ? S.rosa : S.verde;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '9px 13px', background: S.surface, borderRadius: 11,
      border: `1px solid ${S.linhaSoft}`,
      boxShadow: S.isDark ? `inset 0 1px 0 ${corA}12` : 'none',
    }}>
      <div style={{ width: 22, height: 32, border: `1px solid ${corA}`, borderRadius: '2px 2px 6px 6px', position: 'relative', overflow: 'hidden', background: S.bg2 }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct}%`,
          background: `linear-gradient(180deg, ${corA}, ${corB})`, borderRadius: '0 0 5px 5px',
          boxShadow: `inset 0 1px 0 ${corA}cc`,
        }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: S.ink, letterSpacing: '-0.015em' }}>{tonelLabel(tonel)}</div>
        <div style={{ fontSize: 10, color: S.inkFaint, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>tonel {tonel.numero}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 22, fontWeight: 400, color: S.ink, fontVariantNumeric: 'tabular-nums' }}>{tonel.volumeL}</span>
        <span style={{ fontSize: 10.5, color: S.inkFaint, marginLeft: 2 }}>/{tonel.capacidadeL}</span>
      </div>
    </div>
  );
}

window.Id6_Opala = Id6_Opala;
window.OPALA_PALETAS = OPALA_PALETAS;
