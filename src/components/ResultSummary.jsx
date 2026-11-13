import { useState, useEffect } from "react";
import "../styles/ResultSummary.css";

function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    let frame;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export function toReviewItem(question, picked) {
  const hasOptions = Array.isArray(question.options) && question.options.length > 0;
  const pickedText = question.options?.find((o) => o.key === picked)?.text ?? picked;
  const correctText = question.options?.find((o) => o.key === question.correct)?.text ?? question.correct;

  return {
    id: question.id,
    stem: question.stem,
    pickedLabel: hasOptions ? `${picked}. ${pickedText}` : picked,
    correctLabel: question.correct ? `${question.correct}. ${correctText}` : null,
    explanation: question.explanation,
  };
}

export default function ResultSummary({
  label,
  correct,
  total,
  message,
  insight,
  reviewTitle,
  review = [],
  children,
}) {
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const shownPct = useCountUp(pct);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const tone = pct >= 70 ? "is-high" : pct >= 50 ? "is-mid" : "is-low";

  return (
    <div className="result">
      <section className={`result__card ${tone}`}>
        <p className="result__label">{label}</p>

        <div className="result__ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="result__track" cx="60" cy="60" r={radius} />
            <circle
              className="result__bar"
              cx="60"
              cy="60"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ "--circ": circumference }}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="result__center">
            <strong>{shownPct}%</strong>
            <span>
              {correct} / {total}
            </span>
          </div>
        </div>

        <p className="result__msg">{message}</p>
      </section>

      {insight && (
        <section className="result__insight">
          <h3>{insight.title}</h3>
          <p>{insight.text}</p>
        </section>
      )}

      {review.length > 0 && (
        <section className="result__review">
          <h2>{reviewTitle}</h2>
          {review.map((item) => (
            <article key={item.id} className="review-card">
              <p className="review-card__stem">{item.stem}</p>

              <div className="review-card__row">
                <span className="review-card__label">You picked</span>
                <span className="review-card__wrong">{item.pickedLabel}</span>
              </div>

              {item.correctLabel && (
                <div className="review-card__row">
                  <span className="review-card__label">Correct</span>
                  <span className="review-card__right">{item.correctLabel}</span>
                </div>
              )}

              {item.explanation && <p className="review-card__explain">{item.explanation}</p>}
            </article>
          ))}
        </section>
      )}

      <div className="result__actions">{children}</div>
    </div>
  );
}