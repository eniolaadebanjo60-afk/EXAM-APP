import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Graduate() {
  const navigate = useNavigate();

  const companies = [
    { id: "gtbank", name: "GTBank", logo: "🦅" },
    { id: "mtn", name: "MTN Nigeria", logo: "🟡" },
    { id: "shell", name: "Shell", logo: "🐚" },
    { id: "dangote", name: "Dangote Group", logo: "🏭" },
    { id: "kpmg", name: "KPMG", logo: "🔵" },
    { id: "access", name: "Access Bank", logo: "💎" },
  ];

  return (
    <div className="home">
      <div className="home__hero">
        <button className="home__back-btn" onClick={() => navigate("/home")}>
          ← Back to Exams
        </button>
        <h1>Graduate Trainee</h1>
        <p>Select a company to practice their aptitude tests.</p>
      </div>

      <div className="home__grid">
        {companies.map((company) => (
          <button 
            key={company.id} 
            className="home__card" 
            onClick={() => navigate(`/practice?course=graduate&company=${company.id}`)}
          >
            <div className="home__logo-placeholder">{company.logo}</div>
            <div className="home__card-content">
              <h3>{company.name}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}