import QuestionsList from "../questions-list";
import { getQuestionsPage } from "@/lib/questions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Questions
      </h1>

      <QuestionsList
        initialQuestions={questions}
        initialHasMore={hasMore}
      />
    </div>
  );
}