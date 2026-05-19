export default function SkeletonCard() {
  const shimmerStyle = {
    background: "linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: 6,
  };
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "20px 24px",
    }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ ...shimmerStyle, width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...shimmerStyle, height: 12, width: "30%", marginBottom: 10 }} />
          <div style={{ ...shimmerStyle, height: 18, width: "80%", marginBottom: 10 }} />
          <div style={{ ...shimmerStyle, height: 12, width: "100%", marginBottom: 6 }} />
          <div style={{ ...shimmerStyle, height: 12, width: "70%" }} />
        </div>
      </div>
    </div>
  );
}
