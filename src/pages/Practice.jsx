import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import QuestionCard from "../components/QuestionCard";
import ExplanationPanel from "../components/ExplanationPanel";
import "../styles/Practice.css";

export default function Practice() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase.from("questions").select("*");
      
      if (error) {
        console.error("Error fetching questions:", error);
      } else if (data) {
        setQuestions(data);
      }
      setLoading(false);
    }
    
    fetchQuestions();
  }, []);

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
        <span>No questions found in the database.</span>
      </div>
    );
  }

  const q = questions[index];
  const total = questions.length;
  const progress = ((index + (chosen ? 1 : 0)) / total) * 100;

  function pick(key) {
    if (chosen) return;
    setChosen(key);
  }

  function next() {
    setChosen(null);
    setIndex((i) => (i + 1) % total);
  }

  return (
    <div className="practice">
      <div className="practice__top">
        <header className="practice__meta">
          <span>{q.subject}</span>
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
      />

      {chosen && (
        <ExplanationPanel question={q} chosen={chosen} onNext={next} />
      )}
    </div>
  );
}