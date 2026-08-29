"use client";

import { memo, useEffect, useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Bot, Loader2, RotateCcw, Send, X } from "lucide-react";

type DwiAiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ApiMessage = Omit<DwiAiMessage, "id">;

const GENERIC_ERROR = "Maaf, Dwi AI lagi ada gangguan. Coba lagi sebentar ya.";

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? "");
    if (match) {
      return (
        <SyntaxHighlighter
          language={match[1]}
          style={atomOneDark}
          customStyle={{
            margin: "0.75rem 0",
            borderRadius: 8,
            background: "var(--color-charcoal)",
            fontSize: "0.78rem",
          }}
          PreTag="div"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    }

    return (
      <code
        className="bg-cream-deep text-ink rounded px-1.5 py-0.5 font-mono text-[0.85em]"
        {...props}
      >
        {children}
      </code>
    );
  },
};

function withIds(messages: ApiMessage[]): DwiAiMessage[] {
  return messages.map((message) => ({ ...message, id: crypto.randomUUID() }));
}

const MessageBubble = memo(function MessageBubble({
  message,
  canAnimate,
  index,
}: {
  message: DwiAiMessage;
  canAnimate: boolean;
  index: number;
}) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} ${
        canAnimate ? "dwiai-bubble-enter" : ""
      }`}
      style={canAnimate ? { animationDelay: `${Math.min(index, 8) * 45}ms` } : undefined}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-ink text-cream" : "border-line bg-cream-deep text-ink border"
        }`}
        aria-hidden
      >
        {isUser ? (
          <span className="text-[10px] font-semibold">You</span>
        ) : (
          <Bot className="h-4 w-4" strokeWidth={1.5} />
        )}
      </span>
      <div
        className={`max-w-[min(82%,18rem)] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-ink text-cream rounded-tr-sm"
            : "border-line bg-card text-ink rounded-tl-sm border"
        }`}
      >
        <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
});

export default function DwiAiWidget({
  onClose,
  canAnimateMessages = true,
}: {
  onClose: () => void;
  canAnimateMessages?: boolean;
}) {
  const [messages, setMessages] = useState<DwiAiMessage[]>([]);
  const [assistantName, setAssistantName] = useState("Dwi AI");
  const [isThinking, setIsThinking] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamedContentRef = useRef("");
  const flushTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const response = await fetch("/api/dwiai/chat", { cache: "no-store" });
      const data = (await response.json()) as {
        assistantName?: string;
        isActive?: boolean;
        messages?: ApiMessage[];
      };
      if (cancelled) return;
      setAssistantName(data.assistantName || "Dwi AI");
      setIsActive(data.isActive !== false);
      setMessages(withIds(data.messages ?? []));
    }

    loadSession().catch(() => {
      if (!cancelled) {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: GENERIC_ERROR,
          },
        ]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: isThinking ? "auto" : "smooth",
    });
  }, [messages, isThinking]);

  useEffect(() => {
    return () => {
      if (flushTimerRef.current !== null) window.clearTimeout(flushTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
  }, [input]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isThinking || !isActive) return;

    const assistantId = crypto.randomUUID();
    streamedContentRef.current = "";
    setInput("");
    setIsThinking(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/dwiai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || GENERIC_ERROR);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const flushAssistantContent = () => {
        if (flushTimerRef.current !== null) {
          window.clearTimeout(flushTimerRef.current);
          flushTimerRef.current = null;
        }

        const content = streamedContentRef.current;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId ? { ...message, content } : message,
          ),
        );
      };

      const scheduleAssistantFlush = () => {
        if (flushTimerRef.current !== null) return;
        flushTimerRef.current = window.setTimeout(() => {
          flushTimerRef.current = null;
          const content = streamedContentRef.current;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId ? { ...message, content } : message,
            ),
          );
        }, 45);
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamedContentRef.current += chunk;
        scheduleAssistantFlush();
      }

      flushAssistantContent();
    } catch (error) {
      if (flushTimerRef.current !== null) {
        window.clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? { ...message, content: error instanceof Error ? error.message : GENERIC_ERROR }
            : message,
        ),
      );
    } finally {
      setIsThinking(false);
    }
  }

  async function clearChat() {
    if (!confirm("Reset percakapan dengan Dwi AI?")) return;
    const response = await fetch("/api/dwiai/clear", { method: "POST" });
    const data = (await response.json()) as { messages?: ApiMessage[] };
    setMessages(withIds(data.messages ?? []));
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="bg-cream text-ink flex h-full flex-col">
      <header className="border-line bg-card flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="font-rampart-one text-sm leading-none font-normal tracking-normal uppercase">
            {assistantName}
          </p>
          <p className="text-ink-soft mt-0.5 text-xs">
            {isActive ? "Online" : "Sedang tidak aktif"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearChat}
            title="Clear chat"
            aria-label="Clear chat"
            className="text-ink-soft hover:bg-cream-deep hover:text-ink flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.6} />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            aria-label="Close"
            className="text-ink-soft hover:bg-cream-deep hover:text-ink flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              canAnimate={canAnimateMessages}
              index={index}
            />
          ))}
          {isThinking ? (
            <div className="text-ink-soft flex items-center gap-2 pl-11 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
              Mengetik
            </div>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage();
        }}
        className="border-line bg-card flex items-end gap-2 border-t p-3"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={!isActive}
          placeholder={isActive ? "Tulis pesan..." : "Dwi AI sedang nonaktif"}
          aria-label="Message Dwi AI"
          className="border-line focus-visible:border-ink focus-visible:ring-gold-ink/35 bg-cream text-ink max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-[12px] border px-3.5 py-3 text-sm leading-relaxed outline-none focus-visible:ring-2 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking || !isActive}
          title="Send"
          aria-label="Send"
          className="bg-ink text-cream hover:bg-charcoal-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Send className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </form>
    </div>
  );
}
