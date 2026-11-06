import { useState } from "react";
import "../styles/QuestionCard.css";

export default function QuestionCard({ question, chosen, revealed, onPick, isTheory }) {
  const [text, setText] = useState("");

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
          rows={8}
        />
        <div className="qcard__theory-actions">
          <button 
            className="qcard__skip-btn" 
            onClick={() => onPick("SKIP")} 
            disabled={revealed}
          >
            Skip Question
          </button>
          <button 
            className="qcard__submit-btn" 
            onClick={() => onPick(text)} 
            disabled={revealed || text.trim().length < 10}
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
            </button>
          );
        })}
      </div>
    </article>
  );
}