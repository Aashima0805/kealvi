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
  useEffect(() => setHydrated(true), []);

  // EDIT STATES
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // SEARCH
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

  // AI REFINE
  async function refineQuestion() {
    if (!draft.trim()) return;

    const res = await fetch("/api/refine-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: draft }),
    });

    const data = await res.json();
    setDraft(data.refined.trim());
  }

  // ASK QUESTION
  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });

    const created = await res.json();

    if (!res.ok) {
      alert(created.error);
      return;
    }

    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);
    setDraft("");
  }

  // UPVOTE
  async function upvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, votes: q.votes + 1 } : q
      )
    );

    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });

    if (!res.ok) {
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === id ? { ...q, votes: q.votes - 1 } : q
        )
      );
      alert("Already voted");
    }
  }

  // DELETE
  async function deleteQuestion(id: string) {
    const res = await fetch(`/api/questions/${id}/delete`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  // EDIT SAVE
  async function saveEdit(id: string) {
    const res = await fetch(`/api/questions/${id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: editText }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Update failed");
      return;
    }

    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id ? { ...q, body: data.body } : q
      )
    );

    setEditingId(null);
    setEditText("");
  }

  // LOAD MORE
  async function loadMore() {
    setLoading(true);

    const res = await fetch(
      `/api/questions?offset=${questions.length}`
    );

    const data = await res.json();

    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);
    setLoading(false);
  }

 async function askAI(id: string, question: string) {
  // IF answer already exists → remove it (toggle off)
  if (aiAnswers[id]) {
    setAiAnswers((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    return;
  }

  // otherwise fetch AI answer
  setLoadingAI(id);

  const res = await fetch("/api/ai-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const data = await res.json();

  setAiAnswers((prev) => ({
    ...prev,
    [id]: data.answer,
  }));

  setLoadingAI(null);
}
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        {hydrated ? "Interactive ✓" : "Loading interactivity…"}
      </p>

      {/* INPUT */}
      <div className="flex gap-3 p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 bg-transparent outline-none"
        />

        <button onClick={refineQuestion} className="px-3 py-2 rounded-xl border border-[var(--border)] transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md">
          ✨ AI Refine
        </button>

        <button onClick={submit} className="px-3 py-2 rounded-xl border border-[var(--border)] transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md">
          Ask
        </button>
      </div>

      {/* SEARCH */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search questions…"
        className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />

      {/* QUESTIONS */}
      <ul className="space-y-3">
        {questions.map((q) => (
          <li
  key={q.id}
  className="group flex items-start justify-between gap-5 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
>
  {/* LEFT: VOTES */}
  <div className="flex flex-col items-center text-sm min-w-[40px]">
    <button onClick={() => upvote(q.id)} className="transition-all duration-150 hover:scale-105 active:scale-95">▲</button>
    <span className="text-sm text-[var(--muted)]">{q.votes}</span>
    <button
      onClick={() =>
        setQuestions((qs) =>
          qs.map((item) =>
            item.id === q.id
              ? { ...item, votes: Math.max(0, item.votes - 1) }
              : item
          )
        )
      } className="text-lg transition-all duration-150 hover:scale-125 active:scale-95 text-gray-500 hover:text-blue-500"
    >
      ▼
    </button>
  </div>

  {/* MIDDLE: QUESTION */}
  <div className="flex-1">
    {editingId === q.id ? (
      <div className="flex gap-2">
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
        <button onClick={() => saveEdit(q.id)} className="transition-all duration-150 hover:scale-105 active:scale-95">💾</button>
        <button onClick={() => setEditingId(null)} className="transition-all duration-150 hover:scale-105 active:scale-95">❌</button>
      </div>
    ) : (
      <>
        <p className="text-lg font-semibold leading-relaxed break-words tracking-tight">{q.body}</p>

        {/* AI BUTTON */}
        <button
          onClick={() => askAI(q.id, q.body)}
          className="mt-3 inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-[var(--border)] bg-white dark:bg-gray-900 hover:scale-105 transition"
        >
          🤖 {loadingAI === q.id ? "Thinking..." : "Ask AI"}
        </button>

        {/* AI ANSWER */}
        {aiAnswers[q.id] && (
          <p className="text-sm mt-3 pl-3 border-l-2 border-blue-400 text-[var(--muted)] leading-relaxed">
            {aiAnswers[q.id]}
          </p>
        )}
      </>
    )}

    {/* TIMESTAMP */}
    <p className="text-xs text-[var(--muted)] mt-2">
      {new Date(q.created_at).toLocaleString("en-IN")}
    </p>
  </div>

  {/* RIGHT: ACTIONS */}
  <div className="flex gap-3 text-lg min-w-[40px] justify-end">
    <button
      onClick={() => {
        setEditingId(q.id);
        setEditText(q.body);
      }}
      title="Edit"
      className="text-xl transition-all duration-200 hover:scale-125 active:scale-95 hover:text-red-500"
    >
      ✏️
    </button>

    <button
      onClick={() => deleteQuestion(q.id)}
      title="Delete"
      className="text-xl transition-all duration-200 hover:scale-125 active:scale-95 hover:text-red-500"
    >
      🗑
    </button>
  </div>
</li>
        ))}
      </ul>

      {/* LOAD MORE */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mx-auto block px-5 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:scale-105 transition"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}