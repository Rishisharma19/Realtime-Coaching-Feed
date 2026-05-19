"use client";

const categoryColors = {
  motivation: "#f7a26a",
  technique:  "#7c6af7",
  nutrition:  "#6af7c8",
  mindset:    "#f76a9a",
  recovery:   "#6ab5f7",
  general:    "#aaaacc",
};

const categoryEmoji = {
  motivation: "⚡",
  technique:  "🎯",
  nutrition:  "🥗",
  mindset:    "🧠",
  recovery:   "💧",
  general:    "📌",
};

export default function FeedCard({ feed, isNew }) {
  const color = categoryColors[feed.category] || "#aaaacc";
  const emoji = categoryEmoji[feed.category] || "📌";
  const date = new Date(feed.createdAt);
  const timeAgo = getTimeAgo(date);

  return (
    <article style={{
      background: "var(--surface)",
      border: `1px solid ${isNew ? color : "var(--border)"}`,
      borderRadius: "var(--radius)",
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
      animation: isNew ? "slideIn 0.4s ease both, glow 2s ease 0.4s" : "none",
      transition: "border-color 0.5s ease, box-shadow 0.5s ease",
      boxShadow: isNew ? `0 0 20px ${color}22` : "none",
    }}>
      {/* New badge */}
      {isNew && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: color, color: "#0a0a0f",
          fontSize: 10, fontWeight: 700, padding: "2px 8px",
          borderRadius: 99, fontFamily: "var(--font-display)",
          letterSpacing: "0.05em", textTransform: "uppercase",
        }}>NEW</span>
      )}

      {/* Category accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 3, background: color, borderRadius: "3px 0 0 3px",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Category icon */}
        <span style={{
          fontSize: 20, width: 40, height: 40, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: `${color}18`, borderRadius: 10, flexShrink: 0,
        }}>{emoji}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color, textTransform: "uppercase",
              letterSpacing: "0.08em", fontFamily: "var(--font-display)",
            }}>{feed.category}</span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>{timeAgo}</span>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: "var(--font-display)", fontSize: "1.05rem",
            fontWeight: 700, color: "var(--text)", marginBottom: 8, lineHeight: 1.3,
          }}>{feed.title}</h3>

          {/* Content */}
          <p style={{ color: "var(--text2)", fontSize: "0.9rem", lineHeight: 1.65 }}>
            {feed.content}
          </p>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>
              by <span style={{ color: "var(--text)", fontWeight: 500 }}>{feed.author}</span>
            </span>
            {feed.tags && feed.tags.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {feed.tags.slice(0, 3).map((tag) => (
                  <span key={tag} style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 99,
                    background: "var(--surface2)", color: "var(--text2)",
                    border: "1px solid var(--border)",
                  }}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function getTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
