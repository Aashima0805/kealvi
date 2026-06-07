import HomeCard from "@/components/HomeCard";

export default function HomePage() {
  const cards = [
    {
      icon: "❓",
      title: "Questions",
      desc: "Ask and answer questions",
      href: "/questions",
    },
    {
      icon: "📊",
      title: "Polls",
      desc: "Create and vote on polls",
      href: "/polls",
    },
    {
      icon: "🤖",
      title: "AI Answers",
      desc: "Get smart AI responses",
      href: "/questions",
    },
  ];

  return (
    <main style={{ padding: "40px" }}>
  <h1
  style={{
    fontSize: "48px",
    fontWeight: "900",
    marginBottom: "10px",
    background:
      "linear-gradient(90deg, #3b82f6, #a855f7, #06b6d4)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  }}
>
  Welcome to Live Q&A
</h1>

      <p style={{ marginBottom: "30px", opacity: 0.7 }}>
        Ask questions, create polls, and get AI-powered answers.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
           alignItems: "stretch",
        }}
      >
        {cards.map((card) => (
          <HomeCard key={card.title} card={card} />
        ))}
      </div>
    </main>
  );
}