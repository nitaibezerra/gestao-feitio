/**
 * Traduções e cores do domínio para o sistema visual Luz Branca.
 */

import type { TipoConteudo, TipoTiragem } from '../domain/entities/panela';
import type { Tonel } from '../domain/entities/tonel';

export function conteudoLabel(c: TipoConteudo | null): string {
  if (!c) return '—';
  if (c.tipo === 'agua') return 'Água';
  if (c.tipo === 'cozimento') return `${c.ordem}º cozimento`;
  return 'Água forte';
}

export function tiragemLabel(t: TipoTiragem): string {
  if (t.tipo === 'cozimento') return `${t.ordem}º cozimento`;
  if (t.tipo === 'daime') return `${t.grau}º grau`;
  return 'Água forte';
}

export function tonelLabel(t: Tonel): string {
  if (t.tipo === 'cozimento') return `${t.ordem}º Cozimento`;
  if (t.tipo === 'daime') return `Daime ${t.grau}º grau`;
  if (t.tipo === 'agua_forte') return 'Água Forte';
  if (t.tipo === 'apuracao') return 'Apuração';
  return "Mel d'Água";
}

export function tiragemCor(t: TipoTiragem | null | undefined): string {
  if (!t) return 'var(--ink-soft)';
  if (t.tipo === 'daime') return 'var(--daime)';
  if (t.tipo === 'cozimento') return 'var(--azul-profundo)';
  return 'var(--agua-forte)';
}

export function tonelCor(t: Tonel): string {
  if (t.tipo === 'daime') return 'var(--daime)';
  if (t.tipo === 'agua_forte') return 'var(--agua-forte)';
  return 'var(--azul)';
}

export function fmtDuracao(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`;
}

export function fmtHora(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
