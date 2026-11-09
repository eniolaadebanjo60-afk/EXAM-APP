import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="landing__nav">
        <h2>Satoru Exam Prep</h2>
        <button onClick={() => navigate("/auth")}>Sign In</button>
      </nav>

      <main className="landing__hero">
        <h1>Master Your Professional Exams with AI.</h1>
        <p>
          Practice real past questions for ICAN, CIPM, and Graduate Trainee tests. 
          Our AI grades your theory answers instantly and explains exactly why you got it wrong.
        </p>
        
        <div className="landing__actions">
          <button className="landing__btn-primary" onClick={() => navigate("/home")}>
            Try the Demo (No Login Required)
          </button>
          <button className="landing__btn-secondary" onClick={() => navigate("/auth")}>
            Create Free Account
          </button>
        </div>
      </main>

      <section className="landing__features">
        <div className="landing__feature-card">
          <h3>🧠 AI Grading</h3>
          <p>Type your essay answer and get instant feedback based on official ICAN marking guides.</p>
        </div>
        <div className="landing__feature-card">
          <h3>📊 Smart Replay</h3>
          <p>See exactly which questions you second-guessed yourself on, and learn to trust your gut.</p>
        </div>
        <div className="landing__feature-card">
          <h3>🎯 Topic Filtering</h3>
          <p>Jump straight into Financial Accounting, Business Law, or Quantitative Aptitude.</p>
        </div>
      </section>
    </div>
  );
}