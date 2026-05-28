import { useState, useEffect, useCallback } from "react";
import LandingPage from "./components/LandingPage.jsx";
import DataManager from "./components/DataManager.jsx";
import Computations from "./components/Computations.jsx";
import NLChat from "./components/NLChat.jsx";
import Visualizations from "./components/Visualizations.jsx";
import AIInsights from "./components/AIInsights.jsx";
import SettingsModal from "./components/SettingsModal.jsx";

const TABS = [
  { id: "data",    label: "Data Manager",  icon: "🗂" },
  { id: "compute", label: "Computations",  icon: "🔢" },
  { id: "chat",    label: "NL Query",      icon: "💬" },
  { id: "viz",     label: "Visualize",     icon: "📊" },
  { id: "insight", label: "AI Insights",   icon: "🤖" },
];

function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{message}</div>;
}

export default function App() {
  const [tab, setTab] = useState("data");
  const [data, setData] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("analytix_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  const showToast = useCallback(msg => { setToast(msg); }, []);
  const advanceToCompute = useCallback(() => setTab("compute"), []);
  const enterDashboard = useCallback(() => setShowLanding(false), []);

  const saveApiKey = key => {
    setApiKey(key);
    if (key) localStorage.setItem("analytix_api_key", key);
    else localStorage.removeItem("analytix_api_key");
    showToast(key ? "✓ API key saved" : "API key cleared");
  };

  // Persist dataset in sessionStorage so page refresh doesn't always clear it
  useEffect(() => {
    const saved = sessionStorage.getItem("analytix_data");
    if (saved) { try { setData(JSON.parse(saved)); } catch (_) {} }
  }, []);

  useEffect(() => {
    if (data) sessionStorage.setItem("analytix_data", JSON.stringify(data));
    else sessionStorage.removeItem("analytix_data");
  }, [data]);

  const aiAvailable = Boolean(apiKey);

  if (showLanding) {
    return <LandingPage onEnter={enterDashboard} />;
  }

  return (
    <div className="shell">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">📊</div>
          Analytics<span>X</span>
        </div>
        <div className="header-right">
          {data && <span className="tag tag-green" style={{ fontSize: 11 }}>✓ {data.name}</span>}
          <div className="api-status">
            <div className={`status-dot ${aiAvailable ? "ok" : "warn"}`} />
            {aiAvailable ? "AI ready" : "No API key"}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(true)}>⚙ Settings</button>
          <span className="badge">v1.0</span>
        </div>
      </header>

      {/* Nav */}
      <nav className="nav">
        {TABS.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>{t.label}
            {(t.id === "chat" || t.id === "insight") && !aiAvailable && (
              <span style={{ marginLeft: 4, fontSize: 10, color: "var(--amber)" }}>●</span>
            )}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main className="content">
        {tab === "data"    && <DataManager data={data} setData={setData} toast={showToast} onDataLoaded={advanceToCompute} />}
        {tab === "compute" && <Computations data={data} setData={setData} toast={showToast} />}
        {tab === "chat"    && <NLChat data={data} apiKey={apiKey} toast={showToast} />}
        {tab === "viz"     && <Visualizations data={data} toast={showToast} />}
        {tab === "insight" && <AIInsights data={data} apiKey={apiKey} toast={showToast} />}
      </main>

      {/* Modals & toasts */}
      {showSettings && (
        <SettingsModal
          currentKey={apiKey}
          onSave={saveApiKey}
          onClose={() => setShowSettings(false)}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
