"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

/* AI Chat — UI skeleton. Belum terhubung ke model apa pun: kirim pesan hanya
   memunculkan balasan placeholder. Ganti bagian bertanda TODO dengan panggilan
   API AI beneran (streaming/fetch) saat backend siap. */

type Role = "user" | "assistant";
type Message = { id: string; role: Role; text: string };

const STARTERS = [
  "Summarize the newest incoming messages",
  "Draft a description for a new project",
  "Suggest copy for the services page",
];

// TODO(ai-backend): ganti dengan panggilan ke model (mis. streaming dari route
// handler /api/ai-chat). Untuk sekarang balas dengan pesan placebo agar UI utuh.
function stubReply(): Message {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: "I'm not connected to a model yet — this is a UI preview. Wire up the marked TODO to get real answers.",
  };
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`fade-in flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-ink text-cream" : "border-line bg-cream-deep text-ink border"
        }`}
        aria-hidden
      >
        {isUser ? (
          <span className="text-[11px] font-semibold">You</span>
        ) : (
          <Bot className="h-4 w-4" strokeWidth={1.5} />
        )}
      </span>
      <div
        className={`max-w-[min(80%,32rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-ink text-cream rounded-tr-sm"
            : "border-line bg-card text-ink rounded-tl-sm border"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbaru.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text: trimmed };
    // TODO(ai-backend): kirim `trimmed` ke API, append balasan asli (stream).
    setMessages((prev) => [...prev, userMessage, stubReply()]);
    setInput("");
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col lg:h-[calc(100dvh-6rem)]">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">
            AI Chat
          </h1>
          <p className="text-ink-soft mt-2 text-sm">
            Your CMS assistant — a workspace for drafting.
          </p>
        </div>
        {messages.length > 0 ? (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="text-ink-soft hover:text-ink border-line hover:border-ink rounded-full border px-4 py-2 text-xs transition-colors"
          >
            Clear chat
          </button>
        ) : null}
      </header>

      <div className="border-line bg-cream-deep/40 rounded-card flex min-h-0 flex-1 flex-col border">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <span
                className="border-line bg-card mb-5 flex h-12 w-12 items-center justify-center rounded-full border"
                aria-hidden
              >
                <Sparkles className="text-gold-ink h-5 w-5" strokeWidth={1.5} />
              </span>
              <h2 className="font-display text-ink text-xl font-medium">How can I help?</h2>
              <p className="text-ink-soft mt-2 max-w-sm text-sm leading-relaxed">
                Ask about your content, draft copy, or brainstorm ideas. Try one of these to start.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {STARTERS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => send(prompt)}
                    className="border-line bg-card text-ink-soft hover:border-ink hover:text-ink rounded-full border px-3.5 py-2 text-xs transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((m) => (
                <Bubble key={m.id} message={m} />
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-line flex items-center gap-2 border-t p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message the assistant…"
            aria-label="Message the assistant"
            className="border-line focus-visible:border-ink focus-visible:ring-gold-ink/35 bg-card text-ink min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="bg-ink text-cream hover:bg-ink-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </form>
      </div>
    </div>
  );
}
