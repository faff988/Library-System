import { useState, useRef, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import api from "../utils/api";
import ReactMarkdown from 'react-markdown';

const initialMessages = [
  { id: 1, text: "Hi! I'm your AI assistant. How can I help today?", sender: "them", time: "9:41 AM" },
];

const FAQ_SUGGESTIONS = [
  "Which books should we add based on borrow counts?",
  "Recommend similar books to our most popular titles",
  "How many books are currently in our catalog?",
  "How many active members do we have?",
];

function ChatBubbleMsg({ message }) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
        <div
          className={`px-4 py-2 text-sm leading-relaxed shadow-sm ${
            isMe
              ? "bg-[#055E83] text-white rounded-2xl rounded-br-sm"
              : "bg-[#E8C110] text-slate-800 rounded-2xl rounded-bl-sm"
          }`}
        >
          {isMe ? (
            <span>{message.text}</span>
          ) : (
            <div
              className="
                ai-markdown text-[14px] leading-6
                [&>p]:mb-3 [&>p:last-child]:mb-0
                [&>ul]:my-2 [&>ul]:pl-5
                [&>li]:mb-1
                [&_strong]:font-semibold [&_em]:text-slate-600
                [&_hr]:my-4 [&_hr]:border-slate-300
              "
            >
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1">{message.time}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2">
      <div className="bg-[#E8C110] text-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
      </div>
    </div>
  );
}

export default function AiBubblechat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(1);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Dragging states & references
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isClick = useRef(true);

  // Initialize position to bottom-right corner
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 80,
      y: window.innerHeight - 80,
    });
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, sending]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    isClick.current = true;
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    isClick.current = false;

    const newX = Math.max(16, Math.min(window.innerWidth - 72, e.clientX - dragStartPos.current.x));
    const newY = Math.max(16, Math.min(window.innerHeight - 72, e.clientY - dragStartPos.current.y));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const toggleOpen = () => {
    if (!isClick.current) return;
    setOpen((prev) => !prev);
    if (!open) setUnread(0);
  };

  const timeNow = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const sendMessage = async (overrideText) => {
    const trimmed = (overrideText ?? draft).trim();
    if (!trimmed || sending) return;

    const historyForRequest = messages.map((m) => ({ sender: m.sender, text: m.text }));

    const newMsg = { id: Date.now(), text: trimmed, sender: "me", time: timeNow() };
    setMessages((prev) => [...prev, newMsg]);
    setDraft("");
    setSending(true);

    try {
      const response = await api.post("/chat", { message: trimmed, history: historyForRequest });
      const reply = response.data?.data?.reply || "Sorry, I didn't get a response. Please try again.";
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: reply, sender: "them", time: timeNow() }]);
      if (!open) setUnread((u) => u + 1);
    } catch (err) {
      console.error("AI chat request failed:", err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: backendMessage || "Sorry, something went wrong reaching the AI assistant.", sender: "them", time: timeNow() },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Determine dynamic placement based on bubble position relative to screen center
  const isTopHalf = position.y < window.innerHeight / 2;
  const isLeftHalf = position.x < window.innerWidth / 2;

  // Dynamic Tailwind positioning classes for the panel
  const verticalClass = isTopHalf ? "top-16 mt-2" : "bottom-16 mb-2";
  const horizontalClass = isLeftHalf ? "left-0" : "right-0";

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className="flex flex-col items-end z-50 touch-none"
    >
      {/* Dynamic Chat Panel */}
      {open && (
        <div
          className={`absolute ${verticalClass} ${horizontalClass} w-80 sm:w-96 h-[500px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white animate-[fadeIn_0.15s_ease-out]`}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#055E83] text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">AI Assistant</p>
                <p className="text-[11px] text-white/70 mt-0.5">Online now</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-50">
            {messages.map((m) => (
              <ChatBubbleMsg key={m.id} message={m} />
            ))}
            {sending && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && !sending && (
            <div className="flex gap-2 overflow-x-auto px-3 pt-2 pb-1 bg-white border-t border-slate-100">
              {FAQ_SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="shrink-0 text-xs font-medium text-[#055E83] bg-[#EBF4F8] hover:bg-[#DCEAF3] transition-colors px-3 py-1.5 rounded-full whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-slate-200 px-3 py-2 bg-white">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              disabled={sending}
              className="flex-1 resize-none rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#055E83] disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage()}
              disabled={sending}
              className="p-2 rounded-full bg-[#055E83] text-white hover:bg-[#04486A] transition-colors shrink-0 disabled:opacity-60"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating launcher bubble */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={toggleOpen}
        className="relative w-14 h-14 rounded-full bg-[#055E83] text-white shadow-xl flex items-center justify-center hover:bg-[#04486A] transition-transform select-none cursor-grab active:cursor-grabbing"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={24} /> : <Bot size={26} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center border-2 border-white">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}