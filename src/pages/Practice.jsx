import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import QuestionCard from "../components/QuestionCard";
import ExplanationPanel from "../components/ExplanationPanel";
import "../styles/Practice.css";

export default function Practice() {
  const [searchParams] = useSearchParams();
  const course = searchParams.get("course");
  const company = searchParams.get("company");
  const navigate = useNavigate();
  
  const [allQuestions, setAllQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState("All");
  
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      let query = supabase.from("questions").select("*");
      
      if (course) {
        query = query.eq("course", course);
      }
      
      if (company) {
        query = query.eq("company", company);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching:", error);
      } else if (data) {
        setAllQuestions(data);
        const uniqueSubjects = ["All", ...new Set(data.map((q) => q.subject))];
        setSubjects(uniqueSubjects);
      }
      setLoading(false);
    }
    
    fetchQuestions();
  }, [course, company]);

  const questions = currentSubject === "All" 
    ? allQuestions 
    : allQuestions.filter((q) => q.subject === currentSubject);

  function handleSubjectChange(e) {
    setCurrentSubject(e.target.value);
    setIndex(0);
    setHistory({});
    setFinished(false);
  }

  function pick(key) {
    if (history[questions[index].id]) return;
    setHistory((prev) => ({
      ...prev,
      [questions[index].id]: key
    }));
  }

  function skip() {
    next();
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setFinished(true);
    }
  }

  function prev() {
    if (index > 0) {
      setIndex(index - 1);
    }
  }

  function restart() {
    setHistory({});
    setIndex(0);
    setFinished(false);
  }

  if (loading) {
    return (
      <div className="practice__loading">
        <div className="practice__spinner"></div>
        <span>Loading questions...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="practice__loading">
        <span>No questions found for this subject.</span>
      </div>
    );
  }

  const q = questions[index];
  const total = questions.length;
  const progress = ((index + (history[q.id] ? 1 : 0)) / total) * 100;
  const chosen = history[q.id] || null;
  const isTheory = q.type === "theory" || !q.options || q.options.length === 0;

  const correctCount = Object.entries(history).filter(
    ([qid, answer]) => {
      return questions.find((m) => m.id === qid)?.correct === answer;
    }
  ).length;

  if (finished) {
    const missed = questions.filter((m) => {
      const answer = history[m.id];
      return answer && answer !== m.correct;
    });

    return (
      <div className="practice exam--result">
        <div className="exam__result-card">
          <p className="exam__result-label">Practice Complete</p>
          <p className="exam__result-score">
            {correctCount}<span> / {total}</span>
          </p>
          <p className="exam__result-msg">
            {correctCount === total ? "Flawless. You're ready." : `You missed ${missed.length} question(s).`}
          </p>
        </div>

        {missed.length > 0 && (
          <section className="exam__review">
            <h2 className="exam__review-title">Review your misses</h2>
            {missed.map((m) => {
              const picked = history[m.id];
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
            Practice Again
          </button>
          <button className="exam__btn" onClick={() => navigate("/home")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice">
      <div className="practice__top">
        <header className="practice__meta">
          <select 
            className="practice__subject-select" 
            value={currentSubject} 
            onChange={handleSubjectChange}
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          <span className="practice__count">
            {index + 1} / {total}
          </span>
        </header>
        <div className="practice__progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="practice__topic">{q.topic}</p>
      </div>

      <QuestionCard
        question={q}
        chosen={chosen}
        revealed={!!chosen}
        onPick={pick}
        isTheory={isTheory}
      />

      {chosen && (
        <ExplanationPanel 
          question={q} 
          chosen={chosen} 
          onNext={next} 
          isTheory={isTheory}
        />
      )}

      <div className="practice__nav">
        <button 
          className="exam__btn" 
          onClick={prev} 
          disabled={index === 0}
        >
          ← Back
        </button>
        
        {!chosen && (
          <button 
            className="exam__btn exam__btn--primary" 
            onClick={skip}
          >
            Skip →
          </button>
        )}
      </div>
    </div>
  );
}