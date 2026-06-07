import QuestionsList from "../questions-list";
import { getQuestionsPage } from "@/lib/questions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);

  return (
    <div style={{ paddingBottom: "60px" }}>
      {/* Section title */}
      <div style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "12px", fontWeight: 600,
        letterSpacing: "1.5px", color: "var(--muted2)",
        textTransform: "uppercase", margin: "36px 0 16px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        Questions
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      <QuestionsList
        initialQuestions={questions}
        initialHasMore={hasMore}
      />
    </div>
  );
}