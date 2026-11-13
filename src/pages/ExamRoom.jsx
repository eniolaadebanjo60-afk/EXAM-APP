import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { saveExamState, loadExamState, clearExamState } from "../lib/examStorage";
import QuestionCard from "../components/QuestionCard";
import Timer from "../components/Timer";
import ResultSummary, { toReviewItem } from "../components/ResultSummary";
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
      <div className="page-loading" data-room="exam">
        <div className="spinner"></div>
        <span>Loading exam...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page-loading" data-room="exam">
        <span>No exam questions found for this course.</span>
        <button className="btn" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const q = questions[index];
  const total = questions.length;
  const progress = ((index + 1) / total) * 100;
  const currentAnswers = history[q.id] || [];
  const chosen = currentAnswers[currentAnswers.length - 1] || null;
  const answeredCount = questions.filter((item) => (history[item.id] || []).length > 0).length;

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

  const correctCount = Object.entries(history).filter(([qid, answers]) => {
    const finalAnswer = answers[answers.length - 1];
    return questions.find((m) => m.id === qid)?.correct === finalAnswer;
  }).length;

  if (submitted) {
    const secondGuesses = questions.filter((m) => (history[m.id] || []).length > 1);
    const firstInstinctRight = secondGuesses.filter((m) => history[m.id][0] === m.correct).length;
    const missed = questions.filter((m) => {
      const qHistory = history[m.id] || [];
      const finalAnswer = qHistory[qHistory.length - 1];
      return finalAnswer && finalAnswer !== m.correct;
    });

    const insight =
      secondGuesses.length > 0
        ? {
            title: "Replay insight",
            text: `You changed your answer on ${secondGuesses.length} question(s).${
              firstInstinctRight > 0 ? " Your first instinct was right on some of them!" : ""
            }`,
          }
        : null;

    return (
      <ResultSummary
        label="Final score"
        correct={correctCount}
        total={total}
        message={correctCount === total ? "Perfect. Sharp." : `${missed.length} to review below.`}
        insight={insight}
        reviewTitle="Solution Corner"
        review={missed.map((m) => {
          const qHistory = history[m.id];
          return toReviewItem(m, qHistory[qHistory.length - 1]);
        })}
      >
        <button className="btn btn--primary" onClick={restart}>
          Try again
        </button>
        <button className="btn" onClick={() => navigate("/home")}>
          Back to Home
        </button>
      </ResultSummary>
    );
  }

  const isTheory = q.type === "theory" || !q.options || q.options.length === 0;

  return (
    <div className="exam">
      <header className="exam__bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Timer seconds={timeLeft} onTick={setTimeLeft} onEnd={submit} />
        <span className="exam__count">
          {index + 1} / {total}
        </span>
      </header>

      <div className="exam__progress">
        <span style={{ width: `${progress}%` }} />
      </div>

      <main className="exam__body">
        <QuestionCard
          key={q.id}
          question={q}
          chosen={chosen}
          revealed={false}
          onPick={pick}
          isTheory={isTheory}
        />
      </main>

      <section className="exam__palette" aria-label="Question navigator">
        <div className="exam__palette-head">
          <h2>Questions</h2>
          <span>
            {answeredCount} of {total} answered
          </span>
        </div>

        <div className="exam__nav-grid">
          {questions.map((item, i) => {
            const hasAnswer = (history[item.id] || []).length > 0;
            return (
              <button
                key={item.id}
                className={`exam__nav-dot ${hasAnswer ? "is-answered" : ""} ${
                  i === index ? "is-current" : ""
                }`}
                onClick={() => setIndex(i)}
                aria-label={`Question ${i + 1}${hasAnswer ? ", answered" : ""}`}
                aria-current={i === index ? "true" : undefined}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </section>

      <footer className="exam__footer">
        <button className="btn" onClick={prev} disabled={index === 0}>
          ← Back
        </button>

        {index < total - 1 ? (
          <button className="btn btn--primary" onClick={next}>
            Next →
          </button>
        ) : (
          <button className="btn btn--primary" onClick={submit}>
            Submit exam
          </button>
        )}
      </footer>
    </div>
  );
}