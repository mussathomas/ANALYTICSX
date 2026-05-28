import { useState } from "react";

export default function SettingsModal({ onSave, onClose, currentKey }) {
  const [key, setKey] = useState(currentKey || "");
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testKey = async () => {
    if (!key.trim()) return;
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key.trim(),
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });
      if (res.ok) setTestResult("ok");
      else { const d = await res.json(); setTestResult("err:" + (d?.error?.message || res.status)); }
    } catch (e) { setTestResult("err:" + e.message); }
    setTesting(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">⚙ Settings</div>
        <div className="modal-sub">
          Enter your Anthropic API key to enable AI features (NL Query and AI Insights).
          Your key is stored only in your browser's localStorage and never sent anywhere except Anthropic's API.
        </div>

        <div className="modal-field">
          <label>Anthropic API Key</label>
          <div className="key-input-wrap">
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-ant-..."
              spellCheck={false}
              autoComplete="off"
            />
            <button className="key-toggle" onClick={() => setShow(s => !s)} title={show ? "Hide" : "Show"}>
              {show ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        {testResult && (
          <div style={{ marginBottom: 16 }}>
            {testResult === "ok"
              ? <span className="tag tag-green">✓ Key is valid and working</span>
              : <span className="tag tag-red">✗ {testResult.replace("err:", "")}</span>
            }
          </div>
        )}

        <div className="row">
          <button className="btn btn-ghost btn-sm" onClick={testKey} disabled={testing || !key.trim()}>
            {testing ? <><div className="spinner spinner-dark" />Testing…</> : "Test Key"}
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(key.trim()); onClose(); }} disabled={!key.trim()}>
            Save Key
          </button>
        </div>

        <div className="divider" />
        <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.65 }}>
          Get your API key at{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--accent2)", textDecoration: "none" }}>
            console.anthropic.com
          </a>
          {" "}→ API Keys. The free tier includes enough credits to explore the platform.
        </div>
      </div>
    </div>
  );
}
