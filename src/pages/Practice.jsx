import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import QuestionCard from "../components/QuestionCard";
import ExplanationPanel from "../components/ExplanationPanel";
import ResultSummary, { toReviewItem } from "../components/ResultSummary";
import "../styles/Practice.css";

export default function Practice() {
  const [searchParams] = useSearchParams();
  const course = searchParams.get("course");
  const company = searchParams.get("company");
  const level = searchParams.get("level");
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

      if (course) query = query.eq("course", course);
      if (company) query = query.eq("company", company);
      if (level) query = query.eq("level", level);

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
  }, [course, company, level]);

  const questions =
    currentSubject === "All"
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
      [questions[index].id]: key,
    }));
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
      <div className="page-loading">
        <div className="spinner"></div>
        <span>Loading questions...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page-loading">
        <span>No questions found for this subject.</span>
        <button className="btn" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const q = questions[index];
  const total = questions.length;
  const progress = ((index + (history[q.id] ? 1 : 0)) / total) * 100;
  const chosen = history[q.id] || null;
  const isTheory = q.type === "theory" || !q.options || q.options.length === 0;

  const correctCount = Object.entries(history).filter(([qid, answer]) => {
    return questions.find((m) => m.id === qid)?.correct === answer;
  }).length;

  if (finished) {
    const missed = questions.filter((m) => {
      const answer = history[m.id];
      return answer && answer !== m.correct;
    });

    return (
      <ResultSummary
        label="Practice complete"
        correct={correctCount}
        total={total}
        message={
          correctCount === total
            ? "Flawless. You're ready."
            : `You missed ${missed.length} question(s).`
        }
        reviewTitle="Review your misses"
        review={missed.map((m) => toReviewItem(m, history[m.id]))}
      >
        <button className="btn btn--primary" onClick={restart}>
          Practice again
        </button>
        <button className="btn" onClick={() => navigate("/home")}>
          Back to Home
        </button>
      </ResultSummary>
    );
  }

  return (
    <div className="practice">
      <header className="practice__bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <select
          className="practice__subject-select"
          value={currentSubject}
          onChange={handleSubjectChange}
          aria-label="Subject"
        >
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <span className="practice__count">
          {index + 1} / {total}
        </span>
      </header>

      <div className="practice__progress">
        <span style={{ width: `${progress}%` }} />
      </div>

      {q.topic && <p className="practice__topic">{q.topic}</p>}

      <QuestionCard
        key={q.id}
        question={q}
        chosen={chosen}
        revealed={!!chosen}
        onPick={pick}
        isTheory={isTheory}
      />

      {chosen && (
        <ExplanationPanel
          key={`${q.id}-explain`}
          question={q}
          chosen={chosen}
          onNext={next}
          isTheory={isTheory}
          isLast={index === total - 1}
        />
      )}

      <div className="practice__nav">
        <button className="btn" onClick={prev} disabled={index === 0}>
          ← Previous
        </button>

        {!chosen && (
          <button className="btn btn--primary" onClick={next}>
            {index === total - 1 ? "Finish" : "Skip →"}
          </button>
        )}
      </div>
    </div>
  );
}