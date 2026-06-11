// Pesos por categoria. A planilha usa "Regular" e "Excelente";
// mapeamos para Intermediário (2.0) e Avançado (2.5).
export const WEIGHTS = {
  iniciante: 1.0,
  regular: 1.5,
  bom: 2.0,
  excelente: 2.5,
} as const;

export type Level = keyof typeof WEIGHTS;

export interface PlayerStats {
  name: string;
  bom: number;
  iniciante: number;
  regular: number; // intermediário
  excelente: number; // avançado
}

// Dados extraídos da planilha enviada
export const PLAYER_DB: PlayerStats[] = [
  { name: "Ana P", bom: 1, iniciante: 17, regular: 3, excelente: 0 },
  { name: "Arthur Andrade", bom: 6, iniciante: 1, regular: 13, excelente: 1 },
  { name: "Arthur Mendes", bom: 4, iniciante: 0, regular: 1, excelente: 16 },
  { name: "Bruno", bom: 16, iniciante: 0, regular: 2, excelente: 3 },
  { name: "Charles", bom: 9, iniciante: 0, regular: 1, excelente: 11 },
  { name: "Clarice Mendes", bom: 14, iniciante: 0, regular: 5, excelente: 2 },
  { name: "Claudio", bom: 0, iniciante: 0, regular: 0, excelente: 21 },
  { name: "Daniel Aviz", bom: 2, iniciante: 12, regular: 7, excelente: 0 },
  { name: "Danny", bom: 3, iniciante: 5, regular: 13, excelente: 0 },
  { name: "Lucas", bom: 13, iniciante: 0, regular: 8, excelente: 0 },
  { name: "Maria", bom: 10, iniciante: 1, regular: 8, excelente: 2 },
  { name: "Rafael", bom: 6, iniciante: 0, regular: 1, excelente: 14 },
  { name: "Renato", bom: 9, iniciante: 0, regular: 0, excelente: 12 },
  { name: "Tânara", bom: 3, iniciante: 7, regular: 10, excelente: 1 },
  { name: "Vanessa", bom: 14, iniciante: 0, regular: 5, excelente: 2 },
  { name: "Vinicius", bom: 11, iniciante: 0, regular: 2, excelente: 8 },
  { name: "Luan", bom: 18, iniciante: 0, regular: 2, excelente: 1 },
  { name: "Leandro", bom: 8, iniciante: 3, regular: 8, excelente: 2 },
  { name: "Natália", bom: 4, iniciante: 9, regular: 8, excelente: 0 },
  { name: "Marcellia", bom: 0, iniciante: 15, regular: 6, excelente: 0 },
  { name: "Victor", bom: 1, iniciante: 12, regular: 8, excelente: 0 },
];

export function computeRating(p: PlayerStats): number {
  const total = p.bom + p.iniciante + p.regular + p.excelente;
  if (total === 0) return 0;
  const sum =
    p.bom * WEIGHTS.bom +
    p.iniciante * WEIGHTS.iniciante +
    p.regular * WEIGHTS.regular +
    p.excelente * WEIGHTS.excelente;
  return sum / total;
}

export function normalizeName(n: string) {
    return n
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

export interface ResolvedPlayer {
  name: string;
  rating: number;
  source: "db" | "manual";
}

export function resolvePlayers(
    names: string[],
    manualRatings: Record<string, Level>,
): { resolved: ResolvedPlayer[]; missing: string[] } {
    const nameIndex = new Map<string, PlayerStats>();
    const partialNameCount = new Map<string, number>();

    // 1. Mapeia nomes completos
    for (const player of PLAYER_DB) {
        nameIndex.set(normalizeName(player.name), player);

        // Conta quantas vezes cada parte aparece
        const parts = player.name.split(" ");
        for (const part of parts) {
            const key = normalizeName(part);
            if (key.length > 2) {
                partialNameCount.set(key, (partialNameCount.get(key) || 0) + 1);
            }
        }
    }

    const resolved: ResolvedPlayer[] = [];
    const missing: string[] = [];

    for (const raw of names) {
        const name = raw.trim();
        if (!name) continue;
        const key = normalizeName(name);

        // Tenta achar pelo nome completo primeiro
        if (nameIndex.has(key)) {
            const p = nameIndex.get(key)!;
            resolved.push({ name: p.name, rating: computeRating(p), source: "db" });
            continue;
        }

        // Se não achou, tenta pelo primeiro nome ou sobrenome
        // SÓ aceita se for único (evita "Arthur" ambíguo entre Andrade e Irmão)
        const candidates = PLAYER_DB.filter(p =>
            p.name.toLowerCase().includes(key)
        );

        if (candidates.length === 1) {
            const p = candidates[0];
            resolved.push({ name: p.name, rating: computeRating(p), source: "db" });
        } else if (manualRatings[key]) {
            resolved.push({ name, rating: WEIGHTS[manualRatings[key]], source: "manual" });
        } else {
            missing.push(name);
        }
    }
    return { resolved, missing };
}

// Distribui jogadores respeitando min/max por time. Times recebem tamanhos
// o mais iguais possível dentro do intervalo (ex.: 9 pessoas em 2 times → 5 e 4).
export function generateTeams(
  players: ResolvedPlayer[],
  numTeams: number,
  minPerTeam: number,
  maxPerTeam: number,
) {
  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const minCap = numTeams * minPerTeam;
  const maxCap = numTeams * maxPerTeam;

  // Quantos jogadores realmente entram (limitado pela capacidade máxima)
  const used = Math.min(sorted.length, maxCap);
  const picked = sorted.slice(0, used);
  const bench = sorted.slice(used);

  // Calcula tamanho-alvo de cada time: base + 1 para os primeiros `extra` times
  const base = Math.floor(used / numTeams);
  const extra = used % numTeams;
  const sizes = Array.from({ length: numTeams }, (_, i) =>
    Math.min(maxPerTeam, base + (i < extra ? 1 : 0)),
  );

  const teams: ResolvedPlayer[][] = Array.from({ length: numTeams }, () => []);
  // Snake draft pulando times que já atingiram a capacidade-alvo
  let idx = 0;
  let dir = 1;
  for (const p of picked) {
    let safety = 0;
    while (teams[idx].length >= sizes[idx] && safety < numTeams * 2) {
      idx += dir;
      if (idx >= numTeams) { idx = numTeams - 1; dir = -1; }
      else if (idx < 0) { idx = 0; dir = 1; }
      safety++;
    }
    teams[idx].push(p);
    idx += dir;
    if (idx >= numTeams) { idx = numTeams - 1; dir = -1; }
    else if (idx < 0) { idx = 0; dir = 1; }
  }

  const feasible = used >= minCap;
  return { teams, bench, feasible, minCap, maxCap };
}

export function teamRating(team: ResolvedPlayer[]) {
  if (!team.length) return 0;
  return team.reduce((s, p) => s + p.rating, 0) / team.length;
}
