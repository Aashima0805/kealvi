"use client";

import { useState, useEffect } from "react";

const BAR_COLORS = ["#FF4D6D", "#7B61FF", "#00C9A7", "#FFB800", "#00B4D8"];

export default function PollsPage() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [polls, setPolls] = useState<any[]>([]);
  const [editingPollId, setEditingPollId] = useState<string | null>(null);
  const [newOption, setNewOption] = useState("");
  const [editPollText, setEditPollText] = useState("");
  const [toast, setToast] = useState("");

  function updateOption(index: number, value: string) {
    const copy = [...options];
    copy[index] = value;
    setOptions(copy);
  }

  function addOption() {
    setOptions([...options, ""]);
  }

  async function createPoll() {
    const res = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options }),
    });
    if (res.ok) {
      showToast("Poll created! 🎉");
      loadPolls();
      setQuestion("");
      setOptions(["", ""]);
    }
  }

  async function loadPolls() {
    const res = await fetch("/api/polls");
    const data = await res.json();
    setPolls(data);
  }

  async function deletePoll(id: string) {
    const confirmed = confirm("Are you sure you want to delete this poll?");
    if (!confirmed) return;
    const res = await fetch(`/api/polls/${id}/delete`, { method: "DELETE" });
    if (res.ok) { loadPolls(); showToast("Poll deleted."); }
  }

  useEffect(() => {
    if (!localStorage.getItem("poll-user")) {
      localStorage.setItem("poll-user", crypto.randomUUID());
    }
  }, []);

  async function vote(pollId: string, optionId: string) {
    await fetch("/api/polls/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        poll_id: pollId,
        option_id: optionId,
        user_id: localStorage.getItem("poll-user") ?? crypto.randomUUID(),
      }),
    });
    loadPolls();
    showToast("Vote cast! ✓");
  }

  useEffect(() => { loadPolls(); }, []);

  async function savePollEdit(id: string) {
    const res = await fetch(`/api/polls/${id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: editPollText }),
    });
    if (res.ok) { setEditingPollId(null); loadPolls(); showToast("Updated!"); }
    else showToast("Update failed.");
  }

  async function deleteOption(id: string) {
    const confirmed = confirm("Delete this option?");
    if (!confirmed) return;
    const res = await fetch(`/api/poll-options/${id}/delete`, { method: "DELETE" });
    if (res.ok) { loadPolls(); showToast("Option deleted."); }
  }

  async function saveOption(optionId: string, optionText: string) {
    await fetch(`/api/poll-options/${optionId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option_text: optionText }),
    });
    loadPolls();
  }

  async function addOptionToPoll(pollId: string) {
    if (!newOption.trim()) return;
    const res = await fetch(`/api/polls/${pollId}/add-option`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option_text: newOption }),
    });
    if (res.ok) { setNewOption(""); loadPolls(); showToast("Option added!"); }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div style={{ paddingBottom: "60px" }}>

      {/* ── Create Poll ── */}
      <SectionTitle>Create a poll</SectionTitle>

      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "22px", marginBottom: "12px",
      }}>
        <StyledInput
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Your poll question…"
          focusColor="var(--brand2)"
        />

        {options.map((opt, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
            <StyledInput
              value={opt}
              onChange={e => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              focusColor="var(--brand2)"
            />
            {options.length > 2 && (
              <button
                onClick={() => setOptions(options.filter((_, j) => j !== i))}
                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--border2)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}
              >×</button>
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <GhostBtn onClick={addOption}>+ Add option</GhostBtn>
          <PrimaryBtn onClick={createPoll}>Create poll</PrimaryBtn>
        </div>
      </div>

      {/* ── Live Polls ── */}
      <SectionTitle>Live polls 📊</SectionTitle>

      {polls.map((poll, pi) => {
        const totalVotes = poll.poll_options.reduce(
          (sum: number, o: any) => sum + (o.poll_votes?.[0]?.count ?? 0), 0
        ) || 1;

        return (
          <div key={poll.id} className="fade-up" style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "20px", marginBottom: "10px",
            transition: "border-color 0.2s", animationDelay: `${pi * 0.05}s`,
          }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border2)"}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
          >
            {/* Poll header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              {editingPollId === poll.id ? (
                <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                  <input
                    value={editPollText}
                    onChange={e => setEditPollText(e.target.value)}
                    style={{
                      flex: 1, background: "var(--surface2)",
                      border: "1px solid var(--brand2)", borderRadius: "8px",
                      padding: "7px 12px", color: "var(--text)",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "14px", outline: "none",
                    }}
                  />
                  <IconBtn onClick={() => savePollEdit(poll.id)} title="Save">💾</IconBtn>
                  <IconBtn onClick={() => setEditingPollId(null)} title="Cancel">❌</IconBtn>
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
                    {poll.question}
                  </h3>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <IconBtn onClick={() => { setEditingPollId(poll.id); setEditPollText(poll.question); }} title="Edit">✏️</IconBtn>
                    <IconBtn onClick={() => deletePoll(poll.id)} title="Delete">🗑️</IconBtn>
                  </div>
                </>
              )}
            </div>

            {/* Options */}
            {poll.poll_options.map((option: any, oi: number) => {
              const count = option.poll_votes?.[0]?.count ?? 0;
              const pct = Math.round(count / totalVotes * 100);
              const color = BAR_COLORS[oi % BAR_COLORS.length];

              return (
                <div key={option.id} style={{ marginBottom: "12px" }}>
                  {editingPollId === poll.id ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                      <input
                        defaultValue={option.option_text}
                        onBlur={e => saveOption(option.id, e.target.value)}
                        style={{
                          flex: 1, background: "var(--surface2)",
                          border: "1px solid var(--border2)", borderRadius: "8px",
                          padding: "6px 10px", color: "var(--text)",
                          fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", outline: "none",
                        }}
                      />
                      <IconBtn onClick={() => deleteOption(option.id)} title="Delete option">🗑️</IconBtn>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", marginBottom: "5px" }}>
                        <span
                          onClick={() => vote(poll.id, option.id)}
                          style={{ color: "var(--text)", cursor: "pointer" }}
                        >
                          {option.option_text}
                        </span>
                        <span style={{ color: "var(--muted)", fontWeight: 500 }}>
                          {count} votes · {pct}%
                        </span>
                      </div>
                      <div style={{ height: "8px", background: "var(--surface2)", borderRadius: "100px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: color, borderRadius: "100px",
                          transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
                        }} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Vote buttons row */}
            {editingPollId !== poll.id && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                {poll.poll_options.map((option: any, oi: number) => (
                  <button key={option.id} onClick={() => vote(poll.id, option.id)} style={{
                    padding: "5px 14px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 500,
                    cursor: "pointer", border: "1px solid var(--border2)",
                    background: "transparent", color: "var(--muted)",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#00C9A7"; b.style.borderColor = "rgba(0,201,167,0.35)"; b.style.background = "rgba(0,201,167,0.07)"; }}
                    onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "var(--muted)"; b.style.borderColor = "var(--border2)"; b.style.background = "transparent"; }}
                  >
                    {option.option_text}
                  </button>
                ))}
              </div>
            )}

            {/* Add option in edit mode */}
            {editingPollId === poll.id && (
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <input
                  value={newOption}
                  onChange={e => setNewOption(e.target.value)}
                  placeholder="New option…"
                  style={{
                    flex: 1, background: "var(--surface2)",
                    border: "1px solid var(--border2)", borderRadius: "8px",
                    padding: "7px 12px", color: "var(--text)",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px", outline: "none",
                  }}
                />
                <GhostBtn onClick={() => addOptionToPoll(poll.id)}>➕ Add</GhostBtn>
              </div>
            )}

            <div style={{ fontSize: "11.5px", color: "var(--muted2)", marginTop: "10px" }}>
              {poll.poll_options.reduce((a: number, o: any) => a + (o.poll_votes?.[0]?.count ?? 0), 0)} votes total
            </div>
          </div>
        );
      })}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)",
          background: "var(--surface2)", border: "1px solid var(--border2)",
          borderRadius: "12px", padding: "10px 22px",
          fontSize: "13.5px", fontWeight: 500, color: "var(--text)", zIndex: 999,
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── tiny helpers ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Syne', sans-serif", fontSize: "12px", fontWeight: 600,
      letterSpacing: "1.5px", color: "var(--muted2)", textTransform: "uppercase",
      margin: "36px 0 14px", display: "flex", alignItems: "center", gap: "12px",
    }}>
      {children}
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, focusColor }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  focusColor: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%", background: "var(--surface2)",
        border: "1px solid var(--border2)", borderRadius: "10px",
        padding: "11px 14px", fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px", color: "var(--text)", outline: "none", marginBottom: "10px",
        transition: "border-color 0.2s",
      }}
      onFocus={e => (e.target.style.borderColor = focusColor)}
      onBlur={e => (e.target.style.borderColor = "var(--border2)")}
    />
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 18px", borderRadius: "10px",
      border: "1px solid var(--border2)", background: "transparent",
      color: "var(--muted)", fontFamily: "'DM Sans', sans-serif",
      fontSize: "13.5px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
    }}
      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "var(--text)"; }}
      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "var(--muted)"; }}
    >{children}</button>
  );
}

function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 22px", borderRadius: "10px", border: "none",
      background: "linear-gradient(135deg, var(--brand2), #4b3fc7)",
      color: "#fff", fontFamily: "'DM Sans', sans-serif",
      fontSize: "13.5px", fontWeight: 600, cursor: "pointer", transition: "all 0.18s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
    >{children}</button>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: "32px", height: "32px", borderRadius: "8px",
      border: "1px solid var(--border2)", background: "transparent",
      cursor: "pointer", fontSize: "14px", display: "flex",
      alignItems: "center", justifyContent: "center", transition: "all 0.15s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--surface2)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >{children}</button>
  );
}