import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SuggestChat } from "@/components/SuggestChat";
import {
    PLAYER_DB,
    WEIGHTS,
    computeRating,
    normalizeName,
    resolvePlayers,
    generateTeams,
    teamRating,
    type Level,
} from "@/lib/players";
import {
    knockoutStages,
    roundRobin,
    rotationSchedule,
    type Team,
} from "@/lib/tournament";
import logoAsset from "@/assets/logo.png";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "O Pior Vôlei de Belém — Gerador de Times" },
            { name: "description", content: "Sorteie times equilibrados e monte rodízios ou campeonatos para o vôlei." },
        ],
    }),
    component: Home,
});

const LEVELS = [
    { value: "iniciante", label: "Iniciante", weight: WEIGHTS.iniciante },
    { value: "regular", label: "Regular", weight: WEIGHTS.regular },
    { value: "bom", label: "Bom", weight: WEIGHTS.bom },
    { value: "excelente", label: "Excelente", weight: WEIGHTS.excelente },
];

type Mode = "rodizio" | "campeonato";

function Home() {
    const [numTeams, setNumTeams] = useState();
    const [minPerTeam, setMinPerTeam] = useState();
    const [maxPerTeam, setMaxPerTeam] = useState();
    const [namesText, setNamesText] = useState("");
    const [mode, setMode] = useState<Mode>("rodizio");
    const [includeEighths, setIncludeEighths] = useState(true);
    const [includeQuarters, setIncludeQuarters] = useState(true);
    const [includeSemis, setIncludeSemis] = useState(true);
    const [quarterRepechage, setQuarterRepechage] = useState(false);
    const [rotationRounds, setRotationRounds] = useState(5);
    const [manual, setManual] = useState<Record<string, Level>>({});
    const [generated, setGenerated] = useState<{
        teams: Team[];
        bench: { name: string; rating: number }[];
    } | null>(null);

    const names = useMemo(() => {
        return namesText
            .split(/[\n,•\-\u2022]/)
            .map((s) => s.trim())
            .filter(Boolean);
    }, [namesText]);

    const { resolved, missing } = useMemo(() => resolvePlayers(names, manual), [names, manual]);

    const minCap = numTeams * minPerTeam;
    const maxCap = numTeams * maxPerTeam;
    const validRange = minPerTeam <= maxPerTeam;
    const canGenerate =
        missing.length === 0 && validRange && resolved.length >= minCap;

    function handleGenerate() {
        const playersForDraft = resolved.map((p) => ({
            ...p,
            rating: p.rating + (Math.random() * 0.3 - 0.15),
        }));

        const { teams: raw, bench: rawBench } = generateTeams(playersForDraft, numTeams, minPerTeam, maxPerTeam);

        const teams: Team[] = raw.map((draftedPlayers, i) => {
            const originalPlayers = draftedPlayers.map(
                dp => resolved.find(rp => rp.name === dp.name)!
            );

            return {
                name: `Time ${i + 1}`,
                players: originalPlayers,
                rating: teamRating(originalPlayers),
            };
        });

        const bench = rawBench.map(dp => resolved.find(rp => rp.name === dp.name)!);

        setGenerated({ teams, bench });
    }

    const schedule = useMemo(() => {
        if (!generated) return null;
        if (mode === "rodizio") {
            return { type: "rodizio" as const, rounds: rotationSchedule(generated.teams, rotationRounds) };
        }
        return {
            type: "campeonato" as const,
            groupStage: roundRobin(generated.teams),
            knockout: knockoutStages(generated.teams.length, {
                includeEighths: includeEighths && generated.teams.length >= 6,
                includeQuarters: includeQuarters && generated.teams.length >= 5,
                includeSemis: includeSemis && generated.teams.length >= 3,
            }),
        };
    }, [generated, mode, rotationRounds, includeEighths, includeQuarters, includeSemis]);

    return (
        <div className="min-h-screen">
            <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-10 bg-background/60">
                <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={logoAsset} alt="Logo" className="h-14 w-14 rounded-lg shadow-[var(--shadow-glow)]" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-display text-foreground leading-none">Gerador de Times</h1>
                            <p className="text-xs md:text-sm text-muted-foreground">O Pior Vôlei de Belém · 2026</p>
                        </div>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
            Versão Beta
        </span>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-10">
                <section className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                    <Card title="1. Configuração">
                        <div className="grid grid-cols-3 gap-3">
                            <NumberField label="Times" value={numTeams} min={2} max={32} onChange={setNumTeams} />
                            <NumberField label="Mín. por time" value={minPerTeam} min={1} max={20} onChange={setMinPerTeam} />
                            <NumberField label="Máx. por time" value={maxPerTeam} min={1} max={20} onChange={setMaxPerTeam} />
                        </div>

                        <div className="mt-4">
                            <label className="text-sm font-medium mb-2 block">Formato</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(["rodizio", "campeonato"] as Mode[]).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => m === "campeonato" ? null : setMode(m)} // Bloqueia o clique no campeonato
                                        className={`px-4 py-2 rounded-md border text-sm font-medium transition relative ${
                                             mode === m
                                                ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                                                : "bg-secondary/40 border-border hover:bg-secondary"
                                        } ${m === "campeonato" ? "opacity-60 cursor-not-allowed" : ""}`}
                                    >
                                        {m === "rodizio" ? "Rodízio" : "Campeonato"}
                                        {m === "campeonato" && (
                                            <span className="absolute -top-2 -right-2 bg-muted text-[9px] px-1 rounded text-foreground font-bold">
            EM BREVE
        </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {mode === "rodizio" && (
                                <div className="mt-3">
                                    <NumberField label="Rodadas de rodízio" value={rotationRounds} min={1} max={20} onChange={setRotationRounds} />
                                </div>
                            )}
                            {mode === "campeonato" && (
                                <div className="mt-4 pt-4 border-t border-border/40">
                                    <p className="text-sm font-medium text-foreground mb-3">Eliminatórias (Mata-mata sempre tem Final)</p>
                                    <div className="space-y-3">
                                        <label className={`flex items-center gap-3 cursor-pointer group ${numTeams < 6 ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <input
                                                type="checkbox"
                                                disabled={numTeams < 6}
                                                checked={includeEighths}
                                                onChange={(e) => setIncludeEighths(e.target.checked)}
                                                className="w-4 h-4 rounded border-border bg-input cursor-pointer accent-primary transition-all disabled:opacity-50"
                                            />
                                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                Oitavas de Final
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-auto">A partir de 6 times</span>
                                        </label>
                                        <label className={`flex items-center gap-3 cursor-pointer group ${numTeams < 5 ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <input
                                                type="checkbox"
                                                disabled={numTeams < 5}
                                                checked={includeQuarters}
                                                onChange={(e) => setIncludeQuarters(e.target.checked)}
                                                className="w-4 h-4 rounded border-border bg-input cursor-pointer accent-primary transition-all disabled:opacity-50"
                                            />
                                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                Quartas de Final
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-auto">A partir de 5 times</span>
                                        </label>
                                        <label className={`flex items-center gap-3 cursor-pointer group ${numTeams < 3 ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <input
                                                type="checkbox"
                                                disabled={numTeams < 3}
                                                checked={includeSemis}
                                                onChange={(e) => setIncludeSemis(e.target.checked)}
                                                className="w-4 h-4 rounded border-border bg-input cursor-pointer accent-primary transition-all disabled:opacity-50"
                                            />
                                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                Semifinal
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-auto">A partir de 3 times</span>
                                        </label>
                                    </div>

                                    <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-md text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">Final</span> é obrigatória (últimos 2 times)
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title="2. Lista de pessoas" >
        <div className="mb-2">
            <p className="text-xs text-muted-foreground mb-2">Um nome por linha (ou separados por vírgula).</p>
            <textarea
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                rows={10}
                className="w-full h-auto rounded-md bg-input/60 border border-border p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>Reconhecidos: <strong className="text-foreground">{resolved.length}</strong></span>
                <span>Sem cadastro: <strong className={missing.length ? "text-destructive" : "text-foreground"}>{missing.length}</strong></span>
                <span>Vagas: <strong className="text-foreground">{minCap}–{maxCap}</strong></span>
            </div>

        </div>
                        {missing.length > 0 && (
                            <Card title="3. Defina o nível dos novatos">
                                <p className="text-xs text-muted-foreground mb-3">
                                    Pesos: Iniciante 1.0 · Regular 1.5 · Bom 2.0 · Excelente 2.5
                                </p>
                                <div className="space-y-2">
                                    {missing.map((name) => {
                                        const key = normalizeName(name);
                                        return (
                                            <div key={key} className="flex items-center gap-2">
                                                <span className="flex-1 text-sm truncate">{name}</span>
                                                <select
                                                    value={manual[key] ?? ""}
                                                    onChange={(e) =>
                                                        setManual((m) => ({ ...m, [key]: e.target.value as Level }))
                                                    }
                                                    className="bg-input border border-border rounded-md px-2 py-1 text-sm"
                                                >
                                                    <option value="">Selecione…</option>
                                                    {LEVELS.map((l) => (
                                                        <option key={l.value} value={l.value}>{l.label} ({l.weight})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}

                    </Card>


                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!canGenerate}
                        className="w-full py-3 rounded-md font-display text-lg tracking-wider text-primary-foreground transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                    >
                        Sortear Times
                    </button>
                    {!canGenerate && (
                        <p className="text-xs text-center text-muted-foreground -mt-3">
                            {missing.length > 0
                                ? "Defina o nível de todos os novatos."
                                : !validRange
                                    ? "Ajuste o intervalo mín./máx."
                                    : `Faltam ${minCap - resolved.length} jogador(es) para o mínimo de ${minPerTeam} por time.`}
                        </p>
                    )}
                </section>

                <section className="space-y-6">
                    {!generated ? (
                        <Card title="Resultado">
                            <div className="text-sm text-muted-foreground py-10 text-center">
                                Configure e clique em <strong className="text-foreground">Sortear Times</strong> para gerar o equilíbrio ideal.
                            </div>
                        </Card>
                    ) : (
                        <>
                            <Card title="Times sorteados">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {generated.teams.map((t) => (
                                        <div key={t.name} className="rounded-lg border border-border bg-secondary/30 p-4">
                                            <div className="flex items-baseline justify-between mb-2">
                                                <h3 className="font-display text-xl text-foreground">{t.name}</h3>
                                                <span className="text-xs text-muted-foreground">
                          média <strong className="text-accent-foreground">{t.rating.toFixed(2)}</strong>
                        </span>
                                            </div>
                                            <ul className="space-y-1 text-sm">
                                                {t.players.map((p) => (
                                                    <li key={p.name} className="flex justify-between">
                                                        <span>{p.name}{p.source === "manual" && <span className="text-[10px] ml-1 text-muted-foreground">(novo)</span>}</span>
                                                        <span className="text-muted-foreground tabular-nums">{p.rating.toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                {generated.bench.length > 0 && (
                                    <div className="mt-4 text-xs text-muted-foreground">
                                        Banco: {generated.bench.map((p) => p.name).join(", ")}
                                    </div>
                                )}
                            </Card>

                            {schedule?.type === "rodizio" && (
                                <Card title="Rodízio">
                                    <div className="space-y-3">
                                        {schedule.rounds.map((round, i) => (
                                            <div key={i}>
                                                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{round.name}</div>
                                                <div className="grid sm:grid-cols-2 gap-2">
                                                    {round.matches.map((m, k) => (
                                                        <MatchPill key={k} match={m} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {schedule?.type === "campeonato" && (
                                <>
                                    <Card title="Fase de grupos · Todos contra todos">
                                        <div className="grid sm:grid-cols-2 gap-2">
                                            {schedule.groupStage.map((m, k) => (
                                                <MatchPill key={k} match={m} />
                                            ))}
                                        </div>
                                    </Card>
                                    {schedule.knockout.length > 0 && (
                                        <Card title="Mata-mata">
                                            <BracketDisplay matches={schedule.knockout} teams={generated.teams} />
                                        </Card>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    <details className="rounded-lg border border-border bg-card/40 p-4 text-sm">
                        <summary className="cursor-pointer font-display text-lg">Base de dados ({PLAYER_DB.length})</summary>
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            {PLAYER_DB.map((p) => (
                                <div key={p.name} className="flex justify-between border-b border-border/40 py-1">
                                    <span>{p.name}</span>
                                    <span className="text-muted-foreground tabular-nums">{computeRating(p).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </details>
                </section>
            </main>

            <footer className="text-center text-xs text-muted-foreground py-6">
                O Pior Vôlei de Belém · 2026
            </footer>

            <SuggestChat />
        </div>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-5 shadow-lg">
            <h2 className="font-display text-xl mb-3 text-foreground">{title}</h2>
            {children}
        </div>
    );
}

function NumberField({
                         label, value, min, max, onChange,
                     }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
    return (
        <label className="block">
            <span className="text-sm font-medium block mb-1">{label}</span>
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
                className="w-full rounded-md bg-input/60 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
        </label>
    );
}

function MatchPill({ match }: { match: { a: string; b: string } }) {
    return (
        <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm">
            <span className="truncate">{match.a}</span>
            <span className="text-[10px] font-display tracking-widest text-accent-foreground/70">VS</span>
            <span className="truncate text-right">{match.b}</span>
        </div>
    );
}

interface BracketRound {
    name: string;
    matches: Array<{ a: string; b: string }>;
}

function BracketDisplay({ matches, teams }: { matches: BracketRound[]; teams: Team[] }) {
    // Ordena times por rating (seed) para o rodapé
    const seededTeams = [...teams].sort((a, b) => b.rating - a.rating);

    // Nova lógica de ordenação: Da esquerda (primeiras fases) para a direita (Final)
    // O uso de toLowerCase() e a busca por palavras-chave específicas resolve
    // o bug de "Oitavas de Final" ser tratada como "Final".
    const getRoundLevel = (roundName: string) => {
        const name = roundName.toLowerCase();
        if (name.includes("oitava")) return 1;
        if (name.includes("quarta")) return 2;
        if (name.includes("semi")) return 3;
        // Se não for nenhuma das acima, assumimos que é a grande Final
        return 4;
    };

    // Ordenamos as colunas de forma crescente (1, 2, 3, 4...)
    const sortedMatches = [...matches].sort((a, b) => getRoundLevel(a.name) - getRoundLevel(b.name));

    return (
        <div className="overflow-x-auto pb-4">
            {/* O flex-row-reverse do HTML original foi trocado para manter a ordem natural da esquerda para a direita */}
            <div className="flex gap-8 min-w-max p-2 items-center">
                {sortedMatches.map((round, roundIndex) => (
                    <div key={roundIndex} className="flex flex-col justify-around gap-6">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center w-32 mb-2">
                            {round.name}
                        </div>
                        <div className="flex flex-col justify-around flex-1 gap-6">
                            {round.matches.map((match, matchIndex) => (
                                <div key={matchIndex} className="relative flex flex-col gap-[2px] w-32 bg-secondary/20 p-2 rounded-md border border-border/50 shadow-sm">
                                    <div className="flex justify-between items-center bg-background/50 rounded px-2 py-1 text-xs">
                                        <span className="font-medium truncate pr-2">{match.a || "TBD"}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/50 rounded px-2 py-1 text-xs">
                                        <span className="font-medium truncate pr-2">{match.b || "TBD"}</span>
                                    </div>

                                    {/* Linha conectora apontando para a próxima fase (exceto na Final) */}
                                    {roundIndex < sortedMatches.length - 1 && (
                                        <div className="absolute top-1/2 -right-4 w-4 h-[2px] bg-border/50" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Seeding (por rating):</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                    {seededTeams.map((team, i) => (
                        <div key={team.name} className="flex items-center justify-between p-2 bg-secondary/10 border border-border/20 rounded-md">
                            <span className="font-bold text-primary mr-2">#{i + 1}</span>
                            <span className="text-muted-foreground truncate">{team.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}