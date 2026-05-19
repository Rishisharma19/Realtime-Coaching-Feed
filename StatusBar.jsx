"use client";
const statusConfig = {
  connected:     { color: "#6af7c8", label: "Live",         dot: true  },
  disconnected:  { color: "#f76a6a", label: "Offline",      dot: false },
  reconnecting:  { color: "#f7a26a", label: "Reconnecting", dot: true  },
  error:         { color: "#f76a6a", label: "Error",        dot: false },
};

export default function StatusBar({ socketStatus, cacheStatus, connectedClients }) {
  const cfg = statusConfig[socketStatus] || statusConfig.disconnected;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      padding: "8px 16px", background: "var(--surface2)", borderRadius: 8,
      border: "1px solid var(--border)", fontSize: 12, fontFamily: "var(--font-body)",
    }}>
      {/* Socket status */}
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: cfg.color, display: "inline-block",
          animation: cfg.dot ? "pulse 1.8s infinite" : "none",
        }} />
        <span style={{ color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
      </span>

      {/* Cache info */}
      {cacheStatus && (
        <span style={{ color: "var(--text2)", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ opacity: 0.5 }}>Cache:</span>
          <span style={{ color: cacheStatus.status === "HIT" ? "var(--accent3)" : "var(--text2)" }}>
            {cacheStatus.status}
          </span>
          {cacheStatus.backend !== "disabled" && (
            <span style={{ opacity: 0.5 }}>via {cacheStatus.backend}</span>
          )}
        </span>
      )}

      {/* Connected clients */}
      <span style={{ color: "var(--text2)", marginLeft: "auto" }}>
        <span style={{ opacity: 0.5 }}>Viewers: </span>
        <span style={{ color: "var(--text)", fontWeight: 500 }}>{connectedClients}</span>
      </span>
    </div>
  );
}
