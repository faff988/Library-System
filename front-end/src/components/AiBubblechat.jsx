import { useState, useRef, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";

const initialMessages = [
  { id: 1, text: "Hi! I'm your AI assistant. How can I help today?", sender: "them", time: "9:41 AM" },
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
          {message.text}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1">{message.time}</span>
      </div>
    </div>
  );
}

export default function AiBubblechat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) setUnread(0);
  };

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const newMsg = {
      id: Date.now(),
      text: trimmed,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setDraft("");

    // Placeholder for a real AI reply — replace with your API call
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Thanks for your message! (connect this to your AI backend)",
          sender: "them",
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        },
      ]);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      {/* Chat panel */}
      {open && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white animate-[fadeIn_0.15s_ease-out]">
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
              onClick={toggleOpen}
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
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200 px-3 py-2 bg-white">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#055E83]"
            />
            <button
              onClick={sendMessage}
              className="p-2 rounded-full bg-[#055E83] text-white hover:bg-[#04486A] transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating launcher bubble */}
      <button
        onClick={toggleOpen}
        className="relative w-14 h-14 rounded-full bg-[#055E83] text-white shadow-xl flex items-center justify-center hover:bg-[#04486A] hover:scale-105 transition-all"
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