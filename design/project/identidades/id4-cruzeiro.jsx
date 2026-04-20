// ============================================================
// IDENTIDADE 4 — CRUZEIRO NOTURNO
// Azul noturno profundo com constelações sutis,
// branco luz, tipografia serifa alongada.
// Sensação: o firmamento visto da casinha de madrugada.
// ============================================================

const id4Styles = {
  bg: '#0a0f1e',              // azul noite profundo
  bg2: '#121830',
  bg3: '#1a2040',
  surface: '#161c36',
  ink: '#eef2ff',
  inkSoft: '#a8b2d4',
  inkFaint: '#6c7599',
  azul: '#6a8fd4',            // azul estrela
  azulClaro: '#a8c0e8',
  azulLuz: '#e0e8ff',
  dourado: '#e8c478',         // luz de lamparina
  verde: '#8ab89a',
  daime: '#d48a8a',
  linhaSoft: '#242c4e',
};

function Id4_Cruzeiro() {
  const now = useLiveNow();
  const S = id4Styles;
  const duracaoMs = now - FEITIO_DATA.feitio.inicio;

  // Deterministic stars
  const stars = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 70; i++) {
      const seed = Math.sin(i * 9873.23) * 10000;
      const x = ((seed - Math.floor(seed)) * 100);
      const seed2 = Math.sin(i * 3371.17) * 10000;
      const y = ((seed2 - Math.floor(seed2)) * 100);
      const seed3 = Math.sin(i * 1237.41) * 10000;
      const op = 0.2 + ((seed3 - Math.floor(seed3)) * 0.6);
      const r = 0.5 + ((seed - Math.floor(seed)) * 1.3);
      arr.push({ x, y, op, r });
    }
    return arr;
  }, []);

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: `
        radial-gradient(ellipse at 20% 15%, ${S.azul}25, transparent 45%),
        radial-gradient(ellipse at 85% 85%, ${S.dourado}14, transparent 50%),
        ${S.bg}
      `,
      color: S.ink,
      fontFamily: "'Cormorant Garamond', 'EB Garamond', Georgia, serif",
      padding: '34px 44px',
      display: 'flex', flexDirection: 'column', gap: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Estrelas */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.12} fill={S.azulLuz} opacity={s.op * 0.7} />
        ))}
        {/* Cruzeiro do Sul estilizado */}
        <g fill={S.dourado} opacity="0.85">
          <circle cx="78" cy="20" r="0.5" />
          <circle cx="82" cy="30" r="0.4" />
          <circle cx="75" cy="28" r="0.45" />
          <circle cx="80" cy="36" r="0.5" />
          <circle cx="73" cy="24" r="0.3" />
        </g>
        <g stroke={S.dourado} strokeWidth="0.08" opacity="0.4" fill="none">
          <path d="M 78 20 L 80 36 M 75 28 L 82 30" />
        </g>
      </svg>

      {/* Header */}
      <header style={{
        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 24,
        borderBottom: `1px solid ${S.linhaSoft}`, paddingBottom: 18, position: 'relative', zIndex: 1,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: S.azul, fontWeight: 500 }}>
            ✧ Feitio sob o Cruzeiro ✧
          </div>
          <h1 style={{ margin: '8px 0 0', fontSize: 54, fontWeight: 400, letterSpacing: '-0.025em', color: S.azulLuz, lineHeight: 1, fontStyle: 'italic' }}>
            {FEITIO_DATA.feitio.nome}
          </h1>
          <div style={{ marginTop: 10, fontSize: 15, color: S.inkSoft }}>
            feitor <strong style={{ color: S.ink, fontWeight: 500 }}>{FEITIO_DATA.feitio.feitor}</strong>
            <span style={{ margin: '0 10px', color: S.linhaSoft }}>·</span>
            foguista <strong style={{ color: S.ink, fontWeight: 500 }}>{FEITIO_DATA.feitio.foguista}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 78, lineHeight: 0.9, letterSpacing: '-0.03em', color: S.dourado, fontWeight: 300 }}>
            {fmtHora(now)}
          </div>
          <div style={{ fontSize: 12, color: S.inkSoft, letterSpacing: '0.2em', marginTop: 4, textTransform: 'uppercase' }}>
            sexta — dia 2
          </div>
          <div style={{ fontSize: 11, color: S.inkFaint, marginTop: 2, fontStyle: 'italic' }}>
            fogo aceso há {fmtDuration(duracaoMs)}
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 30, flex: 1, position: 'relative', zIndex: 1 }}>
        <section>
          <H4 S={S} icon="✦">Fornalha</H4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 18 }}>
            {Array.from({ length: FEITIO_DATA.fornalha.bocas }, (_, i) => i + 1).map(b => {
              const p = FEITIO_DATA.panelas.find(x => x.boca === b);
              return <Id4_Panela key={b} boca={b} panela={p} now={now} S={S} />;
            })}
          </div>
        </section>

        <section>
          <H4 S={S} icon="✧">Tonéis</H4>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FEITIO_DATA.toneis.map(t => <Id4_Tonel key={t.numero} tonel={t} S={S} />)}
          </div>
          <div style={{
            marginTop: 20, padding: '16px 18px',
            background: `linear-gradient(135deg, ${S.azul}22, ${S.bg3})`,
            border: `1px solid ${S.azul}44`, borderRadius: 2,
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.3em', color: S.azulClaro, textTransform: 'uppercase' }}>soma celeste</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 48, fontWeight: 300, letterSpacing: '-0.03em', color: S.azulLuz, fontStyle: 'italic' }}>
                {FEITIO_DATA.toneis.reduce((a,t) => a + t.volumeL, 0)}
              </span>
              <span style={{ fontSize: 14, color: S.inkSoft, fontStyle: 'italic' }}>litros guardados</span>
            </div>
          </div>
        </section>
      </div>

      {/* Rodapé */}
      <footer style={{
        borderTop: `1px solid ${S.linhaSoft}`, paddingTop: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 13, position: 'relative', zIndex: 1,
      }}>
        <div style={{ color: S.inkSoft, fontStyle: 'italic' }}>
          <span style={{ color: S.dourado, marginRight: 8 }}>✧</span>
          {FEITIO_DATA.eventos[0].texto}
          <span style={{ color: S.inkFaint, marginLeft: 10 }}>· {fmtHora(FEITIO_DATA.eventos[0].momento)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ padding: '9px 18px', background: 'transparent', color: S.inkSoft, border: `1px solid ${S.linhaSoft}`, borderRadius: 2, fontFamily: 'inherit', fontSize: 14, fontStyle: 'italic' }}>desfazer</button>
          <button style={{ padding: '9px 22px', background: S.dourado, color: S.bg, border: 'none', borderRadius: 2, fontFamily: 'inherit', fontSize: 14, fontWeight: 500, letterSpacing: '0.05em' }}>✧ Nova panela</button>
        </div>
      </footer>
    </div>
  );
}

function H4({ S, children, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, borderBottom: `0.5px solid ${S.linhaSoft}`, paddingBottom: 6 }}>
      <span style={{ color: S.dourado, fontSize: 14 }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 400, color: S.azulLuz, fontStyle: 'italic', letterSpacing: '-0.01em' }}>{children}</h2>
    </div>
  );
}

function Id4_Panela({ boca, panela, now, S }) {
  if (!panela) {
    return (
      <div style={{
        minHeight: 220, borderRadius: 2,
        border: `1px dashed ${S.linhaSoft}`,
        background: `${S.bg2}80`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10,
        color: S.inkFaint,
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Boca {boca}</div>
        <div style={{ fontSize: 20, color: S.linhaSoft }}>✦</div>
        <div style={{ fontSize: 13, fontStyle: 'italic' }}>nova panela</div>
      </div>
    );
  }

  const tempoMs = now - panela.entradaFogoEm;
  const volPct = Math.min(100, (panela.volumeAtualL / 120) * 100);
  const metaPct = Math.min(100, (panela.metaTiragem / 120) * 100);
  const cor = panela.proxTiragem.tipo === 'daime' ? S.daime : panela.proxTiragem.tipo === 'cozimento' ? S.azulClaro : S.dourado;

  return (
    <article style={{
      minHeight: 220,
      background: `linear-gradient(180deg, ${S.surface}, ${S.bg2})`,
      border: `1px solid ${S.linhaSoft}`,
      borderRadius: 2,
      padding: '14px 16px 16px',
      position: 'relative',
      boxShadow: `0 0 40px ${cor}10 inset`,
    }}>
      {/* Estrela guia (próxima tiragem) — no canto */}
      <div style={{ position: 'absolute', top: 12, right: 14, color: cor, fontSize: 11 }}>✧</div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `0.5px solid ${S.linhaSoft}`, paddingBottom: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: S.inkFaint }}>Boca {boca}</span>
          <span style={{ fontSize: 18, fontWeight: 400, color: S.azulClaro, fontStyle: 'italic' }}>nº {panela.numero}</span>
        </div>
        <span style={{ fontSize: 13, color: S.inkSoft, fontStyle: 'italic', fontVariantNumeric: 'tabular-nums', marginRight: 14 }}>
          {fmtDuration(tempoMs)}
        </span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: S.inkFaint, marginBottom: 2 }}>vai tirar</div>
        <div style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.025em', color: cor, fontStyle: 'italic' }}>
          {tiragemLabel(panela.proxTiragem)}
        </div>
        <div style={{ fontSize: 13, color: S.inkSoft, marginTop: 4, fontStyle: 'italic' }}>
          cozinhando com {conteudoLabel(panela.conteudo).toLowerCase()}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: S.inkFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>volume</span>
          <span>
            <span style={{ fontSize: 22, fontWeight: 400, color: S.azulLuz }}>{panela.volumeAtualL}</span>
            <span style={{ fontSize: 11, color: S.inkFaint, marginLeft: 3, fontStyle: 'italic' }}>L</span>
          </span>
        </div>
        <div style={{ position: 'relative', height: 4, background: S.linhaSoft, borderRadius: 2 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${volPct}%`, background: cor, borderRadius: 2, boxShadow: `0 0 8px ${cor}` }} />
          <div style={{ position: 'absolute', top: -3, left: `calc(${metaPct}% - 1px)`, width: 2, height: 10, background: S.dourado }} />
        </div>
        <div style={{ fontSize: 11, color: S.inkFaint, marginTop: 6, fontStyle: 'italic', textAlign: 'right' }}>
          meta ✧ {panela.metaTiragem} L
        </div>
      </div>
    </article>
  );
}

function Id4_Tonel({ tonel, S }) {
  const pct = (tonel.volumeL / tonel.capacidadeL) * 100;
  const cor = tonel.tipo === 'daime' ? S.daime : tonel.tipo === 'agua_forte' ? S.dourado : S.azulClaro;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 12px', background: `${S.bg2}90`, borderRadius: 2,
      borderLeft: `2px solid ${cor}`,
    }}>
      <div style={{ width: 22, height: 32, border: `1px solid ${cor}70`, borderRadius: '2px 2px 5px 5px', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct}%`, background: cor, borderRadius: '0 0 4px 4px', opacity: 0.75 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 400, color: S.azulLuz, fontStyle: 'italic', letterSpacing: '-0.01em' }}>{tonelLabel(tonel)}</div>
        <div style={{ fontSize: 10, color: S.inkFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>tonel {tonel.numero}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 20, fontWeight: 300, color: S.azulLuz, fontStyle: 'italic' }}>{tonel.volumeL}</span>
        <span style={{ fontSize: 10, color: S.inkFaint, marginLeft: 2 }}>/{tonel.capacidadeL}</span>
      </div>
    </div>
  );
}

window.Id4_Cruzeiro = Id4_Cruzeiro;
