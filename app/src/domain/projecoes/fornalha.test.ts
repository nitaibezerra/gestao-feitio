import { describe, it, expect } from 'vitest';
import { projetarFornalha } from './fornalha';
import { criarEvento } from '../events/tipos';
import type { Evento } from '../events/tipos';

/**
 * A projeção da fornalha é um fold sobre eventos. Dados um feitioId e uma
 * lista ordenada de eventos, retorna o estado atual: feitio, panelas, tonéis.
 *
 * Esses testes reproduzem os cenários exatos do tutorial (§7 e §11 do
 * tutorial-producao-daime.md) + casos do design (initialState em
 * Gestao de Feitio.html linhas 157-237).
 */

function at(iso: string): string {
  return new Date(iso).toISOString();
}

// helper: gera evento com momento específico (não o "now" do criarEvento)
function evt(feitioId: string, momento: string, novo: Parameters<typeof criarEvento>[1]): Evento {
  const e = criarEvento(feitioId, novo);
  return { ...e, momento: at(momento) };
}

describe('projetarFornalha — estado inicial', () => {
  it('sem eventos → estado vazio', () => {
    const r = projetarFornalha([]);
    expect(r.feitio).toBeNull();
    expect(r.panelas).toEqual([]);
    expect(r.toneis).toEqual([]);
  });

  it('evento feitio_iniciado → feitio criado', () => {
    const eventos: Evento[] = [
      evt('f1', '2026-04-20T07:00:00', {
        tipo: 'feitio_iniciado',
        payload: { nome: 'Feitio Abril/2026', feitor: 'José', qtdBocas: 5 }
      })
    ];
    const r = projetarFornalha(eventos);
    expect(r.feitio).toMatchObject({
      nome: 'Feitio Abril/2026',
      feitor: 'José',
      qtdBocas: 5
    });
  });
});

describe('projetarFornalha — cenário QUINTA do tutorial', () => {
  // "Foram batidas 2 panelas. As duas entraram com água.
  //  Ao fim da quinta, 3 tonéis de cozimento (1º, 2º, 3º) com 60 L cada."
  const feitioId = 'f1';
  const eventos: Evento[] = [
    evt(feitioId, '2026-04-16T07:00:00', {
      tipo: 'feitio_iniciado',
      payload: { nome: 'Feitio Abril', feitor: 'José', qtdBocas: 5 }
    }),
    // Montar panelas 1 e 2
    evt(feitioId, '2026-04-16T08:00:00', {
      tipo: 'panela_montada',
      payload: { panelaId: 'p1', numero: 1 }
    }),
    evt(feitioId, '2026-04-16T08:05:00', {
      tipo: 'panela_montada',
      payload: { panelaId: 'p2', numero: 2 }
    }),
    // Entrar no fogo com água
    evt(feitioId, '2026-04-16T08:10:00', {
      tipo: 'panela_entra_fogo',
      payload: { panelaId: 'p1', bocaNumero: 1, conteudo: { tipo: 'agua' }, volumeL: 60 }
    }),
    evt(feitioId, '2026-04-16T08:12:00', {
      tipo: 'panela_entra_fogo',
      payload: { panelaId: 'p2', bocaNumero: 2, conteudo: { tipo: 'agua' }, volumeL: 60 }
    }),
    // 1º cozimento de cada panela → tonel t-c1
    evt(feitioId, '2026-04-16T10:15:00', {
      tipo: 'tiragem_registrada',
      payload: {
        panelaId: 'p1',
        volumeL: 31,
        tonelDestinoId: 't-c1',
        tipoTiragem: { tipo: 'cozimento', ordem: 1 }
      }
    }),
    evt(feitioId, '2026-04-16T10:20:00', {
      tipo: 'tiragem_registrada',
      payload: {
        panelaId: 'p2',
        volumeL: 30,
        tonelDestinoId: 't-c1',
        tipoTiragem: { tipo: 'cozimento', ordem: 1 }
      }
    }),
    // Reposição de ambas com água
    evt(feitioId, '2026-04-16T10:25:00', {
      tipo: 'reposicao_registrada',
      payload: { panelaId: 'p1', conteudo: { tipo: 'agua' }, volumeL: 55 }
    }),
    evt(feitioId, '2026-04-16T10:30:00', {
      tipo: 'reposicao_registrada',
      payload: { panelaId: 'p2', conteudo: { tipo: 'agua' }, volumeL: 55 }
    }),
    // 2º cozimento de cada → tonel t-c2
    evt(feitioId, '2026-04-16T14:40:00', {
      tipo: 'tiragem_registrada',
      payload: {
        panelaId: 'p1',
        volumeL: 30,
        tonelDestinoId: 't-c2',
        tipoTiragem: { tipo: 'cozimento', ordem: 2 }
      }
    }),
    evt(feitioId, '2026-04-16T14:45:00', {
      tipo: 'tiragem_registrada',
      payload: {
        panelaId: 'p2',
        volumeL: 30,
        tonelDestinoId: 't-c2',
        tipoTiragem: { tipo: 'cozimento', ordem: 2 }
      }
    })
  ];

  it('panelas p1 e p2 existem com número e boca corretos', () => {
    const r = projetarFornalha(eventos);
    expect(r.panelas).toHaveLength(2);
    expect(r.panelas.find((p) => p.id === 'p1')?.numero).toBe(1);
    expect(r.panelas.find((p) => p.id === 'p2')?.numero).toBe(2);
  });

  it('p1 acumulou 2 tiragens (1º e 2º cozimento)', () => {
    const r = projetarFornalha(eventos);
    const p1 = r.panelas.find((p) => p.id === 'p1')!;
    expect(p1.tiragens).toHaveLength(2);
    expect(p1.tiragens[0].tipo).toEqual({ tipo: 'cozimento', ordem: 1 });
    expect(p1.tiragens[1].tipo).toEqual({ tipo: 'cozimento', ordem: 2 });
  });

  it('tonéis foram criados implicitamente pelas tiragens', () => {
    const r = projetarFornalha(eventos);
    const tc1 = r.toneis.find((t) => t.id === 't-c1')!;
    const tc2 = r.toneis.find((t) => t.id === 't-c2')!;
    expect(tc1.volumeL).toBe(61); // 31 + 30
    expect(tc2.volumeL).toBe(60); // 30 + 30
  });

  it('após reposição, conteúdo da panela muda para água e volume reseta', () => {
    const r = projetarFornalha(eventos);
    const p1 = r.panelas.find((p) => p.id === 'p1')!;
    // Última ação em p1 foi tiragem de 2º coz. Ela precisa de uma reposição
    // depois da 2ª tiragem para voltar a ser água. Não emitimos — então após
    // 2º coz p1 está aguardando reposição com conteúdo agua do último repor.
    expect(p1.conteudo).toEqual({ tipo: 'agua' });
  });
});

describe('projetarFornalha — cenário SEXTA (Daime 1º grau)', () => {
  // Panela 3 nova alimentada com 1º cozimento do tonel
  const feitioId = 'f1';
  const eventos: Evento[] = [
    evt(feitioId, '2026-04-17T07:00:00', {
      tipo: 'feitio_iniciado',
      payload: { nome: 'Feitio', feitor: 'J', qtdBocas: 5 }
    }),
    // Simula tonel 1º coz com 60L vindo da quinta
    evt(feitioId, '2026-04-17T07:30:00', {
      tipo: 'panela_montada',
      payload: { panelaId: 'px', numero: 99 }
    }),
    evt(feitioId, '2026-04-17T07:35:00', {
      tipo: 'panela_entra_fogo',
      payload: { panelaId: 'px', bocaNumero: 9, conteudo: { tipo: 'agua' }, volumeL: 60 }
    }),
    evt(feitioId, '2026-04-17T07:40:00', {
      tipo: 'tiragem_registrada',
      payload: {
        panelaId: 'px',
        volumeL: 60,
        tonelDestinoId: 't-c1',
        tipoTiragem: { tipo: 'cozimento', ordem: 1 }
      }
    }),
    // Panela 3 nova com 1º cozimento
    evt(feitioId, '2026-04-17T13:00:00', {
      tipo: 'panela_montada',
      payload: { panelaId: 'p3', numero: 3 }
    }),
    evt(feitioId, '2026-04-17T13:20:00', {
      tipo: 'panela_entra_fogo',
      payload: {
        panelaId: 'p3',
        bocaNumero: 3,
        conteudo: { tipo: 'cozimento', ordem: 1 },
        volumeL: 60
      }
    }),
    evt(feitioId, '2026-04-17T14:30:00', {
      tipo: 'tiragem_registrada',
      payload: {
        panelaId: 'p3',
        volumeL: 18,
        tonelDestinoId: 't-d1',
        tipoTiragem: { tipo: 'daime', grau: 1 }
      }
    })
  ];

  it('panela 3 registrou tiragem de Daime 1º grau', () => {
    const r = projetarFornalha(eventos);
    const p3 = r.panelas.find((p) => p.id === 'p3')!;
    expect(p3.tiragens).toHaveLength(1);
    expect(p3.tiragens[0].tipo).toEqual({ tipo: 'daime', grau: 1 });
    expect(p3.tiragens[0].volumeL).toBe(18);
  });

  it('tonel de Daime 1º grau tem 18L', () => {
    const r = projetarFornalha(eventos);
    const td1 = r.toneis.find((t) => t.id === 't-d1')!;
    expect(td1.volumeL).toBe(18);
    expect(td1.tipo).toBe('daime');
  });

  it('tonel de 1º cozimento foi consumido ao entrar na panela 3', () => {
    const r = projetarFornalha(eventos);
    const tc1 = r.toneis.find((t) => t.id === 't-c1')!;
    // 60 depositado (tiragem da panela px) - 60 usado pela panela 3 = 0
    expect(tc1.volumeL).toBe(0);
  });
});

describe('projetarFornalha — transição para água forte', () => {
  const feitioId = 'f1';

  function construirEventosCozimentoAteLimite(): Evento[] {
    const eventos: Evento[] = [
      evt(feitioId, '2026-04-16T07:00:00', {
        tipo: 'feitio_iniciado',
        payload: { nome: 'F', feitor: 'J', qtdBocas: 5 }
      }),
      evt(feitioId, '2026-04-16T08:00:00', {
        tipo: 'panela_montada',
        payload: { panelaId: 'p1', numero: 1 }
      }),
      evt(feitioId, '2026-04-16T08:10:00', {
        tipo: 'panela_entra_fogo',
        payload: { panelaId: 'p1', bocaNumero: 1, conteudo: { tipo: 'agua' }, volumeL: 60 }
      })
    ];

    // 6 ciclos de tiragem + reposição com água
    for (let i = 1 as 1 | 2 | 3 | 4 | 5 | 6; i <= 6; i++) {
      eventos.push(
        evt(feitioId, `2026-04-16T${String(10 + i).padStart(2, '0')}:00:00`, {
          tipo: 'tiragem_registrada',
          payload: {
            panelaId: 'p1',
            volumeL: 30,
            tonelDestinoId: `t-c${i}`,
            tipoTiragem: { tipo: 'cozimento', ordem: i as 1 | 2 | 3 | 4 | 5 | 6 }
          }
        }),
        evt(feitioId, `2026-04-16T${String(10 + i).padStart(2, '0')}:05:00`, {
          tipo: 'reposicao_registrada',
          payload: { panelaId: 'p1', conteudo: { tipo: 'agua' }, volumeL: 55 }
        })
      );
    }
    // 7ª tiragem agora é água forte
    eventos.push(
      evt(feitioId, '2026-04-16T18:00:00', {
        tipo: 'tiragem_registrada',
        payload: {
          panelaId: 'p1',
          volumeL: 28,
          tonelDestinoId: 't-af',
          tipoTiragem: { tipo: 'agua_forte' }
        }
      })
    );
    return eventos;
  }

  it('após 6 cozimentos + 1 água forte, panela está em ciclo de água forte', () => {
    const r = projetarFornalha(construirEventosCozimentoAteLimite());
    const p1 = r.panelas.find((p) => p.id === 'p1')!;
    expect(p1.emCicloAguaForte).toBe(true);
    expect(p1.tiragens).toHaveLength(7);
  });

  it('múltiplas tiragens de água forte sucessivas acumulam no mesmo tonel', () => {
    const base = construirEventosCozimentoAteLimite();
    const mais = [
      evt(feitioId, '2026-04-16T19:00:00', {
        tipo: 'reposicao_registrada',
        payload: { panelaId: 'p1', conteudo: { tipo: 'agua' }, volumeL: 55 }
      }),
      evt(feitioId, '2026-04-16T21:00:00', {
        tipo: 'tiragem_registrada',
        payload: {
          panelaId: 'p1',
          volumeL: 25,
          tonelDestinoId: 't-af',
          tipoTiragem: { tipo: 'agua_forte' }
        }
      }),
      evt(feitioId, '2026-04-16T22:00:00', {
        tipo: 'reposicao_registrada',
        payload: { panelaId: 'p1', conteudo: { tipo: 'agua' }, volumeL: 50 }
      }),
      evt(feitioId, '2026-04-17T01:00:00', {
        tipo: 'tiragem_registrada',
        payload: {
          panelaId: 'p1',
          volumeL: 22,
          tonelDestinoId: 't-af',
          tipoTiragem: { tipo: 'agua_forte' }
        }
      })
    ];
    const r = projetarFornalha([...base, ...mais]);
    const taf = r.toneis.find((t) => t.id === 't-af')!;
    expect(taf.volumeL).toBe(28 + 25 + 22);
    const p1 = r.panelas.find((p) => p.id === 'p1')!;
    expect(p1.emCicloAguaForte).toBe(true);
  });
});

describe('projetarFornalha — panela descartada', () => {
  it('panela descartada fica com estado descartada e desocupa boca', () => {
    const feitioId = 'f1';
    const eventos: Evento[] = [
      evt(feitioId, '2026-04-16T07:00:00', {
        tipo: 'feitio_iniciado',
        payload: { nome: 'F', feitor: 'J', qtdBocas: 5 }
      }),
      evt(feitioId, '2026-04-16T08:00:00', {
        tipo: 'panela_montada',
        payload: { panelaId: 'p1', numero: 1 }
      }),
      evt(feitioId, '2026-04-16T08:10:00', {
        tipo: 'panela_entra_fogo',
        payload: { panelaId: 'p1', bocaNumero: 1, conteudo: { tipo: 'agua' }, volumeL: 60 }
      }),
      evt(feitioId, '2026-04-17T10:00:00', {
        tipo: 'panela_descartada',
        payload: { panelaId: 'p1' }
      })
    ];
    const r = projetarFornalha(eventos);
    const p1 = r.panelas.find((p) => p.id === 'p1')!;
    expect(p1.estado).toBe('descartada');
    expect(p1.bocaAtual).toBeNull();
  });
});

describe('projetarFornalha — volume_ajustado e pausa/retomada', () => {
  it('volume_ajustado soma ao volume atual da panela', () => {
    const feitioId = 'f1';
    const eventos: Evento[] = [
      evt(feitioId, '2026-04-16T07:00:00', {
        tipo: 'feitio_iniciado',
        payload: { nome: 'F', feitor: 'J', qtdBocas: 5 }
      }),
      evt(feitioId, '2026-04-16T08:00:00', {
        tipo: 'panela_montada',
        payload: { panelaId: 'p1', numero: 1 }
      }),
      evt(feitioId, '2026-04-16T08:10:00', {
        tipo: 'panela_entra_fogo',
        payload: { panelaId: 'p1', bocaNumero: 1, conteudo: { tipo: 'agua' }, volumeL: 60 }
      }),
      evt(feitioId, '2026-04-16T09:00:00', {
        tipo: 'volume_ajustado',
        payload: { panelaId: 'p1', deltaL: 5 }
      })
    ];
    const r = projetarFornalha(eventos);
    const p1 = r.panelas.find((p) => p.id === 'p1')!;
    expect(p1.volumeAtualL).toBe(65);
  });

  it('tempo_pausado e tempo_retomado alternam a flag', () => {
    const feitioId = 'f1';
    const eventos: Evento[] = [
      evt(feitioId, '2026-04-16T07:00:00', {
        tipo: 'feitio_iniciado',
        payload: { nome: 'F', feitor: 'J', qtdBocas: 5 }
      }),
      evt(feitioId, '2026-04-16T08:00:00', {
        tipo: 'panela_montada',
        payload: { panelaId: 'p1', numero: 1 }
      }),
      evt(feitioId, '2026-04-16T08:10:00', {
        tipo: 'panela_entra_fogo',
        payload: { panelaId: 'p1', bocaNumero: 1, conteudo: { tipo: 'agua' }, volumeL: 60 }
      }),
      evt(feitioId, '2026-04-16T08:30:00', {
        tipo: 'tempo_pausado',
        payload: { panelaId: 'p1' }
      })
    ];
    const r = projetarFornalha(eventos);
    expect(r.panelas.find((p) => p.id === 'p1')!.tempoPausado).toBe(true);

    const maisEventos: Evento[] = [
      ...eventos,
      evt(feitioId, '2026-04-16T08:45:00', {
        tipo: 'tempo_retomado',
        payload: { panelaId: 'p1' }
      })
    ];
    const r2 = projetarFornalha(maisEventos);
    expect(r2.panelas.find((p) => p.id === 'p1')!.tempoPausado).toBe(false);
  });
});

describe('projetarFornalha — troca de bocas', () => {
  it('troca_bocas inverte as bocas das duas panelas, preservando conteúdo', () => {
    const feitioId = 'f1';
    const eventos: Evento[] = [
      evt(feitioId, '2026-04-16T07:00:00', {
        tipo: 'feitio_iniciado',
        payload: { nome: 'F', feitor: 'J', qtdBocas: 5 }
      }),
      evt(feitioId, '2026-04-16T08:00:00', {
        tipo: 'panela_montada',
        payload: { panelaId: 'p1', numero: 1 }
      }),
      evt(feitioId, '2026-04-16T08:05:00', {
        tipo: 'panela_montada',
        payload: { panelaId: 'p2', numero: 2 }
      }),
      evt(feitioId, '2026-04-16T08:10:00', {
        tipo: 'panela_entra_fogo',
        payload: { panelaId: 'p1', bocaNumero: 1, conteudo: { tipo: 'agua' }, volumeL: 60 }
      }),
      evt(feitioId, '2026-04-16T08:11:00', {
        tipo: 'panela_entra_fogo',
        payload: { panelaId: 'p2', bocaNumero: 2, conteudo: { tipo: 'agua' }, volumeL: 55 }
      }),
      evt(feitioId, '2026-04-16T09:00:00', {
        tipo: 'troca_bocas',
        payload: { panelaAId: 'p1', panelaBId: 'p2' }
      })
    ];
    const r = projetarFornalha(eventos);
    expect(r.panelas.find((p) => p.id === 'p1')!.bocaAtual).toBe(2);
    expect(r.panelas.find((p) => p.id === 'p2')!.bocaAtual).toBe(1);
    // volumes e conteúdo não mudam
    expect(r.panelas.find((p) => p.id === 'p1')!.volumeAtualL).toBe(60);
    expect(r.panelas.find((p) => p.id === 'p2')!.volumeAtualL).toBe(55);
  });
});
