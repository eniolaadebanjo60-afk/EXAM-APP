import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { saveExamState, loadExamState, clearExamState } from "../lib/examStorage";
import QuestionCard from "../components/QuestionCard";
import Timer from "../components/Timer";
import "../styles/ExamRoom.css";

const EXAM_SECONDS = 60 * 10;

export default function ExamRoom() {
  const [searchParams] = useSearchParams();
  const course = searchParams.get("course");
  const company = searchParams.get("company");
  const level = searchParams.get("level");
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-room", "exam");
    
    const saved = loadExamState();
    if (saved && saved.course === course && saved.company === company && saved.level === level) {
      setIndex(saved.index);
      setHistory(saved.history);
      setTimeLeft(saved.timeLeft);
    } else {
      clearExamState();
    }
    
    async function fetchQuestions() {
      let query = supabase.from("questions").select("*");
      if (course) query = query.eq("course", course);
      if (company) query = query.eq("company", company);
      if (level) query = query.eq("level", level);
      
      const { data, error } = await query;
      if (error) {
        console.error(error);
      } else if (data) {
        setQuestions(data);
      }
      setLoading(false);
      setIsLoaded(true);
    }
    
    fetchQuestions();

    return () => document.documentElement.removeAttribute("data-room");
  }, [course, company, level]);

  useEffect(() => {
    if (!submitted && isLoaded && questions.length > 0) {
      saveExamState(index, history, timeLeft, course, company, level);
    }
  }, [index, history, timeLeft, submitted, isLoaded, questions.length, course, company, level]);

  if (loading) {
    return (
      <div className="practice__loading" data-room="exam">
        <div className="practice__spinner"></div>
        <span>Loading exam...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="practice__loading" data-room="exam">
        <span>No exam questions found for this course.</span>
      </div>
    );
  }

  const q = questions[index];
  const total = questions.length;
  const progress = ((index + 1) / total) * 100;
  const currentAnswers = history[q.id] || [];
  const chosen = currentAnswers[currentAnswers.length - 1] || null;

  function pick(key) {
    if (submitted || chosen === key) return;
    
    if (key === "SKIP") {
      next();
      return;
    }

    setHistory((prev) => {
      const qHistory = prev[q.id] || [];
      return { ...prev, [q.id]: [...qHistory, key] };
    });
  }

  function next() {
    if (index < total - 1) setIndex(index + 1);
  }

  function prev() {
    if (index > 0) setIndex(index - 1);
  }

  function submit() {
    setSubmitted(true);
    clearExamState();
  }

  function restart() {
    setSubmitted(false);
    setHistory({});
    setIndex(0);
    setTimeLeft(EXAM_SECONDS);
    clearExamState();
  }

  const correctCount = Object.entries(history).filter(
    ([qid, answers]) => {
      const finalAnswer = answers[answers.length - 1];
      return questions.find((m) => m.id === qid)?.correct === finalAnswer;
    }
  ).length;

  if (submitted) {
    const secondGuesses = questions.filter((m) => (history[m.id] || []).length > 1);
    const missed = questions.filter((m) => {
      const qHistory = history[m.id] || [];
      const finalAnswer = qHistory[qHistory.length - 1];
      return finalAnswer && finalAnswer !== m.correct;
    });

    return (
      <div className="exam exam--result">
        <div className="exam__result-card">
          <p className="exam__result-label">Final score</p>
          <p className="exam__result-score">
            {correctCount}<span> / {total}</span>
          </p>
          <p className="exam__result-msg">
            {correctCount === total ? "Perfect. Sharp." : `${missed.length} to review below.`}
          </p>
        </div>

        {secondGuesses.length > 0 && (
          <div className="exam__replay-stat">
            <h3>Replay Insight</h3>
            <p>
              You changed your answer on <strong>{secondGuesses.length}</strong> question(s). 
              {secondGuesses.filter(m => history[m.id][0] === m.correct).length > 0 && " Your first instinct was right on some of them!"}
            </p>
          </div>
        )}

        {missed.length > 0 && (
          <section className="exam__review">
            <h2 className="exam__review-title">Solution Corner</h2>
            {missed.map((m) => {
              const picked = history[m.id][history[m.id].length - 1];
              const pickedText = m.options?.find((o) => o.key === picked)?.text ?? picked;
              const correctText = m.options?.find((o) => o.key === m.correct)?.text ?? m.correct;
              return (
                <article key={m.id} className="review-card">
                  <p className="review-card__stem">{m.stem}</p>
                  <div className="review-card__row">
                    <span className="review-card__label">You picked</span>
                    <span className="review-card__wrong">{picked}. {pickedText}</span>
                  </div>
                  <div className="review-card__row">
                    <span className="review-card__label">Correct</span>
                    <span className="review-card__right">{m.correct}. {correctText}</span>
                  </div>
                  <p className="review-card__explain">{m.explanation}</p>
                </article>
              );
            })}
          </section>
        )}

        <div className="exam__actions">
          <button className="exam__btn exam__btn--primary" onClick={restart}>
            Try again
          </button>
          <button className="exam__btn" onClick={() => navigate("/home")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam">
      <div className="exam__back-header">
        <button className="exam__back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <header className="exam__bar">
        <Timer seconds={timeLeft} onTick={setTimeLeft} onEnd={submit} />
        <span className="exam__count">{index + 1} / {total}</span>
      </header>

      <div className="exam__progress">
        <span style={{ width: `${progress}%` }} />
      </div>

      <main className="exam__body">
        <QuestionCard 
          question={q} 
          chosen={chosen} 
          revealed={false} 
          onPick={pick} 
          isTheory={q.type === "theory" || !q.options || q.options.length === 0}
        />
      </main>

      <div className="exam__nav-grid">
        {questions.map((item, i) => {
          const hasAnswer = (history[item.id] || []).length > 0;
          return (
            <button 
              key={item.id}
              className={`exam__nav-dot ${hasAnswer ? "is-answered" : ""} ${i === index ? "is-current" : ""}`}
              onClick={() => setIndex(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <footer className="exam__footer">
        <button className="exam__btn" onClick={prev} disabled={index === 0}>
          ← Back
        </button>

        {index < total - 1 ? (
          <button className="exam__btn exam__btn--primary" onClick={next}>
            Next →
          </button>
        ) : (
          <button className="exam__btn exam__btn--primary" onClick={submit}>
            Submit exam
          </button>
        )}
      </footer>
    </div>
  );
}