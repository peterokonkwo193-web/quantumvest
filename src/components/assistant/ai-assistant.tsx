"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { getAssistantReply, SUGGESTED_PROMPTS } from "@/lib/assistant/respond";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text:
    "Hi, I'm the QuantumVest assistant. Ask me anything about our investment plans, deposits, withdrawals, profits, or how to get the most out of your investment.",
};

function renderText(text: string) {
  // Render **bold** segments and preserve line breaks without dangerouslySetInnerHTML
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return (
      <span key={lineIdx} className="block">
        {parts.map((part, i) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={i} className="font-bold text-white">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  });
}

export function AIAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  if (isAuthPage) return null;

  function send(raw: string) {
    const text = raw.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    const reply = getAssistantReply(text);
    const delay = 350 + Math.min(reply.length * 6, 900);
    setTimeout(() => {
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", text: reply }]);
      setTyping(false);
    }, delay);
  }

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[32rem] w-[22rem] max-w-[92vw] flex-col overflow-hidden rounded-3xl border border-neon/20 bg-surface-container-lowest/95 shadow-[0_0_40px_rgba(198,255,0,0.15)] backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neon/30 bg-neon/10">
                <Bot className="h-5 w-5 text-neon" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">QuantumVest Assistant</p>
                <p className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Online · Investment guidance
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-on-surface-variant hover:text-white"
              aria-label="Close assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-neon text-black font-medium"
                      : "border border-white/10 bg-white/[0.04] text-on-surface-variant"
                  }`}
                >
                  {renderText(m.text)}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neon [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neon [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neon" />
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="rounded-full border border-neon/20 bg-neon/5 px-3 py-1.5 text-[11px] text-neon transition-colors hover:bg-neon/10"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-white/10 bg-white/[0.02] p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about plans, deposits, profits..."
              className="flex-1 rounded-xl border border-white/10 bg-surface-container-lowest px-3 py-2 text-sm text-white placeholder:text-on-surface-variant/60 focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/20"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neon text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex h-14 w-14 items-center justify-center rounded-full border border-neon/30 bg-neon text-black shadow-[0_0_30px_rgba(198,255,0,0.4)] transition-transform hover:scale-105"
        aria-label={open ? "Close assistant" : "Open investment assistant"}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <span className="relative flex items-center justify-center">
            <MessageCircle className="h-6 w-6" />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-black/70" />
          </span>
        )}
      </button>
    </div>
  );
}
