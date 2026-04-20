// ============================================================
// IDENTIDADE 3 — LUZ BRANCA AMBIENTE
// Minimalismo sagrado: branco puro, azul muito claro, 
// muito espaço, tipografia geométrica suave.
// Sensação: ambiente de ritual em silêncio, hospital da alma.
// ============================================================

const id3Styles = {
  bg: '#fafaf8',              // quase branco com calor
  bg2: '#f2f2ef',
  surface: '#ffffff',
  ink: '#1c2024',
  inkSoft: '#5a6672',
  inkFaint: '#9aa3ab',
  azul: '#6b8cb8',            // azul firmamento claro
  azulClaro: '#b8cce0',
  azulProfundo: '#3a5a82',
  verde: '#7ba88c',
  daime: '#b87a7a',
  linhaSoft: '#e8e8e3',
};

function Id3_LuzBranca() {
  const now = useLiveNow();
  const S = id3Styles;
  const duracaoMs = now - FEITIO_DATA.feitio.inicio;

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: `
        radial-gradient(ellipse at 50% -20%, ${S.azulClaro}30, transparent 60%),
        ${S.bg}
      `,
      color: S.ink,
      fontFamily: "'Inter', -apple-system, sans-serif",
      fontWeight: 300,
      padding: '40px 56px',
      display: 'flex', flexDirection: 'column', gap: 40,
    }}>
      {/* Header — assimétrico, muito respiro */}
      <header style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 40 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: `1px solid ${S.azulClaro}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: S.azul, fontSize: 18, fontWeight: 300,
        }}>✦</div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: S.inkFaint }}>
            Feitio · Casinha da Sede
          </div>
          <h1 style={{
            margin: '4px 0 0', fontSize: 30, fontWeight: 300, letterSpacing: '-0.02em', color: S.ink,
          }}>
            {FEITIO_DATA.feitio.nome}
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 42, fontWeight: 200, letterSpacing: '-0.02em', color: S.ink, lineHeight: 1 }}>
            {fmtHora(now)}
          </div>
          <div style={{ fontSize: 11, color: S.inkFaint, letterSpacing: '0.15em', marginTop: 4, textTransform: 'uppercase' }}>
            Dia 2 · {fmtDuration(duracaoMs)}
          </div>
        </div>
      </header>

      {/* Créditos numa linha horizontal */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40,
        paddingBottom: 24, borderBottom: `1px solid ${S.linhaSoft}`,
      }}>
        <Field label="Feitor" value={FEITIO_DATA.feitio.feitor} S={S} />
        <Field label="Foguista" value={FEITIO_DATA.feitio.foguista} S={S} />
        <Field label="Bocas ao fogo" value={`${FEITIO_DATA.panelas.length} / ${FEITIO_DATA.fornalha.bocas}`} S={S} />
        <Field label="No tonel" value={`${FEITIO_DATA.toneis.reduce((a,t)=>a+t.volumeL,0)} L`} S={S} highlight />
      </div>

      {/* Fornalha */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 400, letterSpacing: '0.02em', color: S.ink }}>Fornalha</h2>
          <span style={{ fontSize: 11, color: S.inkFaint, letterSpacing: '0.15em', textTransform: 'uppercase' }}>panelas no fogo</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {Array.from({ length: FEITIO_DATA.fornalha.bocas }, (_, i) => i + 1).map(b => {
            const p = FEITIO_DATA.panelas.find(x => x.boca === b);
            return <Id3_Panela key={b} boca={b} panela={p} now={now} S={S} />;
          })}
        </div>
      </section>

      {/* Tonéis em linha horizontal */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 400, letterSpacing: '0.02em', color: S.ink }}>Tonéis</h2>
          <span style={{ fontSize: 11, color: S.inkFaint, letterSpacing: '0.15em', textTransform: 'uppercase' }}>colheita guardada</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 14 }}>
          {FEITIO_DATA.toneis.map(t => <Id3_Tonel key={t.numero} tonel={t} S={S} />)}
        </div>
      </section>

      {/* Rodapé minimalista */}
      <footer style={{
        marginTop: 'auto', paddingTop: 24, borderTop: `1px solid ${S.linhaSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 12, color: S.inkSoft }}>
          <span style={{ color: S.inkFaint, marginRight: 12, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 10 }}>último</span>
          {FEITIO_DATA.eventos[0].texto}
          <span style={{ color: S.inkFaint, marginLeft: 12 }}>{fmtHora(FEITIO_DATA.eventos[0].momento)}</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ padding: '10px 20px', background: 'transparent', color: S.inkSoft, border: `1px solid ${S.linhaSoft}`, borderRadius: 999, fontFamily: 'inherit', fontSize: 13, fontWeight: 400 }}>Desfazer</button>
          <button style={{ padding: '10px 24px', background: S.azulProfundo, color: '#fff', border: 'none', borderRadius: 999, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, letterSpacing: '0.02em' }}>Nova panela</button>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, value, S, highlight }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: S.inkFaint, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: highlight ? 26 : 18, fontWeight: highlight ? 300 : 400, color: highlight ? S.azulProfundo : S.ink, letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  );
}

function Id3_Panela({ boca, panela, now, S }) {
  if (!panela) {
    return (
      <div style={{
        minHeight: 200, borderRadius: 16,
        border: `1px dashed ${S.linhaSoft}`,
        background: S.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
        color: S.inkFaint,
      }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Boca {boca}</div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${S.linhaSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 200, color: S.inkFaint }}>+</div>
      </div>
    );
  }

  const tempoMs = now - panela.entradaFogoEm;
  const volPct = Math.min(100, (panela.volumeAtualL / 120) * 100);
  const metaPct = Math.min(100, (panela.metaTiragem / 120) * 100);
  const cor = panela.proxTiragem.tipo === 'daime' ? S.daime : panela.proxTiragem.tipo === 'cozimento' ? S.azul : S.verde;

  return (
    <article style={{
      minHeight: 200,
      background: S.surface,
      border: `1px solid ${S.linhaSoft}`,
      borderRadius: 16,
      padding: '16px 14px 14px',
      display: 'flex', flexDirection: 'column',
      boxShadow: `0 1px 2px rgba(40,60,90,0.04), 0 8px 24px rgba(40,60,90,0.03)`,
    }}>
      {/* topo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <span style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: S.inkFaint }}>Boca {boca}</span>
        <span style={{ fontSize: 11, color: S.inkSoft, fontVariantNumeric: 'tabular-nums' }}>{fmtDuration(tempoMs)}</span>
      </div>

      {/* número da panela gigante */}
      <div style={{ fontSize: 64, lineHeight: 0.85, fontWeight: 200, color: S.ink, letterSpacing: '-0.04em', marginBottom: 10 }}>
        {String(panela.numero).padStart(2, '0')}
      </div>

      {/* próxima tiragem */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: S.inkFaint, marginBottom: 2 }}>vai tirar</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: cor, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
          {tiragemLabel(panela.proxTiragem)}
        </div>
      </div>

      {/* volume anel circular */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Id3_Ring volPct={volPct} metaPct={metaPct} cor={cor} S={S} />
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 400, color: S.ink, letterSpacing: '-0.02em' }}>{panela.volumeAtualL}</span>
            <span style={{ fontSize: 10, color: S.inkFaint }}>L</span>
          </div>
          <div style={{ fontSize: 9, color: S.inkFaint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>meta {panela.metaTiragem}</div>
        </div>
      </div>
    </article>
  );
}

function Id3_Ring({ volPct, metaPct, cor, S }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const metaAngle = (metaPct / 100) * 360 - 90;
  const mx = 20 + r * Math.cos(metaAngle * Math.PI / 180);
  const my = 20 + r * Math.sin(metaAngle * Math.PI / 180);
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r={r} fill="none" stroke={S.linhaSoft} strokeWidth="2" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round"
        strokeDasharray={`${(volPct/100) * c} ${c}`}
        transform="rotate(-90 20 20)" />
      <circle cx={mx} cy={my} r="2" fill={S.ink} />
    </svg>
  );
}

function Id3_Tonel({ tonel, S }) {
  const pct = (tonel.volumeL / tonel.capacidadeL) * 100;
  const cor = tonel.tipo === 'daime' ? S.daime : tonel.tipo === 'agua_forte' ? S.inkSoft : S.azul;
  return (
    <div style={{
      padding: 14, borderRadius: 14,
      background: S.surface,
      border: `1px solid ${S.linhaSoft}`,
      display: 'flex', flexDirection: 'column', gap: 10,
      minHeight: 130,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: S.inkFaint }}>T{tonel.numero}</span>
        <span style={{ fontSize: 20, fontWeight: 300, color: S.ink, letterSpacing: '-0.02em' }}>{tonel.volumeL}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: S.ink, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
        {tonelLabel(tonel)}
      </div>
      {/* linha de volume */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ height: 3, background: S.linhaSoft, borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: cor, borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 9, color: S.inkFaint, marginTop: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {Math.round(pct)}% · {tonel.capacidadeL} L
        </div>
      </div>
    </div>
  );
}

window.Id3_LuzBranca = Id3_LuzBranca;
