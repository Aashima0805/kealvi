export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">
        Welcome 👋
      </h1>

      <p className="text-gray-500 dark:text-gray-300">
        This is a Live Q&A platform where users can ask questions,
        vote, and get AI-powered answers instantly.
      </p>

      <div className="grid gap-4 mt-6">
        <div className="p-4 border rounded-xl">
          ❓ Ask questions and get community answers
        </div>

        <div className="p-4 border rounded-xl">
          📊 Create polls and vote in real time
        </div>

        <div className="p-4 border rounded-xl">
          🤖 AI helps refine and answer questions
        </div>
      </div>
    </div>
  );
}