/**
 * Stores Svelte reativos — ponte entre o repositório (liveQuery Dexie) e
 * componentes Svelte. Cada store é um `Readable<EstadoFornalha>` que
 * reprojeta quando qualquer evento do feitio muda.
 */

import { readable, type Readable } from 'svelte/store';
import type { EstadoFornalha } from '../domain/projecoes/fornalha';
import { projetarFornalha } from '../domain/projecoes/fornalha';
import type { RepositorioEventos } from '../infra/persistencia/repositorio-eventos';

const ESTADO_VAZIO: EstadoFornalha = { feitio: null, panelas: [], toneis: [] };

export function criarFornalhaStore(
  repo: RepositorioEventos,
  feitioId: string
): Readable<EstadoFornalha> {
  return readable<EstadoFornalha>(ESTADO_VAZIO, (set) => {
    const sub = repo.streamPorFeitio(feitioId).subscribe({
      next: (eventos) => set(projetarFornalha(eventos))
    });
    return () => sub.unsubscribe();
  });
}
