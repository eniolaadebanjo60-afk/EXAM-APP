import { useNavigate } from "react-router-dom";
import gtbankLogo from "../assets/GTBANK.png";
import mtnLogo from "../assets/MTN.jpeg";
import shellLogo from "../assets/SHELL.png";
import dangoteLogo from "../assets/DANGOTE.png";
import kpmgLogo from "../assets/KPMG.png";
import accessLogo from "../assets/ACCESS.jpeg";
import "../styles/Home.css";

export default function Graduate() {
  const navigate = useNavigate();

  const companies = [
    { id: "gtbank", name: "GTBank", image: gtbankLogo },
    { id: "mtn", name: "MTN Nigeria", image: mtnLogo },
    { id: "shell", name: "Shell", image: shellLogo },
    { id: "dangote", name: "Dangote Group", image: dangoteLogo },
    { id: "kpmg", name: "KPMG", image: kpmgLogo },
    { id: "access", name: "Access Bank", image: accessLogo },
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
            onClick={() => navigate(`/mode?course=graduate&company=${company.id}`)}
          >
            <img src={company.image} alt={company.name} className="home__img" />
            <div className="home__card-content">
              <h3>{company.name}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}