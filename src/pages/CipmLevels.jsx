import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function CipmLevels() {
  const navigate = useNavigate();

  const levels = [
    { id: "foundation", name: "Foundation" },
    { id: "intermediate1", name: "Intermediate 1" },
    { id: "intermediate2", name: "Intermediate 2" },
    { id: "professional1", name: "Professional 1" },
    { id: "professional2", name: "Professional 2" },
  ];

  return (
    <div className="home">
      <div className="home__hero">
        <button className="home__back-btn" onClick={() => navigate("/home")}>
          ← Back to Exams
        </button>
        <h1>CIPM Levels</h1>
        <p>Select your current level to begin.</p>
      </div>

      <div className="home__grid">
        {levels.map((level) => (
          <button 
            key={level.id} 
            className="home__card" 
            onClick={() => navigate(`/mode?course=cipm&level=${level.id}`)}
          >
            <div className="home__logo-placeholder" style={{ height: '100px', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {level.name}
            </div>
            <div className="home__card-content">
              <p>Select Level</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}