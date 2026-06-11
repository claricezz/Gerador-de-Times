import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM = `Você é um assistente especializado em organizar partidas de vôlei do grupo "O Pior Vôlei de Belém".

Sua tarefa é ajudar o usuário a decidir:
- Quantos times formar
- Quantas pessoas por time (mínimo e máximo)
- Se faz mais sentido jogar no formato Rodízio (poucos jogadores, alternando quem descansa) ou Campeonato (todos contra todos + mata-mata)

Regras práticas de vôlei:
- O ideal são 6 jogadores por time em quadra, mas 4 ou 5 funcionam bem em jogos casuais.
- Rodízio é melhor quando há poucos jogadores extras (1–3 sobrando).
- Campeonato exige pelo menos 3 times (idealmente 4+) para ter fase de grupos e mata-mata.
- Mata-mata (oitavas/quartas/semi/final) depende da quantidade de times.

Quando o usuário descrever os participantes, sugira de forma DIRETA e OBJETIVA:
1. Número de times
2. Mín e máx por time
3. Formato (Rodízio ou Campeonato)
4. Justificativa corta (1-2 linhas)

Seja amigável, breve e em português do Brasil.`;

// 🌟 CORREÇÃO: Alinhado com o caminho que o frontend chama
export const Route = createFileRoute("/api/suggest")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
                if (!apiKey) {
                    return new Response("Missing GOOGLE_GEMINI_API_KEY no arquivo .env", { status: 500 });
                }

                const { messages } = (await request.json()) as { messages: Msg[] };
                if (!Array.isArray(messages)) {
                    return new Response("messages required", { status: 400 });
                }

                // 🌟 CORREÇÃO: Endpoint real e funcional do Gemini 2.5 Flash-Lite
                const url = `https://googleapis.com{apiKey}`;

                const geminiContents = messages.map(msg => ({
                    role: msg.role === "assistant" ? "model" : "user",
                    parts: [{ text: msg.content }]
                }));

                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: geminiContents,
                        systemInstruction: {
                            parts: [{ text: SYSTEM }]
                        }
                    }),
                });

                if (!res.ok) {
                    const text = await res.text();
                    return new Response(text, { status: res.status });
                }

                const data = (await res.json()) as {
                    candidates?: { content?: { parts?: { text?: string }[] } }[];
                };

                const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                return Response.json({ content });
            },
        },
    },
});
