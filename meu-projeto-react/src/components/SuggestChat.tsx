/*
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const INITIAL: Msg = {
    role: "assistant",
    content:
        "Olá! 👋 Me conta quantas pessoas confirmaram, o nível geral delas e por quanto tempo querem jogar — eu te sugiro quantos times montar, quantos por time e se vale mais um rodízio ou um campeonato.",
};

export function SuggestChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Msg[]>([INITIAL]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading]);

    async function send() {
        const text = input.trim();
        if (!text || loading) return;
        const next = [...messages, { role: "user" as const, content: text }];
        setMessages(next);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch("/api/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: next }),
            });
            if (!res.ok) {
                const errTxt = await res.text();
                let msg = "Não consegui responder agora. Tente novamente em instantes.";
                if (res.status === 429) msg = "Muitas requisições. Aguarde um momento e tente de novo.";
                if (res.status === 402) msg = "Créditos de IA esgotados nesta área de trabalho.";
                setMessages((m) => [...m, { role: "assistant", content: `${msg}${errTxt ? `\n\n_${errTxt.slice(0, 120)}_` : ""}` }]);
            } else {
                const data = (await res.json()) as { content: string };
                setMessages((m) => [...m, { role: "assistant", content: data.content || "(sem resposta)" }]);
            }
        } catch {
            setMessages((m) => [...m, { role: "assistant", content: "Erro de rede. Tente novamente." }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Abrir sugestões com IA"
                className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full text-primary-foreground shadow-[var(--shadow-glow)] flex items-center justify-center transition hover:scale-105"
                style={{ background: "var(--gradient-primary)" }}
            >
                {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>

            {open && (
                <div className="fixed bottom-24 right-5 z-40 w-[min(92vw,380px)] h-[min(70vh,560px)] rounded-2xl border border-border bg-card/95 backdrop-blur shadow-2xl flex flex-col overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2" style={{ background: "var(--gradient-primary)" }}>
                        <MessageCircle className="h-5 w-5 text-primary-foreground" />
                        <div className="flex-1">
                            <div className="font-display text-primary-foreground leading-none">Sugestão da IA</div>
                            <div className="text-[10px] text-primary-foreground/80">Powered by Google Gemini</div>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                                    m.role === "user"
                                        ? "ml-auto bg-primary text-primary-foreground"
                                        : "mr-auto bg-secondary/60 text-foreground border border-border"
                                }`}
                            >
                                {m.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="mr-auto flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" /> pensando…
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-border flex gap-2">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                    }
                }}
                rows={2}
                placeholder="Ex: somos 11, maioria intermediária…"
                className="flex-1 resize-none rounded-md bg-input/60 border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
                        <button
                            onClick={send}
                            disabled={loading || !input.trim()}
                            className="self-end h-9 w-9 rounded-md text-primary-foreground flex items-center justify-center disabled:opacity-40"
                            style={{ background: "var(--gradient-primary)" }}
                            aria-label="Enviar"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
*/


import { useState } from "react";
import { MessageCircle, X, Construction } from "lucide-react";

export function SuggestChat() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Abrir sugestões com IA"
                className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full text-primary-foreground shadow-[var(--shadow-glow)] flex items-center justify-center transition hover:scale-105"
                style={{ background: "var(--gradient-primary)" }}
            >
                {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </button>

            {open && (
                <div className="fixed bottom-24 right-5 z-40 w-[min(92vw,380px)] h-auto rounded-2xl border border-border bg-card/95 backdrop-blur shadow-2xl flex flex-col overflow-hidden">
                    <div className="px-4 py-3 border-b border-border flex items-center gap-2" style={{ background: "var(--gradient-primary)" }}>
                        <MessageCircle className="h-5 w-5 text-primary-foreground" />
                        <div className="flex-1">
                            <div className="font-display text-primary-foreground leading-none">Sugestão da IA</div>
                        </div>
                    </div>

                    <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                        <div className="p-3 rounded-full bg-secondary text-muted-foreground">
                            <Construction className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">Em construção</h3>
                            <p className="text-sm text-muted-foreground">
                                Estamos aprimorando a inteligência artificial para sugerir times melhores. Volte em breve!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}