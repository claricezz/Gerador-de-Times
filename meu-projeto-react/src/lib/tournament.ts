import type { ResolvedPlayer } from "./players";

export interface Team {
  name: string;
  players: ResolvedPlayer[];
  rating: number;
}

export interface Match {
  a: string;
  b: string;
}

export interface BracketRound {
  name: string;
  matches: Match[];
}

export function roundRobin(teams: Team[]): Match[] {
  const matches: Match[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ a: teams[i].name, b: teams[j].name });
    }
  }
  return matches;
}

// Define quais fases mata-mata acontecem dado o nº de times classificados.
// Estratégia: pegar a maior potência de 2 <= nº de times. 2→Final, 4→Semi+Final,
// 8→Quartas+..., etc. Se houver "sobra", são eliminados na fase de grupos (todos contra todos).
export function knockoutStages(numTeams: number, p0: {
    includeEighths: boolean;
    includeQuarters: boolean;
    includeSemis: boolean
}): BracketRound[] {
  if (numTeams < 2) return [];
  let size = 1;
  while (size * 2 <= numTeams) size *= 2;
  const rounds: BracketRound[] = [];
  const labels: Record<number, string> = {
    16: "Oitavas",
    8: "Quartas",
    4: "Semifinal",
    2: "Final",
  };
  for (let s = size; s >= 2; s /= 2) {
    const label = labels[s] ?? `Rodada de ${s}`;
    const matches: Match[] = [];
    for (let i = 0; i < s / 2; i++) {
      matches.push({ a: `Classificado ${i * 2 + 1}`, b: `Classificado ${i * 2 + 2}` });
    }
    rounds.push({ name: label, matches });
  }
  return rounds;
}

// Rodízio: gera rodadas onde, a cada rodada, times jogam em pares e os demais descansam.
export function rotationSchedule(teams: Team[], rounds: number): BracketRound[] {
  const result: BracketRound[] = [];
  const n = teams.length;
  for (let r = 0; r < rounds; r++) {
    const offset = r % n;
    const ordered = [...teams.slice(offset), ...teams.slice(0, offset)];
    const matches: Match[] = [];
    for (let i = 0; i + 1 < ordered.length; i += 2) {
      matches.push({ a: ordered[i].name, b: ordered[i + 1].name });
    }
    const resting = ordered.length % 2 === 1 ? ordered[ordered.length - 1].name : null;
    result.push({
      name: `Rodada ${r + 1}${resting ? ` (descansa: ${resting})` : ""}`,
      matches,
    });
  }
  return result;
}
