import { useState } from "react";
import "../styles/ExplanationPanel.css";

export default function ExplanationPanel({ question, chosen, onNext }) {
  const [followUp, setFollowUp] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const correct = chosen === question.correct;
  const chosenText =
    question.options.find((o) => o.key === chosen)?.text ?? "";

  async function askAI(e) {
    e.preventDefault();
    if (!followUp.trim() || loading) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.stem,
          options: question.options,
          correct: question.correct,
          chosen,
        }),
      });
      const data = await res.json();
      setReply(data.explanation ?? "No reply.");
    } catch {
      setReply("The AI service is currently busy. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="explain" aria-live="polite">
      <div className={`explain__verdict ${correct ? "is-correct" : "is-wrong"}`}>
        {correct ? "Correct" : "Not quite"}
      </div>

      {!correct && (
        <p className="explain__chosen">
          You picked <strong>{chosen}. {chosenText}</strong>
        </p>
      )}

      <p className="explain__text">{question.explanation}</p>

      <form className="explain__ask" onSubmit={askAI}>
        <input
          className="explain__input"
          placeholder="Ask why…"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          disabled={loading}
        />
        <button className="explain__ask-btn" disabled={loading}>
          {loading ? "…" : "Ask"}
        </button>
      </form>

      {reply && <div className="explain__reply">{reply}</div>}

      <button className="explain__next" onClick={onNext}>
        Next question →
      </button>
    </section>
  );
}