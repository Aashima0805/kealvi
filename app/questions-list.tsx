"use client";
import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
  created_at: string;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  async function refineQuestion() {
    if (!draft.trim()) return;
    const res = await fetch("/api/refine-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: draft }),
    });
    const data = await res.json();
    setDraft(data.refined.trim());
    showToast("Question refined! ✨");
  }

  async function submit() {
    if (!draft.trim()) return;
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    const created = await res.json();
    if (!res.ok) { showToast(created.error); return; }
    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);
    setDraft("");
    showToast("Question posted! 🎉");
  }

  async function upvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) => q.id === id ? { ...q, votes: q.votes + 1 } : q)
    );
    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });
    if (!res.ok) {
      setQuestions((qs) =>
        qs.map((q) => q.id === id ? { ...q, votes: q.votes - 1 } : q)
      );
      showToast("Already voted!");
    }
  }

  async function deleteQuestion(id: string) {
    const res = await fetch(`/api/questions/${id}/delete`, { method: "DELETE" });
    if (!res.ok) { showToast("Delete failed"); return; }
    setQuestions((qs) => qs.filter((q) => q.id !== id));
    showToast("Deleted.");
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/questions/${id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: editText }),
    });
    const data = await res.json();
    if (!res.ok) { showToast("Update failed"); return; }
    setQuestions((qs) =>
      qs.map((q) => q.id === id ? { ...q, body: data.body } : q)
    );
    setEditingId(null);
    setEditText("");
    showToast("Updated!");
  }

  async function loadMore() {
    setLoading(true);
    const res = await fetch(`/api/questions?offset=${questions.length}`);
    const data = await res.json();
    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  async function askAI(id: string, question: string) {
    if (aiAnswers[id]) {
      setAiAnswers((prev) => { const u = { ...prev }; delete u[id]; return u; });
      return;
    }
    setLoadingAI(id);
    const res = await fetch("/api/ai-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAiAnswers((prev) => ({ ...prev, [id]: data.answer }));
    setLoadingAI(null);
    showToast("AI answered! 🤖");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  const fmt = (s: string) =>
    new Date(s).toLocaleString("en-IN", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div style={{ paddingBottom: "60px" }}>

      {!hydrated && (
        <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
          Loading interactivity…
        </p>
      )}

      {/* Ask bar */}
      <SectionTitle>Ask a question</SectionTitle>

      <div style={{ position: "relative", marginBottom: "16px" }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="What's on your mind? Ask anything…"
          rows={2}
          style={{
            width: "100%",
            background: "#12121A",
            border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: "16px",
            padding: "16px 160px 16px 20px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "15px",
            color: "#F0EFF8",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#FF4D6D")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.13)")}
        />
        <div style={{
          position: "absolute", bottom: "14px", right: "14px",
          display: "flex", gap: "8px",
        }}>
          <button
            onClick={refineQuestion}
            style={{
              padding: "7px 14px", borderRadius: "9px", fontSize: "12.5px",
              fontWeight: 500, cursor: "pointer",
              border: "1px solid rgba(123,97,255,0.35)",
              background: "rgba(123,97,255,0.12)", color: "#a99fff",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s",
            }}
          >✨ Refine</button>
          <button
            onClick={submit}
            style={{
              padding: "7px 18px", borderRadius: "9px", fontSize: "12.5px",
              fontWeight: 600, cursor: "pointer", border: "none",
              background: "linear-gradient(135deg, #FF4D6D, #ff6b35)",
              color: "#fff", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.18s",
            }}
          >Ask →</button>
        </div>
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search questions…"
        style={{
          width: "100%",
          background: "#12121A",
          border: "1px solid rgba(255,255,255,0.13)",
          borderRadius: "12px",
          padding: "11px 16px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          color: "#F0EFF8",
          outline: "none",
          marginBottom: "28px",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#7B61FF")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.13)")}
      />

      {/* Questions list */}
      <SectionTitle>Questions ({questions.length})</SectionTitle>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {questions.map((q, i) => (
          <li
            key={q.id}
            className="fade-up"
            style={{
              background: "#12121A",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              padding: "18px 20px",
              marginBottom: "10px",
              transition: "all 0.2s",
              animationDelay: `${i * 0.04}s`,
            }}
            onMouseEnter={(e) => {
              const d = e.currentTarget as HTMLLIElement;
              d.style.borderColor = "rgba(255,255,255,0.13)";
              d.style.background = "#1A1A26";
            }}
            onMouseLeave={(e) => {
              const d = e.currentTarget as HTMLLIElement;
              d.style.borderColor = "rgba(255,255,255,0.07)";
              d.style.background = "#12121A";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>

              {/* Vote column */}
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "4px", minWidth: "36px",
              }}>
                <VoteBtn
                  color="#FF4D6D"
                  hoverBg="rgba(255,77,109,0.1)"
                  onClick={() => upvote(q.id)}
                >▲</VoteBtn>

                <span style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "14px", fontWeight: 700,
                  color: "#F0EFF8",
                }}>{q.votes}</span>

                <VoteBtn
                  color="#7B61FF"
                  hoverBg="rgba(123,97,255,0.1)"
                  onClick={() =>
                    setQuestions((qs) =>
                      qs.map((item) =>
                        item.id === q.id
                          ? { ...item, votes: Math.max(0, item.votes - 1) }
                          : item
                      )
                    )
                  }
                >▼</VoteBtn>
              </div>

              {/* Body */}
              <div style={{ flex: 1 }}>
                {editingId === q.id ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        flex: 1, background: "#1A1A26",
                        border: "1px solid #7B61FF",
                        borderRadius: "8px", padding: "8px 12px",
                        color: "#F0EFF8",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "14px", outline: "none",
                      }}
                    />
                    <IconBtn onClick={() => saveEdit(q.id)}>💾</IconBtn>
                    <IconBtn onClick={() => setEditingId(null)}>❌</IconBtn>
                  </div>
                ) : (
                  <>
                    {/* Question text */}
                    <p style={{
                      fontSize: "15px",
                      color: "#F0EFF8",
                      lineHeight: 1.55,
                      marginBottom: "10px",
                      fontWeight: 500,
                    }}>{q.body}</p>

                    {/* Meta row */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: "10px", flexWrap: "wrap",
                    }}>
                      <span style={{ fontSize: "12px", color: "rgba(240,239,248,0.25)" }}>
                        {fmt(q.created_at)}
                      </span>

                      {aiAnswers[q.id] && (
                        <span style={{
                          fontSize: "11px", padding: "2px 10px",
                          borderRadius: "100px",
                          background: "rgba(0,201,167,0.1)",
                          color: "#00C9A7",
                          border: "1px solid rgba(0,201,167,0.2)",
                          fontWeight: 500,
                        }}>AI answered</span>
                      )}

                      <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                        <ActionBtn
                          hoverColor="#a99fff"
                          hoverBorder="rgba(123,97,255,0.4)"
                          hoverBg="rgba(123,97,255,0.08)"
                          onClick={() => askAI(q.id, q.body)}
                        >
                          🤖 {loadingAI === q.id ? "Thinking…" : aiAnswers[q.id] ? "Hide AI" : "Ask AI"}
                        </ActionBtn>

                        <ActionBtn
                          hoverColor="#F0EFF8"
                          hoverBorder="rgba(255,255,255,0.13)"
                          hoverBg="#12121A"
                          onClick={() => { setEditingId(q.id); setEditText(q.body); }}
                        >✏️ Edit</ActionBtn>

                        <ActionBtn
                          hoverColor="#ff6b6b"
                          hoverBorder="rgba(255,107,107,0.4)"
                          hoverBg="rgba(255,107,107,0.08)"
                          onClick={() => deleteQuestion(q.id)}
                        >🗑 Delete</ActionBtn>
                      </div>
                    </div>

                    {/* AI thinking — only this one, no duplicates */}
                    {loadingAI === q.id && (
                      <div style={{
                        marginTop: "14px", padding: "14px 16px",
                        background: "rgba(123,97,255,0.07)",
                        border: "1px solid rgba(123,97,255,0.18)",
                        borderRadius: "12px",
                      }}>
                        <div style={{
                          fontSize: "11px", fontWeight: 600, color: "#a99fff",
                          textTransform: "uppercase", letterSpacing: "0.8px",
                          marginBottom: "8px",
                        }}>AI Answer</div>
                        <span style={{ color: "#a99fff", fontSize: "13px" }}>Thinking…</span>
                      </div>
                    )}

                    {/* AI answer — only this one, no duplicates */}
                    {aiAnswers[q.id] && loadingAI !== q.id && (
                      <div style={{
                        marginTop: "14px", padding: "14px 16px",
                        background: "rgba(123,97,255,0.07)",
                        border: "1px solid rgba(123,97,255,0.18)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "#F0EFF8",
                        lineHeight: 1.65,
                      }}>
                        <div style={{
                          fontSize: "11px", fontWeight: 600, color: "#a99fff",
                          textTransform: "uppercase", letterSpacing: "0.8px",
                          marginBottom: "8px",
                        }}>AI Answer</div>
                        {aiAnswers[q.id]}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          style={{
            display: "block", margin: "12px auto 0",
            padding: "11px 32px", borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.13)",
            background: "transparent", color: "rgba(240,239,248,0.45)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13.5px", fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.18s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F0EFF8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,239,248,0.45)"; }}
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "28px", left: "50%",
          transform: "translateX(-50%)",
          background: "#1A1A26",
          border: "1px solid rgba(255,255,255,0.13)",
          borderRadius: "12px", padding: "10px 22px",
          fontSize: "13.5px", fontWeight: 500,
          color: "#F0EFF8", zIndex: 999, whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── helpers ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: "12px", fontWeight: 600,
      letterSpacing: "1.5px", color: "rgba(240,239,248,0.25)",
      textTransform: "uppercase",
      margin: "36px 0 14px",
      display: "flex", alignItems: "center", gap: "12px",
    }}>
      {children}
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

function VoteBtn({ children, color, hoverBg, onClick }: {
  children: React.ReactNode;
  color: string;
  hoverBg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "32px", height: "32px", borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.13)",
        background: "transparent",
        cursor: "pointer", color: "rgba(240,239,248,0.45)",
        fontSize: "15px",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.borderColor = color;
        b.style.color = color;
        b.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.borderColor = "rgba(255,255,255,0.13)";
        b.style.color = "rgba(240,239,248,0.45)";
        b.style.background = "transparent";
      }}
    >{children}</button>
  );
}

function ActionBtn({ children, hoverColor, hoverBorder, hoverBg, onClick }: {
  children: React.ReactNode;
  hoverColor: string;
  hoverBorder: string;
  hoverBg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px", fontSize: "11.5px", borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.13)",
        background: "transparent",
        color: "rgba(240,239,248,0.45)",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.color = hoverColor;
        b.style.borderColor = hoverBorder;
        b.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.color = "rgba(240,239,248,0.45)";
        b.style.borderColor = "rgba(255,255,255,0.13)";
        b.style.background = "transparent";
      }}
    >{children}</button>
  );
}

function IconBtn({ children, onClick }: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "32px", height: "32px", borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.13)",
        background: "transparent",
        cursor: "pointer", fontSize: "14px",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1A1A26"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >{children}</button>
  );
}