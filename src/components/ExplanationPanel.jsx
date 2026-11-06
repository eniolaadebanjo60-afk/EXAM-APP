import { useState, useEffect } from "react";
import "../styles/ExplanationPanel.css";

export default function ExplanationPanel({ question, chosen, onNext, isTheory }) {
  const [followUp, setFollowUp] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const isCorrect = isTheory ? false : chosen === question.correct;
  const chosenText = isTheory 
    ? chosen 
    : question.options?.find((o) => o.key === chosen)?.text ?? "";

  async function askAI(e) {
    if (e) e.preventDefault();
    if (loading) return;
    setLoading(true);
    setReply("");

    try {
      const res = await fetch("https://exam-app-backend-lsgh.onrender.com/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.stem,
          options: question.options || [],
          correct: question.correct || "",
          chosen: chosen,
          type: isTheory ? "theory" : "mcq",
          officialSolution: question.official_solution || ""
        }),
      });
      const data = await res.json();
      setReply(data.explanation ?? "No reply.");
    } catch {
      setReply("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isTheory && chosen) {
      askAI();
    }
  }, [isTheory, chosen]);

  return (
    <section className="explain" aria-live="polite">
      <div className={`explain__verdict ${isCorrect ? "is-correct" : "is-wrong"}`}>
        {isTheory ? "AI Grading" : isCorrect ? "Correct" : "Not quite"}
      </div>

      {!isCorrect && (
        <p className="explain__chosen">
          {isTheory ? "Your Answer:" : "You picked:"} <strong>{chosenText}</strong>
        </p>
      )}

      {isTheory && loading && (
        <p className="explain__text">AI is grading your answer against the official solution...</p>
      )}

      {isTheory && reply && (
        <div className="explain__reply" style={{ whiteSpace: "pre-wrap" }}>
          {reply}
        </div>
      )}

      {!isTheory && (
        <>
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
        </>
      )}

      <button className="explain__next" onClick={onNext}>
        Next question →
      </button>
    </section>
  );
}