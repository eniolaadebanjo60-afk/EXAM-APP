import { useState } from "react";
import "../styles/QuestionCard.css";

const MIN_LENGTH = 10;

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export default function QuestionCard({ question, chosen, revealed, onPick, isTheory }) {
  const [text, setText] = useState(isTheory && chosen ? chosen : "");
  const length = text.trim().length;

  if (isTheory) {
    return (
      <article className="qcard">
        <p className="qcard__stem">{question.stem}</p>
        <textarea
          className="qcard__textarea"
          placeholder="Type your essay answer here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={revealed}
          rows={9}
        />
        <div className="qcard__theory-footer">
          <span className="qcard__count">
            {length < MIN_LENGTH
              ? `Write at least ${MIN_LENGTH} characters to submit`
              : `${length} characters`}
          </span>
          <button
            className="qcard__submit-btn"
            onClick={() => onPick(text)}
            disabled={revealed || length < MIN_LENGTH}
          >
            Submit for Grading
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="qcard">
      <p className="qcard__stem">{question.stem}</p>
      <div className="qcard__options" role="radiogroup">
        {question.options.map((opt) => {
          const isChosen = chosen === opt.key;
          const isCorrect = revealed && opt.key === question.correct;
          const isWrong = revealed && isChosen && opt.key !== question.correct;

          return (
            <button
              key={opt.key}
              role="radio"
              aria-checked={isChosen}
              className={[
                "opt",
                isChosen && "opt--chosen",
                isCorrect && "opt--correct",
                isWrong && "opt--wrong",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onPick(opt.key)}
              disabled={revealed}
            >
              <span className="opt__key">{opt.key}</span>
              <span className="opt__text">{opt.text}</span>
              {isCorrect && (
                <span className="opt__mark">
                  <CheckIcon />
                </span>
              )}
              {isWrong && (
                <span className="opt__mark">
                  <CrossIcon />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </article>
  );
}