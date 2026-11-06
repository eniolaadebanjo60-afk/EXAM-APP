import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/Home.css";

export default function Home() {
  const [course, setCourse] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name.split(" ")[0]);
      }
    }
    getUser();
  }, []);

  return (
    <div className="home">
      <div className="home__hero">
        <h1>{userName ? `Welcome, ${userName}` : "Ready to pass?"}</h1>
        <p>Choose your exam and start mastering it today.</p>
      </div>

      <div className="home__grid">
        <button 
          className={`home__card ${course === "ican" ? "is-selected" : ""}`}
          onClick={() => setCourse("ican")}
        >
          <div className="home__icon">📊</div>
          <h3>ICAN</h3>
          <p>Accounting</p>
        </button>

        <button 
          className={`home__card ${course === "cipm" ? "is-selected" : ""}`}
          onClick={() => setCourse("cipm")}
        >
          <div className="home__icon">👥</div>
          <h3>CIPM</h3>
          <p>HR Management</p>
        </button>
        
        <button 
          className={`home__card ${course === "university" ? "is-selected" : ""}`}
          onClick={() => setCourse("university")}
        >
          <div className="home__icon">🎓</div>
          <h3>University</h3>
          <p>General</p>
        </button>
      </div>

      <div className="home__actions">
        <button 
          className="home__btn-primary" 
          onClick={() => course && navigate(`/practice?course=${course}`)} 
          disabled={!course}
        >
          Start Practice
        </button>
        <button 
          className="home__btn-secondary" 
          onClick={() => course && navigate(`/exam?course=${course}`)} 
          disabled={!course}
        >
          Timed Exam
        </button>
      </div>
    </div>
  );
}