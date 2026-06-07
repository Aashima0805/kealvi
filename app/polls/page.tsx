"use client";

import { useState } from "react";
import { useEffect } from "react";
export default function PollsPage() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
const [polls, setPolls] = useState<any[]>([]);
const [editingPollId, setEditingPollId] =
  useState<string | null>(null);
const [newOption, setNewOption] =
  useState("");
const [editPollText, setEditPollText] =
  useState("");
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        options,
      }),
    });

    if (res.ok) {
      alert("Poll created!");
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
  const confirmed = confirm(
    "Are you sure you want to delete this poll?"
  );

  if (!confirmed) return;

  const res = await fetch(
    `/api/polls/${id}/delete`,
    {
      method: "DELETE",
    }
  );

  if (res.ok) {
    loadPolls();
  }
}
useEffect(() => {
  if (!localStorage.getItem("poll-user")) {
    localStorage.setItem(
      "poll-user",
      crypto.randomUUID()
    );
  }
}, []);
async function vote(
  pollId: string,
  optionId: string
) {
  await fetch("/api/polls/vote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      poll_id: pollId,
      option_id: optionId,
      user_id: localStorage.getItem("poll-user") ??
        crypto.randomUUID(),
    }),
  });

  loadPolls();
}
useEffect(() => {
  loadPolls();
}, []);
async function savePollEdit(id: string) {
  const res = await fetch(
    `/api/polls/${id}/edit`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: editPollText,
      }),
    }
  );

  if (res.ok) {
    setEditingPollId(null);
    loadPolls();
  } else {
    alert("Update failed");
  }
}
async function deleteOption(id: string) {
  const confirmed = confirm(
    "Delete this option?"
  );

  if (!confirmed) return;

  const res = await fetch(
    `/api/poll-options/${id}/delete`,
    {
      method: "DELETE",
    }
  );

  if (res.ok) {
    loadPolls();
  }
}
async function saveOption(
  optionId: string,
  optionText: string
) {
  await fetch(
    `/api/poll-options/${optionId}/edit`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        option_text: optionText,
      }),
    }
  );

  loadPolls();
}
async function addOptionToPoll(
  pollId: string
) {
  if (!newOption.trim()) return;

  const res = await fetch(
    `/api/polls/${pollId}/add-option`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        option_text: newOption,
      }),
    }
  );

  if (res.ok) {
    setNewOption("");
    loadPolls();
  }
}
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">
        Create Poll
      </h1>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Poll question"
        className="w-full border rounded px-3 py-2"
      />

      {options.map((option, index) => (
        <input
          key={index}
          value={option}
          onChange={(e) =>
            updateOption(index, e.target.value)
          }
          placeholder={`Option ${index + 1}`}
          className="w-full border rounded px-3 py-2"
        />
      ))}

      <button
        onClick={addOption}
        className="border rounded px-4 py-2"
      >
        + Add Option
      </button>

      <button
        onClick={createPoll}
        className="border rounded px-4 py-2 ml-2"
      >
        Create Poll
      </button>
      <hr />

<h2 className="text-2xl font-semibold">
  Polls 📊
</h2>

{polls.map((poll) => (
  <div
    key={poll.id}
    className="border rounded-lg p-4"
  >
   <div className="flex justify-between items-center mb-2">
  {editingPollId === poll.id ? (
    <div className="flex gap-2 flex-1">
      <input
        value={editPollText}
        onChange={(e) =>
          setEditPollText(e.target.value)
        }
        className="border rounded px-2 py-1 flex-1"
      />

      <button
        onClick={() => savePollEdit(poll.id)}
      >
        💾
      </button>

      <button
        onClick={() =>
          setEditingPollId(null)
        }
      >
        ❌
      </button>
    </div>
  ) : (
    <>
      <h3 className="font-bold">
        {poll.question}
      </h3>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setEditingPollId(poll.id);
            setEditPollText(
              poll.question
            );
          }}
        >
          ✏️
        </button>

        <button
          onClick={() =>
            deletePoll(poll.id)
          }
        >
          🗑️
        </button>
      </div>
    </>
  )}
</div>
{poll.poll_options.map((option: any) => (
  <div
    key={option.id}
    className="flex justify-between items-center p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-[1.01]"
  >
   {editingPollId === poll.id ? (
  <input
    defaultValue={option.option_text}
    className="border rounded px-2 py-1 flex-1"
    onBlur={(e) =>
      saveOption(
        option.id,
        e.target.value
      )
    }
  />
) : (
  <span
    className="flex-1 cursor-pointer"
    onClick={() =>
      vote(poll.id, option.id)
    }
  >
    {option.option_text}
  </span>
)}

    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">
        {option.poll_votes?.[0]?.count ?? 0} votes
      </span>

      {editingPollId === poll.id && (
        <button
          onClick={() =>
            deleteOption(option.id)
          }
        >
          🗑️
        </button>
      )}
    </div>
  </div>
))}
{editingPollId === poll.id && (
  <div className="flex gap-2 mt-3">
    <input
      value={newOption}
      onChange={(e) =>
        setNewOption(e.target.value)
      }
      placeholder="New option"
      className="border rounded px-2 py-1 flex-1"
    />

   <button
  onClick={() =>
    addOptionToPoll(poll.id)
  }
  className="border rounded px-3 py-1"
>
  ➕
</button>
  </div>
)}
  </div>
))}
    </div>
  );
}