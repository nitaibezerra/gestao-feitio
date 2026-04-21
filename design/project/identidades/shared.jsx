// ============================================================
// DADOS COMPARTILHADOS — usados por todas as identidades
// ============================================================
const { useState, useEffect } = React;

const NOW = new Date(2026, 3, 17, 14, 32, 0); // sexta 17/abr 14:32

const FEITIO_DATA = {
  feitio: {
    nome: "Feitio de Abril/2026",
    inicio: new Date(2026, 3, 16, 7, 0),
    feitor: "José",
    foguista: "Swidou",
    casinha: "Casinha da Sede",
  },
  fornalha: { bocas: 5 },
  panelas: [
    {
      id: "p1", numero: 1, boca: 1,
      conteudo: { tipo: "agua" },
      volumeAtualL: 58,
      metaTiragem: 40,
      entradaFogoEm: new Date(2026, 3, 17, 12, 40),
      proxTiragem: { tipo: "cozimento", grau: 1 },
    },
    {
      id: "p2", numero: 2, boca: 2,
      conteudo: { tipo: "cozimento", ordem: 2 },
      volumeAtualL: 72,
      metaTiragem: 45,
      entradaFogoEm: new Date(2026, 3, 17, 10, 15),
      proxTiragem: { tipo: "cozimento", grau: 3 },
    },
    {
      id: "p3", numero: 3, boca: 3,
      conteudo: { tipo: "cozimento", ordem: 3 },
      volumeAtualL: 48,
      metaTiragem: 30,
      entradaFogoEm: new Date(2026, 3, 17, 8, 45),
      proxTiragem: { tipo: "daime", grau: 1 },
    },
    {
      id: "p4", numero: 4, boca: 4,
      conteudo: { tipo: "cozimento", ordem: 4 },
      volumeAtualL: 36,
      metaTiragem: 20,
      entradaFogoEm: new Date(2026, 3, 17, 11, 20),
      proxTiragem: { tipo: "daime", grau: 2 },
    },
  ],
  toneis: [
    { numero: 1, tipo: "cozimento", ordem: 1, volumeL: 52, capacidadeL: 120 },
    { numero: 2, tipo: "cozimento", ordem: 2, volumeL: 40, capacidadeL: 120 },
    { numero: 3, tipo: "cozimento", ordem: 3, volumeL: 30, capacidadeL: 80 },
    { numero: 4, tipo: "cozimento", ordem: 4, volumeL: 18, capacidadeL: 80 },
    { numero: 5, tipo: "daime", grau: 1, volumeL: 24, capacidadeL: 60 },
    { numero: 6, tipo: "daime", grau: 2, volumeL: 12, capacidadeL: 60 },
    { numero: 7, tipo: "agua_forte", volumeL: 8, capacidadeL: 40 },
  ],
  eventos: [
    { id: "e1", tipo: "tiragem_registrada", momento: new Date(2026, 3, 17, 14, 10), texto: "Panela 3 — Tirou 18 L (3º cozimento) → Tonel 3" },
    { id: "e2", tipo: "reposicao", momento: new Date(2026, 3, 17, 13, 30), texto: "Panela 1 — Acrescentou 3 L" },
    { id: "e3", tipo: "tiragem_registrada", momento: new Date(2026, 3, 17, 11, 20), texto: "Panela 2 — Tirou 30 L (3º cozimento) → Tonel 3" },
  ],
};

// ---- Hooks ----
function useLiveNow() {
  const [now, setNow] = useState(new Date(NOW));
  useEffect(() => {
    const id = setInterval(() => setNow(d => new Date(d.getTime() + 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ---- Formatters ----
function fmtDuration(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`;
}
function fmtDurationLong(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
function fmtHora(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function conteudoLabel(c) {
  if (!c) return "—";
  if (c.tipo === "agua") return "Água";
  if (c.tipo === "cozimento") return `${c.ordem}º cozimento`;
  if (c.tipo === "agua_forte") return "Água forte";
  return "—";
}
function tiragemLabel(t) {
  if (t.tipo === "cozimento") return `${t.grau}º cozimento`;
  if (t.tipo === "daime") return `${t.grau}º grau`;
  if (t.tipo === "agua_forte") return "Água forte";
  return "—";
}
function tiragemShort(t) {
  if (t.tipo === "cozimento") return `${t.grau}ºC`;
  if (t.tipo === "daime") return `${t.grau}ºG`;
  if (t.tipo === "agua_forte") return "AF";
  return "—";
}
function tonelLabel(t) {
  if (t.tipo === "cozimento") return `${t.ordem}º Cozimento`;
  if (t.tipo === "daime") return `Daime ${t.grau}º grau`;
  if (t.tipo === "agua_forte") return "Água Forte";
  return "—";
}

// ---- Expose globally ----
Object.assign(window, {
  NOW, FEITIO_DATA,
  useLiveNow,
  fmtDuration, fmtDurationLong, fmtHora,
  conteudoLabel, tiragemLabel, tiragemShort, tonelLabel,
});
