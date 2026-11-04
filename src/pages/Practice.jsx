import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import QuestionCard from "../components/QuestionCard";
import ExplanationPanel from "../components/ExplanationPanel";
import "../styles/Practice.css";

export default function Practice() {
  const [searchParams] = useSearchParams();
  const course = searchParams.get("course");
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      let query = supabase.from("questions").select("*");
      
      if (course) {
        query = query.eq("course", course);
      }

      const { data, error } = await query;
      
      if (error) console.error("Error fetching:", error);
      else if (data) setQuestions(data);
      
      setLoading(false);
    }
    
    fetchQuestions();
  }, [course]);

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
        <span>No questions found for this course yet.</span>
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