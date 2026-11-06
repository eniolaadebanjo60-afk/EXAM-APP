import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import CIPM from '../assets/CIPM.jpeg';
import ICAN from '../assets/ICAN.png';
import GRADUATE from '../assets/GRADUATE TRAINEE.png';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home__hero">
        <h1>Select Your Exam</h1>
        <p>Master your professional exams with AI-powered practice.</p>
      </div>

      <div className="home__grid">
        <button className="home__card" onClick={() => navigate("/practice?course=ican")}>
          <img src={ICAN} alt="ICAN" className="home__img" />
          <div className="home__card-content">
            <h3>ICAN</h3>
            <p>Accountants</p>
          </div>
        </button>

        <button className="home__card" onClick={() => navigate("/practice?course=cipm")}>
          <img src={CIPM} alt="CIPM" className="home__img" />
          <div className="home__card-content">
            <h3>CIPM</h3>
            <p>HR Personnels</p>
          </div>
        </button>

        <button className="home__card" onClick={() => navigate("/graduate")}>
          <img src={GRADUATE} alt="Graduate Trainee" className="home__img" />
          <div className="home__card-content">
            <h3>Graduate Trainee</h3>
            <p>Bank & Corporate Tests</p>
          </div>
        </button>
      </div>
    </div>
  );
}