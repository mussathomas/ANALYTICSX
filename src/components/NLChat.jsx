import { useState, useRef, useEffect } from "react";
import { callClaude, buildDataContext } from "../utils/data.js";

const CHIPS = [
  "What is the total of each numeric column?",
  "Which row has the highest value?",
  "Are there any trends in the data?",
  "Give me a 3-bullet summary of this dataset",
  "What is the average of all numeric columns?",
  "Find the top 3 rows by the first numeric column",
  "Are there any anomalies or outliers?",
  "Which category appears most often?",
];

export default function NLChat({ data, apiKey, toast }) {
  const [msgs, setMsgs] = useState([{ role: "system", text: "Ask anything about your data in plain English. Claude will answer using your actual dataset." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  if (!data) return (
    <div className="panel">
      <div className="empty"><div className="empty-icon">💬</div><div className="empty-msg">No Data Loaded</div><div className="empty-hint">Load a dataset from the Data Manager first.</div></div>
    </div>
  );

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    if (!apiKey) { toast("⚠ Set your API key in Settings first"); return; }
    setInput("");
    setMsgs(m => [...m, { role: "user", text: q }]);
    setLoading(true);

    try {
      const history = msgs
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      history.push({ role: "user", content: q });
      const reply = await callClaude(apiKey, history, buildDataContext(data));
      setMsgs(m => [...m, { role: "ai", text: reply }]);
    } catch (e) {
      setMsgs(m => [...m, { role: "ai", text: "⚠ Error: " + e.message }]);
      toast("⚠ " + e.message);
    }
    setLoading(false);
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clear = () => setMsgs([{ role: "system", text: "Conversation cleared. Ask anything about your data." }]);

  return (
    <div className="panel">
      <div className="section-title">Natural Language Query</div>
      <div className="section-sub">Ask questions in plain English. Claude reads your actual data rows and answers with precise numbers.</div>

      <div className="chip-row">
        {CHIPS.map(c => <button key={c} className="chip" onClick={() => send(c)}>{c}</button>)}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 14px 0" }}>
          <button className="btn btn-ghost btn-xs" onClick={clear}>Clear chat</button>
        </div>

        <div className="chat-messages">
          {msgs.map((m, i) => (
            <div key={i} className={`msg msg-${m.role}`}>{m.text}</div>
          ))}
          {loading && <div className="msg msg-ai msg-thinking">Analysing your data…</div>}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder={apiKey ? "e.g. What month had the highest profit?" : "Set your API key in Settings to enable AI chat"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={!apiKey}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim() || !apiKey}>
            {loading ? <div className="spinner" /> : "Send ↵"}
          </button>
        </div>
      </div>

      {!apiKey && (
        <div className="card" style={{ borderColor: "rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.05)" }}>
          <div style={{ fontSize: 13.5, color: "var(--amber)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠</span>
            <span>AI chat requires an Anthropic API key. Click <strong>Settings</strong> in the top-right to add yours.</span>
          </div>
        </div>
      )}
    </div>
  );
}
