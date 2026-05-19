"use client";
import Link from "next/link";
import { useFeed } from "../hooks/useFeed";
import FeedCard from "../components/FeedCard";
import SkeletonCard from "../components/SkeletonCard";
import StatusBar from "../components/StatusBar";

export default function HomePage() {
  const {
    feeds, pagination, loading, error,
    socketStatus, cacheStatus, connectedClients,
    newFeedIds, fetchFeeds,
  } = useFeed();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div className="container" style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "1.4rem", letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #7c6af7, #f7a26a)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>SYNCUP</h1>
            <p style={{ fontSize: 11, color: "var(--text2)", marginTop: 1 }}>Realtime Coaching Feed</p>
          </div>
          <Link href="/admin" style={{
            padding: "8px 18px", background: "var(--accent)",
            color: "#fff", borderRadius: 8, textDecoration: "none",
            fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)",
            letterSpacing: "0.02em", transition: "opacity 0.2s",
          }}>+ Post Update</Link>
        </div>
      </header>

      <main className="container" style={{ padding: "28px 24px" }}>
        {/* Status Bar */}
        <StatusBar
          socketStatus={socketStatus}
          cacheStatus={cacheStatus}
          connectedClients={connectedClients}
        />

        {/* Feed count */}
        <div style={{ margin: "24px 0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--text2)" }}>
            {pagination ? `${pagination.total} Updates` : "Latest Updates"}
          </h2>
          <button
            onClick={() => fetchFeeds()}
            disabled={loading}
            style={{
              background: "none", border: "1px solid var(--border)", borderRadius: 6,
              color: "var(--text2)", padding: "5px 12px", fontSize: 12,
              cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
              fontFamily: "var(--font-body)",
            }}
          >{loading ? "Loading…" : "↻ Refresh"}</button>
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            padding: "16px 20px", background: "#f76a6a18", border: "1px solid #f76a6a44",
            borderRadius: "var(--radius)", color: "#f76a6a", marginBottom: 16,
          }}>
            <strong>Error:</strong> {error}
            <button onClick={() => fetchFeeds()} style={{ marginLeft: 12, textDecoration: "underline", background: "none", border: "none", color: "#f76a6a", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}

        {/* Feed List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading && feeds.length === 0
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : feeds.length === 0
              ? (
                <div style={{
                  textAlign: "center", padding: "60px 24px",
                  color: "var(--text2)", border: "1px dashed var(--border)",
                  borderRadius: "var(--radius)",
                }}>
                  <p style={{ fontSize: "2rem", marginBottom: 12 }}>📭</p>
                  <p>No feed items yet.</p>
                  <Link href="/admin" style={{ color: "var(--accent)", textDecoration: "underline" }}>Post the first update →</Link>
                </div>
              )
              : feeds.map((feed) => (
                <FeedCard
                  key={feed._id}
                  feed={feed}
                  isNew={newFeedIds.has(feed._id)}
                />
              ))
          }
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchFeeds({ page: p })}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: p === pagination.page ? "var(--accent)" : "var(--surface)",
                  border: `1px solid ${p === pagination.page ? "var(--accent)" : "var(--border)"}`,
                  color: p === pagination.page ? "#fff" : "var(--text2)",
                  cursor: "pointer", fontSize: 13, fontFamily: "var(--font-display)",
                }}
              >{p}</button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
