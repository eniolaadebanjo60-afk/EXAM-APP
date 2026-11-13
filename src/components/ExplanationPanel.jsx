import { useState, useEffect } from "react";
import "../styles/ExplanationPanel.css";

const VerdictIcon = ({ kind }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "correct" && <path d="M5 12.5l4.5 4.5L19 7.5" />}
    {kind === "wrong" && <path d="M6 6l12 12M18 6L6 18" />}
    {kind === "theory" && (
      <>
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
      </>
    )}
  </svg>
);

export default function ExplanationPanel({ question, chosen, onNext, isTheory, isLast = false }) {
  const [followUp, setFollowUp] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const isCorrect = isTheory ? false : chosen === question.correct;
  const kind = isTheory ? "theory" : isCorrect ? "correct" : "wrong";
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
          officialSolution: question.official_solution || "",
          followUp: followUp.trim(),
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
    <section className={`explain is-${kind}`} aria-live="polite">
      <div className="explain__verdict">
        <span className="explain__verdict-icon">
          <VerdictIcon kind={kind} />
        </span>
        {isTheory ? "AI grading" : isCorrect ? "Correct" : "Not quite"}
      </div>

      {!isCorrect && (
        <p className="explain__chosen">
          {isTheory ? "Your answer:" : "You picked:"} <strong>{chosenText}</strong>
        </p>
      )}

      {isTheory && loading && (
        <div className="explain__loading">
          <span />
          <span />
          <span />
          <p>AI is grading your answer against the official solution...</p>
        </div>
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
              {loading ? "Asking…" : "Ask"}
            </button>
          </form>
          {reply && <div className="explain__reply">{reply}</div>}
        </>
      )}

      <button className="explain__next" onClick={onNext}>
        {isLast ? "See results →" : "Next question →"}
      </button>
    </section>
  );
}