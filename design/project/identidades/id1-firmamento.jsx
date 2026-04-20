// ============================================================
// IDENTIDADE 1 — FIRMAMENTO CLARO
// Papel envelhecido, azul firmamento, serifa clássica.
// Sensação: diário do feitor à luz do dia.
// ============================================================

const id1Styles = {
  // Tokens desta identidade
  paper: '#f5f1e8',         // papel manteiga
  paperDeep: '#ebe4d1',
  ink: '#2a3a4f',           // tinta azul-escura
  inkSoft: '#5a6b7f',
  inkFaint: '#8c9aa8',
  firmamento: '#3e6b8f',    // azul firmamento
  firmamentoSoft: '#7ba3c4',
  folha: '#5a7a3a',
  dourado: '#b8944a',       // como tinta ocre
  daime: '#8b3a3a',
  linha: '#d4c8a8',         // linha fina sépia
  linhaSoft: '#e6ddc3',
};

function Id1_Firmamento() {
  const now = useLiveNow();
  const S = id1Styles;
  const duracaoMs = now - FEITIO_DATA.feitio.inicio;

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: `
        radial-gradient(ellipse at 20% 10%, ${S.firmamentoSoft}15, transparent 50%),
        radial-gradient(circle at 85% 90%, ${S.folha}12, transparent 45%),
        ${S.paper}
      `,
      backgroundImage: `
        radial-gradient(ellipse at 20% 10%, ${S.firmamentoSoft}15, transparent 50%),
        radial-gradient(circle at 85% 90%, ${S.folha}12, transparent 45%),
        url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0.2  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`)}")
      `,
      color: S.ink,
      fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
      padding: '32px 40px',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* Top: cabeçalho manuscrito */}
      <header style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'end',
        gap: 24,
        borderBottom: `1.5px solid ${S.linha}`,
        paddingBottom: 20,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: S.inkFaint, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
            Livro do Feitio · Casinha da Sede
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 46, fontWeight: 500, letterSpacing: '-0.02em', color: S.ink, lineHeight: 1 }}>
            {FEITIO_DATA.feitio.nome}
          </h1>
          <div style={{ marginTop: 10, fontSize: 15, color: S.inkSoft, fontStyle: 'italic' }}>
            Feitor <strong style={{ color: S.ink, fontStyle: 'normal' }}>{FEITIO_DATA.feitio.feitor}</strong>
            <span style={{ margin: '0 10px', color: S.linha }}>·</span>
            Foguista <strong style={{ color: S.ink, fontStyle: 'normal' }}>{FEITIO_DATA.feitio.foguista}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 68, lineHeight: 0.95, letterSpacing: '-0.03em', color: S.firmamento, fontWeight: 500 }}>
            {fmtHora(now)}
          </div>
          <div style={{ fontSize: 13, color: S.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
            sexta-feira · 17 de abril
          </div>
          <div style={{ fontSize: 12, color: S.inkFaint, marginTop: 2, fontStyle: 'italic' }}>
            segundo dia de feitio — {fmtDuration(duracaoMs)} acesos
          </div>
        </div>
      </header>

      {/* Body: fornalha + tonéis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, flex: 1 }}>
        {/* Fornalha */}
        <section>
          <SectionTitle id1 numeral="I" titulo="Fornalha" subtitulo={`${FEITIO_DATA.panelas.length} de ${FEITIO_DATA.fornalha.bocas} bocas ao fogo`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 18 }}>
            {Array.from({ length: FEITIO_DATA.fornalha.bocas }, (_, i) => i + 1).map(b => {
              const p = FEITIO_DATA.panelas.find(x => x.boca === b);
              return <Id1_Boca key={b} boca={b} panela={p} now={now} S={S} />;
            })}
          </div>
        </section>

        {/* Tonéis */}
        <section>
          <SectionTitle id1 numeral="II" titulo="Tonéis" subtitulo="colheita do feitio" />
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEITIO_DATA.toneis.map(t => <Id1_Tonel key={t.numero} tonel={t} S={S} />)}
          </div>
          <div style={{ marginTop: 20, padding: '14px 16px', background: `${S.firmamento}0f`, border: `1px solid ${S.firmamento}33`, borderRadius: 4 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.firmamento }}>Soma geral</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 500, letterSpacing: '-0.02em', color: S.ink }}>
                {FEITIO_DATA.toneis.reduce((a, t) => a + t.volumeL, 0)}
              </span>
              <span style={{ fontSize: 14, color: S.inkSoft, fontStyle: 'italic' }}>litros ao total</span>
            </div>
          </div>
        </section>
      </div>

      {/* Rodapé — última anotação */}
      <footer style={{
        borderTop: `1.5px solid ${S.linha}`,
        paddingTop: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        fontSize: 13,
      }}>
        <div style={{ color: S.inkSoft, fontStyle: 'italic' }}>
          <span style={{ color: S.inkFaint, marginRight: 8 }}>última anotação</span>
          <span>{FEITIO_DATA.eventos[0].texto}</span>
          <span style={{ color: S.inkFaint, marginLeft: 10 }}>· {fmtHora(FEITIO_DATA.eventos[0].momento)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            padding: '8px 18px', background: 'transparent', color: S.inkSoft,
            border: `1px solid ${S.linha}`, borderRadius: 2,
            fontFamily: "'EB Garamond', serif", fontSize: 14, fontStyle: 'italic',
          }}>desfazer</button>
          <button style={{
            padding: '8px 22px', background: S.firmamento, color: S.paper,
            border: 'none', borderRadius: 2,
            fontFamily: "'EB Garamond', serif", fontSize: 14, letterSpacing: '0.05em',
          }}>+ Nova panela</button>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ numeral, titulo, subtitulo, id1 }) {
  const S = id1Styles;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderBottom: `0.5px solid ${S.linha}`, paddingBottom: 8 }}>
      <span style={{ fontSize: 22, color: S.firmamento, fontStyle: 'italic', letterSpacing: '0.05em' }}>{numeral}.</span>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-0.01em', color: S.ink }}>{titulo}</h2>
      <span style={{ fontSize: 13, color: S.inkFaint, fontStyle: 'italic', marginLeft: 4 }}>— {subtitulo}</span>
    </div>
  );
}

function Id1_Boca({ boca, panela, now, S }) {
  if (!panela) {
    return (
      <div style={{
        minHeight: 220, borderRadius: 4,
        border: `1.5px dashed ${S.linha}`,
        background: `${S.paper}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
        color: S.inkFaint,
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Boca {boca}</div>
        <div style={{ fontSize: 36, color: S.linha }}>+</div>
        <div style={{ fontSize: 13, fontStyle: 'italic' }}>montar nova panela</div>
      </div>
    );
  }

  const tempoMs = now - panela.entradaFogoEm;
  const volPct = Math.min(100, (panela.volumeAtualL / 120) * 100);
  const metaPct = Math.min(100, (panela.metaTiragem / 120) * 100);
  const proxCor = panela.proxTiragem.tipo === 'daime' ? S.daime : panela.proxTiragem.tipo === 'cozimento' ? S.firmamento : S.dourado;

  return (
    <article style={{
      minHeight: 220,
      background: S.paper,
      border: `1px solid ${S.linha}`,
      borderRadius: 4,
      padding: '14px 16px 16px',
      position: 'relative',
      boxShadow: `0 1px 0 ${S.linhaSoft}, 2px 3px 0 ${S.linha}30`,
    }}>
      {/* Header da panela */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `0.5px solid ${S.linhaSoft}`, paddingBottom: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: S.inkFaint }}>Boca {boca}</span>
          <span style={{ fontSize: 18, fontWeight: 500, color: S.ink, fontStyle: 'italic' }}>n.º {panela.numero}</span>
        </div>
        <span style={{ fontSize: 13, color: S.inkSoft, fontFamily: "'IBM Plex Mono', monospace", fontStyle: 'italic' }}>
          {fmtDuration(tempoMs)}
        </span>
      </div>

      {/* Nome — próxima tiragem */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: S.inkFaint, marginBottom: 2 }}>vai tirar</div>
        <div style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.02em', color: proxCor, fontStyle: 'italic' }}>
          {tiragemLabel(panela.proxTiragem)}
        </div>
        <div style={{ fontSize: 13, color: S.inkSoft, marginTop: 4, fontStyle: 'italic' }}>
          cozinhando com {conteudoLabel(panela.conteudo).toLowerCase()}
        </div>
      </div>

      {/* Volume — como régua impressa */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: S.inkFaint, letterSpacing: '0.08em' }}>volume</span>
          <span>
            <span style={{ fontSize: 22, fontWeight: 500, color: S.ink }}>{panela.volumeAtualL}</span>
            <span style={{ fontSize: 11, color: S.inkFaint, marginLeft: 3, fontStyle: 'italic' }}>L</span>
          </span>
        </div>
        <div style={{ position: 'relative', height: 6, background: S.linhaSoft, borderRadius: 1 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${volPct}%`, background: proxCor, borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: -4, left: `calc(${metaPct}% - 1px)`, width: 2, height: 14, background: S.ink }} />
        </div>
        <div style={{ fontSize: 11, color: S.inkFaint, marginTop: 6, fontStyle: 'italic', textAlign: 'right' }}>
          meta de tiragem em {panela.metaTiragem} L
        </div>
      </div>
    </article>
  );
}

function Id1_Tonel({ tonel, S }) {
  const pct = (tonel.volumeL / tonel.capacidadeL) * 100;
  const cor = tonel.tipo === 'daime' ? S.daime : tonel.tipo === 'agua_forte' ? S.dourado : S.firmamento;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: `${S.paperDeep}60`, borderRadius: 3, border: `0.5px solid ${S.linhaSoft}` }}>
      <div style={{ width: 22, height: 34, border: `1.2px solid ${cor}`, borderRadius: '2px 2px 6px 6px', position: 'relative', background: S.paper }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct}%`, background: cor, borderRadius: '0 0 5px 5px', opacity: 0.7 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: S.ink, letterSpacing: '-0.01em' }}>
          {tonelLabel(tonel)}
        </div>
        <div style={{ fontSize: 11, color: S.inkFaint, fontStyle: 'italic' }}>tonel n.º {tonel.numero}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 20, fontWeight: 500, color: S.ink }}>{tonel.volumeL}</span>
        <span style={{ fontSize: 10, color: S.inkFaint, marginLeft: 2, fontStyle: 'italic' }}>/{tonel.capacidadeL} L</span>
      </div>
    </div>
  );
}

window.Id1_Firmamento = Id1_Firmamento;
