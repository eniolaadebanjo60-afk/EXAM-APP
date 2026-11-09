import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function ModeSelection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const course = searchParams.get("course");
  const company = searchParams.get("company");
  const level = searchParams.get("level");

  let queryString = `?course=${course}`;
  if (company) queryString += `&company=${company}`;
  if (level) queryString += `&level=${level}`;

  let title = course === "graduate" ? company.toUpperCase() : course.toUpperCase();
  if (level) title += ` - ${level.toUpperCase()}`;

  return (
    <div className="home">
      <div className="home__hero">
        <button className="home__back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{title}</h1>
        <p>How do you want to study today?</p>
      </div>

      <div className="home__grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <button 
          className="home__card" 
          onClick={() => navigate(`/practice${queryString}`)}
          style={{ padding: '40px 20px', textAlign: 'center' }}
        >
          <div className="home__logo-placeholder" style={{ height: 'auto', background: 'transparent', fontSize: '3rem', paddingBottom: '10px' }}>
            📖
          </div>
          <div className="home__card-content">
            <h3>Practice Mode</h3>
            <p>Instant AI feedback</p>
          </div>
        </button>

        <button 
          className="home__card" 
          onClick={() => navigate(`/exam${queryString}`)}
          style={{ padding: '40px 20px', textAlign: 'center' }}
        >
          <div className="home__logo-placeholder" style={{ height: 'auto', background: 'transparent', fontSize: '3rem', paddingBottom: '10px' }}>
            ⏱️
          </div>
          <div className="home__card-content">
            <h3>Timed Exam</h3>
            <p>Simulate real conditions</p>
          </div>
        </button>
      </div>
    </div>
  );
}